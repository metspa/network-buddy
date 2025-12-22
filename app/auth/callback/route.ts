import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/services/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const returnUrl = searchParams.get('returnUrl')
  const next = searchParams.get('next')
  const redirectPath = returnUrl || next || '/'

  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorParam = encodeURIComponent(errorDescription || error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorParam}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Check if this is a new user (created within last 2 minutes) and send welcome email
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const createdAt = new Date(user.created_at)
          const now = new Date()
          const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60)

          // If user was created within the last 2 minutes, they're new - send welcome email
          if (minutesSinceCreation < 2) {
            const userName = user.user_metadata?.full_name || user.user_metadata?.name || null
            sendWelcomeEmail(user.email!, userName).catch((err) => {
              console.error('Failed to send welcome email:', err)
            })
            console.log('📧 Welcome email queued for new user:', user.email)
          }
        }
      } catch (emailError) {
        // Don't block auth flow if email fails
        console.error('Error checking for welcome email:', emailError)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }

    // Log the error for debugging
    console.error('Code exchange error:', exchangeError.message)
    const errorParam = encodeURIComponent(exchangeError.message || 'Code exchange failed')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorParam}`)
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
