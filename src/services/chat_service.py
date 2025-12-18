"""
Service for managing conversational chat with context using Google Gemini and database
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from models.summarizer import gemini_model
from services.chat_repository import ChatRepository
from utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatService:
    """Service for handling conversational chat with database persistence"""
    
    def __init__(self):
        self.repository = ChatRepository
    
    def create_session(self, db: Session, user_id: int, title: Optional[str] = None) -> str:
        """
        Create a new chat session
        
        Args:
            db: Database session
            user_id: ID of the user creating the session
            title: Optional title for the session
            
        Returns:
            Session ID
        """
        session = self.repository.create_session(db, user_id, title)
        return session.session_id
    
    def get_user_sessions(self, db: Session, user_id: int):
        """Get all chat sessions for a user"""
        return self.repository.get_user_sessions(db, user_id)
    
    def delete_session(self, db: Session, session_id: str):
        """Delete a chat session"""
        return self.repository.delete_session(db, session_id)
    
    def update_session_title(self, db: Session, session_id: str, title: str):
        """Update session title"""
        return self.repository.update_session_title(db, session_id, title)
    
    async def chat(
        self,
        db: Session,
        session_id: str,
        message: str,
        context: Optional[str] = None
    ) -> str:
        """
        Process a chat message with conversation history
        
        Args:
            db: Database session
            session_id: Chat session ID
            message: User message
            context: Optional context (e.g., summarized document)
            
        Returns:
            Assistant response
        """
        # Verify session exists
        session = self.repository.get_session_by_id(db, session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Auto-update session title from first user message
        if session.title in [None, "", "Hội thoại mới", "New Conversation"]:
            # Get message count to check if this is the first message
            message_count = len(session.messages) if session.messages else 0
            if message_count == 0:
                # Use first 200 characters of user message as title
                title = message[:200].strip()
                if len(message) > 200:
                    title += "..."
                self.repository.update_session_title(db, session_id, title)
                logger.info(f"Auto-updated session {session_id} title: {title}")
        
        # Add user message to database
        self.repository.add_message(db, session_id, "user", message)
        
        # Get conversation history
        messages = self.repository.get_session_messages(db, session_id, limit=10)
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
        
        # Generate response using Gemini
        response = await self._generate_response(message, history, context)
        
        # Add assistant response to database
        self.repository.add_message(db, session_id, "assistant", response)
        
        return response
    
    def get_session_history(self, db: Session, session_id: str):
        """Get all messages for a session"""
        return self.repository.get_session_messages(db, session_id)
    
    async def _generate_response(
        self,
        message: str,
        history: List[Dict],
        context: Optional[str]
    ) -> str:
        """
        Generate response using Google Gemini
        
        Args:
            message: Current user message
            history: Conversation history
            context: Optional context
            
        Returns:
            Generated response
        """
        try:
            # Use Gemini to generate response
            response = gemini_model.chat(
                message=message,
                context=context,
                conversation_history=history[:-1] if history else []  # Exclude current message
            )
            
            return response
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "I apologize, but I encountered an error while processing your request. Please try again."


# Global instance
chat_service = ChatService()
