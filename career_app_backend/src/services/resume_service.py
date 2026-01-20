from typing import Dict, List, Optional
import json
import os
import re
from datetime import datetime
from config.settings import Config

class ResumeAnalysisService:
    """Service for analyzing resumes with basic rule-based analysis"""
    
    def __init__(self):
        """Initialize the resume analysis service"""
        pass
    
    def analyze_resume(self, resume_text: str, job_description: str = "") -> Dict:
        """Complete resume analysis using rule-based methods"""
        try:
            # Basic text analysis
            analysis_details = self._analyze_text_content(resume_text)
            
            # Calculate ATS score
            ats_score = self.calculate_ats_score(resume_text, job_description)
            
            # Get improvement suggestions
            suggestions = self.get_improvement_suggestions(resume_text, job_description)
            
            # Get keywords analysis
            keywords_analysis = self.extract_keywords(job_description, resume_text)
            
            # Combine all results
            return {
                "ats_score": ats_score,
                "analysis_details": analysis_details,
                "suggestions": suggestions,
                "keywords_analysis": keywords_analysis,
                "analysis_timestamp": self._get_timestamp()
            }
            
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "ats_score": {"overall_score": 0, "details": {}},
                "suggestions": {"improvements": [], "strengths": []},
                "analysis_timestamp": self._get_timestamp()
            }
    
    def calculate_ats_score(self, resume_text: str, job_description: str = "") -> Dict:
        """Calculate ATS compatibility score using rule-based analysis"""
        try:
            scores = {}
            total_score = 0
            
            # Format and Structure Analysis (30 points)
            format_score = self._analyze_format_structure(resume_text)
            scores["format_score"] = format_score
            total_score += format_score
            
            # Keywords Matching (25 points) 
            keywords_score = self._analyze_keywords_matching(resume_text, job_description)
            scores["keywords_score"] = keywords_score
            total_score += keywords_score
            
            # Content Quality (25 points)
            content_score = self._analyze_content_quality(resume_text)
            scores["content_score"] = content_score
            total_score += content_score
            
            # Sections Completeness (20 points)
            sections_score = self._analyze_sections_completeness(resume_text)
            scores["sections_score"] = sections_score
            total_score += sections_score
            
            # Calculate grade
            grade = self._calculate_grade(total_score)
            interpretation = self._get_score_interpretation(total_score)
            
            return {
                "overall_score": total_score,
                "max_score": 100,
                "grade": grade,
                "interpretation": interpretation,
                "detailed_scores": scores,
                "recommendations": self._get_score_recommendations(scores),
                "strengths": self._identify_strengths(scores),
                "areas_for_improvement": self._identify_improvements(scores)
            }
            
        except Exception as e:
            return {
                "overall_score": 0,
                "max_score": 100,
                "grade": "F",
                "interpretation": f"Scoring failed: {str(e)}",
                "detailed_scores": {},
                "recommendations": ["Please try again with a valid resume"]
            }
    
    def get_improvement_suggestions(self, resume_text: str, job_description: str = "") -> Dict:
        """Get improvement suggestions using rule-based analysis"""
        try:
            suggestions = {
                "priority_improvements": [],
                "content_suggestions": [],
                "formatting_tips": [],
                "keyword_recommendations": [],
                "strengths": [],
                "missing_elements": []
            }
            
            # Analyze content and provide suggestions
            word_count = len(resume_text.split())
            if word_count < 200:
                suggestions["priority_improvements"].append("Expand resume content - current word count is too low")
            elif word_count > 800:
                suggestions["priority_improvements"].append("Consider condensing resume - current word count is very high")
            
            # Check for action verbs
            action_verbs = ["achieved", "developed", "managed", "led", "created", "implemented", "improved"]
            found_verbs = [verb for verb in action_verbs if verb.lower() in resume_text.lower()]
            if len(found_verbs) < 3:
                suggestions["content_suggestions"].append("Add more strong action verbs to describe accomplishments")
            else:
                suggestions["strengths"].append("Good use of action verbs")
            
            # Check for quantifiable achievements
            numbers_pattern = r'\d+%|\d+\+|\$\d+|\d+ [a-zA-Z]+'
            if not re.search(numbers_pattern, resume_text):
                suggestions["priority_improvements"].append("Add quantifiable achievements with specific numbers or percentages")
            else:
                suggestions["strengths"].append("Contains quantifiable achievements")
            
            # Check for contact information
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
            
            if re.search(email_pattern, resume_text):
                suggestions["strengths"].append("Email address found")
            else:
                suggestions["missing_elements"].append("Email address")
                
            if re.search(phone_pattern, resume_text):
                suggestions["strengths"].append("Phone number found")
            else:
                suggestions["missing_elements"].append("Phone number")
            
            # Check for common sections
            sections = ["experience", "education", "skills", "summary", "objective"]
            found_sections = [section for section in sections if section.lower() in resume_text.lower()]
            
            if len(found_sections) >= 3:
                suggestions["strengths"].append("Resume contains multiple important sections")
            else:
                suggestions["missing_elements"].extend([s for s in sections if s not in found_sections])
            
            # Formatting tips
            suggestions["formatting_tips"].extend([
                "Use consistent bullet points throughout",
                "Ensure proper spacing between sections",
                "Use a professional font and format",
                "Keep formatting simple for ATS compatibility"
            ])
            
            # Keyword recommendations
            if job_description:
                suggestions["keyword_recommendations"].append("Include keywords from the job description")
                suggestions["keyword_recommendations"].append("Add industry-specific terminology")
            else:
                suggestions["keyword_recommendations"].extend([
                    "Add relevant industry keywords",
                    "Include technical skills and competencies",
                    "Mention relevant certifications or qualifications"
                ])
            
            return suggestions
            
        except Exception as e:
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
        """Extract and analyze keywords using basic text analysis"""
        try:
            # Basic keyword extraction
            resume_words = self._extract_keywords_from_text(resume_text)
            job_words = self._extract_keywords_from_text(job_description) if job_description else []
            
            # Find matching keywords
            matching_keywords = list(set(resume_words) & set(job_words)) if job_description else []
            missing_keywords = list(set(job_words) - set(resume_words)) if job_description else []
            
            # Calculate match percentage
            match_percentage = (len(matching_keywords) / len(job_words) * 100) if job_words else 0
            
            # Calculate keyword density
            keyword_density = len(resume_words) / len(resume_text.split()) * 100 if resume_text else 0
            
            return {
                "job_description_keywords": job_words[:20],  # Top 20 keywords
                "resume_keywords": resume_words[:20],  # Top 20 keywords
                "matching_keywords": matching_keywords,
                "missing_keywords": missing_keywords[:10],  # Top 10 missing
                "keyword_density": round(keyword_density, 2),
                "match_percentage": round(match_percentage, 2),
                "critical_missing_keywords": missing_keywords[:5],  # Top 5 critical
                "keyword_suggestions": self._generate_keyword_suggestions(missing_keywords),
                "industry_keywords": self._get_common_industry_keywords()
            }
            
        except Exception as e:
            return {
                "job_description_keywords": [],
                "resume_keywords": [],
                "matching_keywords": [],
                "missing_keywords": [],
                "keyword_density": 0,
                "match_percentage": 0,
                "error": f"Keyword extraction failed: {str(e)}"
            }
    
    # Helper methods for analysis
    def _analyze_text_content(self, text: str) -> Dict:
        """Analyze basic text content"""
        words = text.split()
        sentences = text.split('.')
        
        return {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "character_count": len(text),
            "average_words_per_sentence": round(len(words) / len(sentences), 2) if sentences else 0,
            "sections_identified": self._identify_sections(text),
            "readability_score": self._calculate_readability(text)
        }
    
    def _analyze_format_structure(self, text: str) -> int:
        """Analyze format and structure (max 30 points)"""
        score = 0
        
        # Check for section headers
        common_headers = ["experience", "education", "skills", "summary", "contact"]
        headers_found = sum(1 for header in common_headers if header.lower() in text.lower())
        score += min(headers_found * 3, 15)
        
        # Check for contact information
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        
        if re.search(email_pattern, text):
            score += 5
        if re.search(phone_pattern, text):
            score += 5
        
        # Check for bullet points or organized structure
        if '•' in text or '*' in text or '-' in text:
            score += 5
        
        return min(score, 30)
    
    def _analyze_keywords_matching(self, resume_text: str, job_description: str) -> int:
        """Analyze keyword matching (max 25 points)"""
        if not job_description:
            return 15  # Default score if no job description
        
        resume_keywords = self._extract_keywords_from_text(resume_text)
        job_keywords = self._extract_keywords_from_text(job_description)
        
        if not job_keywords:
            return 15
        
        matching_keywords = set(resume_keywords) & set(job_keywords)
        match_ratio = len(matching_keywords) / len(job_keywords)
        
        return min(int(match_ratio * 25), 25)
    
    def _analyze_content_quality(self, text: str) -> int:
        """Analyze content quality (max 25 points)"""
        score = 0
        
        # Check for action verbs
        action_verbs = ["achieved", "developed", "managed", "led", "created", "implemented", "improved", "designed", "executed", "delivered"]
        found_verbs = sum(1 for verb in action_verbs if verb.lower() in text.lower())
        score += min(found_verbs * 2, 10)
        
        # Check for quantifiable achievements
        numbers_pattern = r'\d+%|\d+\+|\$\d+|\d+ [a-zA-Z]+'
        numbers_found = len(re.findall(numbers_pattern, text))
        score += min(numbers_found * 3, 10)
        
        # Check for professional language
        professional_terms = ["responsible", "collaborated", "coordinated", "analyzed", "optimized"]
        prof_terms_found = sum(1 for term in professional_terms if term.lower() in text.lower())
        score += min(prof_terms_found, 5)
        
        return min(score, 25)
    
    def _analyze_sections_completeness(self, text: str) -> int:
        """Analyze sections completeness (max 20 points)"""
        score = 0
        required_sections = ["experience", "education", "skills", "contact"]
        
        for section in required_sections:
            if section.lower() in text.lower():
                score += 5
        
        return min(score, 20)
    
    def _extract_keywords_from_text(self, text: str) -> List[str]:
        """Extract keywords from text"""
        if not text:
            return []
        
        # Common technical and professional keywords
        keywords = []
        
        # Clean and split text
        clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
        words = clean_text.split()
        
        # Filter for meaningful keywords (3+ characters, not common words)
        common_words = {"the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use"}
        
        for word in words:
            if len(word) >= 3 and word not in common_words:
                keywords.append(word)
        
        # Return unique keywords, most frequent first
        from collections import Counter
        keyword_counts = Counter(keywords)
        return [word for word, count in keyword_counts.most_common(50)]
    
    def _calculate_grade(self, score: int) -> str:
        """Calculate letter grade from score"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    def _get_score_interpretation(self, score: int) -> str:
        """Get interpretation of the score"""
        if score >= 90:
            return "Excellent ATS compatibility - resume should pass most ATS systems"
        elif score >= 80:
            return "Good ATS compatibility with minor improvements needed"
        elif score >= 70:
            return "Fair ATS compatibility - several improvements recommended"
        elif score >= 60:
            return "Poor ATS compatibility - significant improvements needed"
        else:
            return "Very poor ATS compatibility - major revision required"
    
    def _get_score_recommendations(self, scores: Dict) -> List[str]:
        """Get recommendations based on scores"""
        recommendations = []
        
        if scores.get("format_score", 0) < 20:
            recommendations.append("Improve resume formatting and structure")
        if scores.get("keywords_score", 0) < 15:
            recommendations.append("Add more relevant keywords")
        if scores.get("content_score", 0) < 15:
            recommendations.append("Enhance content with action verbs and achievements")
        if scores.get("sections_score", 0) < 15:
            recommendations.append("Include all essential resume sections")
        
        return recommendations
    
    def _identify_strengths(self, scores: Dict) -> List[str]:
        """Identify strengths based on scores"""
        strengths = []
        
        if scores.get("format_score", 0) >= 25:
            strengths.append("Well-structured format")
        if scores.get("keywords_score", 0) >= 20:
            strengths.append("Good keyword optimization")
        if scores.get("content_score", 0) >= 20:
            strengths.append("High-quality content")
        if scores.get("sections_score", 0) >= 18:
            strengths.append("Complete resume sections")
        
        return strengths
    
    def _identify_improvements(self, scores: Dict) -> List[str]:
        """Identify areas for improvement"""
        improvements = []
        
        if scores.get("format_score", 0) < 20:
            improvements.append("Format and structure need work")
        if scores.get("keywords_score", 0) < 15:
            improvements.append("Missing relevant keywords")
        if scores.get("content_score", 0) < 15:
            improvements.append("Content quality could be enhanced")
        if scores.get("sections_score", 0) < 15:
            improvements.append("Missing essential sections")
        
        return improvements
    
    def _identify_sections(self, text: str) -> List[str]:
        """Identify sections in the resume"""
        common_sections = ["summary", "objective", "experience", "education", "skills", "certifications", "projects", "achievements"]
        found_sections = []
        
        for section in common_sections:
            if section.lower() in text.lower():
                found_sections.append(section.capitalize())
        
        return found_sections
    
    def _calculate_readability(self, text: str) -> float:
        """Calculate basic readability score"""
        words = text.split()
        sentences = text.split('.')
        
        if not sentences or not words:
            return 0
        
        avg_sentence_length = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Simple readability approximation
        readability = 100 - (avg_sentence_length * 2) - (avg_word_length * 3)
        return max(0, min(100, readability))
    
    def _generate_keyword_suggestions(self, missing_keywords: List[str]) -> List[str]:
        """Generate keyword suggestions"""
        suggestions = []
        
        for keyword in missing_keywords[:5]:
            suggestions.append(f"Consider adding '{keyword}' to relevant sections")
        
        if not suggestions:
            suggestions = [
                "Add more industry-specific technical terms",
                "Include relevant certification names",
                "Mention specific tools and technologies used"
            ]
        
        return suggestions
    
    def _get_common_industry_keywords(self) -> List[str]:
        """Get common industry keywords"""
        return [
            "leadership", "management", "development", "analysis", "design",
            "implementation", "optimization", "collaboration", "communication",
            "problem-solving", "project management", "strategic planning"
        ]
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.now().isoformat()
