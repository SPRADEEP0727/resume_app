
import { useState } from 'react';
import { DashboardNav } from './DashboardNav';
import { DashboardOverview } from './DashboardOverview';
import { JDMatching } from './JDMatching';
import { ProfileOptimization } from './ProfileOptimization';
import { MockInterview } from './MockInterview';
import { Learning } from './Learning';
import { CreditsPayment } from './CreditsPayment';
import { UserProfile } from './UserProfile';
import { SavedResumeManager } from './SavedResumeManager';
import ComingSoonPage from './ComingSoonPage';
import { Toaster } from './ui/toaster';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'my-resumes':
        return 'My Resumes';
      case 'jd-matching':
        return 'Job Description Matching';
      case 'profile-optimization':
        return 'Profile Optimization';
      case 'mock-interview':
        return 'Mock Interview';
      case 'learning':
        return 'Learning Hub';
      case 'credits':
        return 'Credits & Payment';
      case 'profile':
        return 'My Profile';
      default:
        return 'Dashboard Overview';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'my-resumes':
        return <SavedResumeManager onResumeSelect={(resume) => setActiveTab('dashboard')} />;
      case 'jd-matching':
        return <JDMatching />;
      case 'profile-optimization':
        return <ComingSoonPage feature="Profile Optimization" description="Get AI-powered suggestions to optimize your professional profiles on LinkedIn, GitHub, and other platforms." />;
      case 'mock-interview':
        return <ComingSoonPage feature="Mock Interview" description="Practice interviews with AI-powered questions tailored to your resume and target job descriptions." />;
      case 'learning':
        return <ComingSoonPage feature="Learning Hub" description="Access personalized learning resources and skill development recommendations based on your resume analysis." />;
      case 'credits':
        return <CreditsPayment />;
      case 'profile':
        return <UserProfile />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <main className="ml-64">
        {/* Static Header with transparent background */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="py-8 px-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 text-left">
                {getPageTitle()}
              </h1>
            </div>
          </div>
        </div>
        
        {/* Content area with more padding */}
        <div className="py-8 px-16">
          <div className="text-left">
            <AnalysisProvider>
              {renderContent()}
            </AnalysisProvider>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};
