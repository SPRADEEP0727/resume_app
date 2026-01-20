from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from src.services.autogen_resume_service import AutoGenResumeAnalysisService
from src.utils.file_handler import FileHandler
from src.utils.validators import validate_file
import os

# Create blueprint
resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

# Initialize services
resume_service = AutoGenResumeAnalysisService()
file_handler = FileHandler()

@resume_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    """Analyze uploaded resume for ATS compatibility"""
    try:
        # Check if file is present
        if 'resume' not in request.files:
            return jsonify({"error": "No resume file provided"}), 400
        
        file = request.files['resume']
        job_description = request.form.get('job_description', '')
        
        # Validate file
        validation_result = validate_file(file)
        if not validation_result['valid']:
            return jsonify({"error": validation_result['message']}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        file_path = file_handler.save_temp_file(file, filename)
        
        try:
            # Extract text from PDF
            resume_text = file_handler.extract_text_from_pdf(file_path)
            
            # Analyze resume
            analysis_result = resume_service.analyze_resume(
                resume_text=resume_text,
                job_description=job_description
            )
            
            return jsonify(analysis_result), 200
            
        finally:
            # Clean up temporary file
            file_handler.cleanup_temp_file(file_path)
            
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@resume_bp.route('/score', methods=['POST'])
def get_ats_score():
    """Get ATS score for resume"""
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({"error": "Resume text is required"}), 400
        
        resume_text = data['resume_text']
        job_description = data.get('job_description', '')
        
        # Get ATS score
        score_result = resume_service.calculate_ats_score(
            resume_text=resume_text,
            job_description=job_description
        )
        
        return jsonify(score_result), 200
        
    except Exception as e:
        return jsonify({"error": f"Scoring failed: {str(e)}"}), 500

@resume_bp.route('/suggestions', methods=['POST'])
def get_suggestions():
    """Get improvement suggestions for resume"""
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({"error": "Resume text is required"}), 400
        
        resume_text = data['resume_text']
        job_description = data.get('job_description', '')
        
        # Get suggestions
        suggestions = resume_service.get_improvement_suggestions(
            resume_text=resume_text,
            job_description=job_description
        )
        
        return jsonify(suggestions), 200
        
    except Exception as e:
        return jsonify({"error": f"Suggestion generation failed: {str(e)}"}), 500

@resume_bp.route('/keywords', methods=['POST'])
def extract_keywords():
    """Extract and recommend keywords"""
    try:
        data = request.get_json()
        
        if not data or 'job_description' not in data:
            return jsonify({"error": "Job description is required"}), 400
        
        job_description = data['job_description']
        resume_text = data.get('resume_text', '')
        
        # Extract keywords
        keywords_result = resume_service.extract_keywords(
            job_description=job_description,
            resume_text=resume_text
        )
        
        return jsonify(keywords_result), 200
        
    except Exception as e:
        return jsonify({"error": f"Keyword extraction failed: {str(e)}"}), 500
