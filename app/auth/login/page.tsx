'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/supabase/auth'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect to returnUrl if provided, otherwise go to home
      router.push(returnUrl || '/')
      router.refresh()
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
    // OAuth will redirect automatically, no need to manually redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c2f33] p-4">
      <div className="w-full max-w-5xl bg-[#36393f] rounded-2xl shadow-xl overflow-hidden border border-[#202225]">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Login Form */}
          <div className="flex-1 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">Login</h1>
                  <Link href="/" className="text-gray-400 hover:text-gray-300 text-2xl">×</Link>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-900/30 p-4 border border-red-700/50 mb-5">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Google Sign In - Primary Option */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#202225]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#36393f] text-gray-400">or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 bg-[#2c2f33] border border-[#202225] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 bg-[#2c2f33] border border-[#202225] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="mt-2 text-right">
                    <Link href="/auth/reset-password" className="text-sm text-blue-400 hover:text-blue-300">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-400 mt-6">
                  First time here?{' '}
                  <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                    Create an account
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="hidden lg:block lg:w-2/5 bg-[#2c2f33] p-12 border-l border-[#202225]">
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-white mb-8">
                Get the most out of<br />your network
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Scan business cards instantly</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Auto-enrich with LinkedIn & company data</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Get AI-powered conversation starters</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-[#36393f] rounded-2xl p-6 shadow-sm border border-[#202225]">
                <p className="text-sm font-semibold text-white mb-4">Get the Network Buddy App</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#2c2f33] rounded"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Scan to download the mobile app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#2c2f33]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
