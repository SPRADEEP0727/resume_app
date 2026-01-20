# CareerLeap UI - Frontend Documentation

## 🚀 Overview

CareerLeap UI is a modern React-based frontend application for AI-powered resume analysis and career optimization. Built with TypeScript, Vite, and shadcn/ui components, it provides a seamless user experience for resume analysis, credit management, and payment processing.

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Authentication System](#authentication-system)
- [Database Integration](#database-integration)
- [Payment Integration](#payment-integration)
- [API Integration](#api-integration)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🛠 Technology Stack

### Core Technologies
- **React 18** - UI library
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### Key Dependencies
- **React Router DOM** - Client-side routing
- **Supabase Client** - Database and authentication
- **Razorpay** - Payment processing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Query** - Server state management
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AuthModal.tsx    # Authentication modal
│   ├── CreditPurchase.tsx # Credit purchase component
│   ├── Dashboard.tsx    # Main dashboard
│   ├── DashboardOverview.tsx # Dashboard overview
│   ├── HeroSection.tsx  # Landing page hero
│   ├── LoginPage.tsx    # Login page
│   ├── Navbar.tsx       # Navigation bar
│   └── UserProfile.tsx  # User profile management
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── AnalysisContext.tsx # Analysis state
├── hooks/               # Custom React hooks
│   ├── useProfile.ts    # User profile management
│   └── use-toast.ts     # Toast notifications
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # General utilities
├── pages/               # Page components
│   ├── Index.tsx        # Main page (landing/dashboard)
│   └── NotFound.tsx     # 404 page
├── services/            # API services
│   ├── razorpayService.ts # Payment processing
│   └── resumeService.ts # Resume analysis API
├── types/               # TypeScript definitions
│   ├── database.ts      # Supabase database types
│   └── index.ts         # General types
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## ✨ Features

### 🔐 Authentication
- **Google OAuth** integration via Supabase
- **Email/Password** authentication
- **Session management** with automatic token refresh
- **Protected routes** with authentication guards

### 📊 Dashboard
- **Resume analysis** with AI-powered insights
- **Credit-based system** for feature usage
- **Real-time credit tracking**
- **Analysis history** and results management

### 💳 Payment System
- **Razorpay integration** for Indian market
- **Credit packages** (10, 25, 50, 100, 250 credits)
- **Payment history** tracking
- **Secure payment processing**

### 👤 User Management
- **Profile management** with editable fields
- **Credit transaction history**
- **Subscription status** tracking
- **Account settings**

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Razorpay account (for payments)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd career-leap-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# Backend API
VITE_API_BASE_URL="http://localhost:5000"

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID="rzp_test_your_key_id"
VITE_RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project identifier | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ |
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_API_BASE_URL` | Backend API endpoint | ✅ |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key | ✅ |
| `VITE_RAZORPAY_KEY_SECRET` | Razorpay secret (frontend only) | ❌ |

## 🔐 Authentication System

### Implementation Details

The authentication system uses Supabase Auth with the following features:

- **Google OAuth** for social login
- **Email/Password** for traditional auth
- **Automatic session management**
- **Protected route guards**

### Key Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state
   - Provides auth methods (signIn, signUp, signOut)
   - Handles session persistence

2. **AuthModal** (`src/components/AuthModal.tsx`)
   - Login/signup modal interface
   - Form validation with React Hook Form
   - Error handling and user feedback

### Usage Example

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.email}!</div>;
}
```

## 🗄️ Database Integration

### Supabase Setup

The application uses Supabase with three main tables:

1. **user_profiles** - User profile information
2. **payments** - Payment transaction records
3. **credit_transactions** - Credit usage history

### Database Schema

```sql
-- See run_this_in_supabase_sql_editor.sql for complete schema
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 5,
  -- ... other fields
);
```

### TypeScript Types

Database types are automatically generated in `src/types/database.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<UserProfile>;
      };
      // ... other tables
    };
  };
}
```

## 💳 Payment Integration

### Razorpay Setup

The payment system integrates with Razorpay for Indian market support:

### Credit Packages

```typescript
export const creditPackages: CreditPackage[] = [
  { id: 'pack_10', name: '10 Credits', credits: 10, price: 99 },
  { id: 'pack_25', name: '25 Credits', credits: 25, price: 199, savings: 15 },
  { id: 'pack_50', name: '50 Credits', credits: 50, price: 349, savings: 30, popular: true },
  { id: 'pack_100', name: '100 Credits', credits: 100, price: 599, savings: 40 },
  { id: 'pack_250', name: '250 Credits', credits: 250, price: 1299, savings: 50 },
];
```

### Payment Flow

1. **User selects** credit package
2. **Razorpay checkout** opens with prefilled details
3. **Payment processing** via Razorpay
4. **Credits added** to user account
5. **Transaction recorded** in database

### Key Components

- **CreditPurchase** - Payment interface
- **RazorpayService** - Payment processing logic
- **usePayments** - Payment history management

## 🔌 API Integration

### Backend Communication

The frontend communicates with a Flask backend for resume analysis:

```typescript
// Resume analysis API call
const analyzeResume = async (file: File, jobDescription: string) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('job_description', jobDescription);
  
  const response = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/resume/analyze` | POST | Analyze uploaded resume |
| `/api/resume/score` | POST | Get ATS score |
| `/api/resume/suggestions` | POST | Get improvement suggestions |
| `/api/resume/keywords` | POST | Extract keywords |

## 🧩 Component Architecture

### Design Principles

- **Composable components** with single responsibility
- **TypeScript-first** development
- **Accessibility** built-in with shadcn/ui
- **Responsive design** with Tailwind CSS

### Key Components

#### Dashboard Components
- `Dashboard.tsx` - Main dashboard layout
- `DashboardOverview.tsx` - Resume analysis interface
- `UserProfile.tsx` - Profile management

#### UI Components
- `AuthModal.tsx` - Authentication interface
- `CreditPurchase.tsx` - Payment processing
- `Navbar.tsx` - Navigation

#### Page Components
- `Index.tsx` - Landing page and routing logic
- `LoginPage.tsx` - Dedicated login interface

## 🔄 State Management

### Context Providers

1. **AuthContext** - Authentication state
2. **AnalysisContext** - Resume analysis state

### Custom Hooks

1. **useUserProfile** - Profile management
2. **useCredits** - Credit operations
3. **usePayments** - Payment history

### State Flow

```
User Action → Custom Hook → Supabase → Context Update → UI Rerender
```

## 🚀 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment with the included `vercel.json` configuration:

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect it as a Vite project

2. **Configure Environment Variables**
   Add these in your Vercel dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_BACKEND_URL=your_backend_api_url
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or trigger manual deployment from Vercel dashboard

The `vercel.json` file handles:
- SPA routing for React Router
- Build optimization
- Environment variable mapping
- Static asset serving

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment-Specific Builds

```bash
# Development environment
npm run build:dev

# Production environment
npm run build
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase database schema applied
- [ ] Razorpay credentials updated
- [ ] Backend API accessible
- [ ] Domain configured for OAuth redirects

## 🐛 Troubleshooting

### Common Issues

#### Authentication Issues
```typescript
// Check Supabase configuration
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

#### Payment Issues
- Verify Razorpay key ID is correct
- Check browser console for payment errors
- Ensure test mode is enabled for development

#### Database Connection Issues
- Verify Supabase project is active
- Check RLS policies are correctly configured
- Ensure tables exist (run SQL migration)

### Debug Tools

The application includes comprehensive logging:

```typescript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check authentication state
console.log('Auth state:', useAuth());

// Monitor credit operations
console.log('Credits:', useCredits());
```

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
