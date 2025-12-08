'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type PricingButtonProps = {
  plan: 'free' | 'growth' | 'pro';
  cta: string;
  featured?: boolean;
};

export default function PricingButton({ plan, cta, featured }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (plan === 'free') {
      // Redirect to signup for free plan
      router.push('/auth/signup');
      return;
    }

    // For Growth/Pro plan, create Stripe checkout session
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

  // For free plan, use Link directly
  if (plan === 'free') {
    return (
      <Link
        href="/auth/signup"
        className="block w-full px-6 py-3 rounded-lg text-[0.95rem] font-semibold no-underline bg-transparent text-[#F3F3F2] border border-[#2A2A2A] hover:border-[#3A83FE] transition-all"
      >
        {cta}
      </Link>
    );
  }

  // For Growth/Pro plan, use button with Stripe checkout
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full px-6 py-3 rounded-lg text-[0.95rem] font-semibold transition-all ${
        featured
          ? 'bg-[#3A83FE] text-white hover:bg-[#2563eb]'
          : 'bg-transparent text-[#F3F3F2] border border-[#2A2A2A] hover:border-[#3A83FE]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : cta}
    </button>
  );
}
