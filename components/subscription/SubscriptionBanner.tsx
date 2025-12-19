'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CreditsPurchaseModal from '@/components/credits/CreditsPurchaseModal';
import { shouldHideExternalPayments, getWebPurchaseUrl } from '@/lib/utils/platform';

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
  const [upgrading, setUpgrading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    fetchSubscription();
    setIsIOS(shouldHideExternalPayments());
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

  const handleUpgrade = async () => {
    // On iOS, redirect to web for upgrades (App Store requirement)
    if (isIOS) {
      window.open(getWebPurchaseUrl() + '/pricing', '_blank');
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start upgrade. Please try again.');
        setUpgrading(false);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade. Please try again.');
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    // On iOS, redirect to web for subscription management (App Store requirement)
    if (isIOS) {
      window.open(getWebPurchaseUrl() + '/dashboard', '_blank');
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open billing portal. Please try again.');
    }
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

        <div className="flex items-center gap-2">
          {isFree ? (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="bg-[#3A83FE] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? 'Loading...' : 'Upgrade to Pro'}
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

      {/* Warning Messages */}
      {isAtLimit && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 mt-3">
          <p className="text-red-200 text-sm">
            You've reached your monthly scan limit. {isFree ? 'Upgrade to Pro for 50 scans/month.' : 'Your limit will reset at the end of your billing period.'}
          </p>
        </div>
      )}

      {!isAtLimit && isNearLimit && isFree && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-3">
          <p className="text-yellow-200 text-sm">
            You're running low on scans. Upgrade to Pro for 50 scans/month.
          </p>
        </div>
      )}

      {/* Buy Credits Section - Hidden on iOS (App Store compliance) */}
      {!isIOS && (
        <div className="mt-3 pt-3 border-t border-[#202225]">
          <button
            onClick={() => setShowCreditsModal(true)}
            className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-600/10 to-orange-600/10 hover:from-yellow-600/20 hover:to-orange-600/20 active:from-yellow-600/30 active:to-orange-600/30 border border-yellow-600/30 rounded-lg px-3 py-2.5 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">Buy Credits</div>
                <div className="text-gray-400 text-xs">
                  {subscription.credits !== undefined && subscription.credits > 0
                    ? `${subscription.credits} available`
                    : 'Extra enrichments'}
                </div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Credits Purchase Modal */}
      {showCreditsModal && !isIOS && (
        <CreditsPurchaseModal onClose={() => setShowCreditsModal(false)} />
      )}
    </div>
  );
}
