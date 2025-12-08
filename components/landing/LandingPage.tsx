'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PricingButton from '@/components/pricing/PricingButton';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#030303] text-[#F3F3F2]">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-4 sm:px-[5%] py-3 sm:py-4 border-b border-[#2A2A2A] sticky top-0 bg-[rgba(3,3,3,0.95)] backdrop-blur-[20px] z-[1000]">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/logo.png"
            alt="Network Buddy"
            width={200}
            height={50}
            className="h-10 sm:h-12 w-auto drop-shadow-[0_2px_8px_rgba(58,131,254,0.4)]"
            priority
            style={{ filter: 'brightness(1.1)' }}
          />
        </Link>
        <ul className="hidden md:flex gap-8 list-none">
          <li><a href="#product" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">Product</a></li>
          <li><a href="#how-it-works" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">How it works</a></li>
          <li><a href="#integrations" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">Integrations</a></li>
          <li><a href="#pricing" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">Pricing</a></li>
        </ul>
        <div className="flex gap-2 sm:gap-4 items-center">
          <Link href="/auth/login" className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-[0.95rem] font-semibold cursor-pointer transition-all border-none no-underline bg-transparent text-[#F3F3F2] border border-[#2A2A2A] hover:border-[#3A83FE]">
            Sign in
          </Link>
          <Link href="/auth/login" className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-[0.95rem] font-semibold cursor-pointer transition-all border-none no-underline bg-[#3A83FE] text-white hover:bg-[#2563eb] hover:shadow-[0_0_20px_rgba(58,131,254,0.2)]">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-20 md:py-32 text-center">
        <h1 className="text-[clamp(2rem,6vw,4.5rem)] font-extrabold mb-4 sm:mb-6 leading-[1.1] tracking-[-0.03em] px-2">
          Ditch business cards.<br />Keep the relationship.
        </h1>
        <p className="text-[clamp(1rem,2vw,1.3rem)] text-[#A1A09E] max-w-[700px] mx-auto mb-8 sm:mb-10 leading-[1.6] px-4">
          Scan a business card, instantly enrich with LinkedIn, company intel, and reviews—then save to your network and automate follow-ups. All in one place.
        </p>
        <div className="flex gap-3 sm:gap-4 justify-center items-center flex-wrap mb-3 sm:mb-4 px-4">
          <Link href="/auth/login" className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-[1.05rem] font-semibold no-underline bg-[#3A83FE] text-white hover:bg-[#2563eb] hover:shadow-[0_0_20px_rgba(58,131,254,0.2)] transition-all">
            Get started free
          </Link>
          <button className="bg-transparent text-[#F3F3F2] inline-flex items-center gap-2 p-0 border-none cursor-pointer font-semibold hover:text-[#3A83FE] transition-colors text-base sm:text-[1rem]">
            Watch demo <span className="inline-block ml-2">→</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-[#5E5E5C]">No credit card required.</p>
      </section>

      {/* Animated Flow */}
      <div className="my-12 sm:my-16 md:my-24 max-w-[1400px] mx-auto px-4 sm:px-[5%]">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-16 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 relative z-[2]">
            {[
              { icon: '📸', title: 'Card scanned', desc: 'Instant OCR extraction' },
              { icon: '💼', title: 'LinkedIn matched', desc: 'Profile & role detected' },
              { icon: '🏢', title: 'Company enriched', desc: 'Industry & signals' },
              { icon: '⭐', title: 'Reviews pulled', desc: 'Reputation verified' },
              { icon: '📊', title: 'Added to pipeline', desc: 'CRM synced' },
              { icon: '✉️', title: 'Follow-up drafted', desc: 'AI-powered outreach' }
            ].map((stage, i) => (
              <div key={i} className="text-center p-5 sm:p-6 md:p-8 bg-[rgba(26,26,26,0.8)] border border-[#2A2A2A] rounded-xl relative transition-all hover:translate-y-[-4px] hover:border-[#3A83FE] hover:shadow-[0_8px_24px_rgba(58,131,254,0.15)]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[rgba(58,131,254,0.2)] to-[rgba(37,99,235,0.1)] border border-[rgba(58,131,254,0.3)] rounded-full flex items-center justify-center text-xl sm:text-2xl">
                  {stage.icon}
                </div>
                <h3 className="text-base sm:text-[1.1rem] mb-1 sm:mb-2 font-semibold">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-[#A1A09E]">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center py-10 sm:py-12 md:py-16 px-4 sm:px-[5%] border-t border-b border-[#2A2A2A] overflow-hidden">
        <p className="text-[#5E5E5C] text-xs sm:text-sm mb-6 sm:mb-8 uppercase tracking-[0.1em]">Trusted by teams who network for a living</p>
        <div className="relative">
          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .scroll-container {
              animation: scroll 30s linear infinite;
            }
            .scroll-container:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="flex scroll-container">
            {[
              'Salesforce', 'HubSpot', 'Mailchimp', 'Stripe', 'Slack', 'Zoom',
              'Intercom', 'Zendesk', 'Atlassian', 'Dropbox', 'Monday.com', 'Asana',
              'Salesforce', 'HubSpot', 'Mailchimp', 'Stripe', 'Slack', 'Zoom',
              'Intercom', 'Zendesk', 'Atlassian', 'Dropbox', 'Monday.com', 'Asana'
            ].map((company, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-8 px-6 py-4 text-[#A1A09E] font-bold text-lg opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ minWidth: '150px', textAlign: 'center' }}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em]">How it works</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#A1A09E] max-w-[700px] mx-auto px-4">Four simple steps from business card to relationship</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {[
            { num: '1', title: 'Scan', desc: 'Use your phone to snap a business card. Our AI extracts every detail—name, title, company, contact info—in seconds.' },
            { num: '2', title: 'Enrich', desc: 'We automatically find their LinkedIn profile, research their company, and pull recent reviews and signals to give you the full picture.' },
            { num: '3', title: 'Sync', desc: 'Save directly to GoHighLevel, HubSpot, or export to CSV. Your enriched contacts flow seamlessly into your existing workflow.' },
            { num: '4', title: 'Nurture', desc: 'Get AI-drafted follow-ups, smart reminders, and personalized outreach suggestions. Turn every card into a lasting connection.' }
          ].map((step) => (
            <div key={step.num} className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#3A83FE] to-[#2563eb] rounded-full flex items-center justify-center font-bold mb-4 sm:mb-5 md:mb-6 text-base sm:text-lg">
                {step.num}
              </div>
              <h3 className="text-lg sm:text-xl md:text-[1.3rem] mb-2 sm:mb-3 font-bold">{step.title}</h3>
              <p className="text-sm sm:text-base text-[#A1A09E] leading-[1.7]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="product" className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em] px-2">Everything you need to build your network</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#A1A09E] max-w-[700px] mx-auto px-4">Powerful features that turn contacts into relationships</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {[
            { icon: '💼', title: 'LinkedIn enrichment', desc: 'Automatic profile matching with role detection, seniority level, and career history to understand who you\'re talking to.' },
            { icon: '🏢', title: 'Company intelligence', desc: 'Deep insights into what the company does, their size, industry, recent news, and market signals.' },
            { icon: '⭐', title: 'Review aggregation', desc: 'Pull Google reviews and web reputation signals to verify credibility before you engage.' },
            { icon: '✍️', title: 'Smart outreach drafts', desc: 'AI-generated email, LinkedIn DM, and SMS templates personalized to each contact and context.' },
            { icon: '📊', title: 'Pipeline + tagging', desc: 'Organize contacts with custom tags, stages, notes, and reminders. Never lose track of a lead.' },
            { icon: '👥', title: 'Team sharing', desc: 'Collaborate with your team with shared contacts, permissions, and unified pipeline views.' }
          ].map((feature, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 sm:p-8 md:p-10 transition-all hover:border-[#3A83FE] hover:translate-y-[-4px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
              <div className="text-[1.75rem] sm:text-[2rem] mb-4 sm:mb-5 md:mb-6">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl md:text-[1.2rem] mb-2 sm:mb-3 font-bold">{feature.title}</h3>
              <p className="text-sm sm:text-base text-[#A1A09E] leading-[1.7]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em]">Integrates with your CRM</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#A1A09E] max-w-[700px] mx-auto px-4">Sync enriched contacts to your existing tools</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12">
          {[
            { icon: '⚡', title: 'GoHighLevel', featured: true },
            { icon: '📧', title: 'HubSpot', featured: false },
            { icon: '📇', title: 'Google Contacts', featured: false },
            { icon: '📄', title: 'CSV Export', featured: false }
          ].map((integration, i) => (
            <div key={i} className={`bg-[#1A1A1A] border ${integration.featured ? 'border-[#3A83FE] bg-gradient-to-br from-[rgba(58,131,254,0.1)] to-transparent' : 'border-[#2A2A2A]'} rounded-xl p-5 sm:p-6 md:p-8 text-center transition-all hover:border-[#3A83FE] hover:scale-105`}>
              <div className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] mb-3 sm:mb-4">{integration.icon}</div>
              <h3 className="text-sm sm:text-base md:text-[1.1rem] font-semibold">{integration.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-16 lg:p-20 max-w-[900px] mx-auto">
          <h2 className="text-[clamp(1.5rem,5vw,2.5rem)] mb-6 sm:mb-8 font-extrabold">From AI-curious to AI-native</h2>
          <p className="text-sm sm:text-base md:text-[1.15rem] leading-[1.7] sm:leading-[1.8] md:leading-[1.9] text-[#A1A09E] mb-4 sm:mb-5 md:mb-6">
            The world doesn't need another business card scanner. It needs a tool that recognizes networking isn't about collecting paper—it's about building relationships at scale.
          </p>
          <p className="text-sm sm:text-base md:text-[1.15rem] leading-[1.7] sm:leading-[1.8] md:leading-[1.9] text-[#A1A09E] mb-4 sm:mb-5 md:mb-6">
            <strong className="text-[#F3F3F2]">Network Buddy is AI-native from the ground up.</strong> We don't just digitize cards. We enrich them with context, verify credibility, draft personalized follow-ups, and integrate seamlessly into your workflow—automatically.
          </p>
          <p className="text-sm sm:text-base md:text-[1.15rem] leading-[1.7] sm:leading-[1.8] md:leading-[1.9] text-[#A1A09E] mb-4 sm:mb-5 md:mb-6">
            This is what happens when you design for humans who are too busy to manually research every contact, but too strategic to let opportunities slip away.
          </p>
          <p className="text-sm sm:text-base md:text-[1.15rem] leading-[1.7] sm:leading-[1.8] md:leading-[1.9] text-[#A1A09E]">
            <strong className="text-[#F3F3F2]">No more data entry. No more forgotten follow-ups. Just meaningful connections, at the speed of modern business.</strong>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em]">Simple, transparent pricing</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#A1A09E] max-w-[700px] mx-auto px-4">Choose the plan that fits your networking needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 max-w-[1100px] mx-auto">
          {[
            {
              id: 'free' as const,
              title: 'Free',
              price: '$0',
              features: ['5 enrichments/month', 'LinkedIn matching', 'Company research', 'GMB reviews & photos', 'AI icebreakers', 'CSV export'],
              cta: 'Start free',
              featured: false
            },
            {
              id: 'growth' as const,
              title: 'Growth',
              price: '$29',
              features: ['30 enrichments/month', 'Everything in Free', 'Apollo email/phone finder', 'Decision maker ID', 'GoHighLevel sync', 'Buy credit add-ons', 'Priority support'],
              cta: 'Start Growth',
              featured: true
            },
            {
              id: 'pro' as const,
              title: 'Pro',
              price: '$79',
              features: ['120 enrichments/month', 'Everything in Growth', 'Bulk import', 'API access (coming soon)', 'White-label exports', 'Credit add-ons at $1/ea', 'Priority enrichment'],
              cta: 'Go Pro',
              featured: false
            }
          ].map((plan, i) => (
            <div key={i} className={`bg-[#1A1A1A] border-2 ${plan.featured ? 'border-[#3A83FE] bg-gradient-to-br from-[rgba(58,131,254,0.05)] to-transparent' : 'border-[#2A2A2A]'} rounded-xl p-6 sm:p-8 md:p-10 text-center transition-all hover:border-[#3A83FE] hover:translate-y-[-8px] relative`}>
              {plan.featured && <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-[#3A83FE] text-white px-3 sm:px-4 py-1 rounded-[20px] text-[0.65rem] sm:text-xs font-bold uppercase">Most Popular</div>}
              <h3 className="text-xl sm:text-2xl mb-1 sm:mb-2 font-bold">{plan.title}</h3>
              <div className="text-4xl sm:text-5xl font-extrabold my-5 sm:my-6">
                {plan.price}<span className="text-lg sm:text-xl text-[#A1A09E] font-normal">/month</span>
              </div>
              <ul className="list-none my-6 sm:my-8 text-left space-y-2 sm:space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="text-sm sm:text-base text-[#A1A09E] flex items-center gap-2 sm:gap-3">
                    <span className="text-[#3A83FE] font-bold flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <PricingButton plan={plan.id} cta={plan.cta} featured={plan.featured} />
            </div>
          ))}
        </div>
        {/* Credits info */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-[#A1A09E] text-sm sm:text-base">
            Need more enrichments? <span className="text-[#F3F3F2] font-semibold">Buy credit packs</span> starting at $15 for 10 credits. Credits never expire.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em]">Frequently asked questions</h2>
        </div>
        <div className="max-w-[800px] mx-auto">
          {[
            {
              q: 'How does LinkedIn matching work?',
              a: 'We use advanced search algorithms to match names and companies from business cards to public LinkedIn profiles. We verify matches using multiple data points to ensure accuracy. All data comes from publicly available sources.'
            },
            {
              q: 'Is my contact data private and secure?',
              a: 'Yes. All data is encrypted in transit and at rest. We never sell your contact data. You own your contacts and can export or delete them at any time. We\'re GDPR and SOC 2 compliant.'
            },
            {
              q: 'How accurate is the enrichment?',
              a: 'Our OCR achieves 95%+ accuracy on standard business cards. LinkedIn matching accuracy is typically 85-90% for professionals with public profiles. Company data comes from verified sources with high reliability.'
            },
            {
              q: 'Can I sync to my existing CRM?',
              a: 'Yes. We have native integrations with GoHighLevel and HubSpot, plus CSV export for other CRMs. Contacts are enriched before syncing, so your CRM gets complete, verified data.'
            },
            {
              q: 'Can my team use Network Buddy together?',
              a: 'Absolutely. Our Team plan supports shared contacts, pipelines, and permissions. Perfect for sales teams, agencies, and organizations that network collaboratively.'
            }
          ].map((faq, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl mb-3 sm:mb-4 overflow-hidden">
              <div
                className="p-4 sm:p-5 md:p-6 cursor-pointer flex justify-between items-center font-semibold text-base sm:text-lg md:text-[1.1rem] hover:text-[#3A83FE]"
                onClick={() => toggleFaq(i)}
              >
                <span className="pr-4">{faq.q}</span>
                <span className={`text-xl sm:text-2xl transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openFaq === i && (
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-sm sm:text-base text-[#A1A09E] leading-[1.7] sm:leading-[1.8]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] px-4 sm:px-[5%] pt-10 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
          <div>
            <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.1em] text-[#A1A09E] font-bold">Product</h4>
            <ul className="list-none space-y-2 sm:space-y-3">
              {['Features', 'Pricing', 'Integrations', 'Mobile app', 'API'].map((item) => (
                <li key={item}><a href="#" className="text-sm sm:text-base text-[#A1A09E] no-underline hover:text-[#F3F3F2] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.1em] text-[#A1A09E] font-bold">Company</h4>
            <ul className="list-none space-y-2 sm:space-y-3">
              {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                <li key={item}><a href="#" className="text-sm sm:text-base text-[#A1A09E] no-underline hover:text-[#F3F3F2] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.1em] text-[#A1A09E] font-bold">Resources</h4>
            <ul className="list-none space-y-2 sm:space-y-3">
              {['Help center', 'Documentation', 'Status', 'Community'].map((item) => (
                <li key={item}><a href="#" className="text-sm sm:text-base text-[#A1A09E] no-underline hover:text-[#F3F3F2] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm uppercase tracking-[0.1em] text-[#A1A09E] font-bold">Newsletter</h4>
            <p className="text-[#A1A09E] text-xs sm:text-sm mb-3 sm:mb-4">Get networking tips and product updates</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 sm:py-3 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-[#F3F3F2] text-sm sm:text-[0.95rem] focus:outline-none focus:border-[#3A83FE]" />
              <button className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-[0.95rem] font-semibold cursor-pointer transition-all border-none bg-[#3A83FE] text-white hover:bg-[#2563eb]">→</button>
            </div>
          </div>
        </div>
        <div className="text-center pt-6 sm:pt-8 border-t border-[#2A2A2A] text-[#5E5E5C] text-xs sm:text-sm">
          <p>&copy; 2024 Network Buddy. All rights reserved. <a href="#" className="text-[#5E5E5C] hover:text-[#F3F3F2]">Privacy</a> · <a href="#" className="text-[#5E5E5C] hover:text-[#F3F3F2]">Terms</a></p>
        </div>
      </footer>
    </div>
  );
}
