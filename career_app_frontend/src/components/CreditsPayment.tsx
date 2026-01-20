
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, Star } from 'lucide-react';
import { useUserProfile } from '@/hooks/useProfile';
import { CreditPurchase } from './CreditPurchase';

export const CreditsPayment = () => {
  const { profile } = useUserProfile();
  const credits = profile?.credits || 0;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Credits & Payment</h1>
        <p className="text-gray-600">Choose a plan that fits your job search needs</p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Current Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">{credits}</div>
              <p className="text-gray-600">Credits Available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Purchase Section */}
      <div className="text-center mb-6">
        <CreditPurchase 
          trigger={
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-5 h-5 mr-2" />
              Purchase More Credits
            </Button>
          }
        />
      </div>

      {/* Features Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>What You Get With Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Resume Analysis</h3>
              <p className="text-sm text-gray-600">Complete ATS scoring and detailed feedback</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Suggestions</h3>
              <p className="text-sm text-gray-600">Personalized improvement recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Keyword Matching</h3>
              <p className="text-sm text-gray-600">Industry-specific optimization</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Skills Analysis</h3>
              <p className="text-sm text-gray-600">Comprehensive skills assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Resume Analysis", credits: -2, date: "2 hours ago" },
                { action: "JD Matching", credits: -3, date: "1 day ago" },
                { action: "Mock Interview", credits: -5, date: "3 days ago" },
                { action: "Credits Purchase", credits: +25, date: "1 week ago" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.action}</div>
                    <div className="text-sm text-gray-600">{item.date}</div>
                  </div>
                  <div className={`font-medium ${item.credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.credits > 0 ? '+' : ''}{item.credits} credits
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
