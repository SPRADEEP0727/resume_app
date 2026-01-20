import os
import tempfile
import PyPDF2
import pdfplumber
from typing import Optional

class FileHandler:
    """Handle file operations for resume processing"""
    
    def __init__(self):
        self.allowed_extensions = {'pdf'}
        self.max_file_size = 16 * 1024 * 1024  # 16MB
    
    def save_temp_file(self, file, filename: str) -> str:
        """Save uploaded file temporarily"""
        # Create temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"resume_{filename}")
        
        # Save file
        file.save(temp_path)
        return temp_path
    
    def cleanup_temp_file(self, file_path: str) -> None:
        """Remove temporary file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up file {file_path}: {e}")
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using multiple methods for better accuracy"""
        text = ""
        
        # Method 1: Try pdfplumber first (best for complex layouts)
        try:
            text = self._extract_with_pdfplumber(file_path)
            if text.strip():
                return text
        except Exception as e:
            print(f"pdfplumber failed: {e}")
        
        # Method 2: Fallback to PyPDF2
        try:
            text = self._extract_with_pypdf2(file_path)
            if text.strip():
                return text
        except Exception as e:
            print(f"PyPDF2 failed: {e}")
        
        raise Exception("Could not extract text from PDF file")
    
    def _extract_with_pdfplumber(self, file_path: str) -> str:
        """Extract text using pdfplumber"""
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    
    def _extract_with_pypdf2(self, file_path: str) -> str:
        """Extract text using PyPDF2"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def get_file_info(self, file_path: str) -> dict:
        """Get file information"""
        try:
            file_size = os.path.getsize(file_path)
            file_name = os.path.basename(file_path)
            
            # Get PDF info using PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                page_count = len(pdf_reader.pages)
                metadata = pdf_reader.metadata or {}
            
            return {
                "filename": file_name,
                "size_bytes": file_size,
                "size_mb": round(file_size / (1024 * 1024), 2),
                "page_count": page_count,
                "metadata": dict(metadata) if metadata else {}
            }
        except Exception as e:
            return {
                "filename": os.path.basename(file_path),
                "size_bytes": 0,
                "size_mb": 0,
                "page_count": 0,
                "error": str(e)
            }
