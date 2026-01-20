import pytest
import os
import tempfile
from flask import Flask
from app import create_app

class TestResumeAnalysis:
    """Test cases for resume analysis functionality"""
    
    @pytest.fixture
    def app(self):
        """Create test app"""
        app = create_app()
        app.config['TESTING'] = True
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        assert response.status_code == 200
        assert response.json['status'] == 'healthy'
    
    def test_analyze_resume_no_file(self, client):
        """Test analyze endpoint without file"""
        response = client.post('/api/resume/analyze')
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_analyze_resume_invalid_file(self, client):
        """Test analyze endpoint with invalid file"""
        data = {'resume': (tempfile.NamedTemporaryFile(suffix='.txt'), 'test.txt')}
        response = client.post('/api/resume/analyze', data=data)
        assert response.status_code == 400
    
    def test_score_endpoint_no_data(self, client):
        """Test score endpoint without data"""
        response = client.post('/api/resume/score')
        assert response.status_code == 400
    
    def test_score_endpoint_with_text(self, client):
        """Test score endpoint with resume text"""
        data = {
            'resume_text': 'John Doe\nSoftware Engineer\nEmail: john@example.com\nExperience:\n- Developed web applications\n- Managed team of 5 developers\nEducation:\nBS Computer Science\nSkills:\nPython, JavaScript, React'
        }
        response = client.post('/api/resume/score', json=data)
        assert response.status_code == 200
        assert 'overall_score' in response.json
    
    def test_suggestions_endpoint(self, client):
        """Test suggestions endpoint"""
        data = {
            'resume_text': 'Basic resume content for testing'
        }
        response = client.post('/api/resume/suggestions', json=data)
        assert response.status_code == 200
        assert 'rule_based_suggestions' in response.json
    
    def test_keywords_endpoint(self, client):
        """Test keywords endpoint"""
        data = {
            'job_description': 'We are looking for a Python developer with experience in Flask and React.',
            'resume_text': 'Experienced software developer with Python and JavaScript skills.'
        }
        response = client.post('/api/resume/keywords', json=data)
        assert response.status_code == 200
        assert 'matching_keywords' in response.json

if __name__ == '__main__':
    pytest.main([__file__])
