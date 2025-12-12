'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
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
            The authentication link has expired or is invalid. This can happen if:
          </p>
          <ul className="text-left text-gray-400 text-sm space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>The link has already been used</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>The link has expired (usually after 1 hour)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>The link was copied incorrectly</span>
            </li>
          </ul>
          <div className="space-y-3">
            <Link
              href="/auth/reset-password"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/auth/login"
              className="block w-full bg-[#2c2f33] border border-[#202225] text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-[#202225] transition-colors text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
