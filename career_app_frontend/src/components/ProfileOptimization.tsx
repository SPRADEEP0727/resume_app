
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase, 
  Star, 
  TrendingUp,
  MapPin,
  Camera,
  FileText,
  Users,
  Award,
  Target
} from 'lucide-react';

export const ProfileOptimization = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<'naukri' | 'linkedin' | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    currentRole: '',
    experience: '',
    location: '',
    skills: '',
    summary: ''
  });

  const naukriOptimizations = {
    sections: [
      {
        title: "Profile Picture",
        icon: Camera,
        priority: "High",
        current: "Generic or missing photo",
        suggestion: "Professional headshot with business attire",
        impact: "Improved profile visibility",
        action: "Upload a high-quality, professional photo where you're smiling and looking directly at the camera"
      },
      {
        title: "Headline",
        icon: User,
        priority: "Critical",
        current: "Basic job title",
        suggestion: "Senior Software Engineer | React.js Expert | 5+ Years | Ex-TCS | Building Scalable Web Apps",
        impact: "Better search visibility",
        action: "Include: Current role + Key skills + Experience + Company name + Value proposition"
      },
      {
        title: "Profile Summary",
        icon: FileText,
        priority: "High",
        current: "Generic summary",
        suggestion: "Results-driven Software Engineer with 5+ years experience. Delivered 15+ projects using React.js, Node.js. Improved system performance by 40%. Led teams of 5+ developers.",
        impact: "Better recruiter visibility",
        action: "Use bullet points, include metrics, mention technologies, and highlight achievements"
      },
      {
        title: "Key Skills",
        icon: Award,
        priority: "Critical",
        current: "Basic skill list",
        suggestion: "React.js, Node.js, JavaScript, TypeScript, AWS, Docker, MongoDB, System Design, Team Leadership",
        impact: "Improved job matching",
        action: "Add trending skills in your domain. Update skill levels. Get endorsements from colleagues."
      },
      {
        title: "Experience Section",
        icon: Briefcase,
        priority: "High",
        current: "Job responsibilities",
        suggestion: "Focus on achievements with numbers: 'Reduced load time by 50%', 'Led team of 5 engineers'",
        impact: "Higher interview rate",
        action: "Use action verbs, quantify results, mention technologies used in each role"
      },
      {
        title: "Location Preferences",
        icon: MapPin,
        priority: "Medium",
        current: "Single location",
        suggestion: "Add multiple preferred cities and remote work availability",
        impact: "More job opportunities",
        action: "Enable 'Open to relocate' and add tier-1 cities in your preferences"
      }
    ],
    tips: [
      "Update your profile at least once a week to appear in recent searches",
      "Use Naukri's fastforward feature for better visibility",
      "Keep your profile complete for maximum reach",
      "Add a professional email ID (avoid gmail for senior roles)"
    ]
  };

  const linkedinOptimizations = {
    sections: [
      {
        title: "Profile Photo & Banner",
        icon: Camera,
        priority: "High",
        current: "Basic profile photo",
        suggestion: "Professional headshot + custom banner showcasing your expertise",
        impact: "More profile views",
        action: "Use tools like Canva to create a banner. Photo should be 400x400px, professional lighting"
      },
      {
        title: "Headline",
        icon: User,
        priority: "Critical",
        current: "Just job title",
        suggestion: "Senior Software Engineer | Building Scalable Web Apps | React & Node.js Expert | Helping Startups Scale",
        impact: "Better searchability",
        action: "Use all 220 characters. Include: Role + Value + Skills + Industry keywords"
      },
      {
        title: "About Section",
        icon: FileText,
        priority: "Critical",
        current: "Resume copy-paste",
        suggestion: "Personal story + achievements + call-to-action. Write in first person, use emojis, include contact info",
        impact: "More connection requests",
        action: "Hook in first 2 lines, use 3-4 paragraphs, end with how people can reach you"
      },
      {
        title: "Featured Section",
        icon: Star,
        priority: "Medium",
        current: "Empty",
        suggestion: "Showcase your best projects, articles, presentations, or achievements",
        impact: "More engagement",
        action: "Add 3-5 items: projects with GitHub links, articles you've written, certifications"
      },
      {
        title: "Experience Details",
        icon: Briefcase,
        priority: "High",
        current: "Basic job duties",
        suggestion: "Rich media + detailed achievements + skills tags for each role",
        impact: "More recruiter interest",
        action: "Add images/videos of your work, use bullet points, tag relevant skills"
      },
      {
        title: "Skills & Endorsements",
        icon: Award,
        priority: "Critical",
        current: "Random skills",
        suggestion: "Top 3 skills should match your target role. Get 15+ endorsements for each",
        impact: "Better algorithm ranking",
        action: "Pin top 3 skills, remove irrelevant ones, actively seek endorsements"
      },
      {
        title: "Recommendations",
        icon: Users,
        priority: "High",
        current: "None",
        suggestion: "Get recommendations from managers, peers, and direct reports",
        impact: "More credibility",
        action: "Request specific recommendations highlighting different aspects of your work"
      },
      {
        title: "Activity & Posts",
        icon: TrendingUp,
        priority: "Medium",
        current: "No activity",
        suggestion: "Post 2-3 times per week about industry insights, your work, or achievements",
        impact: "More visibility",
        action: "Share learnings, comment on others' posts, write articles in your expertise area"
      }
    ],
    tips: [
      "Use LinkedIn's Creator mode if you're sharing content regularly",
      "Join and actively participate in relevant groups",
      "Use LinkedIn Sales Navigator insights for better networking",
      "Set your profile to 'Open to Work' with specific preferences"
    ]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openPlatform = (platform: 'naukri' | 'linkedin') => {
    const urls = {
      naukri: 'https://www.naukri.com/mnjuser/profile',
      linkedin: 'https://www.linkedin.com/in/me/'
    };
    window.open(urls[platform], '_blank');
  };

  const renderOptimizationCard = (section: any, platform: 'naukri' | 'linkedin') => (
    <Card key={section.title} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <section.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <Badge 
                variant={section.priority === 'Critical' ? 'destructive' : 
                        section.priority === 'High' ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {section.priority} Priority
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">{section.impact}</p>
            <p className="text-xs text-gray-500">Expected impact</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Current State
            </Label>
            <p className="text-sm text-gray-600 bg-red-50 p-2 rounded border">{section.current}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Optimized Version
            </Label>
            <div className="bg-green-50 p-2 rounded border">
              <p className="text-sm text-gray-700">{section.suggestion}</p>
              <Button 
                size="sm" 
                variant="ghost"
                className="mt-2 h-6 text-xs"
                onClick={() => copyToClipboard(section.suggestion)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
        
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Action Required:</strong> {section.action}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  if (!selectedPlatform) {
    return (
      <div className="w-full space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Profile Optimization</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized suggestions to optimize your professional profiles for maximum visibility and better job opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Naukri Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500"
                onClick={() => setSelectedPlatform('naukri')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 40" className="w-12 h-5">
                  <rect x="0" y="0" width="100" height="40" fill="white" rx="4"/>
                  <text x="50" y="25" textAnchor="middle" fill="#4A90E2" fontSize="12" fontWeight="bold">Naukri</text>
                </svg>
              </div>
              <CardTitle className="text-xl font-bold">Naukri Profile Optimization</CardTitle>
              <p className="text-gray-600">Optimize for Indian job market and recruiter preferences</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Completeness</span>
                  <span className="font-semibold">--</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>Key Areas</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span>Analytics</span>
                </div>
              </div>
              
              <Button className="w-full group-hover:bg-blue-700 transition-colors">
                Optimize Naukri Profile
              </Button>
            </CardContent>
          </Card>

          {/* LinkedIn Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-700"
                onClick={() => setSelectedPlatform('linkedin')}>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <CardTitle className="text-xl font-bold">LinkedIn Profile Optimization</CardTitle>
              <p className="text-gray-600">Optimize for global opportunities and professional networking</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Strength</span>
                  <span className="font-semibold">Not analyzed</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>Key Areas</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>Analytics</span>
                </div>
              </div>
              
              <Button className="w-full bg-blue-700 hover:bg-blue-800 transition-colors">
                Optimize LinkedIn Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Why Profile Optimization Matters?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-sm text-gray-600">Profile views</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-sm text-gray-600">Job matches</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-sm text-gray-600">Interview calls</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentOptimizations = selectedPlatform === 'naukri' ? naukriOptimizations : linkedinOptimizations;
  const platformName = selectedPlatform === 'naukri' ? 'Naukri' : 'LinkedIn';
  const platformColor = selectedPlatform === 'naukri' ? 'blue' : 'blue-700';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedPlatform(null)}
            className="mb-4"
          >
            ← Back to Platform Selection
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{platformName} Profile Optimization</h2>
          <p className="text-gray-600">Personalized suggestions to improve your profile visibility and attract more opportunities</p>
        </div>
        <Button 
          onClick={() => openPlatform(selectedPlatform)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open {platformName}
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{currentOptimizations.sections.filter(s => s.priority === 'Critical').length}</div>
              <p className="text-sm text-gray-600">Critical Updates</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{currentOptimizations.sections.filter(s => s.priority === 'High').length}</div>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{currentOptimizations.sections.filter(s => s.priority === 'Medium').length}</div>
              <p className="text-sm text-gray-600">Medium Priority</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">5x</div>
              <p className="text-sm text-gray-600">Expected Improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Sections */}
      <div className="space-y-6">
        {currentOptimizations.sections.map((section) => 
          renderOptimizationCard(section, selectedPlatform)
        )}
      </div>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Pro Tips for {platformName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {currentOptimizations.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
