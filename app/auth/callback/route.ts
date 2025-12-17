import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
