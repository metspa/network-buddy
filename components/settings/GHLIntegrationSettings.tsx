'use client';

import { useState } from 'react';
import type { GHLIntegration } from '@/lib/database/ghl-integrations';

type Props = {
  initialIntegration: GHLIntegration | null;
};

export default function GHLIntegrationSettings({ initialIntegration }: Props) {
  const [integration, setIntegration] = useState<GHLIntegration | null>(initialIntegration);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [locationId, setLocationId] = useState(integration?.ghl_location_id || '');
  const [companyId, setCompanyId] = useState(integration?.ghl_company_id || '');
  const [autoSync, setAutoSync] = useState(integration?.auto_sync ?? true);
  const [tags, setTags] = useState(integration?.sync_tags?.join(', ') || '');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/integrations/ghl/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          locationId,
          companyId: companyId || undefined,
          autoSync,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect GoHighLevel');
      }

      setIntegration(data.integration);
      setSuccess('GoHighLevel connected successfully!');
      setApiKey(''); // Clear sensitive data
      setIsEditing(false);

      // Reload page to refresh server component data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GoHighLevel? This will stop automatic syncing.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/ghl/disconnect', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      setIntegration(null);
      setSuccess('GoHighLevel disconnected successfully');

      // Reload page to refresh server component data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setApiKey(''); // User needs to re-enter API key for security
    setLocationId(integration?.ghl_location_id || '');
    setCompanyId(integration?.ghl_company_id || '');
    setAutoSync(integration?.auto_sync ?? true);
    setTags(integration?.sync_tags?.join(', ') || '');
  };

  return (
    <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">GoHighLevel Integration</h2>
          <p className="text-sm text-gray-400">Automatically sync enriched contacts to your GHL CRM</p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg p-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-700/50 rounded-lg p-3">
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      {integration && !isEditing ? (
        // Connected State
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-green-300">Connected to GoHighLevel</p>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <p className="text-xs text-green-200/70">Location ID</p>
              <p className="text-sm text-green-200 font-mono">{integration.ghl_location_id}</p>
            </div>

            {integration.ghl_company_id && (
              <div>
                <p className="text-xs text-green-200/70">Company ID</p>
                <p className="text-sm text-green-200 font-mono">{integration.ghl_company_id}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-green-200/70">Auto-sync</p>
              <p className="text-sm text-green-200">{integration.auto_sync ? 'Enabled' : 'Disabled'}</p>
            </div>

            {integration.sync_tags && integration.sync_tags.length > 0 && (
              <div>
                <p className="text-xs text-green-200/70">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {integration.sync_tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-green-800/50 rounded text-xs text-green-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-green-200/70">Connected</p>
              <p className="text-sm text-green-200">{new Date(integration.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Settings
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        </div>
      ) : (
        // Connection Form
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-200 mb-2">
              Connect your GoHighLevel account to automatically sync contacts after enrichment completes.
            </p>
            <p className="text-xs text-blue-300/70">
              Contacts will be synced with their enriched data including LinkedIn, company info, and AI insights.
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              GoHighLevel API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your GHL API Key"
            />
            <p className="text-xs text-gray-400 mt-1">
              Find in: GHL Settings → API Keys
            </p>
          </div>

          {/* Location ID */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Location ID (Sub-Account ID) *
            </label>
            <input
              type="text"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Location ID"
            />
            <p className="text-xs text-gray-400 mt-1">
              Find in your GHL URL: app.gohighlevel.com/location/<strong className="text-blue-400">[LOCATION_ID]</strong>
            </p>
          </div>

          {/* Company ID (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Company ID (Optional)
            </label>
            <input
              type="text"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your Company ID (optional)"
            />
          </div>

          {/* Auto-sync Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="auto-sync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 bg-[#2c2f33] border border-[#202225] rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="auto-sync" className="text-sm text-gray-200">
              Automatically sync contacts after enrichment
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tags to Apply (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="network-buddy, lead, enriched"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma-separated tags to apply to synced contacts
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : isEditing ? 'Update Settings' : 'Connect GoHighLevel'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
