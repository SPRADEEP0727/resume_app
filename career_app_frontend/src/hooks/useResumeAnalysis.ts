import { useState } from 'react';
import { resumeService, ResumeAnalysisResponse } from '@/services/resumeService';

export interface UseResumeAnalysisState {
  isLoading: boolean;
  analysis: ResumeAnalysisResponse | null;
  error: string | null;
}

export interface UseResumeAnalysisActions {
  analyzeResume: (file: File, jobDescription?: string) => Promise<void>;
  clearAnalysis: () => void;
  clearError: () => void;
}

export const useResumeAnalysis = (): UseResumeAnalysisState & UseResumeAnalysisActions => {
  const [state, setState] = useState<UseResumeAnalysisState>({
    isLoading: false,
    analysis: null,
    error: null,
  });

  const analyzeResume = async (file: File, jobDescription?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = await resumeService.analyzeResume({
        resume: file,
        job_description: jobDescription,
      });

      setState(prev => ({ ...prev, analysis, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  };

  const clearAnalysis = () => {
    setState(prev => ({ ...prev, analysis: null, error: null }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    analyzeResume,
    clearAnalysis,
    clearError,
  };
};
