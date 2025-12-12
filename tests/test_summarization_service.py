"""
Unit tests for SummarizationService
"""
import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from services.summarization_service import SummarizationService


@pytest.fixture
def service():
    """Create SummarizationService instance"""
    return SummarizationService()


@pytest.mark.asyncio
async def test_summarize_with_valid_text(service):
    """Test summarization with valid text"""
    with patch.object(service.model, 'summarize') as mock_summarize:
        mock_summarize.return_value = "This is a test summary."
        
        result = await service.summarize(
            text="This is a long text that needs to be summarized.",
            length="medium"
        )
        
        assert result == "This is a test summary."
        mock_summarize.assert_called_once()


@pytest.mark.asyncio
async def test_summarize_with_empty_text(service):
    """Test summarization with empty text"""
    with pytest.raises(ValueError, match="Text cannot be empty"):
        await service.summarize(text="", length="medium")


@pytest.mark.asyncio
async def test_summarize_length_presets(service):
    """Test different length presets"""
    with patch.object(service.model, 'summarize') as mock_summarize:
        mock_summarize.return_value = "Summary"
        
        # Test short
        await service.summarize(text="Test text", length="short")
        assert mock_summarize.call_args[1]["max_length"] == 80
        
        # Test medium
        await service.summarize(text="Test text", length="medium")
        assert mock_summarize.call_args[1]["max_length"] == 150
        
        # Test detailed
        await service.summarize(text="Test text", length="detailed")
        assert mock_summarize.call_args[1]["max_length"] == 250
