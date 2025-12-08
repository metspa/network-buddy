# Supabase Setup Guide

This guide will help you set up and use Supabase for authentication and database in your Network Buddy application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- This Next.js application

## Environment Variables

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tjroveygfjtutescoknn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=your-openai-key-here
```

## Database Setup

### 1. Create Database Tables

Go to your Supabase dashboard → SQL Editor and run the SQL in `lib/database/schema.sql`.

This creates:
- **profiles** table: User profile information
- **posts** table: Example content table with user relationships
- **Row Level Security (RLS)** policies for data protection
- **Triggers** to automatically create profiles for new users

### 2. Enable Email Authentication

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if desired
4. Set the **Site URL** to your app's URL (e.g., `http://localhost:3000` for development)
5. Add redirect URLs under **URL Configuration**:
   - `http://localhost:3000/auth/callback`
   - Your production URL + `/auth/callback`

## Project Structure

```
lib/
├── supabase/
│   ├── client.ts          # Browser client (client components)
│   ├── server.ts          # Server client (server components/actions)
│   ├── middleware.ts      # Session refresh logic
│   └── auth.ts            # Authentication helper functions
├── database/
│   ├── schema.sql         # Database schema and migrations
│   └── queries.ts         # Example database queries
components/
├── AuthButton.tsx         # Shows login/signup or user email + logout
└── LogoutButton.tsx       # Logout button component
app/
├── auth/
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── callback/          # OAuth callback handler
middleware.ts              # Root middleware for session management
```

## How It Works

### Authentication Flow

1. **Sign Up**: User creates account at `/auth/signup`
   - Email confirmation may be required (check Supabase settings)
   - A profile is automatically created via database trigger

2. **Sign In**: User logs in at `/auth/login`
   - Session cookie is created
   - User is redirected to home page

3. **Session Management**:
   - Middleware automatically refreshes auth tokens on each request
   - Client components can access user state via `useEffect` and Supabase client

4. **Sign Out**:
   - User clicks logout button
   - Session is destroyed
   - User is redirected to login page

### Client vs Server Components

**Use Browser Client** (`lib/supabase/client.ts`) for:
- Client components (`'use client'`)
- Real-time subscriptions
- Auth state changes

**Use Server Client** (`lib/supabase/server.ts`) for:
- Server components (default in Next.js 15)
- Server actions
- API routes
- Secure operations

## Usage Examples

### Getting the Current User (Client Component)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <div>{user?.email}</div>
}
```

### Getting the Current User (Server Component)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>{user?.email}</div>
}
```

### Database Queries

```tsx
import { getPosts, createPost } from '@/lib/database/queries'

// Get all posts
const { data: posts, error } = await getPosts()

// Create a new post
const { data: newPost, error } = await createPost(
  userId,
  'My Post Title',
  'Post content here'
)
```

### Protecting Routes with Server Components

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

## Testing the Setup

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test Sign Up**:
   - Navigate to http://localhost:3000/auth/signup
   - Create an account with a valid email
   - Check your email for confirmation (if enabled)

3. **Test Sign In**:
   - Navigate to http://localhost:3000/auth/login
   - Sign in with your credentials
   - You should see your email in the header

4. **Test Sign Out**:
   - Click the "Sign out" button
   - You should be redirected to the login page

5. **Check Database**:
   - Go to Supabase dashboard → Table Editor
   - Verify your profile was created in the `profiles` table

## Common Issues

### Email Confirmation Required

If users aren't getting logged in after signup:
1. Go to Supabase dashboard → Authentication → Settings
2. Disable "Enable email confirmations" for development
3. Re-enable for production

### Redirect Loop

If you're experiencing redirect loops:
1. Check that your middleware is properly configured
2. Ensure the callback URL is added to Supabase allowed URLs
3. Clear your browser cookies

### Build Warnings

The Edge Runtime warnings during build are expected and won't affect functionality. Supabase clients work correctly in both Edge and Node.js runtimes.

## Next Steps

1. Customize the `profiles` table with additional fields
2. Create additional tables for your app's data
3. Add more authentication methods (Google, GitHub, etc.)
4. Implement password reset functionality
5. Add role-based access control (RBAC)
6. Set up real-time subscriptions for live updates

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
