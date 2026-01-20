# Supabase Setup Guide

## 1. Database Setup

### Step 1: Run Database Migration
1. Copy the contents of `supabase/migrations/001_initial_schema.sql`
2. Go to your Supabase dashboard → SQL Editor
3. Paste the migration script and run it
4. This will create all necessary tables and functions

### Step 2: Verify Tables
Check that these tables are created:
- `user_profiles`
- `payments` 
- `credit_transactions`
- `resume_analyses`
- `subscriptions`

## 2. Authentication Setup

### Step 1: Enable Email Auth
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Email" provider
3. Set "Confirm email" to false for development (enable in production)

### Step 2: Configure Google OAuth
1. Go to Authentication → Settings → Auth Providers
2. Enable "Google" provider
3. Add your Google OAuth credentials:
   - Client ID: `YOUR_GOOGLE_CLIENT_ID`
   - Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`
4. Add redirect URLs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

## 3. Row Level Security (RLS)

The migration script automatically enables RLS and creates policies. Verify:
1. Go to Database → Tables
2. Check each table has RLS enabled
3. Review policies in the Policies tab

## 4. Environment Variables

Update your `.env` file with:
```env
NEXT_PUBLIC_SUPABASE_URL="https://zsinqznywjzjcttcebof.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key"
```

## 5. Razorpay Setup

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Create an account and get KYC approved

### Step 2: Get API Keys
1. Go to Dashboard → Settings → API Keys
2. Generate Test/Live keys
3. Add to environment variables

### Step 3: Configure Webhooks (Optional)
1. Go to Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Enable payment events

## 6. Test the Setup

### Test User Registration:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
});
```

### Test Credit Purchase:
1. Login to your app
2. Go to Profile → Credits tab
3. Try purchasing credits with test card numbers

## 7. Production Checklist

- [ ] Enable email confirmation
- [ ] Set up proper CORS policies
- [ ] Configure production Razorpay keys
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure backup policies

## Troubleshooting

### Common Issues:

1. **404 Not Found**: Check if Supabase URL is correct
2. **Auth Errors**: Verify RLS policies are set correctly
3. **Payment Errors**: Check Razorpay keys and webhook setup
4. **CORS Errors**: Add your domain to Supabase allowed origins

### Debug Commands:
```javascript
// Check auth status
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Test database connection
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .limit(1);
console.log('Database test:', { data, error });
```
