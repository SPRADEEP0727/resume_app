import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Starting auth setup...');
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
        }
        
        console.log('AuthProvider: Initial session:', session);
        

        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('AuthProvider: Failed to get session:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state change:', { event, session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up for:', email);
    
    try {
      // First, try to sign in with Google to check if user exists with OAuth
      console.log('AuthProvider: Checking if user exists with OAuth');
      try {
        // Check if user exists by trying a sign-in with magic link (this doesn't send email in test mode)
        const { data: magicData, error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false // This prevents creating a new user
          }
        });
        
        // If no error, user exists
        if (!magicError) {
          console.log('AuthProvider: User already exists (found via OTP check)');
          return { error: { message: 'You are already registered with this email. Please use the login option or sign in with Google if you used OAuth.' } as any };
        }
      } catch (otpError) {
        console.log('AuthProvider: OTP check failed, proceeding with signup');
      }
      
      console.log('AuthProvider: Proceeding with signup');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('AuthProvider: Sign up error:', error);
        
        // Handle specific error messages that indicate existing user
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.message.includes('Email address is already registered') ||
            error.message.includes('A user with this email address has already been registered') ||
            error.message.includes('Email rate limit exceeded')) {
          return { error: { ...error, message: 'You are already registered with this email. Please use the login option or sign in with Google if you used OAuth.' } };
        }
        
        return { error };
      }
      
      console.log('AuthProvider: Sign up response', { 
        user: data.user?.id, 
        session: !!data.session,
        needsConfirmation: !data.session,
        emailConfirmedAt: data.user?.email_confirmed_at,
        createdAt: data.user?.created_at,
        appMetadata: data.user?.app_metadata,
        identities: data.user?.identities?.length || 0
      });
      
      // Check if user has OAuth identities (Google, etc.)
      if (data.user && data.user.identities && data.user.identities.length > 0) {
        const hasOAuthIdentity = data.user.identities.some(identity => 
          identity.provider !== 'email' && identity.provider !== 'phone'
        );
        
        if (hasOAuthIdentity) {
          console.log('AuthProvider: User already exists with OAuth identity');
          return { error: { message: 'You are already registered with this email using Google. Please sign in with Google instead.' } as any };
        }
      }
      
      // For existing users, Supabase usually returns the user but doesn't send a new confirmation email
      if (data.user && !data.session) {
        // Parse the creation time
        const userCreatedAt = new Date(data.user.created_at);
        const now = new Date();
        const timeDifferenceSeconds = (now.getTime() - userCreatedAt.getTime()) / 1000;
        
        // If user was created more than 30 seconds ago, they likely already existed
        if (timeDifferenceSeconds > 30) {
          console.log('AuthProvider: User already exists (created at:', data.user.created_at, ', time diff:', timeDifferenceSeconds, 's)');
          return { error: { message: 'You are already registered with this email. Please use the login option.' } as any };
        }
        
        // User is newly created (within 30 seconds), needs email verification
        console.log('AuthProvider: New user signup - needs email verification (created', timeDifferenceSeconds, 'seconds ago)');
        return { error: null };
      }
      
      // If we have both user and session, user is automatically signed in
      if (data.session && data.user) {
        console.log('AuthProvider: User signed up and automatically signed in');
        return { error: null };
      }
      
      return { error: null };
    } catch (err) {
      console.error('AuthProvider: Sign up exception:', err);
      return { error: { message: 'Sign up failed. Please try again.' } as any };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Invalid email or password. Please check your credentials and try again.' } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { ...error, message: 'Please check your email and click the confirmation link before signing in.' } };
        }
        
        return { error };
      }
      
      console.log('AuthProvider: Sign in successful', { user: data.user?.id });
      return { error: null };
    } catch (err) {
      console.error('AuthProvider: Sign in exception:', err);
      return { error: { message: 'Sign in failed. Please try again.' } as any };
    }
  };

  const signInWithGoogle = async () => {
    console.log('AuthProvider: Attempting Google sign in');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) {
      console.error('AuthProvider: Google sign in error:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('AuthProvider: Sign out error:', error);
    } else {
      console.log('AuthProvider: Sign out successful');
    }
    
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  console.log('AuthProvider: Current state:', { user: !!user, loading, sessionExists: !!session });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
