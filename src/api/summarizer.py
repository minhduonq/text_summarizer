"""
Text summarization endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal

from services.summarization_service import SummarizationService
from services.web_scraper_service import WebScraperService
from services.file_processor_service import FileProcessorService
from utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

# Initialize services
summarization_service = SummarizationService()
web_scraper = WebScraperService()
file_processor = FileProcessorService()


class TextSummarizeRequest(BaseModel):
    """Request model for text summarization"""
    text: str
    length: Literal["short", "medium", "detailed"] = "medium"


class URLSummarizeRequest(BaseModel):
    """Request model for URL summarization"""
    url: HttpUrl
    length: Literal["short", "medium", "detailed"] = "medium"


class SummarizeResponse(BaseModel):
    """Response model for summarization"""
    summary: str
    original_length: int
    summary_length: int
    compression_ratio: float


@router.post("/summarize/text", response_model=SummarizeResponse)
async def summarize_text(request: TextSummarizeRequest):
    """
    Summarize text directly
    """
    try:
        summary = await summarization_service.summarize(
            text=request.text,
            length=request.length
        )
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(request.text.split()),
            summary_length=len(summary.split()),
            compression_ratio=round(len(summary) / len(request.text), 2)
        )
    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize/url", response_model=SummarizeResponse)
async def summarize_url(request: URLSummarizeRequest):
    """
    Summarize content from URL
    """
    try:
        # Extract text from URL
        text = await web_scraper.extract_text(str(request.url))
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text from URL")
        
        # Summarize extracted text
        summary = await summarization_service.summarize(
            text=text,
            length=request.length
        )
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text.split()),
            summary_length=len(summary.split()),
            compression_ratio=round(len(summary) / len(text), 2)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/summarize/file", response_model=SummarizeResponse)
async def summarize_file(
    file: UploadFile = File(...),
    length: Literal["short", "medium", "detailed"] = "medium"
):
    """
    Summarize content from uploaded file (PDF, TXT, DOCX)
    """
    try:
        # Extract text from file
        text = await file_processor.extract_text(file)
        
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text from file")
        
        # Summarize extracted text
        summary = await summarization_service.summarize(
            text=text,
            length=length
        )
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text.split()),
            summary_length=len(summary.split()),
            compression_ratio=round(len(summary) / len(text), 2)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error summarizing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
