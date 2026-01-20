from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime

@dataclass
class ATSScore:
    """ATS Score data model"""
    overall_score: float
    max_score: float = 100
    grade: str = ""
    interpretation: str = ""
    detailed_scores: Dict[str, float] = None
    recommendations: List[str] = None
    
    def __post_init__(self):
        if self.detailed_scores is None:
            self.detailed_scores = {}
        if self.recommendations is None:
            self.recommendations = []

@dataclass
class TextStatistics:
    """Text statistics data model"""
    character_count: int
    word_count: int
    sentence_count: int
    average_words_per_sentence: float
    estimated_reading_time: float

@dataclass
class KeywordAnalysis:
    """Keyword analysis data model"""
    job_description_keywords: List[str]
    resume_keywords: List[str]
    matching_keywords: List[str]
    missing_keywords: List[str]
    keyword_density: float
    match_percentage: float

@dataclass
class ImprovementSuggestions:
    """Improvement suggestions data model"""
    ai_suggestions: Dict[str, List[str]]
    rule_based_suggestions: List[str]
    priority_improvements: List[str]
    strengths: List[str]

@dataclass
class ResumeAnalysisResult:
    """Complete resume analysis result"""
    ats_score: ATSScore
    text_statistics: TextStatistics
    sections_found: List[str]
    suggestions: ImprovementSuggestions
    keywords_analysis: KeywordAnalysis
    analysis_timestamp: str
    file_info: Optional[Dict] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON response"""
        result = {
            "ats_score": {
                "overall_score": self.ats_score.overall_score,
                "max_score": self.ats_score.max_score,
                "grade": self.ats_score.grade,
                "interpretation": self.ats_score.interpretation,
                "detailed_scores": self.ats_score.detailed_scores,
                "recommendations": self.ats_score.recommendations
            },
            "text_statistics": {
                "character_count": self.text_statistics.character_count,
                "word_count": self.text_statistics.word_count,
                "sentence_count": self.text_statistics.sentence_count,
                "average_words_per_sentence": self.text_statistics.average_words_per_sentence,
                "estimated_reading_time": self.text_statistics.estimated_reading_time
            },
            "sections_found": self.sections_found,
            "suggestions": {
                "ai_suggestions": self.suggestions.ai_suggestions,
                "rule_based_suggestions": self.suggestions.rule_based_suggestions,
                "priority_improvements": self.suggestions.priority_improvements,
                "strengths": self.suggestions.strengths
            },
            "keywords_analysis": {
                "job_description_keywords": self.keywords_analysis.job_description_keywords,
                "resume_keywords": self.keywords_analysis.resume_keywords,
                "matching_keywords": self.keywords_analysis.matching_keywords,
                "missing_keywords": self.keywords_analysis.missing_keywords,
                "keyword_density": self.keywords_analysis.keyword_density,
                "match_percentage": self.keywords_analysis.match_percentage
            },
            "analysis_timestamp": self.analysis_timestamp
        }
        
        if self.file_info:
            result["file_info"] = self.file_info
        
        if self.error:
            result["error"] = self.error
            
        return result
