"""
Service for managing conversational chat with context
"""
from typing import List, Dict, Optional
from datetime import datetime
import uuid

from utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatSession:
    """Represents a chat session with conversation history"""
    
    def __init__(self, session_id: str = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.messages: List[Dict] = []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.messages.append({
            "role": role,  # "user" or "assistant"
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.updated_at = datetime.utcnow()
    
    def get_history(self, limit: Optional[int] = None) -> List[Dict]:
        """Get conversation history"""
        if limit:
            return self.messages[-limit:]
        return self.messages
    
    def clear_history(self):
        """Clear conversation history"""
        self.messages = []
        self.updated_at = datetime.utcnow()


class ChatService:
    """Service for handling conversational chat"""
    
    def __init__(self):
        # In-memory storage for sessions (use database in production)
        self.sessions: Dict[str, ChatSession] = {}
    
    def create_session(self) -> str:
        """Create a new chat session"""
        session = ChatSession()
        self.sessions[session.session_id] = session
        logger.info(f"Created chat session: {session.session_id}")
        return session.session_id
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get a chat session by ID"""
        return self.sessions.get(session_id)
    
    def delete_session(self, session_id: str):
        """Delete a chat session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Deleted chat session: {session_id}")
    
    async def chat(
        self,
        session_id: str,
        message: str,
        context: Optional[str] = None
    ) -> str:
        """
        Process a chat message with conversation history
        
        Args:
            session_id: Chat session ID
            message: User message
            context: Optional context (e.g., summarized document)
            
        Returns:
            Assistant response
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Add user message to history
        session.add_message("user", message)
        
        # Build prompt with context and history
        prompt = self._build_prompt(session, message, context)
        
        # Generate response (simplified - replace with actual LLM call)
        response = await self._generate_response(prompt, session)
        
        # Add assistant response to history
        session.add_message("assistant", response)
        
        return response
    
    def _build_prompt(
        self,
        session: ChatSession,
        message: str,
        context: Optional[str]
    ) -> str:
        """Build prompt with context and conversation history"""
        prompt_parts = []
        
        # Add context if provided
        if context:
            prompt_parts.append(f"Context: {context}\n")
        
        # Add conversation history (last 5 messages)
        history = session.get_history(limit=5)
        if history:
            prompt_parts.append("Conversation history:")
            for msg in history[:-1]:  # Exclude current message
                role = msg["role"].capitalize()
                prompt_parts.append(f"{role}: {msg['content']}")
        
        # Add current message
        prompt_parts.append(f"\nUser: {message}")
        prompt_parts.append("Assistant:")
        
        return "\n".join(prompt_parts)
    
    async def _generate_response(
        self,
        prompt: str,
        session: ChatSession
    ) -> str:
        """
        Generate response using LLM
        (This is a placeholder - integrate with your actual model)
        """
        # TODO: Replace with actual LLM call (OpenAI, Hugging Face, etc.)
        # For now, return a simple response
        return f"I understand your message. This is a placeholder response. In production, this would use an LLM to generate a contextual response based on the conversation history."


# Global instance
chat_service = ChatService()
