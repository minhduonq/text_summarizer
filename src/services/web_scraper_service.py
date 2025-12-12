"""
Service for web scraping and content extraction
"""
import requests
from bs4 import BeautifulSoup
from newspaper import Article
from typing import Optional

from utils.logger import setup_logger

logger = setup_logger(__name__)


class WebScraperService:
    """Service for extracting text from web pages"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    async def extract_text(self, url: str) -> Optional[str]:
        """
        Extract main text content from URL
        
        Args:
            url: Web page URL
            
        Returns:
            Extracted text content
        """
        try:
            # Try using newspaper3k first (better for articles)
            article = Article(url)
            article.download()
            article.parse()
            
            if article.text and len(article.text.strip()) > 100:
                logger.info(f"Text extracted from {url} using newspaper3k")
                return article.text
            
            # Fallback to BeautifulSoup
            return await self._extract_with_bs4(url)
            
        except Exception as e:
            logger.warning(f"newspaper3k failed, trying BeautifulSoup: {str(e)}")
            try:
                return await self._extract_with_bs4(url)
            except Exception as e2:
                logger.error(f"Failed to extract text from {url}: {str(e2)}")
                raise
    
    async def _extract_with_bs4(self, url: str) -> str:
        """Extract text using BeautifulSoup as fallback"""
        response = requests.get(url, headers=self.headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text from main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('body')
        text = main_content.get_text(separator=' ', strip=True) if main_content else ""
        
        # Clean up whitespace
        text = ' '.join(text.split())
        
        logger.info(f"Text extracted from {url} using BeautifulSoup")
        return text
