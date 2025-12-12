"""
Service for processing uploaded files
"""
from fastapi import UploadFile
import PyPDF2
import docx
from typing import Optional

from utils.logger import setup_logger

logger = setup_logger(__name__)


class FileProcessorService:
    """Service for extracting text from uploaded files"""
    
    async def extract_text(self, file: UploadFile) -> Optional[str]:
        """
        Extract text from uploaded file based on file type
        
        Args:
            file: Uploaded file
            
        Returns:
            Extracted text content
        """
        filename = file.filename.lower()
        
        try:
            if filename.endswith('.pdf'):
                return await self._extract_from_pdf(file)
            elif filename.endswith('.txt'):
                return await self._extract_from_txt(file)
            elif filename.endswith('.docx'):
                return await self._extract_from_docx(file)
            else:
                raise ValueError(f"Unsupported file type: {filename}")
        except Exception as e:
            logger.error(f"Failed to extract text from {filename}: {str(e)}")
            raise
    
    async def _extract_from_pdf(self, file: UploadFile) -> str:
        """Extract text from PDF file"""
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(content)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + " "
        
        logger.info(f"Text extracted from PDF: {file.filename}")
        return text.strip()
    
    async def _extract_from_txt(self, file: UploadFile) -> str:
        """Extract text from TXT file"""
        content = await file.read()
        text = content.decode('utf-8')
        
        logger.info(f"Text extracted from TXT: {file.filename}")
        return text.strip()
    
    async def _extract_from_docx(self, file: UploadFile) -> str:
        """Extract text from DOCX file"""
        content = await file.read()
        doc = docx.Document(content)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + " "
        
        logger.info(f"Text extracted from DOCX: {file.filename}")
        return text.strip()
