'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signUp, signInWithGoogle, signInWithApple } from '@/lib/supabase/auth'

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await signUp(email, password, returnUrl || undefined)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSignupSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    const { error } = await signInWithGoogle(returnUrl || undefined)
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setError(null)
    setLoading(true)
    const { error } = await signInWithApple(returnUrl || undefined)
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  // Success screen (same for both mobile and desktop)
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-[var(--nb-black)] relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--nb-success)] rounded-full opacity-[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 safe-area-pt safe-area-pb">
          <div className="w-full max-w-sm text-center opacity-0 animate-scale-in">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-[var(--nb-success)]/20 flex items-center justify-center mx-auto mb-8">
              <div className="w-14 h-14 rounded-full bg-[var(--nb-success)]/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--nb-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-[var(--nb-text)] mb-4">Check your email</h2>
            <p className="text-[var(--nb-text-secondary)] mb-2">We sent a confirmation link to</p>
            <p className="text-[var(--nb-text)] font-semibold mb-8">{email}</p>

            {/* Tip box */}
            <div className="bg-[var(--nb-gold)]/10 border border-[var(--nb-gold)]/20 rounded-2xl p-4 mb-8">
              <p className="text-[var(--nb-gold-light)] text-sm">
                <span className="font-semibold">Tip:</span> Check your spam folder if you don't see the email within a few minutes.
              </p>
            </div>

            <Link
              href={returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login'}
              className="inline-block w-full nb-btn-accent text-center"
            >
              Go to Login
            </Link>

            <p className="text-[var(--nb-text-muted)] text-sm mt-6">
              Already confirmed?{' '}
              <Link href="/auth/login" className="text-[var(--nb-accent-light)] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--nb-black)] relative overflow-hidden">
      {/* === DESKTOP LAYOUT (lg and up) === */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="w-1/2 bg-gradient-to-br from-[#0f0f12] via-[#1a1a2e] to-[#0f0f12] relative overflow-hidden flex items-center justify-center p-12">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-[0.08] blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--nb-accent)] rounded-full opacity-[0.06] blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--nb-accent)] to-purple-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-[var(--nb-text)]">Network Buddy</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold text-[var(--nb-text)] mb-6 leading-tight">
              Start building your
              <span className="text-gradient-accent"> professional network</span>
            </h1>
            <p className="text-lg text-[var(--nb-text-secondary)] mb-10">
              Join thousands of professionals using AI to manage and grow their connections.
            </p>

            {/* Features */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--nb-accent)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--nb-accent-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[var(--nb-text)] font-semibold mb-1">Import in Seconds</h3>
                  <p className="text-[var(--nb-text-muted)] text-sm">Bring your contacts from LinkedIn, Google, or CSV files</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--nb-gold)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--nb-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[var(--nb-text)] font-semibold mb-1">AI Enrichment</h3>
                  <p className="text-[var(--nb-text-muted)] text-sm">Get complete profiles with company info, social links, and more</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--nb-success)]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--nb-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[var(--nb-text)] font-semibold mb-1">Free to Start</h3>
                  <p className="text-[var(--nb-text-muted)] text-sm">10 free enrichments every month, no credit card required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-1/2 flex items-center justify-center p-12 bg-[var(--nb-black)]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[var(--nb-text)] mb-2">Create account</h2>
              <p className="text-[var(--nb-text-secondary)]">Start building your network today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Social Sign Up */}
            <div className="space-y-3">
              {/* Apple Sign In */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl bg-[var(--nb-surface)] border border-[var(--nb-border)] text-[var(--nb-text)] font-medium hover:bg-[var(--nb-surface-elevated)] transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--nb-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[var(--nb-black)] text-[var(--nb-text-muted)] text-sm">or sign up with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email-desktop" className="block text-sm font-medium text-[var(--nb-text-secondary)] mb-2">
                  Email address
                </label>
                <input
                  id="email-desktop"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="nb-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password-desktop" className="block text-sm font-medium text-[var(--nb-text-secondary)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-desktop"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="nb-input pr-12"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)] hover:text-[var(--nb-text)]"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[var(--nb-text-muted)] text-xs mt-2">
                  Must be at least 6 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full nb-btn-accent text-center text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Terms */}
              <p className="text-[var(--nb-text-muted)] text-xs text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-[var(--nb-accent-light)] hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[var(--nb-accent-light)] hover:underline">Privacy Policy</Link>
              </p>
            </form>

            {/* Login Link */}
            <p className="text-center text-[var(--nb-text-secondary)] mt-8">
              Already have an account?{' '}
              <Link
                href={returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login'}
                className="text-[var(--nb-accent-light)] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* === MOBILE LAYOUT (below lg) === */}
      <div className="lg:hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-[0.08] blur-[100px]" />
          <div className="absolute top-1/3 -right-40 w-60 h-60 bg-[var(--nb-accent)] rounded-full opacity-[0.06] blur-[80px]" />
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-[var(--nb-gold)] rounded-full opacity-[0.05] blur-[60px]" />
        </div>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col safe-area-pt safe-area-pb">
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-2 opacity-0 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--nb-accent)] to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-semibold text-[var(--nb-text)]">Network Buddy</span>
            </Link>
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-[var(--nb-surface)] border border-[var(--nb-border)] flex items-center justify-center opacity-0 animate-fade-in stagger-1"
            >
              <svg className="w-5 h-5 text-[var(--nb-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </header>

          {/* Content */}
          <main className="flex-1 flex flex-col justify-center px-6 py-8">
            {/* Title section */}
            <div className="mb-10 opacity-0 animate-slide-up">
              <h1 className="text-4xl font-bold text-[var(--nb-text)] mb-3 tracking-tight">
                Create account
              </h1>
              <p className="text-[var(--nb-text-secondary)] text-lg">
                Start building your network today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 opacity-0 animate-scale-in">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Social Sign Up */}
            <div className="space-y-3 mb-8 opacity-0 animate-slide-up stagger-1">
              {/* Apple Sign In */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={loading}
                className="nb-btn-social bg-white text-black disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="nb-btn-social bg-[var(--nb-surface)] border border-[var(--nb-border)] text-[var(--nb-text)] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 opacity-0 animate-fade-in stagger-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--nb-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[var(--nb-black)] text-[var(--nb-text-muted)] text-sm">
                  or sign up with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-5 opacity-0 animate-slide-up stagger-2">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--nb-text-secondary)] mb-2.5">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="nb-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--nb-text-secondary)] mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="nb-input pr-12"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--nb-text-muted)]"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[var(--nb-text-muted)] text-xs mt-2">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full nb-btn-accent text-center text-[15px] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Terms */}
              <p className="text-[var(--nb-text-muted)] text-xs text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-[var(--nb-accent-light)]">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[var(--nb-accent-light)]">Privacy Policy</Link>
              </p>
            </form>

            {/* Login Link */}
            <p className="text-center text-[var(--nb-text-secondary)] mt-8 opacity-0 animate-fade-in stagger-3">
              Already have an account?{' '}
              <Link
                href={returnUrl ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/auth/login'}
                className="text-[var(--nb-accent-light)] font-semibold"
              >
                Sign in
              </Link>
            </p>
          </main>

          {/* Bottom safe area spacer */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--nb-black)]">
        <div className="w-8 h-8 border-2 border-[var(--nb-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
