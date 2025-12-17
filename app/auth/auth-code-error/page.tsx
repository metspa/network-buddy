'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthCodeErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Determine user-friendly error message
  const getErrorMessage = () => {
    if (!error) {
      return 'An authentication error occurred.'
    }

    const errorLower = error.toLowerCase()

    if (errorLower.includes('expired') || errorLower.includes('invalid')) {
      return 'Your authentication session has expired. This can happen if you took too long to complete the sign-in process.'
    }

    if (errorLower.includes('pkce') || errorLower.includes('code_verifier')) {
      return 'Authentication verification failed. This usually happens due to browser cookie issues.'
    }

    if (errorLower.includes('no_code')) {
      return 'No authentication code was received. Please try signing in again.'
    }

    if (errorLower.includes('access_denied')) {
      return 'Access was denied. You may have cancelled the sign-in process.'
    }

    return error
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2c2f33] p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#36393f] rounded-lg shadow-xl border border-[#202225]">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 mb-4">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-400 mb-6">
            {getErrorMessage()}
          </p>

          <div className="bg-[#2c2f33] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-300 mb-2">Quick fixes:</p>
            <ul className="text-gray-400 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">1.</span>
                <span>Try signing in again using the button below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">2.</span>
                <span>Clear your browser cookies and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">3.</span>
                <span>Try using a different browser or incognito mode</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-[#2c2f33] border border-[#202225] text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-[#202225] transition-colors text-center"
            >
              Go to Homepage
            </Link>
          </div>

          <p className="text-gray-500 text-xs mt-4">
            Still having issues? <a href="mailto:support@networkbuddy.io" className="text-blue-400 hover:text-blue-300">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#2c2f33]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  )
}
