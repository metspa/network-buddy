# OAuth Setup Guide - Google & Apple Sign-In

This guide will walk you through setting up Google and Apple OAuth authentication for your Network Buddy app.

## Overview

Your app now has fully functional Google and Apple sign-in buttons on both the login and signup pages. To make them work, you need to:

1. Configure OAuth providers in the Supabase dashboard
2. Set up OAuth applications with Google and Apple
3. Add the credentials to Supabase

---

## Part 1: Setting Up Google OAuth

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it "Network Buddy" (or any name you prefer)
4. Click **Create**

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in required fields:
   - **App name**: Network Buddy
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. On the **Scopes** page, click **Save and Continue** (default scopes are fine)
7. On the **Test users** page, click **Save and Continue**
8. Click **Back to Dashboard**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it "Network Buddy Web Client"
5. Under **Authorized redirect URIs**, click **Add URI** and enter:
   ```
   https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
   ```

   To find your Supabase Project ID:
   - Go to your Supabase dashboard
   - Look at the URL: `https://supabase.com/dashboard/project/[PROJECT-ID]`
   - Or find it in Project Settings → General → Reference ID

6. Click **Create**
7. Copy the **Client ID** and **Client Secret** (you'll need these for Supabase)

### Step 4: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Network Buddy project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle **Enable Sign in with Google** to ON
6. Paste your **Client ID** and **Client Secret** from Google Cloud
7. Click **Save**

---

## Part 2: Setting Up Apple OAuth

Apple OAuth is more complex and requires:
- An Apple Developer account ($99/year)
- Your app to be registered in App Store Connect

### Step 1: Join Apple Developer Program (if not already enrolled)

1. Go to [Apple Developer](https://developer.apple.com/programs/)
2. Click **Enroll**
3. Follow the steps and pay the $99 annual fee
4. Wait for approval (usually 24-48 hours)

### Step 2: Create an App ID

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (plus button)
4. Select **App IDs** → **Continue**
5. Select **App** → **Continue**
6. Fill in:
   - **Description**: Network Buddy
   - **Bundle ID**: `com.networkbuddy.app` (must match your Capacitor config)
   - Check **Sign in with Apple** capability
7. Click **Continue** → **Register**

### Step 3: Create a Services ID

1. In **Identifiers**, click **+** again
2. Select **Services IDs** → **Continue**
3. Fill in:
   - **Description**: Network Buddy Web Auth
   - **Identifier**: `com.networkbuddy.app.web` (must be different from App ID)
4. Click **Continue** → **Register**
5. Click on the Services ID you just created
6. Check **Sign in with Apple**
7. Click **Configure**
8. Under **Primary App ID**, select your App ID (`com.networkbuddy.app`)
9. Under **Website URLs**:
   - **Domains**: `[YOUR-SUPABASE-PROJECT-ID].supabase.co`
   - **Return URLs**: `https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`
10. Click **Save** → **Continue** → **Save**

### Step 4: Create a Key for Sign in with Apple

1. Go to **Keys** → **+** (plus button)
2. Name it "Network Buddy Sign in with Apple Key"
3. Check **Sign in with Apple**
4. Click **Configure**
5. Select your App ID (`com.networkbuddy.app`)
6. Click **Save** → **Continue** → **Register**
7. Download the `.p8` key file (you can only download once!)
8. Note the **Key ID** shown on the page

### Step 5: Find Your Team ID

1. In Apple Developer Account, click your name in the top right
2. Go to **Membership**
3. Copy your **Team ID**

### Step 6: Configure Apple OAuth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Apple** in the list
4. Toggle **Enable Sign in with Apple** to ON
5. Fill in:
   - **Services ID**: `com.networkbuddy.app.web`
   - **Team ID**: Your Team ID from Step 5
   - **Key ID**: The Key ID from Step 4
   - **Private Key**: Open the `.p8` file in a text editor and paste the entire contents
6. Click **Save**

---

## Part 3: Testing OAuth

### Test Locally

1. Make sure your local server is running:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000/auth/login`

3. Click **Continue with Google** or **Continue with Apple**

4. You should be redirected to the OAuth provider

5. After signing in, you'll be redirected back to your app

### Test on Production (Vercel)

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Visit your production URL

3. Test the OAuth buttons

4. After signing in, you should be redirected to the home page

---

## Redirect URLs Summary

Make sure these redirect URLs are configured in all places:

### Google Cloud Console
```
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
```

### Apple Services ID
- **Domain**: `[YOUR-SUPABASE-PROJECT-ID].supabase.co`
- **Return URL**: `https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`

### Supabase
Your callback URL is automatically configured as:
```
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
```

---

## Common Issues

### "Redirect URI mismatch" (Google)
- Double-check that the redirect URI in Google Cloud Console exactly matches:
  `https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes
- Wait a few minutes after adding the URI (changes can take time to propagate)

### "Invalid client" (Apple)
- Verify your Services ID is correct
- Make sure the Bundle ID matches your App ID
- Check that the domain and return URL are properly configured
- Ensure your `.p8` key is correctly pasted (including BEGIN and END lines)

### OAuth works but user data isn't saved
- Check your Supabase database RLS policies
- Make sure the `contacts` table allows users to insert their own data
- Check the browser console for errors

### "Email already registered" error
- This happens if you created an account with email/password first
- Supabase doesn't automatically link accounts
- You can either:
  - Use the original email/password
  - Delete the email/password account from Supabase dashboard
  - Sign in with OAuth using a different email

---

## What Happens After OAuth Sign-In?

1. User clicks "Continue with Google" or "Continue with Apple"
2. They're redirected to Google/Apple to authenticate
3. After successful authentication, they're redirected back to:
   `https://your-app.vercel.app/auth/callback?code=...`
4. The callback route exchanges the code for a session
5. User is redirected to the home page (or `returnUrl` if specified)
6. The user is now logged in and can use the app

---

## Security Notes

- **Never commit** your OAuth credentials (Client Secret, `.p8` key) to Git
- Store them only in Supabase dashboard
- For Apple, keep a backup of your `.p8` key file (you can only download once)
- Use HTTPS in production (Vercel provides this automatically)
- Keep your OAuth credentials secure

---

## Next Steps

After setting up OAuth:

1. Test signing in with Google and Apple
2. Verify user data is saved to your `contacts` table
3. Test the full flow: sign up → scan business card → view contact
4. Consider adding a user profile page
5. Update your privacy policy to mention OAuth providers

---

## Need Help?

- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Apple Sign In Docs**: https://developer.apple.com/sign-in-with-apple/
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login
- **Supabase Discord**: https://discord.supabase.com/

Your OAuth buttons are ready to go once you complete this setup!
