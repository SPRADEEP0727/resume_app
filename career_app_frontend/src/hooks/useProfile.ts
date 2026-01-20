import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, CreditTransaction, Payment } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Profile fetch: Attempting to fetch profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Profile fetch: Error occurred:', error);
        
        if (error.code === 'PGRST116') {
          console.log('Profile fetch: Profile not found, creating new profile...');
          
          // Profile doesn't exist, create one
          const newProfile: Partial<UserProfile> = {
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            phone: null,
            avatar_url: null,
            subscription_status: 'free',
            credits: 5,
            total_credits_purchased: 0
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('Profile fetch: Failed to create profile:', createError);
            
            if (createError.code === '42P01') {
              throw new Error('Database tables not found. Please run the SQL migration in Supabase dashboard.');
            }
            
            throw createError;
          }

          console.log('Profile fetch: Profile created successfully:', createdProfile.id);
          setProfile(createdProfile);
        } else {
          throw error;
        }
      } else {
        console.log('Profile fetch: Profile found:', data.id);
        setProfile(data);
      }
    } catch (err) {
      console.error('Profile fetch: Exception occurred:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile
  };
};

export const useCredits = () => {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useUserProfile();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Transactions fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (
    credits: number,
    description: string,
    serviceUsed?: string,
    referenceId?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_credits: credits,
        p_description: description,
        p_service_used: serviceUsed,
        p_reference_id: referenceId
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Insufficient credits');
      }

      // Refresh profile and transactions
      await Promise.all([refetchProfile(), fetchTransactions()]);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const addCredits = async (
    credits: number,
    description: string,
    referenceId?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('add_credits', {
        p_user_id: user.id,
        p_credits: credits,
        p_description: description,
        p_reference_id: referenceId
      });

      if (error) {
        throw error;
      }

      // Refresh profile and transactions
      await Promise.all([refetchProfile(), fetchTransactions()]);

      return data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return {
    credits: profile?.credits || 0,
    transactions,
    loading,
    error,
    deductCredits,
    addCredits,
    refetch: fetchTransactions
  };
};

export const usePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user) {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Payments fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...paymentData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchPayments();
    return data;
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await fetchPayments();
    return data;
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    refetch: fetchPayments
  };
};
