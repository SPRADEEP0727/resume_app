# Career App Backend

A powerful Flask-based backend API for AI-powered resume analysis. This backend provides comprehensive resume analysis using OpenAI GPT models, ATS scoring, and actionable career insights.

## 🚀 Features

- **AI-Powered Resume Analysis** - Advanced text analysis using OpenAI GPT models
- **ATS Score Calculation** - Applicant Tracking System compatibility scoring  
- **Skills Extraction** - Automatic identification and categorization of technical, professional, and soft skills
- **Career Recommendations** - Personalized improvement suggestions
- **File Processing** - PDF and DOCX resume parsing
- **RESTful API** - Clean, documented API endpoints
- **Clean Architecture** - Modular, maintainable codebase

## 🛠️ Tech Stack

- **Framework**: Flask (Python)
- **AI Integration**: OpenAI API (GPT models)
- **File Processing**: PyPDF2, python-docx
- **Authentication**: JWT tokens
- **Database**: SQLAlchemy (PostgreSQL/SQLite)
- **Environment**: Python 3.8+

## 📋 Prerequisites

- Python 3.8 or higher
- OpenAI API key
- pip package manager

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///career_app.db
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
MAX_CONTENT_LENGTH=16777216
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/SPRADEEP0727/career_app_backend.git
   cd career_app_backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **API will be available at**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
backend/
├── app.py                          # Main Flask application entry point
├── requirements.txt                # Python dependencies
├── .env.example                   # Environment variables template
├── Technical_Documed.md           # Technical documentation
│
├── api/                           # API Routes Layer
│   ├── __init__.py
│   └── resume_routes.py           # Resume analysis API endpoints
│
├── src/                           # Business Logic Layer
│   ├── __init__.py
│   ├── services/                  # Business logic services
│   │   ├── __init__.py
│   │   └── resume_service.py      # Resume analysis business logic
│   ├── utils/                     # Utility functions
│   │   ├── __init__.py
│   │   ├── file_handler.py        # File processing utilities
│   │   └── validators.py          # Input validation utilities
│   └── models/                    # Data models
│       ├── __init__.py
│       └── resume_model.py        # Resume data structures
│
├── config/                        # Configuration
│   ├── __init__.py
│   └── settings.py                # Application configuration
│
├── uploads/                       # Temporary file storage
│
└── tests/                         # Test files
    ├── __init__.py
    ├── test_resume_routes.py
    └── test_resume_service.py
```

## Architecture Principles

### API Layer (`api/`)
- Contains all Flask route handlers
- Handles HTTP requests/responses
- Input validation and error handling
- Calls business logic services

### Business Logic Layer (`src/`)
- **Services**: Core business logic implementation
- **Utils**: Reusable utility functions
- **Models**: Data structures and domain models

### Configuration (`config/`)
- Environment-specific settings
- Application configuration management

## File Responsibilities

### `app.py`
- Flask application factory
- Blueprint registration
- Application initialization

### `api/resume_routes.py`
- Resume analysis endpoints
- File upload handling
- Response formatting

### `src/services/resume_service.py`
- Resume text analysis logic
- ATS score calculation
- AI integration for recommendations

### `src/utils/file_handler.py`
- PDF text extraction
- File validation
- Temporary file management

### `src/utils/validators.py`
- Input validation functions
- File type checking
- Data sanitization

## 📚 API Documentation

### Resume Analysis Endpoints

#### **POST** `/api/resume/analyze`
Complete resume analysis with AI insights

**Request:**
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -F "resume=@resume.pdf" \
  -F "job_description=Software Engineer position..."
```

**Response:**
```json
{
  "ats_score": {
    "overall_score": 85,
    "grade": "A-",
    "detailed_scores": {
      "format_score": 90,
      "content_score": 85,
      "keywords_score": 80
    }
  },
  "skills_analysis": {
    "technical_skills": [...],
    "professional_skills": [...],
    "soft_skills": [...]
  },
  "suggestions": {
    "strengths": [...],
    "priority_improvements": [...]
  }
}
```

#### **POST** `/api/resume/score`
Get ATS compatibility score

#### **POST** `/api/resume/suggestions` 
Get improvement recommendations

#### **POST** `/api/resume/keywords`
Extract and analyze keywords

## 🏗️ Architecture

### Clean Architecture Principles

- **Separation of Concerns** - Each layer has distinct responsibilities
- **Dependency Inversion** - Business logic doesn't depend on external frameworks
- **Testability** - All components are easily testable
- **Maintainability** - Code is organized and documented

### API Layer (`api/`)
- Flask route handlers
- Request/response processing
- Input validation
- Error handling

### Business Logic Layer (`src/`)
- **Services**: Core resume analysis logic
- **Utils**: File processing and validation utilities  
- **Models**: Data structures and domain models

### Configuration (`config/`)
- Environment management
- Application settings

## 🧪 Testing

Run tests with:
```bash
pytest tests/
```

Run with coverage:
```bash
pytest tests/ --cov=src --cov-report=html
```

## 🚢 Deployment

### Render (Recommended)

This project is optimized for Render deployment with the included `render.yaml` configuration:

1. **Connect Repository**
   - Sign up at [Render.com](https://render.com)
   - Connect your GitHub repository
   - Render will automatically detect it as a Python web service

2. **Configure Environment Variables**
   Add these in your Render dashboard:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_secret_key_here
   FLASK_ENV=production
   FLASK_DEBUG=False
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Render will use `render.yaml` for configuration
   - Alternatively, it will detect `Procfile` and `runtime.txt`

The deployment includes:
- Automatic dependency installation
- Gunicorn WSGI server
- Health check endpoint at `/health`
- Production-ready configuration

### Manual Deployment

For other platforms:

#### Local Development
```bash
python app.py
```

#### Production with Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

## 🔐 Security Features

- Input validation and sanitization
- File type restrictions
- Size limitations for uploads
- Environment variable protection
- CORS configuration

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Issues**
- Verify API key is correct
- Check API rate limits
- Ensure sufficient credits

**File Upload Issues**  
- Check file size limits
- Verify supported formats (PDF, DOCX)
- Ensure proper MIME types

**CORS Issues**
- Update ALLOWED_ORIGINS in .env
- Check frontend URL configuration

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support, create an issue on GitHub or contact the development team.

---

Built with ❤️ using Flask and OpenAI
