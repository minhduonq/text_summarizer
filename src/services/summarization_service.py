"""
Service for text summarization business logic
"""
from typing import Literal

from models.summarizer import summarizer_model
from utils.logger import setup_logger

logger = setup_logger(__name__)


class SummarizationService:
    """Service for handling text summarization"""
    
    # Length presets
    LENGTH_CONFIGS = {
        "short": {"max_length": 80, "min_length": 20},
        "medium": {"max_length": 150, "min_length": 40},
        "detailed": {"max_length": 250, "min_length": 80},
    }
    
    def __init__(self):
        self.model = summarizer_model
    
    async def summarize(
        self,
        text: str,
        length: Literal["short", "medium", "detailed"] = "medium"
    ) -> str:
        """
        Summarize text with specified length preset
        
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
        
        logger.info(f"Summarizing text with length preset: {length}")
        
        try:
            summary = self.model.summarize(
                text=text,
                max_length=config["max_length"],
                min_length=config["min_length"]
            )
            
            logger.info(f"Summary generated successfully")
            return summary
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            raise
