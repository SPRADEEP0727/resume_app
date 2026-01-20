# Resume ATS Analysis API - Demo Usage

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Application
```bash
python app.py
```

The API will be available at: `http://localhost:5000`

## 📋 API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### 1. Complete Resume Analysis
Upload a PDF resume for complete analysis:

```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@path/to/your/resume.pdf" \
  -F "job_description=Software Engineer position requiring Python, Flask, and React experience"
```

**Response includes:**
- ATS Score (0-100)
- Text statistics
- Section analysis
- Improvement suggestions
- Keyword matching

### 2. ATS Score Only
Get just the ATS score for resume text:

```bash
curl -X POST http://localhost:5000/api/resume/score \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Your resume text here...",
    "job_description": "Job description here..."
  }'
```

### 3. Improvement Suggestions
Get detailed improvement suggestions:

```bash
curl -X POST http://localhost:5000/api/resume/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Your resume text here...",
    "job_description": "Job description here..."
  }'
```

### 4. Keyword Analysis
Analyze keyword matching:

```bash
curl -X POST http://localhost:5000/api/resume/keywords \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Job description here...",
    "resume_text": "Your resume text here..."
  }'
```

## 📊 Sample Response

### ATS Analysis Response:
```json
{
  "ats_score": {
    "overall_score": 78.5,
    "max_score": 100,
    "grade": "B",
    "interpretation": "Good ATS compatibility with room for improvement.",
    "detailed_scores": {
      "format_score": 25.0,
      "keywords_score": 18.5,
      "content_score": 20.0,
      "sections_score": 15.0
    },
    "recommendations": [
      "Add more relevant keywords",
      "Improve formatting",
      "Include more specific achievements"
    ]
  },
  "text_statistics": {
    "character_count": 2847,
    "word_count": 456,
    "sentence_count": 28,
    "average_words_per_sentence": 16.3,
    "estimated_reading_time": 2.3
  },
  "sections_found": [
    "contact",
    "experience", 
    "education",
    "skills"
  ],
  "suggestions": {
    "priority_improvements": [
      "Add quantifiable achievements",
      "Include relevant keywords",
      "Improve section formatting"
    ],
    "strengths": [
      "Professional contact information included",
      "Well-structured with multiple sections",
      "Good use of bullet points for readability"
    ]
  },
  "keywords_analysis": {
    "matching_keywords": ["python", "development", "software"],
    "missing_keywords": ["flask", "react", "api"],
    "match_percentage": 60.0
  }
}
```

## 🧪 Testing

Run tests:
```bash
pytest tests/
```

## 🔧 Features Implemented

✅ **PDF Resume Upload** - Support for various PDF formats
✅ **Text Extraction** - Multiple PDF processing libraries for reliability  
✅ **ATS Score Calculation** - Comprehensive scoring algorithm
✅ **Keyword Analysis** - Job description matching
✅ **AI-Powered Suggestions** - OpenAI integration for improvements
✅ **Section Detection** - Automatic resume section identification
✅ **Format Validation** - File type and size validation
✅ **Error Handling** - Robust error management
✅ **Clean Architecture** - Modular, maintainable code structure

## 📈 ATS Scoring Breakdown

- **Format Score (30%)**: Structure, bullet points, contact info
- **Keywords Score (25%)**: Job description keyword matching  
- **Content Score (25%)**: Action verbs, quantifiable achievements
- **Sections Score (20%)**: Required sections presence

## 🎯 Next Steps

This foundation supports adding:
- Voice interview system
- Web scraping for company intelligence  
- Profile optimization features
- Advanced analytics
- Frontend integration

## 🚨 Important Notes

1. **OpenAI API Key Required**: Set your OpenAI API key in `.env`
2. **PDF Support Only**: Currently supports PDF resume uploads
3. **File Size Limit**: Maximum 16MB file uploads
4. **Dependencies**: Ensure all requirements are installed
