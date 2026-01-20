import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResumeStorage } from '@/hooks/useResumeStorage';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  Download, 
  Trash2, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SavedResumeManagerProps {
  onResumeSelect?: (resume: any) => void;
  showAnalysisPreview?: boolean;
}

export const SavedResumeManager: React.FC<SavedResumeManagerProps> = ({
  onResumeSelect,
  showAnalysisPreview = true
}) => {
  const {
    currentResume,
    userResumes,
    isLoading,
    deleteResume,
    setCurrentResume,
    getResumeDownloadUrl
  } = useResumeStorage();
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleResumeSelect = (resume: any) => {
    setCurrentResume(resume);
    onResumeSelect?.(resume);
  };

  const handleDownload = async (resume: any) => {
    try {
      const url = await getResumeDownloadUrl(resume.filePath);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = resume.fileName;
        link.click();
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(resumeId);
    try {
      const result = await deleteResume(resumeId);
      if (!result.success) {
        alert(`Failed to delete resume: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'Excellent':
      case 'Very Good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Good':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'Fair':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Poor':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading your resumes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Saved Resumes
        </CardTitle>
        <CardDescription>
          Manage your uploaded resumes and view analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userResumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No resumes saved yet</p>
            <p className="text-sm">Upload a resume to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userResumes.map((resume) => (
              <div
                key={resume.id}
                className={`border rounded-lg p-4 transition-colors ${
                  currentResume?.id === resume.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {resume.title}
                      </h3>
                      {resume.isPrimary && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      {currentResume?.id === resume.id && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {resume.fileName}
                    </p>

                    {/* Analysis Preview */}
                    {showAnalysisPreview && (resume as any).analysis && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            {getRatingIcon((resume as any).analysis.overallRating)}
                            <span className="text-sm font-medium">
                              {(resume as any).analysis.overallRating}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-sm font-medium ${getScoreColor((resume as any).analysis.atsScore)}`}>
                            ATS Score: {(resume as any).analysis.atsScore}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-medium text-green-700 mb-1">
                              Strengths ({(resume as any).analysis.strengths?.length || 0})
                            </p>
                            {(resume as any).analysis.strengths?.slice(0, 2).map((strength: string, idx: number) => (
                              <p key={idx} className="text-gray-600 truncate">• {strength}</p>
                            ))}
                          </div>
                          
                          <div>
                            <p className="font-medium text-red-700 mb-1">
                              Areas to Improve ({(resume as any).analysis.weaknesses?.length || 0})
                            </p>
                            {(resume as any).analysis.weaknesses?.slice(0, 2).map((weakness: string, idx: number) => (
                              <p key={idx} className="text-gray-600 truncate">• {weakness}</p>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(resume as any).analysis.skillsFound?.slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {((resume as any).analysis.skillsFound?.length || 0) > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{((resume as any).analysis.skillsFound?.length || 0) - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResumeSelect(resume)}
                      disabled={currentResume?.id === resume.id}
                    >
                      {currentResume?.id === resume.id ? 'Current' : 'Select'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(resume)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resume.id!)}
                      disabled={deletingId === resume.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deletingId === resume.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
