# Resume.AI Backend - Technical Documentation

## Overview
The Resume.AI backend is a Flask-based REST API that provides intelligent resume analysis, optimization, and career guidance services. The system leverages AI technologies to help job seekers improve their resumes, optimize their professional profiles, and prepare for interviews.

## Architecture

### Technology Stack
- **Framework**: Flask (Python)
- **AI/ML**: AutoGen for intelligent analysis
- **Document Processing**: PDF parsing capabilities
- **API Design**: RESTful architecture
- **Voice Processing**: 
  - Speech Recognition (SpeechRecognition library)
  - Text-to-Speech (pyttsx3/gTTS)
  - Audio processing (pyaudio, wave)
- **Web Scraping**:
  - BeautifulSoup4 for HTML parsing
  - Selenium for dynamic content
  - Scrapy for large-scale scraping
  - Requests for API calls
- **Data Storage**: 
  - Redis for session management
  - PostgreSQL for persistent data
  - File storage for audio recordings
- **AI Services**:
  - OpenAI GPT-4o-mini for question generation and analysis
  - Google Speech-to-Text API (alternative)
  - Azure Cognitive Services (alternative)

## Core Features

### 1. Resume Analysis & ATS Scoring
- **Input**: PDF resume files from frontend
- **Processing**: 
  - Extract text and structure from PDF documents
  - Analyze resume content using AutoGen
  - Generate ATS (Applicant Tracking System) compatibility scores
  - Identify skill gaps based on industry standards
- **Output**: Detailed analysis report with scoring metrics

### 2. Job Description-Based Optimization
- **Functionality**:
  - Compare resume content against specific job descriptions
  - Recommend relevant keywords for better ATS matching
  - Suggest content improvements and additions
  - Provide tailored recommendations for specific roles

### 3. Professional Profile Optimization
- **Platforms Supported**:
  - Naukri.com profile optimization
  - LinkedIn profile enhancement
- **Process**:
  - Analyze current resume content
  - Generate platform-specific recommendations
  - Suggest improvements based on target job roles
  - Optimize for better visibility and matching

### 4. Voice-Based Mock Interview System with Company Intelligence
- **Core Features**:
  - **Voice-to-Voice Interaction**: Real-time spoken conversation with AI interviewer
  - **Company-Specific Questions**: Web scraping to gather company culture, values, and interview patterns
  - **Targeted Role Preparation**: Questions tailored to specific job roles and seniority levels
  - **Real-time Analysis**: Live feedback on speech patterns, confidence, and content quality
  - **Performance Analytics**: Detailed scoring and improvement recommendations

- **Technical Components**:
  - **Speech Recognition**: Convert candidate's voice responses to text
  - **Text-to-Speech**: AI interviewer speaks questions naturally
  - **Web Scraping Engine**: Automated data collection from company websites and job portals
  - **Question Intelligence**: AI-generated questions based on scraped company data
  - **Voice Analysis**: Tone, pace, and confidence assessment
  - **Real-time Feedback**: Instant analysis and suggestions during interview

- **Company Data Collection**:
  - Scrape company websites for mission, values, and culture information
  - Extract interview experiences from platforms like Glassdoor, Indeed
  - Gather recent company news and achievements
  - Analyze job posting patterns and requirements
  - Collect information about interview processes and formats

- **Question Categories**:
  - **Company-Specific**: Questions about company culture, values, recent news
  - **Role-Specific**: Technical and behavioral questions for the target position
  - **Industry-Specific**: Sector-relevant challenges and trends
  - **Experience-Based**: Questions tailored to candidate's background
  - **Situational**: Company-specific scenarios and case studies

## API Endpoints

### Resume Analysis
```
POST /api/analyze-resume
- Input: PDF file, optional job description
- Output: ATS score, skill gaps, recommendations
```

### Profile Optimization
```
POST /api/optimize-profile
- Input: Resume data, target platform, job preferences
- Output: Platform-specific optimization suggestions
```

### Voice-Based Mock Interview
```
POST /api/interview/start
- Input: Job description, target companies, resume data
- Output: Interview session ID, company intelligence summary

GET /api/interview/company-data/<company_name>
- Input: Company name
- Output: Scraped company information, culture, values

POST /api/interview/question/<session_id>
- Input: Session ID
- Output: Audio question file, question text, context

POST /api/interview/respond/<session_id>
- Input: Audio response file
- Output: Transcript, analysis, feedback, next question

GET /api/interview/report/<session_id>
- Input: Session ID
- Output: Complete interview performance report

POST /api/interview/scrape-company
- Input: Company name, job role
- Output: Company-specific interview insights
```

### Company Intelligence
```
GET /api/companies/search
- Input: Company name query
- Output: Available company data and last update

POST /api/companies/scrape
- Input: Company website, additional sources
- Output: Scraping job ID, estimated completion time

GET /api/companies/data/<company_id>
- Input: Company ID
- Output: Complete company profile and interview insights
```

## Technical Implementation

### PDF Processing
- Extract text content from uploaded PDF files
- Maintain document structure and formatting information
- Handle various PDF formats and layouts

### AI Integration (AutoGen)
- **Multi-Agent Architecture**: Specialized AutoGen agents for different analysis tasks
- **ATS Scoring Agent**: Expert agent for calculating ATS compatibility scores
- **Resume Analysis Agent**: Comprehensive resume content and structure analysis
- **Improvement Suggestions Agent**: Career counselor agent for optimization recommendations
- **Keywords Analysis Agent**: Specialized agent for keyword extraction and matching
- **Intelligent Orchestration**: Coordinated multi-agent workflow for complete analysis
- **Contextual Analysis**: AI-powered understanding of resume content and job requirements
- **Structured Responses**: JSON-formatted outputs for consistent API responses

### Voice Processing Pipeline
- **Speech-to-Text**: Convert candidate responses to text using multiple engines
- **Natural Language Processing**: Analyze response content, sentiment, and quality
- **Text-to-Speech**: Generate natural-sounding interviewer questions
- **Audio Analysis**: Assess speech patterns, confidence levels, and delivery

### Web Scraping Engine
- **Multi-Source Scraping**: 
  - Company websites (careers, about, news sections)
  - Job portals (LinkedIn, Indeed, Glassdoor)
  - Review sites (Glassdoor, Blind, Fishbowl)
  - News sources for recent company updates
- **Dynamic Content Handling**: Selenium for JavaScript-heavy sites
- **Data Extraction**:
  - Company culture and values
  - Interview processes and formats
  - Recent achievements and news
  - Employee reviews and experiences
  - Common interview questions by role
- **Data Processing**: Clean, categorize, and structure scraped information
- **Update Mechanisms**: Scheduled scraping to keep data current

### Company Intelligence System
- **Data Aggregation**: Combine information from multiple sources
- **Question Generation**: AI-powered creation of company-specific questions
- **Context Building**: Create rich context for each target company
- **Relevance Scoring**: Rank questions by relevance to role and company

### Real-time Interview Flow
1. **Pre-Interview Setup**:
   - Scrape target company data
   - Generate company-specific question pool using AutoGen agents
   - Analyze candidate's resume against role requirements with specialized agents
   - Create personalized interview structure

2. **Interview Execution**:
   - Voice-based question delivery
   - Real-time speech recognition
   - Live response analysis using AutoGen evaluation agents
   - Adaptive question selection based on AI-powered response assessment

3. **Post-Interview Analysis**:
   - Comprehensive performance scoring by AutoGen scoring agents
   - Detailed feedback on each response using analysis agents
   - Company-specific improvement recommendations
   - Practice suggestions for weak areas identified by AI

### AutoGen Multi-Agent Analysis Pipeline
1. **Resume Upload & Processing**: Extract text from PDF files
2. **Agent Initialization**: Specialized AutoGen agents for different analysis aspects
3. **Parallel Analysis**: Multiple agents analyze different resume components simultaneously
4. **ATS Scoring Agent**: Evaluates format, keywords, content quality, and sections
5. **Improvement Agent**: Provides specific, actionable enhancement recommendations
6. **Keywords Agent**: Analyzes keyword matching and suggests optimizations
7. **Response Aggregation**: Combine insights from all agents into comprehensive report
8. **Structured Output**: JSON-formatted results for consistent API responses

## Web Scraping Architecture

### Target Data Sources
- **Company Websites**: 
  - About pages, careers sections, company culture
  - Recent news and press releases
  - Leadership and team information
  - Company values and mission statements

- **Job Portals**:
  - LinkedIn company pages and job postings
  - Indeed company reviews and job descriptions
  - Glassdoor interview experiences and company reviews
  - AngelList for startup information

- **Professional Networks**:
  - Employee reviews and experiences
  - Interview questions and processes
  - Company culture insights
  - Salary and benefits information

### Scraping Strategy
- **Respectful Scraping**: Follow robots.txt and implement proper delays
- **Multi-threaded Processing**: Parallel scraping for efficiency
- **Error Handling**: Robust error handling for failed requests
- **Data Validation**: Quality checks for scraped content
- **Update Scheduling**: Regular updates to keep data fresh
- **Backup Sources**: Multiple sources for critical information

### Data Processing Pipeline
1. **Raw Data Collection**: Gather HTML content from target sources
2. **Content Extraction**: Parse and extract relevant information
3. **Data Cleaning**: Remove irrelevant content and formatting
4. **Information Categorization**: Organize data by type and relevance
5. **Quality Assessment**: Score data quality and relevance
6. **Storage**: Store processed data in structured format
7. **Indexing**: Create searchable indexes for quick retrieval

### Company Intelligence Generation
- **Profile Building**: Create comprehensive company profiles
- **Question Synthesis**: Generate interview questions from company data
- **Context Creation**: Build rich context for each company
- **Trend Analysis**: Identify patterns in company hiring and culture
- **Competitive Analysis**: Compare companies within same industry

## Security & Performance
- **Input Validation**: Comprehensive validation for uploaded files and user inputs
- **Secure File Handling**: Encrypted storage and secure file processing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Privacy**: Secure handling of voice recordings and personal data
- **Scraping Ethics**: Respectful web scraping with proper delays and robots.txt compliance
- **Caching**: Redis caching for company data and frequent requests
- **Optimized Processing**: Asynchronous processing for web scraping and AI analysis
- **Error Handling**: Comprehensive error handling and logging
- **Audio Security**: Temporary audio file handling with automatic cleanup
- **Session Management**: Secure session handling for interview progress

## Future Enhancements
- **Multi-Language Support**: Voice interviews in multiple languages
- **Video Interview Simulation**: Add facial expression and body language analysis
- **AI Interviewer Personalities**: Different interviewer styles (friendly, tough, technical)
- **Group Interview Simulation**: Multiple AI interviewers for panel interviews
- **Industry-Specific Modules**: Specialized interview modules for different industries
- **Integration with Job Platforms**: Direct integration with LinkedIn, Indeed for job matching
- **Advanced Analytics**: Detailed performance trending and improvement tracking
- **Mobile App**: Native mobile application for on-the-go practice
- **VR/AR Integration**: Immersive interview experiences
- **Real-time Coaching**: Live suggestions during interview practice
- **Company Insider Insights**: Integration with employee networks for insider tips
- **Salary Negotiation Training**: Specialized modules for salary discussions

## Development Setup
[Setup instructions to be added]

## API Documentation
[Detailed API documentation to be added]

---
*Last Updated: September 2025*
