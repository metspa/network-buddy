'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const searchParams = useSearchParams()

  // Handle recovery tokens from URL hash or query params
  useEffect(() => {
    const handleRecovery = async () => {
      const supabase = createClient()

      // Check URL hash for tokens (Supabase sends tokens in hash)
      if (typeof window !== 'undefined') {
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          // Parse hash params
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')

          if (type === 'recovery' && accessToken && refreshToken) {
            // Set the session from the recovery tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (!error) {
              setIsRecoveryMode(true)
              setSessionReady(true)
              // Clean up URL
              window.history.replaceState(null, '', window.location.pathname)
              return
            } else {
              setError('Recovery link has expired. Please request a new one.')
            }
          }
        }

        // Also check query params (alternative flow)
        const code = searchParams.get('code')
        const type = searchParams.get('type')

        if (code && type === 'recovery') {
          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            setIsRecoveryMode(true)
            setSessionReady(true)
            return
          } else {
            setError('Recovery link has expired. Please request a new one.')
          }
        }

        // Check if there's already an active session (user might have refreshed)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsRecoveryMode(true)
          setSessionReady(true)
          return
        }
      }

      // No recovery mode - show email input form
      setSessionReady(true)
    }

    handleRecovery()
  }, [searchParams])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the password reset link!')
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    }
    setLoading(false)
  }

  // Show loading while processing recovery tokens
  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2c2f33] p-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-[#36393f] rounded-lg shadow-xl border border-[#202225]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Processing recovery link...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c2f33] p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#36393f] rounded-lg shadow-xl border border-[#202225]">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {isRecoveryMode ? 'Set New Password' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isRecoveryMode
              ? 'Enter your new password below'
              : 'Enter your email and we\'ll send you a reset link'
            }
          </p>
        </div>

        {isRecoveryMode ? (
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            {error && (
              <div className="rounded-md bg-red-900/30 p-4 border border-red-700/50">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-900/30 p-4 border border-green-700/50">
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#202225] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-[#2c2f33] border border-[#202225] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            {error && (
              <div className="rounded-md bg-red-900/30 p-4 border border-red-700/50">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            {message && (
              <div className="rounded-md bg-green-900/30 p-4 border border-green-700/50">
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center text-sm">
          <Link
            href="/auth/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#2c2f33]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
