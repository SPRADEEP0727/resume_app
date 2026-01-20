
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, FileText } from 'lucide-react';

export const JDMatching = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const matchData = {
    percentage: 72,
    suggestions: [
      { category: 'Skills', suggestion: 'Add "Machine Learning" to your skills section', impact: 'High' },
      { category: 'Experience', suggestion: 'Quantify your project management experience', impact: 'Medium' },
      { category: 'Keywords', suggestion: 'Include "Agile methodology" in your description', impact: 'Medium' },
      { category: 'Certifications', suggestion: 'Mention AWS certification if you have it', impact: 'High' }
    ]
  };

  const handleAnalyze = () => {
    if (jobDescription.trim()) {
      setIsAnalyzed(true);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-gray-600">Compare your resume against specific job descriptions</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Job Description</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-description">Paste the job description you want to match</Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!jobDescription.trim()}
              >
                Analyze Match
              </Button>
            </div>
          </CardContent>
        </Card>

        {isAnalyzed && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Match Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{matchData.percentage}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${matchData.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Resume-JD Match Score</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Optimization Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchData.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-blue-900">{suggestion.category}</div>
                        <Badge 
                          variant={suggestion.impact === 'High' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {suggestion.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-blue-800">{suggestion.suggestion}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-left">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Generate Optimized Resume Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
