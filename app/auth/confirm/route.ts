import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/services/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Get token parameters from email confirmation link
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null
  const next = searchParams.get('next') || '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // For new signups, send welcome email
      if (type === 'signup') {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email) {
            const userName = user.user_metadata?.full_name || user.user_metadata?.name || null
            sendWelcomeEmail(user.email, userName).catch((err) => {
              console.error('Failed to send welcome email:', err)
            })
            console.log('📧 Welcome email queued for new user:', user.email)
          }
        } catch (emailError) {
          // Don't block auth flow if email fails
          console.error('Error sending welcome email:', emailError)
        }
      }

      // Redirect to the appropriate page after successful verification
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let redirectUrl = next

      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        redirectUrl = '/auth/reset-password'
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }

    console.error('Email confirmation error:', error)
  }

  // If verification fails, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
