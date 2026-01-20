
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { AuthModal } from '@/components/AuthModal';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [showLoginPage, setShowLoginPage] = useState(false);
  const { user, loading, signOut } = useAuth();

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogin = () => {
    setIsAuthModalOpen(false);
    setShowLoginPage(false);
  };

  const handleModeChange = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
  };

  const handleLoginPageMode = () => {
    setShowLoginPage(true);
    setIsAuthModalOpen(false);
  };

  const handleBackToHome = () => {
    setShowLoginPage(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if logged in
  if (user) {
    return (
      <div>
        <Dashboard />
      </div>
    );
  }

  // Show dedicated login page
  if (showLoginPage) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        onSwitchToSignup={() => {
          setAuthMode('signup');
          setShowLoginPage(false);
          setIsAuthModalOpen(true);
        }}
        onBack={handleBackToHome}
      />
    );
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar 
        onLogin={handleLoginPageMode} 
        onSignup={() => openAuthModal('signup')} 
      />
      <HeroSection onGetStarted={() => openAuthModal('signup')} />
      <FeaturesSection />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onLogin={handleLogin}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default Index;
