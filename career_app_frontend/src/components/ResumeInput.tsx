
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resumeService } from '@/services/resumeService';
import { useAnalysis } from '@/contexts/AnalysisContext';

interface ResumeInputProps {
  onAnalyze: () => void;
  onAnalysisComplete?: (analysis: any) => void;
}

export const ResumeInput = ({ onAnalyze, onAnalysisComplete }: ResumeInputProps) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { setAnalysisData, setIsLoading } = useAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast({
        title: "Error",
        description: "Please select a resume file",
        variant: "destructive",
      });
      return;
    }

    if (!targetRole.trim()) {
      toast({
        title: "Error", 
        description: "Please specify your target role",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setIsLoading(true);

    try {
      // Check backend health first
      await resumeService.checkHealth();

      // Analyze resume
      const analysis = await resumeService.analyzeResume({
        resume: resumeFile,
        job_description: jobDescription.trim() || `Job Title: ${targetRole}`,
      });

      // Store analysis data in context
      setAnalysisData(analysis);

      toast({
        title: "Success",
        description: "Resume analysis completed successfully!",
      });

      // Pass analysis data to parent if callback provided
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }

      // Navigate to analysis page
      onAnalyze();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
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

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-gray-600">Upload your resume and specify your target role to get started with AI-powered analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Resume Input</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resume-file">Resume File (PDF only)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {resumeFile ? `Selected: ${resumeFile.name}` : 'Drop your resume here or click to browse'}
                </p>
                <p className="text-sm text-gray-500">Supports PDF files up to 16MB</p>
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('resume-file')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-role">Target Job Role *</Label>
              <Input
                id="target-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Software Engineer, Data Scientist, Marketing Manager"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description (Optional)</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here for more targeted analysis and keyword matching..."
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Adding a job description will provide more accurate keyword matching and tailored suggestions
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!resumeFile || !targetRole.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                'Analyze Resume with AI'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
