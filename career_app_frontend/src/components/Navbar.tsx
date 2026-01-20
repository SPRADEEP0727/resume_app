
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Navbar = ({ onLogin, onSignup }: NavbarProps) => {

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Resume<span className="text-blue-600">Genius</span>.ai
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLogin}>
              Login
            </Button>
            
            <Button onClick={onSignup} className="bg-blue-600 hover:bg-blue-700">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
