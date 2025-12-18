'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { shouldHideExternalPayments, getWebPurchaseUrl } from '@/lib/utils/platform';

type PricingButtonProps = {
  plan: 'free' | 'starter' | 'growth';
  cta: string;
  featured?: boolean;
};

export default function PricingButton({ plan, cta, featured }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsIOS(shouldHideExternalPayments());
  }, []);

  const handleClick = async () => {
    if (plan === 'free') {
      // Redirect to signup for free plan
      router.push('/auth/signup');
      return;
    }

    // On iOS, redirect to web for paid plans (App Store requirement)
    if (isIOS) {
      window.open(getWebPurchaseUrl() + '/pricing', '_blank');
      return;
    }

    // For Starter/Growth plan, create Stripe checkout session
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }), // Pass the plan type
      });

      const data = await response.json();

      if (data.error) {
        console.error('Checkout error:', data.error);

        // If unauthorized, redirect to signup (they need an account first)
        if (data.error === 'Unauthorized' || response.status === 401) {
          router.push(`/auth/signup?returnUrl=${encodeURIComponent(`/dashboard?startCheckout=${plan}`)}`);
          return;
        }

        alert('Failed to start checkout. Please try again.');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  // Base styles for all buttons
  const baseStyles = `
    relative block w-full px-6 py-3.5 rounded-xl text-[0.95rem] font-semibold
    transition-all duration-300 overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // For free plan, use Link directly
  if (plan === 'free') {
    return (
      <Link
        href="/auth/signup"
        className={`${baseStyles} bg-[#1A1A1A] text-[#F3F3F2] border border-[#2A2A2A]
          hover:border-[#3A83FE] hover:bg-[#1A1A1A]/80 hover:shadow-[0_0_20px_rgba(58,131,254,0.15)]
          no-underline text-center`}
      >
        {cta}
      </Link>
    );
  }

  // Featured button (Growth plan) - gradient with glow
  if (featured) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${baseStyles} group
          bg-gradient-to-r from-[#3A83FE] via-[#6366F1] to-[#8B5CF6] text-white
          hover:shadow-[0_0_30px_rgba(58,131,254,0.5),0_0_60px_rgba(139,92,246,0.3)]
          hover:scale-[1.02] active:scale-[0.98]`}
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
          -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Button text */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              {cta}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </span>
      </button>
    );
  }

  // Growth plan button - outlined with glow on hover
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${baseStyles} group
        bg-transparent text-[#F3F3F2] border-2 border-[#2A2A2A]
        hover:border-[#8B5CF6] hover:text-white
        hover:shadow-[0_0_20px_rgba(139,92,246,0.2),inset_0_0_20px_rgba(139,92,246,0.05)]
        hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-transparent`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {cta}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </span>
    </button>
  );
}
