# Supabase Google OAuth Configuration

## Step 1: Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zsinqznywjzjcttcebof
2. Navigate to Authentication → Providers
3. Find Google and click "Configure"
4. Enable Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
   - **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

## Step 2: Configure Redirect URLs in Google Cloud Console

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Add these authorized redirect URIs:
   ```
   https://zsinqznywjzjcttcebof.supabase.co/auth/v1/callback
   http://localhost:3000/dashboard
   ```

## Step 3: Environment Variables

Make sure your `.env` file contains:
```env
VITE_SUPABASE_PROJECT_ID="zsinqznywjzjcttcebof"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaW5xem55d2p6amN0dGNlYm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MDYyMTEsImV4cCI6MjA3MDI4MjIxMX0.QT6bKwqnjntM0NqZc1N3PjrZkeKj7ceI_Geo0GkVDOo"
VITE_SUPABASE_URL="https://zsinqznywjzjcttcebof.supabase.co"
VITE_API_BASE_URL="http://localhost:5000"
```

## Step 4: Test the Configuration

1. Start your development server: `npm run dev`
2. Try to sign up with email/password
3. Try to sign in with Google
4. Check the Supabase Authentication logs for any issues

## Troubleshooting

### 404 Not Found Error
This usually means:
1. The Supabase project is not properly configured
2. The environment variables are not loaded correctly
3. The redirect URLs are not properly configured

### Google OAuth Issues
1. Make sure the redirect URI in Google Cloud Console matches your Supabase callback URL
2. Verify the Client ID and Secret are correctly entered in Supabase
3. Check that the Google OAuth consent screen is properly configured

### Network Issues
1. Make sure your Supabase project is active
2. Check if your API keys are correct and not expired
3. Verify network connectivity to Supabase

## Current Configuration Status

✅ Frontend configured with Supabase client
✅ Auth context provider created
✅ Components updated to use Supabase auth
✅ Google OAuth credentials available
⏳ Need to configure Google OAuth in Supabase dashboard
⏳ Need to update Google Cloud Console redirect URIs

## Next Steps

1. Configure Google OAuth in your Supabase project dashboard
2. Update Google Cloud Console redirect URIs
3. Test authentication flow
4. Monitor Supabase authentication logs for any issues
