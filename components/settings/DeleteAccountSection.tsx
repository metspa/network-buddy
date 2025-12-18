'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountSection() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Redirect to home page after successful deletion
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#36393f] rounded-lg shadow-sm border border-[#202225] p-6">
      <h2 className="text-lg font-semibold text-white mb-2">Delete Account</h2>
      <p className="text-sm text-gray-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Delete My Account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <p className="text-red-200 text-sm font-medium mb-2">
              Are you sure you want to delete your account?
            </p>
            <p className="text-red-300/80 text-xs">
              This will permanently delete:
            </p>
            <ul className="text-red-300/80 text-xs mt-1 ml-4 list-disc">
              <li>All your contacts and business card scans</li>
              <li>Your subscription and credits</li>
              <li>All enrichment data and integrations</li>
              <li>Your profile and account information</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Type <span className="font-bold text-white">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 bg-[#2c2f33] border border-[#202225] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Type DELETE here"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== 'DELETE'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Permanently Delete Account'}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
                setError(null);
              }}
              disabled={loading}
              className="px-4 py-2 bg-[#2c2f33] text-gray-300 rounded-lg hover:bg-[#202225] transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
