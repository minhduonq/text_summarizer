"""
Service for text summarization business logic using Google Gemini
"""
from typing import Literal

from models.summarizer import gemini_model
from utils.logger import setup_logger

logger = setup_logger(__name__)


class SummarizationService:
    """Service for handling text summarization with Gemini"""
    
    # Length presets (adjusted for Gemini's capabilities)
    LENGTH_CONFIGS = {
        "short": {"max_length": 100, "min_length": 30, "style": "concise"},
        "medium": {"max_length": 200, "min_length": 60, "style": "concise"},
        "detailed": {"max_length": 400, "min_length": 100, "style": "detailed"},
    }
    
    def __init__(self):
        self.model = gemini_model
    
    async def summarize(
        self,
        text: str,
        length: Literal["short", "medium", "detailed"] = "medium"
    ) -> str:
        """
        Summarize text with specified length preset using Gemini
        
        Args:
            text: Input text to summarize
            length: Summary length preset
            
        Returns:
            Generated summary
        """
        if not text or len(text.strip()) == 0:
            raise ValueError("Text cannot be empty")
        
        # Get length configuration
        config = self.LENGTH_CONFIGS.get(length, self.LENGTH_CONFIGS["medium"])
        
        logger.info(f"Summarizing text with Gemini (length preset: {length})")
        
        try:
            summary = self.model.summarize(
                text=text,
                max_length=config["max_length"],
                min_length=config["min_length"],
                style=config["style"]
            )
            
            logger.info(f"Summary generated successfully with Gemini")
            return summary
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            raise
