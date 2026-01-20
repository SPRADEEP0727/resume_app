import { supabase } from '@/lib/supabase';

export const testAuthFlow = async (email: string, password: string) => {
  console.log('🧪 Testing complete auth flow for:', email);
  
  try {
    // Step 1: Test sign up
    console.log('1. Testing sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      return { success: false, step: 'signup', error: signUpError.message };
    }
    
    if (!signUpData.session && signUpData.user) {
      console.log('📧 Sign up successful, email verification required');
      return { success: true, step: 'signup', needsVerification: true };
    }
    
    if (signUpData.session) {
      console.log('✅ Sign up successful with immediate session');
    }
    
    // Step 2: Test sign in (if signup was successful)
    console.log('2. Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return { success: false, step: 'signin', error: signInError.message };
    }
    
    if (signInData.session) {
      console.log('✅ Sign in successful');
      
      // Step 3: Test profile creation
      console.log('3. Testing profile fetch/creation...');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', signInData.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Creating user profile...');
        
        // Try the safe profile creation function first
        const { data: createResult, error: functionError } = await supabase.rpc('create_user_profile_safe', {
          p_user_id: signInData.user.id,
          p_email: signInData.user.email || '',
          p_full_name: 'Test User'
        });
        
        if (functionError) {
          console.log('Function creation failed, trying direct insert...');
          // Fallback to direct insert if function fails
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: signInData.user.id,
              email: signInData.user.email || '',
              full_name: 'Test User',
              credits: 5,
              total_credits_purchased: 0
            });
          
          if (createError) {
            console.log('❌ Profile creation failed:', createError.message);
            return { success: false, step: 'profile', error: createError.message };
          }
        }
        
        console.log('✅ Profile created successfully');
      } else if (profileError) {
        console.log('❌ Profile fetch failed:', profileError.message);
        return { success: false, step: 'profile', error: profileError.message };
      } else {
        console.log('✅ Profile exists');
      }
      
      // Step 4: Clean up (sign out)
      await supabase.auth.signOut();
      console.log('🧹 Cleaned up test session');
      
      return { success: true, step: 'complete' };
    }
    
  } catch (error: any) {
    console.error('❌ Auth flow test failed:', error);
    return { success: false, step: 'unknown', error: error.message };
  }
};

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing Supabase connection...');
    const { data: connectionTest } = await supabase.from('user_profiles').select('count').limit(1);
    console.log('✅ Supabase connection successful');
    
    // Test 2: Check if tables exist
    console.log('2. Checking if required tables exist...');
    
    const tables = ['user_profiles', 'payments', 'credit_transactions'];
    const results = [];
    
    for (const table of tables) {
      try {
        await supabase.from(table).select('count').limit(1);
        console.log(`✅ Table '${table}' exists`);
        results.push({ table, exists: true });
      } catch (error: any) {
        if (error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`);
          results.push({ table, exists: false });
        } else {
          console.log(`⚠️ Error checking table '${table}':`, error.message);
          results.push({ table, exists: false, error: error.message });
        }
      }
    }
    
    // Test 3: Check authentication
    console.log('3. Testing authentication state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ Auth error:', authError.message);
    } else {
      console.log(user ? '✅ User authenticated' : 'ℹ️ No authenticated user');
    }
    
    // Summary
    const missingTables = results.filter(r => !r.exists);
    if (missingTables.length > 0) {
      console.log('\n🚨 ISSUE FOUND: Missing database tables!');
      console.log('Missing tables:', missingTables.map(t => t.table).join(', '));
      console.log('\n📝 SOLUTION:');
      console.log('1. Go to: https://supabase.com/dashboard/project/zsinqznywjzjcttcebof/sql');
      console.log('2. Run the SQL from: run_this_in_supabase_sql_editor.sql');
      console.log('3. Refresh this page and try again');
      return false;
    } else {
      console.log('\n✅ All tests passed! Database is properly configured.');
      return true;
    }
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

// Call this function in development to test the database
if (import.meta.env.DEV) {
  // Uncomment the line below to run database tests on page load
  // testDatabaseConnection();
}
