'use client';

import { useState, useEffect } from 'react';
import { shouldHideExternalPayments, getWebPurchaseUrl } from '@/lib/utils/platform';

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
  const [selectedPackage, setSelectedPackage] = useState<string>('50');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(shouldHideExternalPayments());
  }, []);

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--nb-surface)] w-full sm:max-w-md sm:mx-4 sm:rounded-3xl rounded-t-3xl border-t sm:border border-[var(--nb-border)] max-h-[90vh] overflow-hidden flex flex-col animate-slide-up safe-area-pb">
        {/* Handle bar */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[var(--nb-text-muted)]/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-[var(--nb-text)]">Buy Credits</h2>
            <p className="text-[var(--nb-text-muted)] text-sm mt-1">Power up your enrichments</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--nb-surface-elevated)] border border-[var(--nb-border)] flex items-center justify-center text-[var(--nb-text-muted)] active:scale-95 transition-transform"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-[var(--nb-error)]/10 border border-[var(--nb-error)]/20">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Package cards */}
          <div className="space-y-3">
            {packages.map((pkg, index) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                disabled={loading}
                className={`w-full rounded-2xl p-4 text-left relative transition-all active:scale-[0.98] ${
                  selectedPackage === pkg.id
                    ? 'bg-[var(--nb-accent)]/10 border-2 border-[var(--nb-accent)]'
                    : 'bg-[var(--nb-surface-elevated)] border-2 border-[var(--nb-border)]'
                } ${loading ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {pkg.recommended && (
                  <span className="absolute -top-2.5 left-4 bg-gradient-to-r from-[var(--nb-accent)] to-purple-500 text-white px-3 py-0.5 rounded-full text-xs font-semibold">
                    BEST VALUE
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Radio */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-[var(--nb-accent)] bg-[var(--nb-accent)]'
                        : 'border-[var(--nb-text-muted)]'
                    }`}>
                      {selectedPackage === pkg.id && (
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[var(--nb-text)] font-semibold text-lg">{pkg.credits} Credits</span>
                        {pkg.discount && (
                          <span className="bg-[var(--nb-success)]/20 text-[var(--nb-success)] text-xs px-2 py-0.5 rounded-full font-medium">
                            {pkg.discount}
                          </span>
                        )}
                      </div>
                      <div className="text-[var(--nb-text-muted)] text-sm mt-0.5">
                        ${pkg.pricePerCredit.toFixed(2)} per credit
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[var(--nb-text)] font-bold text-2xl">${pkg.price}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info box */}
          <div className="mt-5 rounded-2xl p-4 bg-[var(--nb-gold)]/10 border border-[var(--nb-gold)]/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--nb-gold)]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[var(--nb-gold)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="text-[var(--nb-gold-light)] font-medium">Credits never expire</p>
                <p className="text-[var(--nb-gold-light)]/70 mt-0.5">Use them anytime for premium enrichments beyond your monthly limit.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="px-6 py-5 border-t border-[var(--nb-border)] bg-[var(--nb-surface)]">
          {isIOS ? (
            // iOS: redirect to web
            <>
              <div className="rounded-2xl p-4 mb-4 bg-[var(--nb-accent)]/10 border border-[var(--nb-accent)]/20">
                <p className="text-[var(--nb-accent-light)] text-sm">
                  To purchase credits, please visit our website. Your credits will sync automatically.
                </p>
              </div>
              <button
                onClick={() => window.open(getWebPurchaseUrl() + '/dashboard', '_blank')}
                className="w-full nb-btn-accent text-center text-[15px] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Website to Purchase
              </button>
              <p className="text-center text-[var(--nb-text-muted)] text-xs mt-3">
                Credits sync across all your devices
              </p>
            </>
          ) : (
            // Web/Android: Stripe
            <>
              <button
                onClick={() => handlePurchase(selectedPackage)}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                style={{ background: 'var(--nb-gradient-gold)' }}
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
              <p className="text-center text-[var(--nb-text-muted)] text-xs mt-3 flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment via Stripe
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
