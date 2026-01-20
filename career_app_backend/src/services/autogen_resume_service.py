from typing import Dict, List, Optional
import json
import os
from datetime import datetime
import sys
import openai

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from config.settings import Config

class AutoGenResumeAnalysisService:
    """Service for analyzing resumes using OpenAI's GPT models as AutoGen-style agents"""
    
    def __init__(self):
        """Initialize the AutoGen resume analysis service with OpenAI"""
        # Set up OpenAI client
        self.api_key = Config.OPENAI_API_KEY
        self.client = None
        self.model = "gpt-4o-mini"
        self.temperature = 0.3
        
        # Initialize client only if API key is available
        if self.api_key:
            try:
                openai.api_key = self.api_key
                self.client = openai.OpenAI(api_key=self.api_key)
                print("✅ OpenAI client initialized successfully")
            except Exception as e:
                print(f"⚠️ OpenAI client initialization failed: {e}")
                self.client = None
        else:
            print("⚠️ OpenAI API key not found - service will return error responses until configured")
    
    def analyze_resume(self, resume_text: str, job_description: str = "") -> Dict:
        """Complete resume analysis using OpenAI GPT-4o-mini as multiple specialized agents"""
        
        # Check if OpenAI client is properly initialized
        if not self.client:
            return {
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
                "analysis_timestamp": self._get_timestamp(),
                "analysis_method": "AutoGen GPT-4o-mini Agents (API Key Missing)"
            }
        
        try:
            print(f"🤖 Starting AutoGen analysis for resume ({len(resume_text)} characters)")
            
            # Get analysis from different specialized agents
            ats_score = self.calculate_ats_score(resume_text, job_description)
            analysis_details = self._analyze_text_content(resume_text)
            suggestions = self.get_improvement_suggestions(resume_text, job_description)
            keywords_analysis = self.extract_keywords(job_description, resume_text)
            skills_analysis = self.extract_skills(resume_text)
            
            # Combine all results
            result = {
                "ats_score": ats_score,
                "analysis_details": analysis_details,
                "suggestions": suggestions,
                "keywords_analysis": keywords_analysis,
                "skills_analysis": skills_analysis,
                "analysis_timestamp": self._get_timestamp(),
                "analysis_method": "AutoGen GPT-4o-mini Agents"
            }
            
            print(f"✅ AutoGen analysis completed - ATS Score: {ats_score.get('overall_score', 0)}")
            return result
            
        except Exception as e:
            print(f"❌ AutoGen analysis failed: {str(e)}")
            return {
                "error": f"AutoGen analysis failed: {str(e)}",
                "analysis_timestamp": self._get_timestamp(),
                "analysis_method": "AutoGen GPT-4o-mini Agents (Failed)"
            }
    
    def calculate_ats_score(self, resume_text: str, job_description: str = "") -> Dict:
        """ATS Specialist Agent - Calculate ATS compatibility score using GPT-4o-mini"""
        try:
            print("🎯 ATS Specialist Agent analyzing resume...")
            
            prompt = f"""You are an expert ATS (Applicant Tracking System) specialist. 
            Your role is to analyze resumes and provide detailed ATS compatibility scores.

            RESUME TEXT:
            {resume_text}

            JOB DESCRIPTION (if provided):
            {job_description if job_description else "No specific job description provided - use general ATS criteria"}

            Please evaluate and score the resume on these criteria (total 100 points):

            1. FORMAT AND STRUCTURE (30 points):
               - Clear section headers and organization
               - Consistent formatting and layout
               - Professional presentation
               - Contact information completeness
               - Proper use of bullet points and white space

            2. KEYWORDS MATCHING (25 points):
               - Relevant industry keywords
               - Job-specific terminology
               - Technical skills and competencies
               - Action verbs and professional language

            3. CONTENT QUALITY (25 points):
               - Quantifiable achievements and metrics
               - Specific accomplishments
               - Relevant work experience
               - Professional language and tone

            4. SECTIONS COMPLETENESS (20 points):
               - Essential sections present (contact, experience, education, skills)
               - Professional summary or objective
               - Additional relevant sections

            Return your response as a valid JSON object with this exact structure:
            {{
                "overall_score": 85,
                "max_score": 100,
                "grade": "B+",
                "interpretation": "Good ATS compatibility with minor improvements needed",
                "detailed_scores": {{
                    "format_score": 25,
                    "keywords_score": 20,
                    "content_score": 22,
                    "sections_score": 18
                }},
                "recommendations": [
                    "Add more industry-specific keywords",
                    "Include quantifiable achievements"
                ],
                "strengths": [
                    "Well-structured format",
                    "Complete contact information"
                ],
                "areas_for_improvement": [
                    "Missing technical keywords",
                    "Need more specific achievements"
                ]
            }}"""

            response = self._call_gpt4_agent(prompt, "ATS Specialist")
            return self._parse_json_response(response, "ats_score")
            
        except Exception as e:
            print(f"❌ ATS Specialist Agent failed: {str(e)}")
            return {
                "overall_score": 0,
                "max_score": 100,
                "grade": "F",
                "interpretation": f"ATS analysis failed: {str(e)}",
                "detailed_scores": {},
                "recommendations": ["Please try again with a valid resume"]
            }
    
    def get_improvement_suggestions(self, resume_text: str, job_description: str = "") -> Dict:
        """Career Counselor Agent - Get detailed improvement suggestions using GPT-4o-mini"""
        try:
            print("💡 Career Counselor Agent generating suggestions...")
            
            prompt = f"""You are a professional career counselor and resume optimization expert.
            Your role is to provide specific, actionable improvement suggestions.

            RESUME TEXT:
            {resume_text}

            JOB DESCRIPTION (if provided):
            {job_description if job_description else "No specific job description - provide general improvements"}

            Please provide detailed improvement suggestions focusing on:
            1. Content improvements and enhancements
            2. Formatting and presentation tips
            3. Keyword optimization strategies
            4. ATS compatibility improvements
            5. Professional presentation advice

            Also identify the resume's current strengths to build upon.

            Return your response as a valid JSON object with this exact structure:
            {{
                "priority_improvements": [
                    "Add quantifiable achievements with specific numbers and percentages",
                    "Include more relevant technical keywords from the job description",
                    "Improve bullet point formatting for better readability"
                ],
                "content_suggestions": [
                    "Replace weak action verbs with stronger alternatives like 'spearheaded', 'optimized'",
                    "Add specific project outcomes and business impact metrics",
                    "Include leadership examples and team collaboration experiences"
                ],
                "formatting_tips": [
                    "Use consistent bullet point style throughout the document",
                    "Ensure proper spacing between sections for better readability",
                    "Consider using a more ATS-friendly font like Arial or Calibri"
                ],
                "keyword_recommendations": [
                    "Add industry-specific technical terms relevant to your field",
                    "Include relevant certification names and professional qualifications",
                    "Incorporate keywords from the job description naturally"
                ],
                "strengths": [
                    "Clear professional experience section with relevant roles",
                    "Good use of action verbs to describe responsibilities",
                    "Complete contact information and professional email"
                ],
                "missing_elements": [
                    "Professional summary section at the top",
                    "Technical skills section with specific tools",
                    "Quantifiable achievements section"
                ]
            }}"""

            response = self._call_gpt4_agent(prompt, "Career Counselor")
            return self._parse_json_response(response, "suggestions")
            
        except Exception as e:
            print(f"❌ Career Counselor Agent failed: {str(e)}")
            return {
                "priority_improvements": ["Please try again with a valid resume"],
                "content_suggestions": [],
                "formatting_tips": [],
                "keyword_recommendations": [],
                "strengths": ["Resume uploaded successfully"],
                "missing_elements": [],
                "error": f"Suggestions generation failed: {str(e)}"
            }
    
    def extract_keywords(self, job_description: str, resume_text: str = "") -> Dict:
        """Keyword Optimization Agent - Analyze keywords using GPT-4o-mini"""
        try:
            print("🔍 Keyword Optimization Agent analyzing keywords...")
            
            prompt = f"""You are a keyword optimization expert specializing in resume analysis.
            Your role is to analyze keyword matching between resumes and job descriptions.

            JOB DESCRIPTION:
            {job_description if job_description else "No job description provided - analyze resume keywords only"}

            RESUME TEXT:
            {resume_text}

            Please provide comprehensive keyword analysis including:
            1. Extract key terms and skills from the job description
            2. Identify keywords present in the resume
            3. Find matching keywords between both
            4. Identify missing critical keywords
            5. Calculate keyword density and matching percentage
            6. Suggest specific keyword improvements

            Return your response as a valid JSON object with this exact structure:
            {{
                "job_description_keywords": [
                    "python", "machine learning", "data analysis", "sql", "tensorflow"
                ],
                "resume_keywords": [
                    "python", "data analysis", "javascript", "web development", "react"
                ],
                "matching_keywords": [
                    "python", "data analysis"
                ],
                "missing_keywords": [
                    "machine learning", "sql", "tensorflow"
                ],
                "keyword_density": 4.2,
                "match_percentage": 40.0,
                "critical_missing_keywords": [
                    "machine learning", "sql"
                ],
                "keyword_suggestions": [
                    "Add 'machine learning' in skills section with specific projects",
                    "Include 'SQL' in technical competencies with database experience",
                    "Mention 'TensorFlow' if you have experience with ML frameworks"
                ],
                "industry_keywords": [
                    "data science", "analytics", "statistical modeling", "predictive analysis"
                ]
            }}"""

            response = self._call_gpt4_agent(prompt, "Keyword Optimization Agent")
            return self._parse_json_response(response, "keywords")
            
        except Exception as e:
            print(f"❌ Keyword Optimization Agent failed: {str(e)}")
            return {
                "job_description_keywords": [],
                "resume_keywords": [],
                "matching_keywords": [],
                "missing_keywords": [],
                "keyword_density": 0,
                "match_percentage": 0,
                "error": f"Keyword extraction failed: {str(e)}"
            }
    
    def _analyze_text_content(self, text: str) -> Dict:
        """Content Analysis Agent - Analyze text structure and readability using GPT-4o-mini"""
        try:
            print("📊 Content Analysis Agent analyzing text structure...")
            
            prompt = f"""You are a professional content analysis expert.
            Analyze this resume text and provide detailed metrics and observations.

            RESUME TEXT:
            {text}

            Please analyze and provide:
            1. Text statistics (word count, readability, etc.)
            2. Resume sections identified
            3. Overall content quality assessment
            4. Professional presentation evaluation

            Return your response as a valid JSON object with this exact structure:
            {{
                "word_count": 450,
                "sentence_count": 25,
                "character_count": 2800,
                "average_words_per_sentence": 18.0,
                "sections_identified": ["Contact", "Summary", "Experience", "Education", "Skills"],
                "readability_score": 75.5,
                "content_quality": "Professional with room for improvement",
                "key_observations": [
                    "Well-structured professional experience section",
                    "Clear section headers throughout",
                    "Good use of action verbs"
                ]
            }}"""

            response = self._call_gpt4_agent(prompt, "Content Analysis Agent")
            return self._parse_json_response(response, "analysis")
            
        except Exception as e:
            print(f"❌ Content Analysis Agent failed: {str(e)}")
            return {
                "error": f"Content analysis failed: {str(e)}"
            }
    
    def _call_gpt4_agent(self, prompt: str, agent_name: str) -> str:
        """Call GPT-4o-mini as a specialized agent"""
        try:
            print(f"🤖 Calling {agent_name} with GPT-4o-mini...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": f"You are {agent_name}, a highly specialized AI agent. Always return valid JSON responses as requested."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=2000
            )
            
            result = response.choices[0].message.content.strip()
            print(f"✅ {agent_name} responded successfully")
            return result
            
        except Exception as e:
            print(f"❌ {agent_name} API call failed: {str(e)}")
            raise Exception(f"{agent_name} analysis failed: {str(e)}")
    
    def _parse_json_response(self, response: str, fallback_key: str) -> Dict:
        """Parse JSON response with comprehensive fallback"""
        try:
            # First try to parse the entire response as JSON
            return json.loads(response)
            
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            import re
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            
            # Try to find JSON object in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            print(f"⚠️ Failed to parse JSON response, using fallback for {fallback_key}")
            
            # Return appropriate fallback structure
            return self._get_fallback_response(fallback_key, response)
    
    def _get_fallback_response(self, fallback_key: str, raw_response: str) -> Dict:
        """Return error when JSON parsing fails - no mock data"""
        return {
            "error": f"AI {fallback_key} analysis failed - unable to parse response",
            "raw_ai_response": raw_response[:200] + "..." if len(raw_response) > 200 else raw_response
        }
    
    def extract_skills(self, resume_text: str) -> Dict:
        """Skills Extraction Agent - Extract and categorize skills from resume using GPT-4o-mini"""
        try:
            print("🛠️ Skills Extraction Agent analyzing resume...")
            
            prompt = f"""You are a professional skills extraction specialist.
            Your role is to analyze resumes and extract all skills, categorize them, and assess proficiency levels.

            RESUME TEXT:
            {resume_text}

            Please extract and categorize all skills from this resume. Analyze:
            1. Technical skills (programming languages, frameworks, tools)
            2. Professional skills (project management, leadership, etc.)
            3. Domain expertise (industry-specific knowledge)
            4. Soft skills (communication, teamwork, etc.)
            5. Certifications and qualifications

            For each skill, estimate:
            - Proficiency level (Beginner, Intermediate, Advanced, Expert)
            - Years of experience (estimate based on context)
            - Category classification

            Return your response as a valid JSON object with this exact structure:
            {{
                "technical_skills": [
                    {{"name": "Python", "level": "Advanced", "years": 4, "category": "Programming"}},
                    {{"name": "React.js", "level": "Intermediate", "years": 2, "category": "Frontend"}},
                    {{"name": "AWS", "level": "Beginner", "years": 1, "category": "Cloud"}}
                ],
                "professional_skills": [
                    {{"name": "Project Management", "level": "Advanced", "years": 5, "category": "Management"}},
                    {{"name": "Team Leadership", "level": "Intermediate", "years": 3, "category": "Leadership"}}
                ],
                "soft_skills": [
                    {{"name": "Communication", "level": "Advanced", "years": 5, "category": "Interpersonal"}},
                    {{"name": "Problem Solving", "level": "Expert", "years": 6, "category": "Analytical"}}
                ],
                "certifications": [
                    {{"name": "AWS Certified Solutions Architect", "level": "Certified", "years": 1, "category": "Cloud"}},
                    {{"name": "PMP Certification", "level": "Certified", "years": 2, "category": "Management"}}
                ],
                "all_skills": [
                    {{"name": "Python", "level": "Advanced", "years": 4, "category": "Programming"}},
                    {{"name": "React.js", "level": "Intermediate", "years": 2, "category": "Frontend"}},
                    {{"name": "Project Management", "level": "Advanced", "years": 5, "category": "Management"}},
                    {{"name": "Communication", "level": "Advanced", "years": 5, "category": "Interpersonal"}}
                ],
                "skills_summary": {{
                    "total_skills": 15,
                    "technical_count": 8,
                    "professional_count": 3,
                    "soft_skills_count": 2,
                    "certifications_count": 2,
                    "average_experience_years": 3.2,
                    "skill_level_distribution": {{
                        "Expert": 2,
                        "Advanced": 6,
                        "Intermediate": 5,
                        "Beginner": 2
                    }}
                }}
            }}"""

            response = self._call_gpt4_agent(prompt, "Skills Extraction Agent")
            return self._parse_json_response(response, "skills")
            
        except Exception as e:
            print(f"❌ Skills Extraction Agent failed: {str(e)}")
            return {
                "technical_skills": [],
                "professional_skills": [],
                "soft_skills": [],
                "certifications": [],
                "all_skills": [],
                "skills_summary": {
                    "total_skills": 0,
                    "technical_count": 0,
                    "professional_count": 0,
                    "soft_skills_count": 0,
                    "certifications_count": 0,
                    "average_experience_years": 0,
                    "skill_level_distribution": {}
                },
                "error": f"Skills extraction failed: {str(e)}"
            }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.now().isoformat()
