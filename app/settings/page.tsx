import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/LogoutButton';
import GHLIntegrationSettings from '@/components/settings/GHLIntegrationSettings';
import PersonalizationSettings from '@/components/settings/PersonalizationSettings';
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

            {/* API Usage */}
            <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">API Usage</h2>
              <p className="text-sm text-gray-400 mb-4">
                Track your API usage for this billing period.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#2c2f33] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Scans This Month</p>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500 mt-1">$0.00 cost</p>
                </div>
                <div className="bg-[#2c2f33] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Enrichments</p>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-gray-500 mt-1">$0.00 cost</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic">
                Usage tracking will be implemented in future updates
              </p>
            </div>

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
          </div>
        </div>
      </div>
    </main>
  );
}
