CREATE OR REPLACE FUNCTION upload_user_resume(
    p_user_id UUID,
    p_title TEXT,
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size INTEGER DEFAULT NULL,
    p_file_type TEXT DEFAULT NULL,
    p_original_content TEXT DEFAULT NULL
) RETURNS TABLE(resume_id UUID) AS $$
DECLARE
    new_resume_id UUID;
BEGIN
    DELETE FROM resumes WHERE user_id = p_user_id;
    
    INSERT INTO resumes (
        user_id,
        title,
        file_name,
        file_path,
        file_size,
        file_type,
        original_content,
        is_primary
    ) VALUES (
        p_user_id,
        p_title,
        p_file_name,
        p_file_path,
        p_file_size,
        p_file_type,
        p_original_content,
        true
    ) RETURNING id INTO new_resume_id;
    
    RETURN QUERY SELECT new_resume_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;