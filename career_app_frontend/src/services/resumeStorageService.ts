import { supabase } from '@/lib/supabase';

export interface ResumeData {
  id?: string;
  title: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  originalContent?: string;
  isPrimary?: boolean;
}

export interface AnalysisData {
  resumeId: string;
  atsScore: number;
  overallRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  skillsFound: any[];  // Can be strings or skill objects from AI
  missingSkills?: string[];
  skillCategories?: Record<string, any>;  // Allow any structure for AI analysis
  sectionsAnalysis?: Record<string, any>;
  formattingScore?: number;
  keywordDensity?: number;
  analysisType?: 'quick' | 'comprehensive' | 'ats-focused';
  jobDescription?: string;
}

export interface JobDescription {
  id?: string;
  title: string;
  company?: string;
  description: string;
  requirements?: string[];
  skillsRequired?: string[];
  location?: string;
  salaryRange?: string;
  isFavorite?: boolean;
}

class ResumeStorageService {
  private bucketName = 'resumes';

  // Helper methods for data transformation
  private convertRatingToGrade(rating: string): string {
    switch (rating) {
      case 'Excellent': return 'A';
      case 'Very Good': return 'B';
      case 'Good': return 'C';
      case 'Fair': return 'D';
      case 'Poor': return 'F';
      default: return 'C';
    }
  }

  private getScoreInterpretation(score: number): string {
    if (score >= 90) return 'Excellent resume with high ATS compatibility';
    if (score >= 80) return 'Very good resume with good ATS compatibility';
    if (score >= 70) return 'Good resume with decent ATS compatibility';
    if (score >= 60) return 'Fair resume with some ATS issues to address';
    return 'Poor ATS compatibility, significant improvements needed';
  }

  private transformSkillsForUI(skills: any[]): any[] {
    if (!Array.isArray(skills)) return [];
    return skills.map(skill => {
      if (typeof skill === 'string') {
        return {
          name: skill,
          level: 'Unknown',
          years: 0,
          category: 'General'
        };
      }
      return skill;
    });
  }

  async uploadResumeFile(file: File, userId: string): Promise<{ filePath: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Try to upload to storage, but don't fail if storage isn't set up
      try {
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(fileName, file);

        if (error) {
          console.warn('Storage upload failed, using fallback:', error.message);
          // Return a fallback path for now
          return { filePath: `fallback/${fileName}` };
        }

        return { filePath: data.path };
      } catch (storageError) {
        console.warn('Storage not configured, using fallback path:', storageError);
        // Return a fallback path when storage is not set up
        return { filePath: `fallback/${fileName}` };
      }
    } catch (error: any) {
      return { filePath: '', error: error.message };
    }
  }

  async saveResumeRecord(resumeData: ResumeData, userId: string): Promise<{ resumeId?: string; error?: string }> {
    try {
      // Try the new upload_user_resume function first
      try {
        const { data, error } = await supabase.rpc('upload_user_resume', {
          p_user_id: userId,
          p_title: resumeData.title,
          p_file_name: resumeData.fileName,
          p_file_path: resumeData.filePath,
          p_file_size: resumeData.fileSize || null,
          p_file_type: resumeData.fileType || null,
          p_original_content: resumeData.originalContent || null
        });

        if (error) {
          throw new Error(error.message);
        }

        // The function returns an array with resume_id
        return { resumeId: data[0].resume_id };
      } catch (newFunctionError: any) {
        // New function doesn't exist, use old method but delete existing resumes first
        console.log('Using fallback to old method with manual cleanup');
        
        // Delete existing resumes for this user first (manual cleanup)
        await supabase
          .from('resumes')
          .delete()
          .eq('user_id', userId);

        // Insert new resume using old method
        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: userId,
            title: resumeData.title,
            file_name: resumeData.fileName,
            file_path: resumeData.filePath,
            file_size: resumeData.fileSize,
            file_type: resumeData.fileType,
            original_content: resumeData.originalContent,
            is_primary: true // Always primary since there's only one
          })
          .select('id')
          .single();

        if (error) {
          return { error: error.message };
        }

        return { resumeId: data.id };
      }
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async saveAnalysisData(analysisData: AnalysisData, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('saveAnalysisData: Calling PostgreSQL function with:', {
        p_resume_id: analysisData.resumeId,
        p_user_id: userId,
        p_ats_score: analysisData.atsScore,
        p_overall_rating: analysisData.overallRating
      });
      
      // Debug: Check resume ownership before attempting to save
      const { data: debugInfo, error: debugError } = await supabase.rpc('debug_resume_ownership', {
        p_resume_id: analysisData.resumeId,
        p_user_id: userId
      });
      
      console.log('saveAnalysisData: Debug ownership check:', debugInfo);
      
      const { data, error } = await supabase.rpc('save_resume_analysis', {
        p_resume_id: analysisData.resumeId,
        p_user_id: userId,
        p_ats_score: analysisData.atsScore,
        p_overall_rating: analysisData.overallRating,
        p_strengths: analysisData.strengths,
        p_weaknesses: analysisData.weaknesses,
        p_suggestions: analysisData.suggestions,
        p_skills_found: analysisData.skillsFound,
        p_missing_skills: analysisData.missingSkills || null,
        p_skill_categories: analysisData.skillCategories || null,
        p_sections_analysis: analysisData.sectionsAnalysis || null,
        p_formatting_score: analysisData.formattingScore || null,
        p_keyword_density: analysisData.keywordDensity || null,
        p_analysis_type: analysisData.analysisType || 'comprehensive',
        p_job_description: analysisData.jobDescription || null
      });

      if (error) {
        console.error('saveAnalysisData: Database error:', error);
        return { success: false, error: error.message };
      }

      // PostgreSQL function returns TRUE on success, FALSE on failure
      const success = data === true;
      console.log('saveAnalysisData: Database response:', { data, success });
      
      return { success };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getUserResumes(userId: string): Promise<{ resumes: ResumeData[]; error?: string }> {
    try {
      // Use the existing method that works, but should only return one resume now
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        return { resumes: [], error: error.message };
      }

      const resumes = data.map(resume => ({
        id: resume.id,
        title: resume.title,
        fileName: resume.file_name,
        filePath: resume.file_path,
        fileSize: resume.file_size,
        fileType: resume.file_type,
        originalContent: resume.original_content,
        isPrimary: resume.is_primary
      }));

      return { resumes };
    } catch (error: any) {
      return { resumes: [], error: error.message };
    }
  }

  async getLatestResumeWithAnalysis(userId: string): Promise<{ 
    resume?: ResumeData & { analysis?: AnalysisData }; 
    error?: string 
  }> {
    try {
      // Use the correct function name that we just created
      const { data, error } = await supabase.rpc('get_user_latest_resume_with_analysis', {
        p_user_id: userId
      });

      if (error) {
        return { error: error.message };
      }

      if (!data || data.length === 0) {
        return { resume: undefined };
      }

      const row = data[0];
      const resume: ResumeData & { analysis?: AnalysisData } = {
        id: row.resume_id,
        title: row.title,
        fileName: row.file_name,
        filePath: row.file_path,
        fileSize: row.file_size || undefined,
        fileType: row.file_type || undefined,
        originalContent: row.original_content || undefined,
        isPrimary: row.is_primary || true
      };

      // If analysis data exists, add it to the resume
      if (row.ats_score !== null) {
        resume.analysis = {
          resumeId: row.resume_id,
          atsScore: row.ats_score,
          overallRating: row.overall_rating,
          strengths: row.strengths || [],
          weaknesses: row.weaknesses || [],
          suggestions: row.suggestions || [],
          skillsFound: row.skills_found || [],
          missingSkills: row.missing_skills || [],
          skillCategories: row.skill_categories,
          sectionsAnalysis: row.sections_analysis,
          formattingScore: row.formatting_score,
          keywordDensity: row.keyword_density,
          analysisType: row.analysis_type || 'comprehensive',
          jobDescription: row.job_description,
          analysis_timestamp: row.analysis_updated_at || new Date().toISOString()
        };
      }

      return { resume };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getResumeAnalysis(resumeId: string): Promise<{ analysis?: AnalysisData; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('resume_analysis')
        .select('*')
        .eq('resume_id', resumeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { analysis: undefined }; // No analysis found
        }
        return { error: error.message };
      }

      const analysis: AnalysisData = {
        resumeId: data.resume_id,
        atsScore: data.ats_score,
        overallRating: data.overall_rating,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        suggestions: data.suggestions || [],
        skillsFound: data.skills_found || [],
        missingSkills: data.missing_skills || [],
        skillCategories: data.skill_categories,
        sectionsAnalysis: data.sections_analysis,
        formattingScore: data.formatting_score,
        keywordDensity: data.keyword_density,
        analysisType: data.analysis_type,
        jobDescription: data.job_description
      };

      return { analysis };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async deleteResume(resumeId: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }

      // Delete from database (cascade will handle analysis)
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getResumeFileUrl(filePath: string): Promise<{ url?: string; error?: string }> {
    try {
      // Skip storage URL generation for fallback paths
      if (filePath.startsWith('fallback/')) {
        return { error: 'File stored in fallback mode - download not available' };
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        return { error: error.message };
      }

      return { url: data.signedUrl };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Job Description methods
  async saveJobDescription(jd: JobDescription, userId: string): Promise<{ jdId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: userId,
          title: jd.title,
          company: jd.company,
          description: jd.description,
          requirements: jd.requirements,
          skills_required: jd.skillsRequired,
          location: jd.location,
          salary_range: jd.salaryRange,
          is_favorite: jd.isFavorite || false
        })
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { jdId: data.id };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async getUserJobDescriptions(userId: string): Promise<{ jobDescriptions: JobDescription[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        return { jobDescriptions: [], error: error.message };
      }

      const jobDescriptions = data.map(jd => ({
        id: jd.id,
        title: jd.title,
        company: jd.company,
        description: jd.description,
        requirements: jd.requirements || [],
        skillsRequired: jd.skills_required || [],
        location: jd.location,
        salaryRange: jd.salary_range,
        isFavorite: jd.is_favorite
      }));

      return { jobDescriptions };
    } catch (error: any) {
      return { jobDescriptions: [], error: error.message };
    }
  }
}

export const resumeStorageService = new ResumeStorageService();
