import { supabase } from './supabase';

export async function checkAuthConfiguration() {
  console.log('🔧 Checking Supabase Auth Configuration...');
  
  try {
    // Test 1: Check if we can access Supabase auth
    console.log('1. Testing Supabase Auth API access...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return false;
    }
    console.log('✅ Auth API accessible, current session:', session ? 'EXISTS' : 'NULL');
    
    // Test 2: Check auth settings (this might fail if we don't have admin access)
    console.log('2. Attempting to check auth configuration...');
    
    // Test 3: Try a test signup to see what happens
    console.log('3. Testing signup behavior...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`🧪 Attempting signup with: ${testEmail}`);
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signupError) {
      console.error('❌ Signup failed:', signupError);
      
      // Check for common auth configuration issues
      if (signupError.message.includes('Email not confirmed')) {
        console.log('🔍 DIAGNOSIS: Email confirmation is required!');
        console.log('📋 SOLUTION: Either:');
        console.log('   1. Check your email and confirm the signup');
        console.log('   2. Or disable email confirmation in Supabase Dashboard');
        return 'EMAIL_CONFIRMATION_REQUIRED';
      }
      
      if (signupError.message.includes('User already registered')) {
        console.log('⚠️ Email already exists, testing signin instead...');
        
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (signinError) {
          console.error('❌ Signin also failed:', signinError);
          if (signinError.message.includes('Email not confirmed')) {
            return 'EMAIL_CONFIRMATION_REQUIRED';
          }
          return false;
        }
        
        console.log('✅ Signin successful:', signinData.session ? 'SESSION_CREATED' : 'NO_SESSION');
        return signinData.session ? true : 'NO_SESSION_AFTER_SIGNIN';
      }
      
      return false;
    }
    
    console.log('✅ Signup successful:', signupData);
    
    // Check if we got a session immediately (email confirmation disabled)
    if (signupData.session) {
      console.log('✅ Got session immediately - email confirmation is DISABLED');
      
      // Clean up test user
      await supabase.auth.signOut();
      return 'EMAIL_CONFIRMATION_DISABLED';
    } else if (signupData.user && !signupData.user.email_confirmed_at) {
      console.log('⚠️ User created but no session - email confirmation is REQUIRED');
      console.log('📋 User needs to check email and click confirmation link');
      return 'EMAIL_CONFIRMATION_REQUIRED';
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Auth configuration check failed:', error);
    return false;
  }
}

export async function getAuthStatus() {
  console.log('📊 Getting current auth status...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
    
    console.log('Current session:', {
      exists: !!session,
      userId: session?.user?.id || 'N/A',
      email: session?.user?.email || 'N/A',
      emailConfirmed: session?.user?.email_confirmed_at || 'Not confirmed',
      role: session?.user?.role || 'N/A'
    });
    
    return session;
  } catch (error) {
    console.error('❌ Failed to get auth status:', error);
    return null;
  }
}
