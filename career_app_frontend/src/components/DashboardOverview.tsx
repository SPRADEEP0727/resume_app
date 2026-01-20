
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Code, Award, Target, Users, Calendar, Upload, FileText, Loader2, CheckCircle, AlertCircle, Eye, Star, Lightbulb, Coins } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useResumeStorage } from '@/hooks/useResumeStorage';
import { CreditPurchase } from './CreditPurchase';
import { resumeService } from '@/services/resumeService';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const { analysisData, userProfile, isLoading, setAnalysisData, setIsLoading } = useAnalysis();
  const { credits, deductCredits } = useCredits();
  const { toast } = useToast();
  const { 
    currentResume, 
    uploadAndSaveResume, 
    saveAnalysis, 
    isSaving: isStorageSaving,
    isLoading: isLoadingResume
  } = useResumeStorage();
  
  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use database data as primary source, context as fallback
  const safeAnalysisData = currentResume?.analysis || analysisData;

  // Transform database analysis to UI-compatible format
  const getUICompatibleAnalysis = (dbAnalysis: any) => {
    if (!dbAnalysis) return dbAnalysis;
    
    // If it's already in AI format (from context), return as-is
    if (dbAnalysis.ats_score?.overall_score !== undefined) {
      return dbAnalysis;
    }
    
    // Transform database format to UI format
    const transformed = {
      ats_score: {
        overall_score: dbAnalysis.atsScore || 0,
        max_score: 100,
        grade: convertRatingToGrade(dbAnalysis.overallRating || 'Good'),
        interpretation: getScoreInterpretation(dbAnalysis.atsScore || 0),
        detailed_scores: (() => {
          // Only use detailed scores if they exist from AI analysis
          if (dbAnalysis.sectionsAnalysis?.detailed_scores) {
            return dbAnalysis.sectionsAnalysis.detailed_scores;
          }
          
          // Return undefined instead of fallback - let the UI handle the missing data
          return undefined;
        })(),
        recommendations: dbAnalysis.suggestions || [],
        strengths: dbAnalysis.strengths || [],
        areas_for_improvement: dbAnalysis.weaknesses || []
      },
      suggestions: {
        strengths: dbAnalysis.strengths || [],
        priority_improvements: dbAnalysis.weaknesses || [],
        content_suggestions: dbAnalysis.suggestions || [],
        formatting_tips: [],
        keyword_recommendations: dbAnalysis.missingSkills || [],
        missing_elements: dbAnalysis.weaknesses || []
      },
      skills_analysis: (() => {
        // Only use skills analysis if it exists from AI analysis
        if (dbAnalysis.skillCategories?.skills_analysis) {
          return dbAnalysis.skillCategories.skills_analysis;
        }
        
        // Return minimal structure without fake data
        return {
          all_skills: dbAnalysis.skillsFound || [],
          technical_skills: [],
          professional_skills: [],
          soft_skills: [],
          certifications: [],
          skills_summary: {
            total_skills: (dbAnalysis.skillsFound || []).length,
            technical_count: 0,
            professional_count: 0,
            soft_skills_count: 0,
            certifications_count: 0,
            average_experience_years: 0,
            skill_level_distribution: {}
          }
        };
      })(),
      keywords_analysis: {
        job_description_keywords: [],
        resume_keywords: dbAnalysis.skillsFound || [],
        matching_keywords: dbAnalysis.skillsFound || [],
        missing_keywords: dbAnalysis.missingSkills || [],
        keyword_density: dbAnalysis.keywordDensity || 0,
        match_percentage: 0,
        critical_missing_keywords: dbAnalysis.missingSkills || [],
        keyword_suggestions: dbAnalysis.missingSkills || [],
        industry_keywords: []
      },
      analysis_timestamp: dbAnalysis.analysis_timestamp || new Date().toISOString(),
      analysis_method: 'Database Loaded'
    };
    
    return transformed;
  };

  // Helper functions for data transformation
  const convertRatingToGrade = (rating: string): string => {
    switch (rating) {
      case 'Excellent': return 'A';
      case 'Very Good': return 'B';
      case 'Good': return 'C';
      case 'Fair': return 'D';
      case 'Poor': return 'F';
      default: return 'C';
    }
  };

  const getScoreInterpretation = (score: number): string => {
    if (score >= 90) return 'Excellent resume with high ATS compatibility';
    if (score >= 80) return 'Very good resume with good ATS compatibility';
    if (score >= 70) return 'Good resume with decent ATS compatibility';
    if (score >= 60) return 'Fair resume with some ATS issues to address';
    return 'Poor ATS compatibility, significant improvements needed';
  };

  // Get UI-compatible analysis data
  const uiAnalysisData = getUICompatibleAnalysis(safeAnalysisData);

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-gray-600">Please sign in to access the dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Handle resume file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (16MB max)
      if (file.size > 16 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 16MB",
          variant: "destructive",
        });
        return;
      }

      setResumeFile(file);
    }
  };

  // Handle resume analysis
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast({
        title: "Error",
        description: "Please select a resume file",
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough credits
    if (credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to analyze a resume. Please purchase more credits.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);

    try {
      // Check backend health first
      await resumeService.checkHealth();

      // Step 1: Upload and save resume file to Supabase
      const uploadResult = await uploadAndSaveResume(
        resumeFile, 
        resumeFile.name.replace(/\.[^/.]+$/, '') // Remove file extension for title
      );

      if (!uploadResult.success || !uploadResult.resumeId) {
        throw new Error(uploadResult.error || 'Failed to save resume');
      }

      // Step 2: Analyze resume FIRST (before deducting credits)
      const analysis = await resumeService.analyzeResume({
        resume: resumeFile,
        job_description: '',
      });

      // Check if analysis failed
      if (analysis.error) {
        throw new Error(`Analysis failed: ${analysis.error}`);
      }

      // Step 3: Only deduct credits AFTER successful analysis
      await deductCredits(
        1, 
        `Resume analysis: ${resumeFile.name}`,
        'resume_analysis'
      );

      // Step 4: Store analysis data in context
      setAnalysisData(analysis);

      // Step 5: Save analysis results to Supabase
      
      // Convert letter grade to descriptive rating that matches database constraint
      const convertGradeToRating = (grade: string): 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent' => {
        switch (grade.toUpperCase()) {
          case 'A+':
          case 'A': return 'Excellent';
          case 'A-':
          case 'B+':
          case 'B': return 'Very Good';
          case 'B-':
          case 'C+':
          case 'C': return 'Good';
          case 'C-':
          case 'D+':
          case 'D': return 'Fair';
          default: return 'Poor';
        }
      };
      
      // Log exactly what we're saving for verification - with null safety
      const dataToSave = {
        atsScore: analysis.ats_score?.overall_score || 0,
        overallRating: convertGradeToRating(analysis.ats_score?.grade || 'F'),
        strengths: analysis.suggestions?.strengths || [],
        weaknesses: analysis.suggestions?.priority_improvements || [],
        suggestions: analysis.suggestions?.priority_improvements || [],
        skillsFound: analysis.skills_analysis?.all_skills || [],  // Complete skills objects with null safety
        missingSkills: analysis.keywords_analysis?.missing_keywords || [],
        skillCategories: {
          skills_analysis: analysis.skills_analysis || null,  // Complete AI skills analysis with null safety
        },
        sectionsAnalysis: analysis.ats_score || {},  // Complete ATS analysis with detailed_scores
        formattingScore: analysis.ats_score?.detailed_scores?.format_score || 0,
        keywordDensity: analysis.keywords_analysis?.keyword_density || 0,
        analysisType: 'comprehensive' as const
      };
      
      const saveResult = await saveAnalysis(dataToSave);

      if (!saveResult.success) {
        console.warn('⚠️ Failed to save analysis to database:', saveResult.error);
        // Don't fail the whole process, just warn
      }

      toast({
        title: "Success",
        description: "Resume analysis completed and saved! 1 credit has been deducted.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      console.error('❌ Analysis failed:', error);
      
      setAnalysisData(null);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  };
  
  // Extract data from analysis - only use real AI data
  const atsScore = uiAnalysisData?.ats_score?.overall_score;
  const skills = uiAnalysisData?.skills_analysis?.all_skills || [];

  const skillCategories = skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Show loading state - be more specific about when to show loading
  if (isLoadingResume && !currentResume) {
    return (
      <div className="w-full space-y-6 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading your resume data...</span>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Advanced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Beginner':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Certified':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Resume Upload Section - Compact */}
      <Card className="border-2 border-blue-200 shadow-md bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-center space-x-2 text-xl font-bold">
            <Upload className="w-6 h-6" />
            <span>Upload & Analyze Resume</span>
          </CardTitle>
          <p className="text-blue-100 mt-2 text-sm">
            Upload your resume and get instant ATS score with comprehensive AI-powered analysis from our AutoGen agents
          </p>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <form onSubmit={handleAnalyzeResume} className="space-y-5">
            {/* File Upload Section - Compact */}
            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">Choose Your Resume File</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">PDF</span> • Max <span className="font-medium text-blue-600">16MB</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    {/* Hidden file input */}
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                    
                    {/* Custom visible button */}
                    <label 
                      htmlFor="resume-file" 
                      className={`
                        inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg
                        ${isAnalyzing 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        }
                      `}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      {isAnalyzing ? 'Processing...' : 'Browse & Select File'}
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Secure</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>AI Analysis</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Instant</span>
                    </span>
                  </div>
                </div>

                {resumeFile && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center justify-center space-x-4 text-green-700">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div className="text-center">
                        <span className="font-semibold text-lg">{resumeFile.name}</span>
                        <p className="text-sm text-green-600">Size: {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Features Preview - Compact */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* ATS Score Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-700 transition-colors">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">ATS Score</h4>
                    <p className="text-xs text-gray-600 mb-2">Compatibility analysis with detailed scoring</p>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 font-medium text-sm">
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-xl">
                      <Target className="w-6 h-6 text-blue-600" />
                      <span>ATS Score Analysis</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {uiAnalysisData?.ats_score ? (
                      <>
                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {uiAnalysisData?.ats_score?.overall_score || 0}%
                          </div>
                          <div className="text-lg font-medium text-gray-700">
                            Grade: {uiAnalysisData?.ats_score?.grade || 'N/A'}
                          </div>
                          <p className="text-gray-600 mt-2">
                            {uiAnalysisData?.ats_score?.interpretation || 'Analysis pending'}
                          </p>
                        </div>
                        
                        {uiAnalysisData?.ats_score?.detailed_scores && Object.keys(uiAnalysisData.ats_score.detailed_scores).length > 0 && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Detailed Breakdown (AI-Generated)</h3>
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(uiAnalysisData.ats_score.detailed_scores).map(([key, value]) => (
                                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="font-medium capitalize">
                                    {key.replace('_', ' ')}
                                  </div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {value as number || 0}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No ATS Analysis Available</h3>
                        <p className="text-gray-500">Upload and analyze your resume to see detailed ATS scoring</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* AI Suggestions Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-700 transition-colors">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">AI Suggestions</h4>
                    <p className="text-xs text-gray-600 mb-2">Expert improvement recommendations</p>
                    <div className="flex items-center justify-center space-x-1 text-green-600 font-medium text-sm">
                      <Lightbulb className="w-3 h-3" />
                      <span>View Suggestions</span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-xl">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <span>AI Improvement Suggestions</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {uiAnalysisData?.suggestions ? (
                      <>
                        {uiAnalysisData?.suggestions?.priority_improvements && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-red-600">Priority Improvements</h3>
                            <ul className="space-y-2">
                              {uiAnalysisData.suggestions.priority_improvements.map((suggestion, index) => (
                                <li key={index} className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
                                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <span className="text-gray-700">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {uiAnalysisData?.suggestions?.content_suggestions && 
                         uiAnalysisData.suggestions.content_suggestions.length > 0 &&
                         // Only show if content suggestions are different from priority improvements
                         JSON.stringify(uiAnalysisData.suggestions.content_suggestions) !== JSON.stringify(uiAnalysisData.suggestions.priority_improvements) && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-blue-600">Content Suggestions</h3>
                            <ul className="space-y-2">
                              {uiAnalysisData.suggestions.content_suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                                  <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                                  <span className="text-gray-700">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {uiAnalysisData?.suggestions?.strengths && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-green-600">Your Strengths</h3>
                            <ul className="space-y-2">
                              {uiAnalysisData.suggestions.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                                  <Star className="w-5 h-5 text-green-500 mt-0.5" />
                                  <span className="text-gray-700">{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Suggestions Available</h3>
                        <p className="text-gray-500">Upload and analyze your resume to get AI-powered improvement suggestions</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Skills Analysis Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-700 transition-colors">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Skills Analysis</h4>
                    <p className="text-xs text-gray-600 mb-2">Technical competency evaluation</p>
                    <div className="flex items-center justify-center space-x-1 text-purple-600 font-medium text-sm">
                      <Code className="w-3 h-3" />
                      <span>View Skills</span>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2 text-xl">
                      <Code className="w-6 h-6 text-purple-600" />
                      <span>Complete Skills Analysis</span>
                      {uiAnalysisData?.skills_analysis && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {uiAnalysisData?.analysis_method || 'AI Extracted'}
                        </Badge>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {uiAnalysisData?.skills_analysis && uiAnalysisData.skills_analysis.skills_summary?.total_skills > 0 ? (
                      <>
                        {/* Skills Summary - Only show if we have real AI data */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {uiAnalysisData.skills_analysis.skills_summary.total_skills}
                            </div>
                            <div className="text-sm text-gray-600">Total Skills (AI)</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {uiAnalysisData.skills_analysis.skills_summary.technical_count}
                            </div>
                            <div className="text-sm text-gray-600">Technical</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {uiAnalysisData.skills_analysis.skills_summary.professional_count}
                            </div>
                            <div className="text-sm text-gray-600">Professional</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {uiAnalysisData.skills_analysis.skills_summary.average_experience_years}
                            </div>
                            <div className="text-sm text-gray-600">Avg Years</div>
                          </div>
                        </div>

                        {/* AI-Categorized Skills Sections */}
                        <div className="space-y-6">
                          {/* Technical Skills */}
                          {uiAnalysisData.skills_analysis.technical_skills && uiAnalysisData.skills_analysis.technical_skills.length > 0 && (
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                              <h3 className="font-semibold text-lg text-blue-600 mb-4 flex items-center space-x-2">
                                <Code className="w-5 h-5" />
                                <span>Technical Skills (AI-Categorized)</span>
                                <Badge variant="secondary" className="text-xs">
                                  {uiAnalysisData.skills_analysis.technical_skills.length} skills
                                </Badge>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {uiAnalysisData.skills_analysis.technical_skills.map((skill, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medium text-gray-900">{skill.name}</span>
                                      <Badge 
                                        className={`text-xs ${getLevelColor(skill.level)}`}
                                        variant="outline"
                                      >
                                        {skill.level}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {skill.years} years experience
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Professional Skills */}
                          {uiAnalysisData.skills_analysis.professional_skills && uiAnalysisData.skills_analysis.professional_skills.length > 0 && (
                            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                              <h3 className="font-semibold text-lg text-green-600 mb-4 flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>Professional Skills (AI-Categorized)</span>
                                <Badge variant="secondary" className="text-xs">
                                  {uiAnalysisData.skills_analysis.professional_skills.length} skills
                                </Badge>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {uiAnalysisData.skills_analysis.professional_skills.map((skill, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medium text-gray-900">{skill.name}</span>
                                      <Badge 
                                        className={`text-xs ${getLevelColor(skill.level)}`}
                                        variant="outline"
                                      >
                                        {skill.level}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {skill.years} years experience
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Soft Skills */}
                          {uiAnalysisData.skills_analysis.soft_skills && uiAnalysisData.skills_analysis.soft_skills.length > 0 && (
                            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                              <h3 className="font-semibold text-lg text-purple-600 mb-4 flex items-center space-x-2">
                                <Star className="w-5 h-5" />
                                <span>Soft Skills (AI-Categorized)</span>
                                <Badge variant="secondary" className="text-xs">
                                  {uiAnalysisData.skills_analysis.soft_skills.length} skills
                                </Badge>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {uiAnalysisData.skills_analysis.soft_skills.map((skill, index) => (
                                  <div key={index} className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-medium text-gray-900">{skill.name}</span>
                                      <Badge 
                                        className={`text-xs ${getLevelColor(skill.level)}`}
                                        variant="outline"
                                      >
                                        {skill.level}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {skill.years} years experience
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Certifications */}
                        {uiAnalysisData?.skills_analysis?.certifications && uiAnalysisData.skills_analysis.certifications.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-orange-600">Certifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {uiAnalysisData.skills_analysis.certifications.map((cert, index) => (
                                <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-orange-800">{cert.name}</div>
                                      <div className="text-sm text-orange-600">{cert.category}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-orange-700">{cert.level}</div>
                                      <div className="text-xs text-orange-500">{cert.years}+ years</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills Gap Analysis */}
                        {uiAnalysisData?.skills_analysis?.skill_gaps && uiAnalysisData.skills_analysis.skill_gaps.length > 0 && (
                          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <h3 className="font-semibold text-lg text-orange-600 mb-3 flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5" />
                              <span>Skills Gap Analysis</span>
                            </h3>
                            <div className="space-y-2">
                              {uiAnalysisData.skills_analysis.skill_gaps.map((gap, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-gray-700 leading-relaxed">{gap}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skill Level Distribution - Only show if we have AI data */}
                        {uiAnalysisData?.skills_analysis?.skills_summary?.skill_level_distribution && Object.keys(uiAnalysisData.skills_analysis.skills_summary.skill_level_distribution).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg">AI-Analyzed Skill Level Distribution</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {Object.entries(uiAnalysisData.skills_analysis.skills_summary.skill_level_distribution).map(([level, count]) => (
                                <div key={level} className="p-3 bg-gray-50 rounded-lg border text-center">
                                  <div className="text-xl font-bold text-gray-800">{count as number}</div>
                                  <div className="text-sm text-gray-600">{level}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Skills Analysis Available</h3>
                        <p className="text-gray-500">Upload and analyze your resume to see detailed skills breakdown</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Submit Button - Compact */}
            <div className="text-center space-y-3">
              <Button 
                type="submit" 
                disabled={!resumeFile || isAnalyzing}
                className={`px-8 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                  !resumeFile || isAnalyzing 
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg text-white'
                }`}
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
              
              {!resumeFile && (
                <p className="text-sm text-gray-500">Please upload a resume file to begin analysis</p>
              )}
              
              {resumeFile && !isAnalyzing && (
                <p className="text-sm text-green-600 font-medium">✓ Ready to analyze</p>
              )}
            </div>
          </form>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-800">AI Analysis in Progress</p>
                  <p className="text-xs text-blue-600">This may take 30-60 seconds...</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {/* ATP Score Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>ATP Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{atsScore || 0}/100</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${atsScore || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Above Average</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                <p className="text-sm text-gray-600">Total Skills</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(skillCategories).length}</div>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {skills.filter(skill => skill.level === 'Expert' || skill.level === 'Advanced').length}
                </div>
                <p className="text-sm text-gray-600">Expert/Advanced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
