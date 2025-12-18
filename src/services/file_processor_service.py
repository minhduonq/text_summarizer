"""
Service for processing uploaded files
"""
from fastapi import UploadFile
import PyPDF2
import docx
from typing import Optional
import io

from pdf2image import convert_from_bytes
import pytesseract
from PIL import Image

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
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + " "
        if len(text.strip()) < 50:
            logger.info(f"PDF appears to be image-based, using OCR: {file.filename}")
            text = await self.__extract_from_pdf_with_ocr(content)
        
        logger.info(f"Text extracted from PDF: {file.filename}")
        return text.strip()
    
    async def __extract_from_pdf_with_ocr(self, content: bytes) -> str:
        """Extract text from image-base PDF using OCR"""

        try:
            images = convert_from_bytes(content)

            text = ""
            for i, image in enumerate(images):
                # Use Tesseract OCR to read text
                page_text = pytesseract.image_to_string(image, lang='vie+eng')
                text += page_text + " "
                logger.info(f"OCR processed page {i+1}")
            return text.strip()
        except Exception as e:
            logger.error(f"OCR extraction failed: {str(e)}")
            raise
    
    async def _extract_from_txt(self, file: UploadFile) -> str:
        """Extract text from TXT file"""
        content = await file.read()
        text = content.decode('utf-8')
        
        logger.info(f"Text extracted from TXT: {file.filename}")
        return text.strip()
    
    async def _extract_from_docx(self, file: UploadFile) -> str:
        """Extract text from DOCX file"""
        content = await file.read()
        docx_file = io.BytesIO(content)
        doc = docx.Document(docx_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + " "
        
        logger.info(f"Text extracted from DOCX: {file.filename}")
        return text.strip()
