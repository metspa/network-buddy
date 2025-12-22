'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isIOSWebView } from '@/lib/utils/platform';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isInApp, setIsInApp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if inside the iOS app (WebView/PWA)
    // Allow pricing page in Safari/Chrome - that's where users go to purchase
    if (isIOSWebView()) {
      setIsInApp(true);
      router.push('/');
    }
  }, [router]);

  // Don't render pricing inside the iOS app - redirect to Safari
  if (isInApp) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#3A83FE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A1A09E]">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleCheckout = async (plan: 'starter' | 'growth') => {
    setLoading(plan);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });

      const data = await response.json();

      if (data.error) {
        if (data.error === 'Unauthorized' || response.status === 401) {
          router.push(`/auth/signup?returnUrl=${encodeURIComponent(`/pricing?checkout=${plan}`)}`);
          return;
        }
        alert('Failed to start checkout. Please try again.');
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const handleCreditPurchase = async (pack: string, credits: number) => {
    setLoading(pack);

    try {
      const response = await fetch('/api/stripe/create-checkout-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });

      const data = await response.json();

      if (data.error) {
        if (data.error === 'Unauthorized' || response.status === 401) {
          router.push(`/auth/signup?returnUrl=${encodeURIComponent(`/pricing`)}`);
          return;
        }
        alert('Failed to start checkout. Please try again.');
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For active networkers',
      price: billingCycle === 'monthly' ? '$9' : '$90',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'annual' ? 'Save $18/year' : null,
      features: [
        '10 enrichments/month',
        'Everything in Free, plus:',
        'Decision maker identification',
        'GoHighLevel CRM sync',
        'SMS & email templates',
        'Buy extra credits anytime',
        'Priority support',
      ],
      cta: 'Start Networking',
      popular: true,
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For power networkers',
      price: billingCycle === 'monthly' ? '$29' : '$290',
      period: billingCycle === 'monthly' ? '/month' : '/year',
      savings: billingCycle === 'annual' ? 'Save $58/year' : null,
      features: [
        '30 enrichments/month',
        'Everything in Starter, plus:',
        '3x more enrichments',
        'Bulk card import',
        'Priority enrichment queue',
        'Credits at $1.50/each (25% off)',
      ],
      cta: 'Unlock Growth',
      popular: false,
    },
  ];

  const creditPacks = [
    { id: 'pack-10', credits: 10, price: 15, perCredit: 1.50, popular: false },
    { id: 'pack-25', credits: 25, price: 35, perCredit: 1.40, popular: true, savings: '7% off' },
    { id: 'pack-50', credits: 50, price: 60, perCredit: 1.20, popular: false, savings: '20% off' },
    { id: 'pack-100', credits: 100, price: 100, perCredit: 1.00, popular: false, savings: '33% off' },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-[#F3F3F2] overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#3A83FE] opacity-[0.03] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#8B5CF6] opacity-[0.04] blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-[#3A83FE]/5 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-4 sm:px-[5%] py-4 border-b border-[#1A1A1A]">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/logo-v2.png"
            alt="Network Buddy"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-[#A1A09E] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#3A83FE] text-white hover:bg-[#2563eb] transition-all hover:shadow-[0_0_20px_rgba(58,131,254,0.3)]">
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-20 pb-12 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A83FE]/10 border border-[#3A83FE]/30 rounded-full mb-6 text-sm text-[#3A83FE]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
          </svg>
          Simple, transparent pricing
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Invest in{' '}
          <span className="bg-gradient-to-r from-[#3A83FE] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
            relationships
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[#A1A09E] max-w-2xl mx-auto mb-10">
          Every plan pays for itself after your first deal. Start free, scale when you're ready.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 p-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#3A83FE] text-white shadow-lg shadow-[#3A83FE]/25'
                : 'text-[#A1A09E] hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-[#3A83FE] text-white shadow-lg shadow-[#3A83FE]/25'
                : 'text-[#A1A09E] hover:text-white'
            }`}
          >
            Annual
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
              Save 17%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative group rounded-2xl p-1 transition-all duration-500 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#3A83FE] via-[#6366F1] to-[#8B5CF6] shadow-2xl shadow-[#3A83FE]/20 scale-[1.02] md:-mt-4 md:mb-4'
                  : 'bg-[#1A1A1A] hover:bg-gradient-to-b hover:from-[#2A2A2A] hover:to-[#1A1A1A]'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className={`h-full rounded-xl p-6 lg:p-8 ${plan.popular ? 'bg-[#0D0D0D]' : 'bg-[#0D0D0D]'}`}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-[#5E5E5C]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl lg:text-5xl font-extrabold">{plan.price}</span>
                    <span className="text-[#5E5E5C] text-sm">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <span className="inline-block mt-2 px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-[#3A83FE]' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={feature.includes('Everything in') ? 'text-[#5E5E5C]' : 'text-[#A1A09E]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                    onClick={() => handleCheckout(plan.id as 'starter' | 'growth')}
                    disabled={loading === plan.id}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#3A83FE] via-[#6366F1] to-[#8B5CF6] text-white hover:shadow-[0_0_30px_rgba(58,131,254,0.4)] hover:scale-[1.02]'
                        : 'bg-[#1A1A1A] text-white border border-[#2A2A2A] hover:border-[#8B5CF6] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.id ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
              </div>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className="mt-10 text-center">
          <p className="text-[#5E5E5C] text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Credit Packs Section */}
      <section className="relative z-10 py-20 border-t border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full mb-6 text-sm text-[#8B5CF6]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Credit Packs
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Need more enrichments?
            </h2>
            <p className="text-lg text-[#A1A09E] max-w-xl mx-auto">
              Buy credits anytime. They <span className="text-[#8B5CF6] font-semibold">never expire</span> and work with any plan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <div
                key={pack.id}
                className={`relative group rounded-xl p-1 transition-all duration-300 ${
                  pack.popular
                    ? 'bg-gradient-to-b from-[#8B5CF6] to-[#6366F1] shadow-xl shadow-[#8B5CF6]/20'
                    : 'bg-[#1A1A1A] hover:bg-[#2A2A2A]'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] rounded-full text-xs font-bold uppercase tracking-wider">
                    Best Value
                  </div>
                )}

                <div className="h-full rounded-lg p-5 bg-[#0D0D0D]">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-extrabold text-[#8B5CF6] mb-1">
                      {pack.credits}
                    </div>
                    <div className="text-sm text-[#5E5E5C]">credits</div>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold">${pack.price}</div>
                    <div className="text-xs text-[#5E5E5C]">${pack.perCredit.toFixed(2)}/credit</div>
                    {pack.savings && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full font-medium">
                        {pack.savings}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCreditPurchase(pack.id, pack.credits)}
                    disabled={loading === pack.id}
                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      pack.popular
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                        : 'bg-[#1A1A1A] text-white border border-[#2A2A2A] hover:border-[#8B5CF6]'
                    } disabled:opacity-50`}
                  >
                    {loading === pack.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      'Buy Credits'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 border-t border-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'What happens when I run out of monthly enrichments?',
                a: 'When you use all your monthly enrichments, you can either wait for your next billing cycle to reset, upgrade to a higher plan, or purchase credit packs for instant additional enrichments.'
              },
              {
                q: 'Do credits expire?',
                a: 'No! Credits never expire. Buy them once and use them whenever you need extra enrichments beyond your monthly allowance.'
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Yes, you can change your plan at any time. When upgrading, you\'ll be prorated for the remainder of your billing cycle. Downgrades take effect at your next billing date.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.'
              },
              {
                q: 'Is there a refund policy?',
                a: 'Yes! We offer a 30-day money-back guarantee on all subscription plans. If you\'re not satisfied, contact us for a full refund.'
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold hover:text-[#3A83FE] transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-[#5E5E5C] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-[#A1A09E] text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 border-t border-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to network smarter?
          </h2>
          <p className="text-lg text-[#A1A09E] mb-8">
            Start with 5 free contacts. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-[#3A83FE] via-[#6366F1] to-[#8B5CF6] text-white hover:shadow-[0_0_40px_rgba(58,131,254,0.4)] hover:scale-[1.02] transition-all"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1A1A1A] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5E5E5C]">
            © {new Date().getFullYear()} Network Buddy. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#5E5E5C]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
