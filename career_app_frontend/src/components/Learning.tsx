
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, Star, Users, BookOpen, Video, FileText } from 'lucide-react';

export const Learning = () => {
  const skillGaps = [
    {
      skill: "React.js",
      priority: "High",
      courses: [
        {
          title: "React - The Complete Guide",
          provider: "freeCodeCamp",
          type: "Video",
          duration: "12 hours",
          rating: 4.8,
          students: "2.1M",
          url: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
          description: "Learn React from scratch with hands-on projects"
        },
        {
          title: "React Official Tutorial",
          provider: "React.dev",
          type: "Interactive",
          duration: "4 hours",
          rating: 4.9,
          students: "5M+",
          url: "https://react.dev/learn",
          description: "Official React documentation with interactive examples"
        }
      ]
    },
    {
      skill: "AWS",
      priority: "High",
      courses: [
        {
          title: "AWS Cloud Practitioner Essentials",
          provider: "AWS Skill Builder",
          type: "Course",
          duration: "6 hours",
          rating: 4.7,
          students: "800K",
          url: "https://explore.skillbuilder.aws/learn",
          description: "Introduction to AWS cloud fundamentals"
        },
        {
          title: "AWS Basics for Beginners",
          provider: "freeCodeCamp",
          type: "Video",
          duration: "4 hours",
          rating: 4.6,
          students: "1.2M",
          url: "https://www.freecodecamp.org/news/aws-certified-cloud-practitioner-training-2019-free-video-course/",
          description: "Complete AWS beginner course with practical examples"
        }
      ]
    },
    {
      skill: "Docker",
      priority: "Medium",
      courses: [
        {
          title: "Docker Tutorial for Beginners",
          provider: "Docker",
          type: "Interactive",
          duration: "3 hours",
          rating: 4.8,
          students: "900K",
          url: "https://www.docker.com/101-tutorial/",
          description: "Official Docker tutorial with hands-on exercises"
        },
        {
          title: "Docker Complete Course",
          provider: "Codecademy",
          type: "Course",
          duration: "8 hours",
          rating: 4.5,
          students: "500K",
          url: "https://www.codecademy.com/learn/learn-docker",
          description: "Learn containerization with Docker from basics to advanced"
        }
      ]
    },
    {
      skill: "GraphQL",
      priority: "Medium",
      courses: [
        {
          title: "GraphQL Fundamentals",
          provider: "Apollo GraphQL",
          type: "Course",
          duration: "5 hours",
          rating: 4.7,
          students: "300K",
          url: "https://www.apollographql.com/tutorials/",
          description: "Learn GraphQL with Apollo's comprehensive tutorial"
        },
        {
          title: "Full Stack GraphQL",
          provider: "The Net Ninja",
          type: "Video",
          duration: "6 hours",
          rating: 4.6,
          students: "400K",
          url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9iK6Qhn-QLcXCXPQUov1U7f",
          description: "Build full-stack applications with GraphQL"
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="w-4 h-4" />;
      case 'Interactive':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-gray-600">
          Based on your resume analysis, here are personalized learning recommendations to bridge your skill gaps
        </p>
      </div>

      <div className="space-y-8">
        {skillGaps.map((skillGap, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <span>{skillGap.skill}</span>
                  <Badge 
                    className={`${getPriorityColor(skillGap.priority)} text-xs`}
                    variant="outline"
                  >
                    {skillGap.priority} Priority
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {skillGap.courses.map((course, courseIndex) => (
                  <Card key={courseIndex} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {course.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                            {course.provider}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(course.type)}
                            <span>{course.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{course.students}</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(course.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Start Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Learning Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Focus on high-priority skills first to maximize your job market appeal</li>
              <li>• Practice building projects while learning to solidify your knowledge</li>
              <li>• Update your resume and LinkedIn profile as you acquire new skills</li>
              <li>• Join communities and forums related to your target skills for networking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
