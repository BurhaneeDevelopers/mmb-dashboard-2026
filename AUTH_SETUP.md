# Authentication Setup Guide

This application uses Supabase Authentication with email/password login, protected routes, and session persistence.

## Features Implemented

### 1. Authentication System
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Password Reset Flow
- ✅ Session Persistence
- ✅ Protected Routes
- ✅ Auth State Management
- ✅ User Profile Display
- ✅ Sign Out Functionality

### 2. Components Created

#### Auth Components
- `components/auth/AuthProvider.tsx` - Global auth context provider
- `components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `lib/supabase/auth.service.ts` - Authentication service layer
- `lib/hooks/use-auth.ts` - Auth hook for components

#### Pages
- `app/auth/login/page.tsx` - Login form
- `app/auth/signup/page.tsx` - Registration form
- `app/auth/forgot-password/page.tsx` - Password reset request

### 3. Protected Routes

All dashboard routes are now protected:
- `/dashboard` - Main dashboard
- `/categories` - Categories management
- `/masters` - Masters management
- `/products` - Products management

Unauthenticated users are automatically redirected to `/auth/login`.

## Supabase Configuration

### Enable Email Authentication

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### Email Settings

Go to **Authentication** → **Email Templates** to customize:
- **Confirm signup**: Sent when user signs up
- **Reset password**: Sent when user requests password reset
- **Magic Link**: For passwordless login (optional)

### Site URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:3000`
   - Production: Your production domain
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

## Usage

### Sign Up New User

```typescript
import { authService } from '@/lib/supabase/auth.service';

await authService.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  fullName: 'John Doe'
});
```

### Sign In

```typescript
await authService.signIn({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Sign Out

```typescript
await authService.signOut();
```

### Using Auth in Components

```typescript
import { useAuth } from '@/components/auth/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protecting Routes

Routes inside `app/(dashboard)` are automatically protected by the `ProtectedRoute` component in the layout.

For custom protection:

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## User Flow

### New User Registration
1. User visits `/auth/signup`
2. Fills in name, email, and password
3. Submits form
4. Receives confirmation email (if email confirmation is enabled)
5. Clicks confirmation link
6. Redirected to login page
7. Signs in and accesses dashboard

### Existing User Login
1. User visits `/auth/login`
2. Enters email and password
3. Submits form
4. Redirected to `/dashboard`
5. Session persists across page refreshes

### Password Reset
1. User clicks "Forgot password?" on login page
2. Enters email address
3. Receives password reset email
4. Clicks reset link
5. Sets new password
6. Redirected to login page

## Security Features

### Session Management
- Sessions are stored in browser's local storage
- Automatic session refresh
- Session expires after inactivity (configurable in Supabase)

### Password Requirements
- Minimum 6 characters (configurable)
- Can be enhanced with additional validation

### Protected API Routes
All Supabase queries automatically include the user's session token, ensuring:
- Only authenticated users can perform CRUD operations
- RLS policies are enforced
- User context is available in database queries

## Testing Authentication

### Create Test User

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign up" and create a test account

4. Check your email for confirmation (if enabled)

5. Sign in with your credentials

### Verify Protection

1. Try accessing `/dashboard` without signing in
   - Should redirect to `/auth/login`

2. Sign in and access `/dashboard`
   - Should display dashboard content

3. Sign out
   - Should redirect to `/auth/login`
   - Session should be cleared

## Troubleshooting

### "Invalid login credentials" error
- Verify email and password are correct
- Check if email confirmation is required
- Ensure user exists in Supabase Auth dashboard

### Redirect loop
- Check Site URL configuration in Supabase
- Verify redirect URLs are whitelisted
- Clear browser cache and cookies

### Session not persisting
- Check browser's local storage
- Verify Supabase client is properly initialized
- Check for console errors

### Email not received
- Check spam folder
- Verify email provider settings in Supabase
- Check Supabase logs for email delivery status

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
```

## Next Steps

### Optional Enhancements

1. **Social Authentication**
   - Add Google, GitHub, etc.
   - Configure OAuth providers in Supabase

2. **Email Verification**
   - Enable email confirmation in Supabase
   - Customize email templates

3. **Two-Factor Authentication**
   - Implement TOTP
   - Add SMS verification

4. **Role-Based Access Control**
   - Add user roles to database
   - Implement role-based permissions
   - Create admin-only routes

5. **User Profile Management**
   - Add profile edit page
   - Allow avatar upload
   - Update user metadata

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review Supabase Auth logs in dashboard
- Check browser console for errors
