"""
Chat endpoints for conversational interface
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

from services.chat_service import chat_service
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


class CreateSessionResponse(BaseModel):
    """Response for creating a new session"""
    session_id: str
    message: str


class ChatRequest(BaseModel):
    """Request model for chat"""
    session_id: str
    message: str
    context: Optional[str] = None  # Optional context (e.g., document summary)


class ChatResponse(BaseModel):
    """Response model for chat"""
    session_id: str
    message: str
    response: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    """Response model for chat history"""
    session_id: str
    messages: List[Dict]


@router.post("/chat/session", response_model=CreateSessionResponse)
async def create_chat_session():
    """
    Create a new chat session
    """
    try:
        session_id = chat_service.create_session()
        return CreateSessionResponse(
            session_id=session_id,
            message="Chat session created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest):
    """
    Send a message in a chat session
    """
    try:
        response = await chat_service.chat(
            session_id=request.session_id,
            message=request.message,
            context=request.context
        )
        
        from datetime import datetime
        return ChatResponse(
            session_id=request.session_id,
            message=request.message,
            response=response,
            timestamp=datetime.utcnow().isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(session_id: str):
    """
    Get chat history for a session
    """
    try:
        session = chat_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return ChatHistoryResponse(
            session_id=session_id,
            messages=session.get_history()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/chat/session/{session_id}")
async def delete_chat_session(session_id: str):
    """
    Delete a chat session
    """
    try:
        chat_service.delete_session(session_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/clear/{session_id}")
async def clear_chat_history(session_id: str):
    """
    Clear chat history for a session
    """
    try:
        session = chat_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session.clear_history()
        return {"message": "Chat history cleared successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
