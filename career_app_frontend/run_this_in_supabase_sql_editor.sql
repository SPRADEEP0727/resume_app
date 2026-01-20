-- Run this in your Supabase SQL Editor to create the required tables
-- Go to: https://supabase.com/dashboard/project/zsinqznywjzjcttcebof/sql

-- Create user profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
    credits INTEGER DEFAULT 5,
    total_credits_purchased INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create payments table for Razorpay integration
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL, -- Amount in paise (Indian currency)
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_type TEXT DEFAULT 'credits' CHECK (payment_type IN ('credits', 'subscription')),
    credits_purchased INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
    credits INTEGER NOT NULL,
    description TEXT NOT NULL,
    service_used TEXT, -- 'resume_analysis', 'mock_interview', etc.
    reference_id UUID, -- Reference to payment or service usage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table to store user resumes and analysis data
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Resume',
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase storage
    file_size INTEGER,
    file_type TEXT DEFAULT 'application/pdf',
    original_content TEXT, -- Extracted text content
    is_primary BOOLEAN DEFAULT false, -- Mark primary resume
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resume analysis table to store ATS scores and analysis data
CREATE TABLE IF NOT EXISTS resume_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ATS Analysis Data
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    overall_rating TEXT CHECK (overall_rating IN ('Poor', 'Fair', 'Good', 'Very Good', 'Excellent')),
    
    -- Detailed Analysis
    strengths JSONB, -- Array of strength points
    weaknesses JSONB, -- Array of improvement areas
    suggestions JSONB, -- Array of AI suggestions
    
    -- Skill Analysis
    skills_found JSONB, -- Array of detected skills
    missing_skills JSONB, -- Array of suggested skills to add
    skill_categories JSONB, -- Categorized skills (technical, soft, etc.)
    
    -- Section Analysis
    sections_analysis JSONB, -- Analysis of resume sections
    formatting_score INTEGER CHECK (formatting_score >= 0 AND formatting_score <= 100),
    keyword_density DECIMAL(5,2),
    
    -- Metadata
    analysis_version TEXT DEFAULT '1.0',
    analysis_type TEXT DEFAULT 'comprehensive' CHECK (analysis_type IN ('quick', 'comprehensive', 'ats-focused')),
    job_description TEXT, -- If analyzed against specific JD
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one analysis per resume (can be updated)
    UNIQUE(resume_id)
);

-- Create job descriptions table for JD matching
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT,
    description TEXT NOT NULL,
    requirements JSONB, -- Array of requirements
    skills_required JSONB, -- Array of required skills
    location TEXT,
    salary_range TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create JD matching results table
CREATE TABLE IF NOT EXISTS jd_matching_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_description_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Matching Scores
    overall_match_score INTEGER CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
    skills_match_score INTEGER CHECK (skills_match_score >= 0 AND skills_match_score <= 100),
    experience_match_score INTEGER CHECK (experience_match_score >= 0 AND experience_match_score <= 100),
    
    -- Detailed Analysis
    matched_skills JSONB, -- Skills that match
    missing_skills JSONB, -- Skills required but missing
    matched_requirements JSONB, -- Requirements that are met
    missing_requirements JSONB, -- Requirements that are missing
    
    -- Recommendations
    improvement_suggestions JSONB, -- How to improve match
    recommended_changes JSONB, -- Specific changes to make
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique matching per resume-jd pair
    UNIQUE(resume_id, job_description_id)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jd_matching_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;

DROP POLICY IF EXISTS "Users can view own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;

DROP POLICY IF EXISTS "Users can view own resume analysis" ON resume_analysis;
DROP POLICY IF EXISTS "Users can insert own resume analysis" ON resume_analysis;
DROP POLICY IF EXISTS "Users can update own resume analysis" ON resume_analysis;
DROP POLICY IF EXISTS "Users can delete own resume analysis" ON resume_analysis;

DROP POLICY IF EXISTS "Users can view own job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Users can insert own job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Users can update own job descriptions" ON job_descriptions;
DROP POLICY IF EXISTS "Users can delete own job descriptions" ON job_descriptions;

DROP POLICY IF EXISTS "Users can view own JD matching results" ON jd_matching_results;
DROP POLICY IF EXISTS "Users can insert own JD matching results" ON jd_matching_results;
DROP POLICY IF EXISTS "Users can update own JD matching results" ON jd_matching_results;
DROP POLICY IF EXISTS "Users can delete own JD matching results" ON jd_matching_results;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payments
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for credit_transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for resumes
CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes" ON resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes" ON resumes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes" ON resumes
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for resume_analysis
CREATE POLICY "Users can view own resume analysis" ON resume_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume analysis" ON resume_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume analysis" ON resume_analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analysis" ON resume_analysis
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for job_descriptions
CREATE POLICY "Users can view own job descriptions" ON job_descriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job descriptions" ON job_descriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job descriptions" ON job_descriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own job descriptions" ON job_descriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for jd_matching_results
CREATE POLICY "Users can view own JD matching results" ON jd_matching_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own JD matching results" ON jd_matching_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own JD matching results" ON jd_matching_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own JD matching results" ON jd_matching_results
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            CASE 
                WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'full_name'
                ELSE NULL 
            END,
            CASE 
                WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'name'
                ELSE NULL 
            END,
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error in handle_new_user(): %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_credits INTEGER,
    p_description TEXT,
    p_service_used TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO current_credits
    FROM user_profiles
    WHERE user_id = p_user_id;
    
    -- Check if user has enough credits
    IF current_credits < p_credits THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct credits
    UPDATE user_profiles
    SET credits = credits - p_credits,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        credits,
        description,
        service_used
    ) VALUES (
        p_user_id,
        'usage',
        -p_credits,
        p_description,
        p_service_used
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_credits INTEGER,
    p_description TEXT,
    p_reference_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Add credits
    UPDATE user_profiles
    SET credits = credits + p_credits,
        total_credits_purchased = total_credits_purchased + p_credits,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Record transaction
    INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        credits,
        description,
        reference_id
    ) VALUES (
        p_user_id,
        'purchase',
        p_credits,
        p_description,
        p_reference_id::UUID
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely create user profile (fallback)
CREATE OR REPLACE FUNCTION create_user_profile_safe(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_profiles (user_id, email, full_name, credits, total_credits_purchased)
    VALUES (
        p_user_id,
        p_email,
        COALESCE(p_full_name, split_part(p_email, '@', 1)),
        5,  -- Default credits
        0   -- No credits purchased yet
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in create_user_profile_safe(): %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save or update resume analysis
CREATE OR REPLACE FUNCTION save_resume_analysis(
    p_resume_id UUID,
    p_user_id UUID,
    p_ats_score INTEGER,
    p_overall_rating TEXT,
    p_strengths JSONB,
    p_weaknesses JSONB,
    p_suggestions JSONB,
    p_skills_found JSONB,
    p_missing_skills JSONB DEFAULT NULL,
    p_skill_categories JSONB DEFAULT NULL,
    p_sections_analysis JSONB DEFAULT NULL,
    p_formatting_score INTEGER DEFAULT NULL,
    p_keyword_density DECIMAL DEFAULT NULL,
    p_analysis_type TEXT DEFAULT 'comprehensive',
    p_job_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Security check: Ensure the resume belongs to the user
    IF NOT EXISTS (
        SELECT 1 FROM resumes 
        WHERE id = p_resume_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Resume does not belong to user or does not exist';
        RETURN FALSE;
    END IF;

    INSERT INTO resume_analysis (
        resume_id, user_id, ats_score, overall_rating, strengths, weaknesses, 
        suggestions, skills_found, missing_skills, skill_categories, 
        sections_analysis, formatting_score, keyword_density, analysis_type, job_description
    ) VALUES (
        p_resume_id, p_user_id, p_ats_score, p_overall_rating, p_strengths, p_weaknesses,
        p_suggestions, p_skills_found, p_missing_skills, p_skill_categories,
        p_sections_analysis, p_formatting_score, p_keyword_density, p_analysis_type, p_job_description
    )
    ON CONFLICT (resume_id) DO UPDATE SET
        ats_score = EXCLUDED.ats_score,
        overall_rating = EXCLUDED.overall_rating,
        strengths = EXCLUDED.strengths,
        weaknesses = EXCLUDED.weaknesses,
        suggestions = EXCLUDED.suggestions,
        skills_found = EXCLUDED.skills_found,
        missing_skills = EXCLUDED.missing_skills,
        skill_categories = EXCLUDED.skill_categories,
        sections_analysis = EXCLUDED.sections_analysis,
        formatting_score = EXCLUDED.formatting_score,
        keyword_density = EXCLUDED.keyword_density,
        analysis_type = EXCLUDED.analysis_type,
        job_description = EXCLUDED.job_description,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in save_resume_analysis(): %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function before recreating with new return type
DROP FUNCTION IF EXISTS get_user_latest_resume_with_analysis(UUID);

-- Function to get user's latest resume with analysis
CREATE OR REPLACE FUNCTION get_user_latest_resume_with_analysis(p_user_id UUID)
RETURNS TABLE(
    resume_id UUID,
    title TEXT,
    file_name TEXT,
    file_path TEXT,
    file_size INTEGER,
    file_type TEXT,
    original_content TEXT,
    is_primary BOOLEAN,
    created_at TIMESTAMPTZ,
    ats_score INTEGER,
    overall_rating TEXT,
    strengths JSONB,
    weaknesses JSONB,
    suggestions JSONB,
    skills_found JSONB,
    missing_skills JSONB,
    skill_categories JSONB,
    sections_analysis JSONB,
    formatting_score INTEGER,
    keyword_density DECIMAL,
    analysis_type TEXT,
    job_description TEXT,
    analysis_updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.file_name,
        r.file_path,
        r.file_size,
        r.file_type,
        r.original_content,
        r.is_primary,
        r.created_at,
        ra.ats_score,
        ra.overall_rating,
        ra.strengths,
        ra.weaknesses,
        ra.suggestions,
        ra.skills_found,
        ra.missing_skills,
        ra.skill_categories,
        ra.sections_analysis,
        ra.formatting_score,
        ra.keyword_density,
        ra.analysis_type,
        ra.job_description,
        ra.updated_at
    FROM resumes r
    LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
    WHERE r.user_id = p_user_id
    ORDER BY r.updated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a temporary debug function to check resume ownership
CREATE OR REPLACE FUNCTION debug_resume_ownership(
    p_resume_id UUID,
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    resume_record RECORD;
    result JSONB;
BEGIN
    -- Get the resume record
    SELECT * INTO resume_record FROM resumes WHERE id = p_resume_id;
    
    result := jsonb_build_object(
        'resume_id', p_resume_id,
        'user_id', p_user_id,
        'resume_exists', CASE WHEN resume_record.id IS NOT NULL THEN true ELSE false END,
        'resume_user_id', resume_record.user_id,
        'user_match', CASE WHEN resume_record.user_id = p_user_id THEN true ELSE false END,
        'resume_title', resume_record.title,
        'resume_created_at', resume_record.created_at
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
