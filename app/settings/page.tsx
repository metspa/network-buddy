import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import GHLIntegrationSettings from '@/components/settings/GHLIntegrationSettings';
import PersonalizationSettings from '@/components/settings/PersonalizationSettings';
import DeleteAccountSection from '@/components/settings/DeleteAccountSection';
import type { GHLIntegration } from '@/lib/database/ghl-integrations';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile with personalization fields
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Check for GHL integration
  const { data: ghlIntegration } = await supabase
    .from('ghl_integrations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <main className="min-h-screen bg-[#2c2f33] pb-20">
      {/* Header */}
      <header className="bg-[#36393f] border-b border-[#202225]">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-400">Manage your account and personalization</p>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Personalization (on top for mobile) */}
          <div className="order-1 lg:order-1">
            <PersonalizationSettings initialProfile={profile} />
          </div>

          {/* Right Column - Account & Other Settings */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Account Information */}
            <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-200">{user.email}</p>
                </div>
                {profile?.full_name && (
                  <div>
                    <p className="text-xs text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-200">{profile.full_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Account Created</p>
                  <p className="text-sm font-medium text-gray-200">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#202225]">
                <LogoutButton />
              </div>
            </div>

            {/* GoHighLevel Integration */}
            <GHLIntegrationSettings initialIntegration={ghlIntegration as GHLIntegration | null} />


            {/* About */}
            <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
              <h2 className="text-lg font-semibold text-white mb-2">About Network Buddy</h2>
              <p className="text-sm text-gray-400 mb-4">
                Version 1.0.0 (Phase 1 - Foundation)
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Smart business card scanner with AI-powered networking insights.</p>
                <p className="text-xs text-gray-500 mt-4">
                  Developed with Next.js 15, Supabase, and OpenAI
                </p>
              </div>
            </div>

            {/* Legal */}
            <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Legal</h2>
              <div className="space-y-3">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#2c2f33] rounded-lg hover:bg-[#40444b] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-200">Privacy Policy</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#2c2f33] rounded-lg hover:bg-[#40444b] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-200">Terms of Service</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#2c2f33] rounded-lg hover:bg-[#40444b] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-200">Support</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Delete Account */}
            <DeleteAccountSection />
          </div>
        </div>
      </div>
    </main>
  );
}
