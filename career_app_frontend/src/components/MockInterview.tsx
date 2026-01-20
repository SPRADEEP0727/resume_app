
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, MessageSquare, Mic, MicOff } from 'lucide-react';

export const MockInterview = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths and weaknesses?",
    "Why are you interested in this position?",
    "Describe a challenging project you worked on recently.",
    "Where do you see yourself in 5 years?"
  ];

  const startInterview = () => {
    if (selectedRole.trim()) {
      setIsInterviewStarted(true);
      setCurrentQuestion(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const resetInterview = () => {
    setIsInterviewStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setIsRecording(false);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-gray-600">Practice your interview skills with AI-generated questions</p>
      </div>

      {!isInterviewStarted ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Start Mock Interview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="job-role">Target Job Role</Label>
                <Input
                  id="job-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What to expect:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 5 AI-generated questions based on your role</li>
                  <li>• Record your answers and review them</li>
                  <li>• Get feedback on your responses</li>
                  <li>• Practice as many times as you want</li>
                </ul>
              </div>
              
              <Button 
                onClick={startInterview}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedRole.trim()}
              >
                Start Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Mock Interview - {selectedRole}</span>
                </div>
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Question {currentQuestion + 1}:</h3>
                  <p className="text-gray-700">{questions[currentQuestion]}</p>
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </Button>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Recording...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    onClick={resetInterview}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart</span>
                  </Button>
                  
                  {currentQuestion < questions.length - 1 ? (
                    <Button
                      onClick={nextQuestion}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Finish Interview
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interview Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index < currentQuestion ? 'bg-green-500' : 
                      index === currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <span className={`text-sm ${
                      index === currentQuestion ? 'font-medium' : 'text-gray-600'
                    }`}>
                      Question {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
