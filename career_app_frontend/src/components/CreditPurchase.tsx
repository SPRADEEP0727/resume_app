import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Coins, Star, Zap, CheckCircle, CreditCard } from 'lucide-react';
import { creditPackages, razorpayService, CreditPackage } from '@/services/razorpayService';
import { useUserProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';

interface CreditPurchaseProps {
  trigger?: React.ReactNode;
}

export const CreditPurchase: React.FC<CreditPurchaseProps> = ({ trigger }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlePurchase = async (packageInfo: CreditPackage) => {
    if (!user || !profile) {
      alert('Please login to purchase credits');
      return;
    }

    try {
      setLoading(packageInfo.id);
      
      await razorpayService.purchaseCredits(packageInfo, {
        name: profile.full_name || 'User',
        email: profile.email,
        phone: profile.phone || undefined
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const formatSavings = (savings: number) => {
    return `Save ${savings}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Buy Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="w-6 h-6 text-blue-600" />
            Purchase Credits
          </DialogTitle>
          <p className="text-gray-600">
            Choose a credit package to continue using our AI-powered resume analysis
          </p>
        </DialogHeader>

        {/* Current Credits Display */}
        {profile && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-800 font-medium">Current Balance</p>
                  <p className="text-blue-600 text-sm">Available for analysis</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {profile.credits} credits
              </div>
            </div>
          </div>
        )}

        {/* Credit Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-300 hover:shadow-lg border-2 ${
                pkg.popular 
                  ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' 
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {pkg.savings && (
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    {formatSavings(pkg.savings)}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{pkg.price}
                </div>
                <div className="text-sm text-gray-600">
                  ₹{(pkg.price / pkg.credits).toFixed(2)} per credit
                </div>
              </CardHeader>

              <CardContent className="text-center">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{pkg.credits} Analysis Credits</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>AI-Powered ATS Scoring</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Detailed Improvement Suggestions</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Keyword Optimization</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Skills Analysis</span>
                    </div>
                    {pkg.credits >= 50 && (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Priority Support</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    pkg.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                >
                  {loading === pkg.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Buy Now
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-600" />
            Secure Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Powered by Razorpay - India's most trusted payment gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>SSL encrypted and PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Instant credit activation</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              * Payments are processed in Indian Rupees (INR). Credits are added instantly to your account after successful payment.
              By purchasing credits, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-3 text-blue-800">What you get with each credit:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-800">Complete Resume Analysis</span>
                <p className="text-blue-600">ATS score, grammar check, formatting review</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-800">AI-Powered Suggestions</span>
                <p className="text-blue-600">Personalized improvement recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-800">Keyword Optimization</span>
                <p className="text-blue-600">Industry-specific keyword matching</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <span className="font-medium text-blue-800">Skills Analysis</span>
                <p className="text-blue-600">Detailed skills assessment and recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
