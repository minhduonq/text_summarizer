"""
Chat endpoints for conversational interface with database persistence
"""
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from models.database import get_db
from models.schemas import (
    ChatSessionCreate, ChatSessionResponse, ChatMessageRequest,
    ChatMessageResponse, ChatHistoryResponse, MessageResponse
)
from services.chat_service import chat_service
from services.file_processor_service import FileProcessorService
from api.auth import get_current_active_user
from models.user import User
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)
file_processor = FileProcessorService()


@router.post("/chat/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chat session for the authenticated user
    
    Requires authentication token in Authorization header
    """
    try:
        session_id = chat_service.create_session(db, current_user.id, session_data.title)
        session = chat_service.repository.get_session_by_id(db, session_id)
        
        return ChatSessionResponse(
            id=session.id,
            session_id=session.session_id,
            user_id=session.user_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=len(session.messages)
        )
    except Exception as e:
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/sessions", response_model=List[ChatSessionResponse])
async def get_user_chat_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all chat sessions for the authenticated user
    
    Requires authentication token in Authorization header
    """
    try:
        sessions = chat_service.get_user_sessions(db, current_user.id)
        return [
            ChatSessionResponse(
                id=session.id,
                session_id=session.session_id,
                user_id=session.user_id,
                title=session.title,
                created_at=session.created_at,
                updated_at=session.updated_at,
                message_count=len(session.messages)
            )
            for session in sessions
        ]
    except Exception as e:
        logger.error(f"Error retrieving chat sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_chat_message(
    session_id: str,
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in a chat session
    
    Requires authentication token in Authorization header
    """
    try:
        # Verify session belongs to user
        session = chat_service.repository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        
        # Process chat message
        response = await chat_service.chat(
            db=db,
            session_id=session_id,
            message=request.message,
            context=request.context
        )
        
        return ChatMessageResponse(
            session_id=session_id,
            user_message=request.message,
            assistant_response=response,
            timestamp=datetime.utcnow()
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/sessions/{session_id}/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history for a session
    
    Requires authentication token in Authorization header
    """
    try:
        # Verify session belongs to user
        session = chat_service.repository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        
        messages = chat_service.get_session_history(db, session_id)
        
        return ChatHistoryResponse(
            session_id=session_id,
            title=session.title,
            messages=[
                MessageResponse(
                    id=msg.id,
                    role=msg.role,
                    content=msg.content,
                    created_at=msg.created_at
                )
                for msg in messages
            ],
            total_messages=len(messages)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a chat session
    
    Requires authentication token in Authorization header
    """
    try:
        # Verify session belongs to user
        session = chat_service.repository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        
        chat_service.delete_session(db, session_id)
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/chat/sessions/{session_id}/title")
async def update_chat_session_title(
    session_id: str,
    title: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update chat session title
    
    Requires authentication token in Authorization header
    """
    try:
        # Verify session belongs to user
        session = chat_service.repository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        
        updated_session = chat_service.update_session_title(db, session_id, title)
        return {"message": "Title updated successfully", "title": updated_session.title}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating session title: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/sessions/{session_id}/messages/file", response_model=ChatMessageResponse)
async def send_chat_message_with_file(
    session_id: str,
    message: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Send a chat message with optional file attachment (PDF, DOCX, TXT)
    
    The AI will analyze the file content and include it in the conversation context.
    Requires authentication token in Authorization header.
    """
    try:
        # Verify session belongs to user
        session = chat_service.repository.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied to this session")
        
        # Extract text from file if provided
        context = None
        if file:
            logger.info(f"Processing uploaded file: {file.filename}")
            try:
                file_text = await file_processor.extract_text(file)
                if file_text:
                    context = f"[Attached document: {file.filename}]\n\n{file_text}"
                    logger.info(f"Extracted {len(file_text)} characters from {file.filename}")
            except Exception as e:
                logger.error(f"Error extracting file content: {str(e)}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Could not process file: {str(e)}"
                )
        
        # Process chat message with file context
        response = await chat_service.chat(
            db=db,
            session_id=session_id,
            message=message,
            context=context
        )
        
        return ChatMessageResponse(
            session_id=session_id,
            user_message=message,
            assistant_response=response,
            timestamp=datetime.utcnow()
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing chat message with file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
