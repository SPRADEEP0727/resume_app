export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          subscription_status: 'free' | 'premium' | 'enterprise';
          credits: number;
          total_credits_purchased: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          subscription_status?: 'free' | 'premium' | 'enterprise';
          credits?: number;
          total_credits_purchased?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          subscription_status?: 'free' | 'premium' | 'enterprise';
          credits?: number;
          total_credits_purchased?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          razorpay_signature: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_type: 'credits' | 'subscription';
          credits_purchased: number;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_signature?: string | null;
          amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_type?: 'credits' | 'subscription';
          credits_purchased?: number;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_signature?: string | null;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_type?: 'credits' | 'subscription';
          credits_purchased?: number;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
          credits: number;
          description: string;
          service_used: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
          credits: number;
          description: string;
          service_used?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: 'purchase' | 'usage' | 'refund' | 'bonus';
          credits?: number;
          description?: string;
          service_used?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
      resume_analyses: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string | null;
          analysis_result: any;
          ats_score: number | null;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url?: string | null;
          analysis_result: any;
          ats_score?: number | null;
          credits_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string | null;
          analysis_result?: any;
          ats_score?: number | null;
          credits_used?: number;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'premium' | 'enterprise';
          status: 'active' | 'cancelled' | 'expired';
          start_date: string;
          end_date: string | null;
          razorpay_subscription_id: string | null;
          credits_per_month: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type: 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired';
          start_date?: string;
          end_date?: string | null;
          razorpay_subscription_id?: string | null;
          credits_per_month?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired';
          start_date?: string;
          end_date?: string | null;
          razorpay_subscription_id?: string | null;
          credits_per_month?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_credits: number;
          p_description: string;
          p_service_used?: string;
          p_reference_id?: string;
        };
        Returns: boolean;
      };
      add_credits: {
        Args: {
          p_user_id: string;
          p_credits: number;
          p_description: string;
          p_reference_id?: string;
        };
        Returns: boolean;
      };
    };
  };
}

// Helper types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
export type ResumeAnalysis = Database['public']['Tables']['resume_analyses']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
