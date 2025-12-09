'use client';

import { useState } from 'react';

type UserProfile = {
  nickname?: string | null;
  occupation?: string | null;
  about_me?: string | null;
  company_name?: string | null;
  industry?: string | null;
  communication_tone?: string | null;
};

type PersonalizationSettingsProps = {
  initialProfile: UserProfile | null;
};

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
];

export default function PersonalizationSettings({ initialProfile }: PersonalizationSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: initialProfile?.nickname || '',
    occupation: initialProfile?.occupation || '',
    about_me: initialProfile?.about_me || '',
    company_name: initialProfile?.company_name || '',
    industry: initialProfile?.industry || '',
    communication_tone: initialProfile?.communication_tone || 'professional',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/user/personalization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to save');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving personalization:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Personalization</h2>
          <p className="text-xs text-gray-400">Customize how AI generates your messages</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nickname */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nickname
          </label>
          <input
            type="text"
            value={profile.nickname || ''}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="What should we call you?"
            className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Occupation / Role
          </label>
          <input
            type="text"
            value={profile.occupation || ''}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="e.g., Real Estate Agent, Marketing Director"
            className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Company
          </label>
          <input
            type="text"
            value={profile.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Your company name"
            className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Industry
          </label>
          <input
            type="text"
            value={profile.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="e.g., Real Estate, Technology, Healthcare"
            className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* About Me */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            About You
          </label>
          <textarea
            value={profile.about_me || ''}
            onChange={(e) => handleChange('about_me', e.target.value)}
            placeholder="Tell us about yourself - your interests, what you're looking for in connections, your communication style..."
            rows={4}
            className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">This helps AI write messages that sound like you</p>
        </div>

        {/* Communication Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Communication Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('communication_tone', option.value)}
                className={`p-3 rounded-lg border transition-all ${
                  profile.communication_tone === option.value
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                    : 'bg-[#2c2f33] border-[#202225] text-gray-400 hover:border-gray-500'
                }`}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-[#202225] flex items-center justify-between">
        <div>
          {saveStatus === 'success' && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-400">Failed to save. Try again.</span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
