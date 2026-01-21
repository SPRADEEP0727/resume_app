const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ResumeAnalysisRequest {
  resume: File;
  job_description?: string;
}

export interface ATSScore {
  overall_score: number;
  max_score: number;
  grade: string;
  interpretation: string;
  detailed_scores: {
    format_score: number;
    keywords_score: number;
    content_score: number;
    sections_score: number;
  };
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export interface Suggestions {
  priority_improvements: string[];
  content_suggestions: string[];
  formatting_tips: string[];
  keyword_recommendations: string[];
  strengths: string[];
  missing_elements: string[];
}

export interface KeywordAnalysis {
  job_description_keywords: string[];
  resume_keywords: string[];
  matching_keywords: string[];
  missing_keywords: string[];
  keyword_density: number;
  match_percentage: number;
  critical_missing_keywords: string[];
  keyword_suggestions: string[];
  industry_keywords: string[];
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Certified';
  years: number;
  category: string;
}

export interface SkillsAnalysis {
  technical_skills: Skill[];
  professional_skills: Skill[];
  soft_skills: Skill[];
  certifications: Skill[];
  all_skills: Skill[];
  skill_gaps?: string[];
  skills_summary: {
    total_skills: number;
    technical_count: number;
    professional_count: number;
    soft_skills_count: number;
    certifications_count: number;
    average_experience_years: number;
    skill_level_distribution: Record<string, number>;
  };
}

export interface AnalysisDetails {
  word_count: number;
  sentence_count: number;
  character_count: number;
  average_words_per_sentence: number;
  sections_identified: string[];
  readability_score: number;
}

export interface ResumeAnalysisResponse {
  ats_score: ATSScore;
  analysis_details: AnalysisDetails;
  suggestions: Suggestions;
  keywords_analysis: KeywordAnalysis;
  skills_analysis: SkillsAnalysis;
  analysis_timestamp: string;
  analysis_method?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export const resumeService = {
  // Check backend health
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Backend service is not available');
    }

    return await response.json();
  },

  // Analyze resume with optional job description
  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    const formData = new FormData();
    formData.append('resume', request.resume);
    
    if (request.job_description) {
      formData.append('job_description', request.job_description);
    }

    const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Resume analysis failed');
    }

    return await response.json();
  },

  // Get ATS score only
  async getATSScore(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    const response = await fetch(`${API_BASE_URL}/resume/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'ATS scoring failed');
    }

    return await response.json();
  },

  // Get improvement suggestions only
  async getSuggestions(resumeText: string, jobDescription?: string): Promise<Suggestions> {
    const response = await fetch(`${API_BASE_URL}/resume/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Suggestions generation failed');
    }

    return await response.json();
  },

  // Extract keywords only
  async extractKeywords(jobDescription: string, resumeText?: string): Promise<KeywordAnalysis> {
    const response = await fetch(`${API_BASE_URL}/resume/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_description: jobDescription,
        resume_text: resumeText || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Keyword extraction failed');
    }

    return await response.json();
  },
};
