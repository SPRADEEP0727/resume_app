import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ResumeAnalysisResponse, Skill } from '@/services/resumeService';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeStorage } from '@/hooks/useResumeStorage';

interface AnalysisContextType {
  analysisData: ResumeAnalysisResponse | null;
  setAnalysisData: (data: ResumeAnalysisResponse | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
}

interface UserProfile {
  name: string;
  email: string;
  skills: Skill[];
  recentActivity: Activity[];
}

interface Activity {
  action: string;
  date: string;
  type: string;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const { user } = useAuth();
  const { currentResume } = useResumeStorage();

  // Load analysis data when currentResume changes or when component mounts
  useEffect(() => {
    const loadAnalysisFromStorage = () => {

      if (currentResume?.analysis) {
        // Convert stored analysis back to ResumeAnalysisResponse format
        const storedAnalysis: ResumeAnalysisResponse = {
          ats_score: {
            overall_score: currentResume.analysis.atsScore,
            max_score: 100,
            grade: currentResume.analysis.overallRating,
            interpretation: getScoreInterpretation(currentResume.analysis.atsScore),
            detailed_scores: {
              format_score: currentResume.analysis.formattingScore || 0,
              keywords_score: 0,
              content_score: 0,
              sections_score: 0
            },
            recommendations: currentResume.analysis.suggestions,
            strengths: currentResume.analysis.strengths,
            areas_for_improvement: currentResume.analysis.weaknesses
          },
          analysis_details: {
            word_count: 0,
            sentence_count: 0,
            character_count: 0,
            average_words_per_sentence: 0,
            sections_identified: [],
            readability_score: 0
          },
          suggestions: {
            priority_improvements: currentResume.analysis.weaknesses,
            content_suggestions: currentResume.analysis.suggestions,
            formatting_tips: [],
            keyword_recommendations: currentResume.analysis.missingSkills || [],
            strengths: currentResume.analysis.strengths,
            missing_elements: currentResume.analysis.weaknesses
          },
          keywords_analysis: {
            job_description_keywords: [],
            resume_keywords: currentResume.analysis.skillsFound,
            matching_keywords: currentResume.analysis.skillsFound,
            missing_keywords: currentResume.analysis.missingSkills || [],
            keyword_density: currentResume.analysis.keywordDensity || 0,
            match_percentage: 0,
            critical_missing_keywords: currentResume.analysis.missingSkills || [],
            keyword_suggestions: currentResume.analysis.missingSkills || [],
            industry_keywords: []
          },
          skills_analysis: {
            technical_skills: currentResume.analysis.skillsFound.map(skill => ({
              name: skill,
              level: 'Intermediate' as const,
              years: 0,
              category: 'Technical'
            })),
            professional_skills: [],
            soft_skills: [],
            certifications: [],
            all_skills: currentResume.analysis.skillsFound.map(skill => ({
              name: skill,
              level: 'Intermediate' as const,
              years: 0,
              category: 'Technical'
            })),
            skills_summary: {
              total_skills: currentResume.analysis.skillsFound.length,
              technical_count: currentResume.analysis.skillsFound.length,
              professional_count: 0,
              soft_skills_count: 0,
              certifications_count: 0,
              average_experience_years: 0,
              skill_level_distribution: {}
            }
          },
          analysis_timestamp: new Date().toISOString(),
          analysis_method: 'Stored Analysis'
        };

        setAnalysisData(storedAnalysis);
      } else if (user && !currentResume) {
        // User is logged in but no current resume, clear analysis
        setAnalysisData(null);
      } else if (!user) {
        // User logged out, clear analysis
        setAnalysisData(null);
      } else {
        console.log('ℹ️ Current resume has no analysis data');
      }
    };

    loadAnalysisFromStorage();
  }, [currentResume, user]);

  // Additional effect to handle cases where currentResume is loaded after component mounts
  useEffect(() => {
    if (user && !currentResume && !analysisData) {
      // Small delay to allow useResumeStorage to load data
      const timeout = setTimeout(() => {
        // Resume loading completed
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [user, currentResume, analysisData]);

  // Helper function to get score interpretation
  const getScoreInterpretation = (score: number): string => {
    if (score >= 90) return "Excellent! Your resume is highly optimized for ATS systems.";
    if (score >= 80) return "Very Good! Minor improvements could boost your score.";
    if (score >= 70) return "Good! Some improvements needed for better ATS compatibility.";
    if (score >= 60) return "Fair! Significant improvements needed.";
    return "Poor! Major improvements required for ATS optimization.";
  };

  const value: AnalysisContextType = {
    analysisData,
    setAnalysisData,
    isLoading,
    setIsLoading,
    userProfile,
    setUserProfile,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};
