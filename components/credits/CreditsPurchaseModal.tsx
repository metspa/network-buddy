'use client';

import { useState, useEffect } from 'react';
import { shouldHideExternalPayments, getWebPurchaseUrl } from '@/lib/utils/platform';
import { RevenueCatService } from '@/lib/revenuecat';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

type Package = {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  discount?: string;
  recommended?: boolean;
  // RevenueCat specific
  rcPackage?: PurchasesPackage;
};

type CreditsPurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreditsPurchaseModal({ isOpen, onClose }: CreditsPurchaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('50');
  const [isIOS, setIsIOS] = useState(false);
  const [rcPackage, setRcPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    const checkPlatform = async () => {
      const isIosDevice = shouldHideExternalPayments();
      setIsIOS(isIosDevice);

      if (isIosDevice) {
        setLoading(true);
        try {
          await RevenueCatService.initialize();
          const offerings = await RevenueCatService.getOfferings();

          // Map RevenueCat packages to our UI format
          const packages = await RevenueCatService.getOfferings();
          // Look for a package that matches our subscription
          // We assume the offering has a package with identifier 'pro_monthly' or similar, or just take the first available
          if (packages.length > 0) {
            setRcPackage(packages[0]);
          }
        } catch (e) {
          console.error('Failed to init RC:', e);
        }
      }
    };
    checkPlatform();
  }, []);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (isIOS && rcPackage) {
        // RevenueCat Purchase
        const result = await RevenueCatService.purchasePackage(rcPackage);
        if (!result.success) {
          if (!result.cancelled) {
            alert('Purchase failed: ' + result.error);
          }
          setLoading(false);
          return;
        }

        // Purchase successful! Sync with backend
        await fetch('/api/user/subscription/sync-iap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: result.customerInfo?.originalAppUserId,
            productId: rcPackage.product.identifier
          }),
        });

        alert('Subscription successful! You now have 10 scans/month.');
        onClose();
        window.location.reload(); // Refresh to update UI
      } else {
        // Web/Android: Stripe Subscription
        // Note: You need to implement the Stripe subscription endpoint separately if you want web support
        // For now, we focus on iOS IAP as requested
        alert('Web subscription coming soon!');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[var(--nb-surface)] rounded-3xl border border-[var(--nb-border)] shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <svg className="w-5 h-5 text-[var(--nb-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-[var(--nb-text-muted)] mb-8">
            Get 10 AI scans per month to power your networking.
          </p>

          <div className="bg-[var(--nb-surface-light)] rounded-2xl p-6 mb-8 border border-[var(--nb-border)]">
            <div className="flex items-end justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-white">$9.99</span>
              <span className="text-[var(--nb-text-muted)] mb-1">/month</span>
            </div>
            <p className="text-sm text-[var(--nb-text-muted)]">Cancel anytime</p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading || (isIOS && !rcPackage)}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
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
              'Subscribe Now'
            )}
          </button>

          {isIOS && (
            <p className="text-center text-[var(--nb-text-muted)] text-xs mt-4 flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure payment via App Store
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
