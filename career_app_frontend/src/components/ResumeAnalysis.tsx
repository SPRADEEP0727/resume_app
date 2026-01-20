
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, Target, Loader2 } from 'lucide-react';
import { useAnalysis } from '@/contexts/AnalysisContext';

export const ResumeAnalysis = () => {
  const { analysisData, isLoading } = useAnalysis();

  // Show loading state if analysis is in progress
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Resume</h3>
          <p className="text-gray-600">Using AutoGen AI agents to provide comprehensive analysis...</p>
        </div>
      </div>
    );
  }

  // Show message if no analysis data is available
  if (!analysisData) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <p className="text-gray-600">Upload and analyze your resume to see detailed insights here</p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600 mb-4">
                Go to Resume Input tab to upload your resume and get AI-powered analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data from analysis
  const atpScore = analysisData.ats_score.overall_score;
  const scoreGrade = analysisData.ats_score.grade;
  const scoreInterpretation = analysisData.ats_score.interpretation;
  
  // Get suggestions from analysis data
  const priorityImprovements = analysisData.suggestions.priority_improvements || [];
  const strengths = analysisData.suggestions.strengths || [];
  const missingKeywords = analysisData.keywords_analysis.missing_keywords || [];
  const criticalMissingKeywords = analysisData.keywords_analysis.critical_missing_keywords || [];
  
  // Format missing skills data
  const missingSkills = criticalMissingKeywords.slice(0, 4).map((keyword, index) => ({
    skill: keyword,
    demand: index < 2 ? "High" : "Medium",
    companies: Math.floor(Math.random() * 5) + 4
  }));

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-gray-600">Here's how your resume performs against industry standards</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✨ Analysis completed using {analysisData.analysis_method || 'AutoGen AI Agents'} on{' '}
            {new Date(analysisData.analysis_timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ATP Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>ATS Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{atpScore}/100</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${atpScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{scoreInterpretation}</p>
              <Badge variant="outline" className="mt-2">
                Grade: {scoreGrade}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Priority Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>Priority Improvements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityImprovements.slice(0, 3).map((improvement, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{improvement}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      Priority {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
              {priorityImprovements.length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">Great job! No critical issues found.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Missing Keywords</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {missingSkills.map((skill, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{skill.skill}</div>
                      <div className="text-sm text-gray-600">
                        Industry relevance score
                      </div>
                    </div>
                    <Badge 
                      variant={skill.demand === 'High' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {skill.demand}
                    </Badge>
                  </div>
                </div>
              ))}
              {missingSkills.length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">Excellent keyword coverage!</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths Section */}
      {strengths.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Resume Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {strengths.map((strength, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-900">{strength}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 text-left">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Apply AI Suggestions
        </Button>
      </div>
    </div>
  );
};
