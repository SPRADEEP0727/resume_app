import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  savings?: number;
  popular?: boolean;
}

export const creditPackages: CreditPackage[] = [
  {
    id: 'pack_10',
    name: '10 Credits',
    credits: 10,
    price: 99, // ₹99
  },
  {
    id: 'pack_25',
    name: '25 Credits',
    credits: 25,
    price: 199, // ₹199
    savings: 15,
  },
  {
    id: 'pack_50',
    name: '50 Credits',
    credits: 50,
    price: 349, // ₹349
    savings: 30,
    popular: true,
  },
  {
    id: 'pack_100',
    name: '100 Credits',
    credits: 100,
    price: 599, // ₹599
    savings: 40,
  },
  {
    id: 'pack_250',
    name: '250 Credits',
    credits: 250,
    price: 1299, // ₹1299
    savings: 50,
  },
];

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string; // Made optional for testing
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: {
    [key: string]: string;
  };
}

export class RazorpayService {
  private static instance: RazorpayService;
  private readonly keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  
  private constructor() {
    if (!this.keyId) {
      throw new Error('Razorpay key ID not found in environment variables');
    }
  }

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  // Load Razorpay script
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create order - simplified approach for testing
  private async createOrder(amount: number, currency: string, credits: number): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // For testing without database tables, just return a mock ID
      // Once you run the SQL script in Supabase, this will work with real tables
      console.log('Creating order for:', { amount, currency, credits, user: user.user.id });
      return `temp_order_${Date.now()}`;
      
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Purchase credits
  async purchaseCredits(
    packageInfo: CreditPackage,
    userDetails: { name: string; email: string; phone?: string }
  ): Promise<void> {
    try {
      // Load Razorpay script if not already loaded
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const orderId = await this.createOrder(packageInfo.price, 'INR', packageInfo.credits);

      // Razorpay options - without order_id for testing
      const options: RazorpayOptions = {
        key: this.keyId,
        amount: packageInfo.price * 100, // Convert to paise
        currency: 'INR',
        name: 'CareerLeap',
        description: `${packageInfo.name} - Resume Analysis Credits`,
        handler: (response) => this.handlePaymentSuccess(response, packageInfo, orderId),
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#667eea',
        },
        notes: {
          credits: packageInfo.credits.toString(),
          package: packageInfo.name,
          user_reference: orderId
        }
      };

      // Create and open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        this.handlePaymentFailure(response);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  // Handle successful payment (updated signature)
  private async handlePaymentSuccess(response: any, packageInfo: CreditPackage, paymentRecordId?: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Update payment record with Razorpay response (when tables exist)
      console.log('Payment successful - would update payment record:', paymentRecordId);
      
      // For now, just add credits directly to user profile
      // First, get current credits
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('user_id', user.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile doesn't exist, create one
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.user.id,
            email: user.user.email || '',
            credits: packageInfo.credits
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          alert('Payment successful, but there was an error setting up your account. Please contact support.');
          return;
        }
      } else {
        // Update existing profile with new credits
        const newCredits = (profile.credits || 0) + packageInfo.credits;
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ credits: newCredits })
          .eq('user_id', user.user.id);

        if (updateError) {
          console.error('Error updating credits:', updateError);
          alert('Payment successful, but there was an error adding credits. Please contact support.');
          return;
        }
      }

      // Show success message
      alert(`Payment successful! ${packageInfo.credits} credits added to your account.`);
      
      // Refresh page to update credits display
      window.location.reload();
      
    } catch (error) {
      console.error('Error processing payment success:', error);
      alert('Payment was successful but there was an error processing it. Please contact support.');
    }
  }

  // Handle payment failure
  private async handlePaymentFailure(response: any): Promise<void> {
    console.error('Payment failed:', response);
    
    try {
      // Update payment record as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          metadata: { error: response.error }
        })
        .eq('razorpay_order_id', response.error.metadata?.order_id);
        
    } catch (error) {
      console.error('Error updating failed payment:', error);
    }

    alert(`Payment failed: ${response.error.description || 'Unknown error'}`);
  }

  // Get user's payment history
  async getPaymentHistory(): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
      
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

export const razorpayService = RazorpayService.getInstance();
