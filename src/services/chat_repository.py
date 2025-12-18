"""
Repository layer for chat database operations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from models.chat import ChatSession, Message
from models.user import User
from utils.logger import setup_logger

logger = setup_logger(__name__)


class ChatRepository:
    """Repository for chat-related database operations"""
    
    @staticmethod
    def create_session(db: Session, user_id: int, title: Optional[str] = None) -> ChatSession:
        """
        Create a new chat session
        
        Args:
            db: Database session
            user_id: ID of the user creating the session
            title: Optional title for the chat session
            
        Returns:
            Created ChatSession object
        """
        session_id = str(uuid.uuid4())
        db_session = ChatSession(
            session_id=session_id,
            user_id=user_id,
            title=title or f"Chat {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        logger.info(f"Created chat session {session_id} for user {user_id}")
        return db_session
    
    @staticmethod
    def get_session_by_id(db: Session, session_id: str) -> Optional[ChatSession]:
        """Get chat session by session_id"""
        return db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    
    @staticmethod
    def get_user_sessions(db: Session, user_id: int, limit: int = 50) -> List[ChatSession]:
        """
        Get all chat sessions for a user
        
        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of sessions to return
            
        Returns:
            List of ChatSession objects
        """
        return db.query(ChatSession)\
            .filter(ChatSession.user_id == user_id)\
            .order_by(ChatSession.updated_at.desc())\
            .limit(limit)\
            .all()
    
    @staticmethod
    def delete_session(db: Session, session_id: str) -> bool:
        """
        Delete a chat session and all its messages
        
        Args:
            db: Database session
            session_id: Session ID to delete
            
        Returns:
            True if deleted, False if not found
        """
        session = ChatRepository.get_session_by_id(db, session_id)
        if session:
            db.delete(session)
            db.commit()
            logger.info(f"Deleted chat session {session_id}")
            return True
        return False
    
    @staticmethod
    def add_message(
        db: Session,
        session_id: str,
        role: str,
        content: str
    ) -> Message:
        """
        Add a message to a chat session
        
        Args:
            db: Database session
            session_id: Chat session ID
            role: Message role ("user" or "assistant")
            content: Message content
            
        Returns:
            Created Message object
        """
        # Get the session
        chat_session = ChatRepository.get_session_by_id(db, session_id)
        if not chat_session:
            raise ValueError(f"Session {session_id} not found")
        
        # Create message
        message = Message(
            session_id=chat_session.id,
            role=role,
            content=content
        )
        db.add(message)
        
        # Update session timestamp
        chat_session.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(message)
        return message
    
    @staticmethod
    def get_session_messages(
        db: Session,
        session_id: str,
        limit: Optional[int] = None
    ) -> List[Message]:
        """
        Get all messages for a chat session
        
        Args:
            db: Database session
            session_id: Chat session ID
            limit: Optional limit on number of messages
            
        Returns:
            List of Message objects
        """
        chat_session = ChatRepository.get_session_by_id(db, session_id)
        if not chat_session:
            return []
        
        query = db.query(Message)\
            .filter(Message.session_id == chat_session.id)\
            .order_by(Message.created_at.asc())
        
        if limit:
            query = query.limit(limit)
        
        return query.all()
    
    @staticmethod
    def update_session_title(db: Session, session_id: str, title: str) -> Optional[ChatSession]:
        """
        Update chat session title
        
        Args:
            db: Database session
            session_id: Chat session ID
            title: New title
            
        Returns:
            Updated ChatSession or None if not found
        """
        chat_session = ChatRepository.get_session_by_id(db, session_id)
        if chat_session:
            chat_session.title = title
            chat_session.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(chat_session)
            logger.info(f"Updated title for session {session_id}")
        return chat_session
