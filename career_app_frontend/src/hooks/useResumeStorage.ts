import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resumeStorageService, ResumeData, AnalysisData } from '@/services/resumeStorageService';
import { supabase } from '@/integrations/supabase/client';

interface UseResumeStorageReturn {
  // Current resume and analysis
  currentResume: (ResumeData & { analysis?: AnalysisData }) | null;
  
  // All user resumes
  userResumes: ResumeData[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  uploadAndSaveResume: (file: File, title?: string) => Promise<{ success: boolean; resumeId?: string; error?: string }>;
  saveAnalysis: (analysisData: Omit<AnalysisData, 'resumeId'>) => Promise<{ success: boolean; error?: string }>;
  loadUserResumes: () => Promise<void>;
  loadLatestResume: () => Promise<void>;
  deleteResume: (resumeId: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentResume: (resume: ResumeData & { analysis?: AnalysisData }) => void;
  
  // Utility
  getResumeDownloadUrl: (filePath: string) => Promise<string | null>;
}

export const useResumeStorage = (): UseResumeStorageReturn => {
  const { user } = useAuth();
  const [currentResume, setCurrentResume] = useState<(ResumeData & { analysis?: AnalysisData }) | null>(null);
  const [userResumes, setUserResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load latest resume when user logs in
  useEffect(() => {
    if (user?.id) {
      console.log('useResumeStorage: Loading resume for user:', user.id);
      loadLatestResume();
      loadUserResumes();
    } else {
      // Clear data when user logs out
      console.log('useResumeStorage: Clearing data on logout');
      setCurrentResume(null);
      setUserResumes([]);
    }
  }, [user?.id]);

  const uploadAndSaveResume = async (file: File, title?: string): Promise<{ success: boolean; resumeId?: string; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsSaving(true);
    try {
      // Extract text content from file (simplified - you might want to use a proper PDF parser)
      const textContent = file.type === 'text/plain' ? await file.text() : '';

      // Upload file to storage
      const { filePath, error: uploadError } = await resumeStorageService.uploadResumeFile(file, user.id);
      
      if (uploadError) {
        return { success: false, error: uploadError };
      }

      // Save resume record
      const resumeData: ResumeData = {
        title: title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        fileName: file.name,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        originalContent: textContent,
        isPrimary: userResumes.length === 0 // First resume is primary
      };

      const { resumeId, error: saveError } = await resumeStorageService.saveResumeRecord(resumeData, user.id);
      
      if (saveError) {
        return { success: false, error: saveError };
      }

      // Update local state by reloading from database to ensure data consistency
      await loadLatestResume(); // This ensures we get the complete resume data from database
      await loadUserResumes(); // Update the list as well

      return { success: true, resumeId };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  };

  const saveAnalysis = async (analysisData: Omit<AnalysisData, 'resumeId'>): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsSaving(true);
    try {
      // First, get the actual resume ID from the database to avoid ID mismatches
      console.log('saveAnalysis: Getting correct resume ID from database...');
      const { resume: dbResume, error: dbError } = await resumeStorageService.getLatestResumeWithAnalysis(user.id);
      
      if (dbError) {
        console.error('saveAnalysis: Failed to get resume from database:', dbError);
        return { success: false, error: `Failed to get resume from database: ${dbError}` };
      }

      if (!dbResume?.id) {
        console.error('saveAnalysis: No resume found in database for user');
        return { success: false, error: 'No resume found in database. Please upload a resume first.' };
      }

      console.log('saveAnalysis: Using correct resume ID from database:', dbResume.id);
      console.log('saveAnalysis: React state had resume ID:', currentResume?.id);

      const fullAnalysisData: AnalysisData = {
        ...analysisData,
        resumeId: dbResume.id  // Use the correct ID from database
      };

      const result = await resumeStorageService.saveAnalysisData(fullAnalysisData, user.id);
      
      if (result.success) {
        console.log('saveAnalysis: Analysis saved successfully, reloading from database...');
        // Reload the complete data from database to ensure sync
        await loadLatestResume();
      } else {
        console.error('saveAnalysis: Failed to save analysis:', result.error);
      }

      return result;
    } catch (error: any) {
      console.error('saveAnalysis: Unexpected error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserResumes = async (): Promise<void> => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { resumes, error } = await resumeStorageService.getUserResumes(user.id);
      
      if (error) {
        console.error('Failed to load user resumes:', error);
        return;
      }

      setUserResumes(resumes);
    } catch (error) {
      console.error('Failed to load user resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatestResume = async (): Promise<void> => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log('loadLatestResume: Loading for user:', user.id);
      const { resume, error } = await resumeStorageService.getLatestResumeWithAnalysis(user.id);
      
      if (error) {
        console.error('Failed to load latest resume:', error);
        return;
      }

      console.log('loadLatestResume: Result:', resume ? 'Resume loaded' : 'No resume found');
      if (resume) {
        console.log('loadLatestResume: Resume ID:', resume.id, 'Title:', resume.title);
      }
      setCurrentResume(resume || null);
    } catch (error) {
      console.error('Failed to load latest resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResume = async (resumeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const resumeToDelete = userResumes.find(r => r.id === resumeId);
      if (!resumeToDelete) {
        return { success: false, error: 'Resume not found' };
      }

      const result = await resumeStorageService.deleteResume(resumeId, resumeToDelete.filePath);
      
      if (result.success) {
        // Update local state
        setUserResumes(prev => prev.filter(r => r.id !== resumeId));
        
        // If this was the current resume, clear it
        if (currentResume?.id === resumeId) {
          setCurrentResume(null);
        }
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getResumeDownloadUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { url, error } = await resumeStorageService.getResumeFileUrl(filePath);
      
      if (error) {
        console.error('Failed to get download URL:', error);
        return null;
      }

      return url || null;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      return null;
    }
  };

  return {
    currentResume,
    userResumes,
    isLoading,
    isSaving,
    uploadAndSaveResume,
    saveAnalysis,
    loadUserResumes,
    loadLatestResume,
    deleteResume,
    setCurrentResume,
    getResumeDownloadUrl
  };
};
