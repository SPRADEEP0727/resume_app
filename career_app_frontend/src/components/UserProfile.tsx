import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  CreditCard, 
  History, 
  Settings, 
  Upload,
  Coins,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useUserProfile, useCredits, usePayments } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { CreditPurchase } from './CreditPurchase';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { credits, transactions } = useCredits();
  const { payments } = usePayments();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  });

  // Authentication check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <User className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-gray-600">Please sign in to view your profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'premium':
        return <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account, credits, and subscription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Overview Card */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
            <p className="text-gray-600 text-sm">{profile?.email}</p>
            {getSubscriptionBadge(profile?.subscription_status || 'free')}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member since</span>
                <span className="text-sm font-medium">
                  {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total analyses</span>
                <span className="text-sm font-medium">
                  {transactions.filter(t => t.transaction_type === 'usage').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Coins className="w-5 h-5" />
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{credits}</div>
              <p className="text-blue-700 text-sm mb-4">credits remaining</p>
              <CreditPurchase 
                trigger={
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy More Credits
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits purchased</span>
                <span className="text-sm font-medium">{profile?.total_credits_purchased}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credits used</span>
                <span className="text-sm font-medium">
                  {(profile?.total_credits_purchased || 0) - credits}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant={editMode ? "outline" : "default"}
                  onClick={() => {
                    if (editMode) {
                      setFormData({
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || '',
                      });
                    }
                    setEditMode(!editMode);
                  }}
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ''} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editMode ? formData.full_name : (profile?.full_name || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editMode ? formData.phone : (profile?.phone || '')}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editMode}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="subscription">Subscription</Label>
                  <div className="mt-2">
                    {getSubscriptionBadge(profile?.subscription_status || 'free')}
                  </div>
                </div>
              </div>
              {editMode && (
                <div className="mt-6">
                  <Button onClick={handleSaveProfile} className="mr-2">
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit History</CardTitle>
              <p className="text-gray-600 text-sm">Track your credit usage and purchases</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.transaction_type === 'purchase' 
                            ? 'bg-green-100 text-green-600'
                            : transaction.transaction_type === 'usage'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.transaction_type === 'purchase' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : transaction.transaction_type === 'usage' ? (
                            <History className="w-4 h-4" />
                          ) : (
                            <Coins className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.created_at)}
                          </p>
                          {transaction.service_used && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.service_used}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <Coins className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No credit transactions yet</p>
                    <p className="text-sm">Your credit history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <p className="text-gray-600 text-sm">View all your payment transactions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : payment.status === 'failed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {payment.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {payment.credits_purchased} Credits Purchase
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.created_at)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={payment.status === 'completed' ? 'default' : 'outline'}
                              className={
                                payment.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {payment.status}
                            </Badge>
                            {payment.razorpay_payment_id && (
                              <span className="text-xs text-gray-500">
                                ID: {payment.razorpay_payment_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.currency}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No payments yet</p>
                    <p className="text-sm">Your payment history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <p className="text-gray-600 text-sm">Manage your account preferences</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Profile Picture</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Picture
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3 text-red-600">Danger Zone</h3>
                  <div className="space-y-3">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-600 mb-3">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
