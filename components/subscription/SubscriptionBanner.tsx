'use client';

import { useState, useEffect } from 'react';
import { isIOSDevice } from '@/lib/utils/platform';

const PRICING_URL = 'https://networkbuddy.io/pricing';

type SubscriptionStatus = {
  plan: string;
  status: string;
  scansUsed: number;
  scansLimit: number;
  scansRemaining: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  credits?: number;
};

export default function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    fetchSubscription();
    // Check if on iOS device - we hide ALL pricing/upgrade buttons on iOS for App Store compliance
    setIsIOS(isIOSDevice());
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    // On iOS, this button is hidden entirely for App Store compliance
    // On other platforms, open pricing page
    window.open(PRICING_URL, '_blank');
  };

  const handleManageSubscription = () => {
    // On iOS, this button is hidden entirely for App Store compliance
    // On other platforms, open pricing page
    window.open(PRICING_URL, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-[#36393f] rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-[#36393f] rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const usagePercentage = (subscription.scansUsed / subscription.scansLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = subscription.scansRemaining <= 0;
  const isFree = subscription.plan === 'free';

  return (
    <div className="bg-[#2f3136] border border-[#202225] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold capitalize">{subscription.plan} Plan</span>
            {subscription.cancelAtPeriodEnd && (
              <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                Canceling
              </span>
            )}
          </div>
        </div>

        {/* Hide ALL upgrade/pricing buttons on iOS for App Store compliance (Guideline 3.1.1) */}
        {!isIOS && (
          <div className="flex items-center gap-2">
            {isFree ? (
              <button
                onClick={handleUpgrade}
                className="bg-[#3A83FE] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </button>
            ) : (
              <button
                onClick={handleManageSubscription}
                className="bg-[#36393f] hover:bg-[#40444b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Manage Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {/* Usage Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Scans Used</span>
          <span className={`font-medium ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-300'}`}>
            {subscription.scansUsed} / {subscription.scansLimit}
          </span>
        </div>
        <div className="w-full bg-[#202225] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-[#3A83FE]'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Warning Messages - Hide upgrade links on iOS for App Store compliance */}
      {isAtLimit && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mt-3">
          <p className="text-red-200 text-sm">
            {isIOS ? (
              "You've reached your scan limit."
            ) : (
              <>
                You've reached your scan limit.{' '}
                <button onClick={handleUpgrade} className="text-[#3A83FE] hover:underline font-medium">
                  Upgrade to continue
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {!isAtLimit && isNearLimit && isFree && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-3">
          <p className="text-yellow-200 text-sm">
            {isIOS ? (
              "You're running low on scans."
            ) : (
              <>
                You're running low on scans.{' '}
                <button onClick={handleUpgrade} className="text-[#3A83FE] hover:underline font-medium">
                  Upgrade for more
                </button>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
