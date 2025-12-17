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
  const [selectedPackage, setSelectedPackage] = useState<string>('50'); // Default to recommended

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
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal - Full width on mobile, centered on desktop */}
      <div className="relative bg-[#36393f] w-full sm:max-w-lg sm:mx-4 sm:rounded-xl rounded-t-2xl border-t sm:border border-[#202225] max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up sm:animate-none">
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-500 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202225]">
          <div>
            <h2 className="text-xl font-bold text-white">Buy Credits</h2>
            <p className="text-gray-400 text-sm mt-0.5">For extra enrichments</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-white active:bg-[#202225] rounded-lg transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-700/30 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Package cards - Stacked on mobile */}
          <div className="space-y-3">
            {packages.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                disabled={loading}
                className={`w-full bg-[#2c2f33] rounded-xl p-4 border-2 transition-all text-left relative ${
                  selectedPackage === pkg.id
                    ? 'border-blue-500 ring-1 ring-blue-500/50'
                    : 'border-[#202225] active:border-gray-500'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {pkg.recommended && (
                  <span className="absolute -top-2.5 left-4 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    BEST VALUE
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Selection indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedPackage === pkg.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-500'
                    }`}>
                      {selectedPackage === pkg.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-lg">{pkg.credits} Credits</span>
                        {pkg.discount && (
                          <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
                            {pkg.discount}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        ${pkg.pricePerCredit.toFixed(2)} per credit
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-bold text-xl">${pkg.price}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info box */}
          <div className="mt-4 bg-[#202225] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                </svg>
              </div>
              <div className="text-sm text-gray-300">
                <strong className="text-white">Credits never expire.</strong> Use them anytime for premium enrichments beyond your monthly limit.
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action */}
        <div className="px-5 py-4 border-t border-[#202225] bg-[#36393f]">
          <button
            onClick={() => handlePurchase(selectedPackage)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:from-yellow-600 active:to-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                Purchase {packages.find(p => p.id === selectedPackage)?.credits} Credits - ${packages.find(p => p.id === selectedPackage)?.price}
              </>
            )}
          </button>
          <p className="text-center text-gray-500 text-xs mt-3">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
