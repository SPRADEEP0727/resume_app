from werkzeug.utils import secure_filename
import os

def validate_file(file) -> dict:
    """Validate uploaded file"""
    
    # Check if file is selected
    if not file or file.filename == '':
        return {
            "valid": False,
            "message": "No file selected"
        }
    
    # Check file extension
    if not allowed_file(file.filename):
        return {
            "valid": False,
            "message": "Only PDF files are allowed"
        }
    
    # Check file size (if possible)
    try:
        # Seek to end to get file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        max_size = 16 * 1024 * 1024  # 16MB
        if file_size > max_size:
            return {
                "valid": False,
                "message": f"File size too large. Maximum allowed: {max_size // (1024 * 1024)}MB"
            }
        
        if file_size == 0:
            return {
                "valid": False,
                "message": "File is empty"
            }
            
    except Exception:
        # If we can't check size, continue
        pass
    
    return {
        "valid": True,
        "message": "File is valid"
    }

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    allowed_extensions = {'pdf'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    return secure_filename(filename)

def validate_text_input(text: str, min_length: int = 10, max_length: int = 50000) -> dict:
    """Validate text input"""
    
    if not text or not text.strip():
        return {
            "valid": False,
            "message": "Text cannot be empty"
        }
    
    text_length = len(text.strip())
    
    if text_length < min_length:
        return {
            "valid": False,
            "message": f"Text too short. Minimum length: {min_length} characters"
        }
    
    if text_length > max_length:
        return {
            "valid": False,
            "message": f"Text too long. Maximum length: {max_length} characters"
        }
    
    return {
        "valid": True,
        "message": "Text is valid",
        "length": text_length
    }

def validate_job_description(job_description: str) -> dict:
    """Validate job description input"""
    if not job_description or not job_description.strip():
        return {
            "valid": True,  # Job description is optional
            "message": "No job description provided - using general analysis"
        }
    
    return validate_text_input(job_description, min_length=20, max_length=10000)
