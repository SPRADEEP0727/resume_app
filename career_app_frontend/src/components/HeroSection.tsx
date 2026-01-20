
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Star, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  
  const rotatingWords = ['Resume', 'Career', 'Profile', 'Skills'];
  
  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 px-8">
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Announcement Badge */}
          <div className="mb-8 animate-bounce">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              🚀 AI-Powered Career Acceleration Platform
              <div className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">NEW</div>
            </div>
          </div>
          
          {/* Main Headline with Rotating Words */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Supercharge Your
            </span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent transition-all duration-500">
                {rotatingWords[currentWord]}
              </span>
              <span className="text-gray-900">.</span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Get Hired Faster.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transform your career with <span className="font-semibold text-blue-600">AI-powered resume analysis</span>, 
            <span className="font-semibold text-purple-600"> intelligent job matching</span>, and 
            <span className="font-semibold text-green-600"> personalized career coaching</span> — all in one revolutionary platform.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center">
                Start Your Journey Free
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="group px-10 py-5 text-xl font-semibold border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl bg-white/80 backdrop-blur-sm"
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mb-16 animate-fade-in-up animation-delay-1000">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <span className="font-semibold">Trusted Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-semibold">AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Enterprise Security</span>
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview with Animations */}
          <div className="mt-20 animate-fade-in-up animation-delay-2000">
            <div className="relative bg-white rounded-3xl shadow-2xl p-4 mx-auto max-w-6xl border border-gray-200 hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
              {/* Browser Bar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500 font-mono">career-leap.ai/dashboard</div>
                <div className="w-8"></div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 m-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ATS Score Card */}
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">ATS Score</h3>
                      <Zap className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Upload resume to analyze</p>
                  </div>

                  {/* Skills Analysis */}
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Skills Detected</h3>
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                        No skills detected yet
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">AI-powered extraction</p>
                  </div>

                  {/* Job Match */}
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Job Matches</h3>
                      <Star className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                    <div className="text-sm text-gray-500">
                      No matches yet
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Analyze resume first</p>
                  </div>
                </div>

                {/* Live Demo Badge */}
                <div className="text-center mt-8">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live AI Analysis in Progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};
