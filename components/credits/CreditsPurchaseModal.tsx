'use client';

import { useState } from 'react';

type Package = {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  discount?: string;
  recommended?: boolean;
};

type CreditsPurchaseModalProps = {
  onClose: () => void;
};

export default function CreditsPurchaseModal({ onClose }: CreditsPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages: Package[] = [
    {
      id: '10',
      name: 'Starter',
      credits: 10,
      price: 15,
      pricePerCredit: 1.50,
    },
    {
      id: '50',
      name: 'Growth',
      credits: 50,
      price: 50,
      pricePerCredit: 1.00,
      discount: 'Save 33%',
      recommended: true,
    },
    {
      id: '100',
      name: 'Pro',
      credits: 100,
      price: 90,
      pricePerCredit: 0.90,
      discount: 'Save 40%',
    },
  ];

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType: packageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate purchase');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#36393f] rounded-lg max-w-4xl w-full p-6 border border-[#202225] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Credits never expire and can be used for premium contact enrichments with Apollo.io data.
          Each credit gives you access to email, phone, and professional details for one contact.
        </p>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700/30 rounded-lg p-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`bg-[#2c2f33] rounded-lg p-6 border-2 ${
                pkg.recommended ? 'border-blue-500' : 'border-[#202225]'
              } relative transition-all hover:border-blue-600`}
            >
              {pkg.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  BEST VALUE
                </span>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  {pkg.credits}
                </div>
                <div className="text-gray-400 text-sm">credits</div>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white">
                  ${pkg.price}
                </div>
                <div className="text-sm text-gray-400">
                  ${pkg.pricePerCredit.toFixed(2)} per credit
                </div>
                {pkg.discount && (
                  <div className="text-green-400 text-sm font-semibold mt-1">
                    {pkg.discount}
                  </div>
                )}
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  pkg.recommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-[#202225] hover:bg-[#3a3d42] text-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-200">
              <strong>How credits work:</strong> Credits stack with your subscription. Use them when you need extra enrichments beyond your monthly limit. They never expire and can be used anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
