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
          <div className="relative h-12 sm:h-14 md:h-16">
            <Image
              src="/logo-v2.png"
              alt="Network Buddy"
              width={240}
              height={70}
              className="h-12 sm:h-14 md:h-16 w-auto drop-shadow-[0_2px_12px_rgba(58,131,254,0.5)]"
              style={{
                mixBlendMode: 'screen',
                filter: 'contrast(1.1) brightness(1.1)'
              }}
              priority
            />
          </div>
        </Link>
        <ul className="hidden md:flex gap-8 list-none">
          <li><a href="#product" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">Product</a></li>
          <li><a href="#how-it-works" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">How it works</a></li>
          <li><a href="#pricing" className="text-[#A1A09E] no-underline text-[0.95rem] hover:text-[#F3F3F2] transition-colors">Pricing</a></li>
        </ul>
        <div className="flex gap-2 sm:gap-4 items-center">
          <Link href="/auth/login" className="px-3 sm:px-5 py-2 sm:py-3 rounded-lg text-sm sm:text-[0.95rem] font-semibold cursor-pointer transition-all border-none no-underline bg-transparent text-[#F3F3F2] border border-[#2A2A2A] hover:border-[#3A83FE]">
            Sign in
          </Link>
          <Link href="/auth/signup" className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-[0.95rem] font-semibold cursor-pointer transition-all border-none no-underline bg-[#3A83FE] text-white hover:bg-[#2563eb] hover:shadow-[0_0_20px_rgba(58,131,254,0.2)]">
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero Section with Phone Animation */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-[5%] py-8 sm:py-10 md:py-12 overflow-hidden">
        {/* Hero Animation Styles */}
        <style jsx>{`
          @keyframes slideInRight {
            0% { transform: translateX(100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideInLeft {
            0% { transform: translateX(-100px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideUp {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes starPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes cardSlide {
            0% { transform: translateY(100%) scale(0.8); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes verified {
            0% { transform: scale(0) rotate(-180deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(58, 131, 254, 0.3); }
            50% { box-shadow: 0 0 40px rgba(58, 131, 254, 0.6); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .phone-mockup {
            animation: float 6s ease-in-out infinite;
          }
          .contact-card-1 { animation: cardSlide 0.6s ease-out 0.3s both; }
          .contact-card-2 { animation: cardSlide 0.6s ease-out 0.6s both; }
          .contact-card-3 { animation: cardSlide 0.6s ease-out 0.9s both; }
          .review-card { animation: slideInRight 0.6s ease-out 1.2s both; }
          .star-1 { animation: starPop 0.3s ease-out 1.5s both; }
          .star-2 { animation: starPop 0.3s ease-out 1.6s both; }
          .star-3 { animation: starPop 0.3s ease-out 1.7s both; }
          .star-4 { animation: starPop 0.3s ease-out 1.8s both; }
          .star-5 { animation: starPop 0.3s ease-out 1.9s both; }
          .verified-badge { animation: verified 0.5s ease-out 2.2s both; }
          .phone-glow { animation: glow 3s ease-in-out infinite; }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left order-1">
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold mb-4 sm:mb-6 leading-[1.1] tracking-[-0.03em]">
              Ditch business cards.<br />
              <span className="bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] bg-clip-text text-transparent">
                Keep the relationship.
              </span>
            </h1>
            <p className="text-[clamp(1rem,2vw,1.2rem)] text-[#A1A09E] max-w-[550px] mx-auto lg:mx-0 mb-8 leading-[1.7]">
              Scan a business card, instantly enrich with LinkedIn, company intel, and reviews—then save to your network and automate follow-ups.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start items-center flex-wrap mb-4">
              <Link href="/auth/signup" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-[1.05rem] font-semibold no-underline bg-gradient-to-r from-[#3A83FE] to-[#6366F1] text-white hover:shadow-[0_0_30px_rgba(58,131,254,0.4)] transition-all hover:scale-105">
                Get started free
              </Link>
              <button className="bg-transparent text-[#F3F3F2] inline-flex items-center gap-2 px-4 py-3 border border-[#2A2A2A] rounded-xl cursor-pointer font-semibold hover:border-[#3A83FE] hover:text-[#3A83FE] transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch demo
              </button>
            </div>
            <p className="text-sm text-[#5E5E5C] flex items-center gap-2 justify-center lg:justify-start">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No credit card required
            </p>
          </div>

          {/* Right side - Animated Phone Mockup */}
          <div className="relative order-2 flex justify-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A83FE]/20 to-[#8B5CF6]/20 blur-[100px] rounded-full" />

            {/* Phone Frame */}
            <div className="phone-mockup relative w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-[#1A1A1A] rounded-[40px] border-4 border-[#2A2A2A] shadow-2xl phone-glow overflow-hidden">
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0D0D0D] rounded-full z-20" />

              {/* Screen Content */}
              <div className="absolute inset-3 top-10 bg-[#0D0D0D] rounded-[28px] overflow-hidden">
                {/* App Header */}
                <div className="bg-gradient-to-r from-[#3A83FE]/20 to-[#8B5CF6]/20 px-4 py-3 border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">Network Buddy</span>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400 text-xs">Online</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Contact Cards */}
                <div className="p-3 space-y-2">
                  {/* Contact 1 */}
                  <div className="contact-card-1 bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A] transform hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A83FE] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-sm">
                        JD
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">John Davis</p>
                        <p className="text-[#A1A09E] text-xs truncate">CEO at TechCorp</p>
                      </div>
                      <div className="verified-badge w-5 h-5 bg-[#3A83FE] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Contact 2 - Service Provider with Stars */}
                  <div className="contact-card-2 bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center text-white font-bold text-sm">
                        MP
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">Mike's Plumbing</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="star-1 text-yellow-400 text-xs">★</span>
                          <span className="star-2 text-yellow-400 text-xs">★</span>
                          <span className="star-3 text-yellow-400 text-xs">★</span>
                          <span className="star-4 text-yellow-400 text-xs">★</span>
                          <span className="star-5 text-yellow-400 text-xs">★</span>
                          <span className="text-[#A1A09E] text-xs ml-1">4.9 (127)</span>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-medium">Verified</span>
                    </div>
                  </div>

                  {/* Contact 3 */}
                  <div className="contact-card-3 bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center text-white font-bold text-sm">
                        SL
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">Sarah Lee</p>
                        <p className="text-[#A1A09E] text-xs truncate">Marketing Director</p>
                      </div>
                      <svg className="w-4 h-4 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Review Card Floating */}
                <div className="review-card absolute bottom-20 right-2 left-2 bg-gradient-to-r from-[#1A1A1A] to-[#0D0D0D] rounded-xl p-3 border border-[#F59E0B]/30 shadow-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#F59E0B] text-sm">⭐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-semibold">Google Review Found</p>
                      <p className="text-[#A1A09E] text-[10px] leading-tight mt-0.5">"Excellent service! Mike was professional and fixed our issue quickly."</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className="text-yellow-400 text-[10px]">★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Scan Button - HERO */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="relative overflow-hidden rounded-xl">
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3A83FE] via-[#EC4899] to-[#F59E0B] rounded-xl"
                      style={{
                        backgroundSize: '200% 100%',
                        animation: 'gradient-shift 3s ease infinite',
                      }}
                    />
                    {/* Inner button */}
                    <div className="relative m-[2px] bg-gradient-to-r from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] rounded-[10px] py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(58,131,254,0.5)]">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animation: 'shimmer 2s infinite' }} />
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white font-bold text-sm drop-shadow-lg">Scan Card</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            {/* LinkedIn Badge - Left */}
            <div className="absolute -left-4 sm:left-0 top-1/4 bg-[#0077B5] rounded-xl p-2 sm:p-3 shadow-lg animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-white text-xs font-semibold hidden sm:inline">Matched!</span>
              </div>
            </div>

            {/* Star Rating Badge - Right */}
            <div className="absolute -right-2 sm:right-0 top-1/3 bg-[#1A1A1A] border border-[#F59E0B]/50 rounded-xl p-2 sm:p-3 shadow-lg" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-sm sm:text-base">★★★★★</span>
                <span className="text-white text-xs font-semibold hidden sm:inline">4.9</span>
              </div>
            </div>

            {/* Verified Badge - Bottom Right */}
            <div className="absolute right-4 sm:right-8 bottom-16 bg-green-500/20 border border-green-500/50 rounded-full p-2 sm:p-3 shadow-lg" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
              <div className="flex items-center gap-1 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 text-xs font-semibold hidden sm:inline">Verified</span>
              </div>
            </div>

            {/* New Lead Notification - Top */}
            <div className="absolute -top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-[#3A83FE] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg flex items-center gap-2" style={{ animation: 'slideUp 0.5s ease-out 2.5s both' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-white text-xs font-semibold">+3 New Leads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Flow - Redesigned */}
      <div className="my-12 sm:my-16 md:my-20 max-w-[1400px] mx-auto px-4 sm:px-[5%]">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <p className="text-[#3A83FE] text-sm font-semibold uppercase tracking-[0.15em] mb-3">The Magic Behind</p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-[-0.02em]">
            From scan to <span className="bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] bg-clip-text text-transparent">relationship</span>
          </h2>
        </div>

        {/* Flow Animation Styles */}
        <style jsx>{`
          @keyframes flowPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .flow-card:hover .flow-icon {
            animation: iconFloat 1s ease-in-out infinite;
          }
          .flow-line {
            background: linear-gradient(90deg, #3A83FE 0%, #8B5CF6 50%, #3A83FE 100%);
            background-size: 200% 100%;
            animation: flowPulse 3s ease-in-out infinite;
          }
        `}</style>

        {/* Flow Grid */}
        <div className="relative">
          {/* Connecting Lines - Desktop Only */}
          <div className="hidden lg:block absolute top-[60px] left-[16.66%] right-[16.66%] h-[2px] z-0">
            <div className="flow-line w-full h-full rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 relative z-[2]">
            {[
              {
                step: '01',
                title: 'Card Scanned',
                desc: 'Instant OCR extraction',
                color: 'from-[#3A83FE] to-[#60A5FA]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'LinkedIn Matched',
                desc: 'Profile & role detected',
                color: 'from-[#0077B5] to-[#00A0DC]',
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Company Enriched',
                desc: 'Industry & signals',
                color: 'from-[#8B5CF6] to-[#A78BFA]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                step: '04',
                title: 'Reviews Pulled',
                desc: 'Reputation verified',
                color: 'from-[#F59E0B] to-[#FBBF24]',
                icon: (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )
              },
              {
                step: '05',
                title: 'Pipeline Ready',
                desc: 'CRM synced',
                color: 'from-[#10B981] to-[#34D399]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                step: '06',
                title: 'Follow-up Sent',
                desc: 'AI-powered outreach',
                color: 'from-[#EC4899] to-[#F472B6]',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              }
            ].map((stage, i) => (
              <div
                key={i}
                className="flow-card group relative"
              >
                {/* Card */}
                <div className="text-center p-5 sm:p-6 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl relative transition-all duration-300 hover:border-transparent hover:shadow-[0_0_30px_rgba(58,131,254,0.2)] h-full"
                  style={{
                    background: 'linear-gradient(#0D0D0D, #0D0D0D) padding-box, linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%) border-box'
                  }}
                >
                  {/* Hover gradient border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `linear-gradient(#0D0D0D, #0D0D0D) padding-box, linear-gradient(135deg, ${stage.color.includes('3A83FE') ? '#3A83FE' : stage.color.includes('0077B5') ? '#0077B5' : stage.color.includes('8B5CF6') ? '#8B5CF6' : stage.color.includes('F59E0B') ? '#F59E0B' : stage.color.includes('10B981') ? '#10B981' : '#EC4899'} 0%, transparent 100%) border-box`,
                      border: '1px solid transparent'
                    }}
                  ></div>

                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D0D0D] px-2">
                    <span className={`text-xs font-bold bg-gradient-to-r ${stage.color} bg-clip-text text-transparent`}>
                      {stage.step}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`flow-icon w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${stage.color} rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    style={{
                      boxShadow: `0 8px 24px ${stage.color.includes('3A83FE') ? 'rgba(58,131,254,0.3)' : stage.color.includes('0077B5') ? 'rgba(0,119,181,0.3)' : stage.color.includes('8B5CF6') ? 'rgba(139,92,246,0.3)' : stage.color.includes('F59E0B') ? 'rgba(245,158,11,0.3)' : stage.color.includes('10B981') ? 'rgba(16,185,129,0.3)' : 'rgba(236,72,153,0.3)'}`
                    }}
                  >
                    {stage.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${stage.color.includes('3A83FE') ? '#3A83FE, #60A5FA' : stage.color.includes('0077B5') ? '#0077B5, #00A0DC' : stage.color.includes('8B5CF6') ? '#8B5CF6, #A78BFA' : stage.color.includes('F59E0B') ? '#F59E0B, #FBBF24' : stage.color.includes('10B981') ? '#10B981, #34D399' : '#EC4899, #F472B6'})`
                    }}
                  >
                    {stage.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#6B6B6B] group-hover:text-[#A1A09E] transition-colors">{stage.desc}</p>
                </div>

                {/* Arrow connector - Mobile/Tablet */}
                {i < 5 && (
                  <div className="lg:hidden flex justify-center my-2">
                    <svg className="w-5 h-5 text-[#3A3A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Showcase Section */}
      <section id="how-it-works" className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-[#0A0A0A] to-[#030303]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#3A83FE]/10 via-[#8B5CF6]/10 to-[#3A83FE]/10 rounded-full blur-[120px]" />

        {/* Showcase Animation Styles */}
        <style jsx>{`
          @keyframes showcaseFloat {
            0%, 100% { transform: translateY(0) rotateX(2deg); }
            50% { transform: translateY(-15px) rotateX(2deg); }
          }
          @keyframes featureSlide {
            0% { transform: translateX(-20px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes featureSlideRight {
            0% { transform: translateX(20px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .showcase-screen {
            animation: showcaseFloat 6s ease-in-out infinite;
            transform-style: preserve-3d;
            perspective: 1000px;
          }
          .feature-left { animation: featureSlide 0.6s ease-out forwards; }
          .feature-right { animation: featureSlideRight 0.6s ease-out forwards; }
          .shimmer-border {
            background: linear-gradient(90deg, transparent, rgba(58,131,254,0.3), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s linear infinite;
          }
        `}</style>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-[5%]">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#3A83FE] text-sm font-semibold uppercase tracking-[0.15em] mb-3">See It In Action</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold tracking-[-0.02em] mb-4">
              Your network, <span className="bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] bg-clip-text text-transparent">supercharged</span>
            </h2>
            <p className="text-base sm:text-lg text-[#A1A09E] max-w-[600px] mx-auto">
              Watch as a simple business card transforms into actionable intelligence
            </p>
          </div>

          {/* Main Showcase */}
          <div className="relative flex justify-center items-center">
            {/* Left Features */}
            <div className="hidden lg:flex flex-col gap-6 absolute left-0 top-1/2 -translate-y-1/2 w-[280px]">
              {[
                { icon: '📸', title: 'Instant Scan', desc: 'Point, snap, done. AI extracts every detail.' },
                { icon: '🔗', title: 'Auto-Match', desc: 'LinkedIn profiles found automatically.' },
                { icon: '⭐', title: 'Reputation Check', desc: 'Google reviews & ratings verified.' }
              ].map((feature, i) => (
                <div key={i} className="feature-left bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-xl p-4 flex items-start gap-3 hover:border-[#3A83FE]/50 transition-colors"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3A83FE]/20 to-[#8B5CF6]/20 flex items-center justify-center text-lg flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{feature.title}</h4>
                    <p className="text-xs text-[#6B6B6B]">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Center - App Screenshot */}
            <div className="showcase-screen relative mx-auto">
              {/* Glow behind screen */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3A83FE]/20 to-[#8B5CF6]/20 rounded-3xl blur-2xl" />

              {/* Browser/App Frame */}
              <div className="relative bg-[#0D0D0D] rounded-2xl border border-[#2A2A2A] shadow-2xl overflow-hidden w-[320px] sm:w-[400px] md:w-[500px] lg:w-[600px]">
                {/* Browser Bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-[#0D0D0D] rounded-lg px-3 py-1.5 text-xs text-[#6B6B6B] flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      app.networkbuddy.io
                    </div>
                  </div>
                </div>

                {/* App Content - Simulated Dashboard */}
                <div className="p-4 sm:p-6 bg-[#0D0D0D] min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                  {/* Contact Card Being Enriched */}
                  <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3A83FE] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg">
                        JD
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">John Davis</h3>
                        <p className="text-[#A1A09E] text-sm">CEO at TechCorp Industries</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                          <span className="text-[#6B6B6B] text-xs">4.9 rating</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full">Verified</span>
                        <span className="bg-[#0077B5]/20 text-[#0077B5] text-[10px] px-2 py-0.5 rounded-full">LinkedIn</span>
                      </div>
                    </div>
                  </div>

                  {/* Enrichment Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white">LinkedIn profile matched</span>
                          <span className="text-green-400">Complete</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white">Company intel gathered</span>
                          <span className="text-green-400">Complete</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3A83FE]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#3A83FE] animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white">Generating follow-up draft...</span>
                          <span className="text-[#3A83FE]">In progress</span>
                        </div>
                        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] rounded-full shimmer-border" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 sm:-right-8 bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl p-3 shadow-xl" style={{ animation: 'float 4s ease-in-out infinite' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold">Profile Found!</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-[#0D0D0D] border border-[#F59E0B]/30 rounded-xl p-3 shadow-xl" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-white text-xs font-semibold">4.9 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="hidden lg:flex flex-col gap-6 absolute right-0 top-1/2 -translate-y-1/2 w-[280px]">
              {[
                { icon: '🏢', title: 'Company Intel', desc: 'Size, industry, and recent news.' },
                { icon: '✉️', title: 'Smart Drafts', desc: 'AI writes your follow-up emails.' },
                { icon: '📊', title: 'CRM Sync', desc: 'Push to GoHighLevel or HubSpot.' }
              ].map((feature, i) => (
                <div key={i} className="feature-right bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#2A2A2A] rounded-xl p-4 flex items-start gap-3 hover:border-[#8B5CF6]/50 transition-colors"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center text-lg flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{feature.title}</h4>
                    <p className="text-xs text-[#6B6B6B]">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Features - Below Screenshot */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-8">
            {/* SCAN - Hero Feature */}
            <div className="col-span-2 relative rounded-xl p-4 flex items-center justify-center gap-3 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
              }}
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #3A83FE, #8B5CF6, #EC4899, #F59E0B, #3A83FE)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient-shift 4s ease infinite',
                  padding: '2px',
                  zIndex: 0,
                }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A]" />

              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#3A83FE]/20 via-[#8B5CF6]/20 to-[#EC4899]/20 rounded-xl" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-lg shadow-[#3A83FE]/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Instant Scan</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3A83FE] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3A83FE]"></span>
                    </span>
                  </div>
                  <span className="text-[#A1A09E] text-xs">Point, snap, done!</span>
                </div>
              </div>
            </div>

            {/* Other features */}
            <div className="bg-[#0D0D0D]/80 border border-[#0077B5]/30 rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-white">Auto-Match</span>
            </div>

            <div className="bg-[#0D0D0D]/80 border border-[#F59E0B]/30 rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="text-xs font-semibold text-white">Reviews</span>
            </div>

            <div className="col-span-2 bg-[#0D0D0D]/80 border border-[#8B5CF6]/30 rounded-xl p-3 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3A83FE] to-[#8B5CF6] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white">Smart Drafts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="product" className="max-w-[1400px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24 overflow-hidden">
        {/* Feature Animation Styles */}
        <style jsx>{`
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(0.8); opacity: 0.5; }
          }
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .bento-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .bento-card:hover {
            transform: translateY(-8px) scale(1.02);
          }
          .bento-card:hover .bento-icon {
            animation: floatIcon 2s ease-in-out infinite;
          }
          .bento-card:hover .bento-glow {
            opacity: 1;
          }
          .gradient-animate {
            background-size: 200% 200%;
            animation: gradient-shift 8s ease infinite;
          }
        `}</style>

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[#3A83FE] text-sm font-semibold uppercase tracking-[0.15em] mb-3">Features</p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em] px-2">
            Everything you need to <span className="bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] bg-clip-text text-transparent">win deals</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A1A09E] max-w-[600px] mx-auto px-4">
            Powerful features that turn contacts into relationships
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Feature 1 - LinkedIn */}
          <div className="bento-card relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden group">
            <div className="bento-glow absolute inset-0 bg-gradient-to-br from-[#0077B5]/10 to-transparent opacity-0 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="bento-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center mb-4 shadow-lg shadow-[#0077B5]/20">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">LinkedIn Enrichment</h3>
              <p className="text-sm text-[#A1A09E] leading-relaxed mb-4">
                Auto-match profiles with role detection and career history.
              </p>
              {/* Mini Profile */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center text-white font-bold text-xs">JD</div>
                <div>
                  <p className="text-white text-xs font-semibold">John Davis</p>
                  <p className="text-[#6B6B6B] text-[10px]">CEO • TechCorp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - SCAN (HERO - Center, Large) */}
          <div className="bento-card md:col-span-2 lg:col-span-1 lg:row-span-2 relative rounded-2xl p-6 sm:p-8 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
            }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl -z-10"
              style={{
                background: 'linear-gradient(135deg, #3A83FE, #8B5CF6, #EC4899, #F59E0B, #3A83FE)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 4s ease infinite',
                padding: '2px',
              }}
            />
            <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A]" />

            {/* Glow effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3A83FE]/20 via-[#8B5CF6]/10 to-[#EC4899]/20 opacity-60 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#3A83FE] blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              {/* Animated Camera Icon */}
              <div className="relative mb-6">
                {/* Pulse rings */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-[#3A83FE]/30 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 w-20 h-20 rounded-full border-2 border-[#8B5CF6]/30 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />

                <div className="bento-icon w-24 h-24 rounded-2xl bg-gradient-to-br from-[#3A83FE] via-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-2xl shadow-[#3A83FE]/40 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#3A83FE]/20 to-[#8B5CF6]/20 border border-[#3A83FE]/30 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3A83FE] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3A83FE]"></span>
                </span>
                <span className="text-[#3A83FE] text-xs font-semibold uppercase tracking-wider">Core Feature</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
                Instant Card Scan
              </h3>
              <p className="text-sm sm:text-base text-[#A1A09E] leading-relaxed max-w-[280px] mb-6">
                Point your camera at any business card. AI extracts every detail in seconds.
              </p>

              {/* Animated Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1.5 bg-[#3A83FE]/20 text-[#60A5FA] text-xs rounded-full font-medium border border-[#3A83FE]/30 group-hover:bg-[#3A83FE]/30 transition-colors">
                  OCR Magic
                </span>
                <span className="px-3 py-1.5 bg-[#8B5CF6]/20 text-[#A78BFA] text-xs rounded-full font-medium border border-[#8B5CF6]/30 group-hover:bg-[#8B5CF6]/30 transition-colors">
                  Auto-Extract
                </span>
                <span className="px-3 py-1.5 bg-[#EC4899]/20 text-[#F472B6] text-xs rounded-full font-medium border border-[#EC4899]/30 group-hover:bg-[#EC4899]/30 transition-colors">
                  1-Tap Save
                </span>
              </div>

              {/* CTA Button */}
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(58,131,254,0.5)] hover:scale-105 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Try Scanning Now
              </Link>
            </div>
          </div>

          {/* Feature 3 - Reviews */}
          <div className="bento-card relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden group">
            <div className="bento-glow absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 to-transparent opacity-0 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="bento-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#FBBF24] flex items-center justify-center mb-4 shadow-lg shadow-[#F59E0B]/20">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Review Aggregation</h3>
              <p className="text-sm text-[#A1A09E] leading-relaxed mb-4">
                Pull Google reviews and reputation signals to verify credibility.
              </p>
              {/* Mini Stars */}
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="text-yellow-400 text-lg group-hover:scale-110 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>★</span>
                ))}
                <span className="text-white text-sm font-semibold ml-2">4.9</span>
              </div>
            </div>
          </div>

          {/* Feature 4 - Company Intel */}
          <div className="bento-card relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden group">
            <div className="bento-glow absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent opacity-0 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="bento-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center mb-4 shadow-lg shadow-[#8B5CF6]/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Company Intelligence</h3>
              <p className="text-sm text-[#A1A09E] leading-relaxed mb-4">
                Deep insights into size, industry, news, and market signals.
              </p>
              {/* Mini Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-[#8B5CF6]/20 text-[#A78BFA] text-xs rounded-full">SaaS</span>
                <span className="px-2 py-1 bg-[#8B5CF6]/20 text-[#A78BFA] text-xs rounded-full">50-200</span>
                <span className="px-2 py-1 bg-[#8B5CF6]/20 text-[#A78BFA] text-xs rounded-full">Series B</span>
              </div>
            </div>
          </div>

          {/* Feature 5 - Smart Drafts */}
          <div className="bento-card relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden group">
            <div className="bento-glow absolute inset-0 bg-gradient-to-br from-[#3A83FE]/10 to-[#8B5CF6]/10 opacity-0 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="bento-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A83FE] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg shadow-[#3A83FE]/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI-Powered Outreach</h3>
              <p className="text-sm text-[#A1A09E] leading-relaxed mb-4">
                Personalized email, LinkedIn DM, and SMS templates drafted instantly.
              </p>
              {/* Mini Draft Preview */}
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-[#3A83FE]/20 text-[#3A83FE] text-[10px] rounded">Email</span>
                <span className="px-2 py-1 bg-[#0077B5]/20 text-[#0077B5] text-[10px] rounded">LinkedIn</span>
                <span className="px-2 py-1 bg-[#10B981]/20 text-[#10B981] text-[10px] rounded">SMS</span>
              </div>
            </div>
          </div>

          {/* Feature 6 - Pipeline */}
          <div className="bento-card relative bg-gradient-to-br from-[#0D0D0D] to-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 overflow-hidden group">
            <div className="bento-glow absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent opacity-0 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="bento-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center mb-4 shadow-lg shadow-[#10B981]/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pipeline & Tags</h3>
              <p className="text-sm text-[#A1A09E] leading-relaxed mb-4">
                Organize with custom tags, stages, and reminders. Never lose a lead.
              </p>
              {/* Mini Pipeline */}
              <div className="flex gap-1">
                <div className="flex-1 h-2 rounded-full bg-[#10B981]" />
                <div className="flex-1 h-2 rounded-full bg-[#10B981]/60" />
                <div className="flex-1 h-2 rounded-full bg-[#10B981]/30" />
                <div className="flex-1 h-2 rounded-full bg-[#2A2A2A]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-4 sm:px-[5%] py-12 sm:py-16 md:py-24 relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3A83FE] opacity-[0.03] blur-[120px] rounded-full" />
        </div>

        <div className="text-center mb-10 sm:mb-12 md:mb-16 relative z-10">
          <p className="text-[#3A83FE] text-sm font-semibold uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-extrabold mb-3 sm:mb-4 tracking-[-0.02em]">Invest in relationships, not admin work</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#A1A09E] max-w-[700px] mx-auto px-4">Every plan pays for itself after your first deal. Start free, scale when you're ready.</p>
        </div>

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes borderGlow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .pricing-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .pricing-card:hover {
            transform: translateY(-12px) scale(1.02);
          }
          .pricing-card::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 16px;
            padding: 2px;
            background: linear-gradient(135deg, transparent, transparent);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.4s ease;
          }
          .pricing-card:hover::before {
            background: linear-gradient(135deg, #3A83FE, #8B5CF6, #3A83FE);
            opacity: 1;
            animation: borderGlow 2s ease-in-out infinite;
          }
          .pricing-card-featured::before {
            background: linear-gradient(135deg, #3A83FE, #8B5CF6, #06B6D4, #3A83FE);
            opacity: 1;
            animation: borderGlow 2s ease-in-out infinite;
          }
          .glow-button {
            position: relative;
            overflow: hidden;
          }
          .glow-button::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
          }
          .price-glow {
            text-shadow: 0 0 40px rgba(58, 131, 254, 0.3);
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 max-w-[1100px] mx-auto relative z-10">
          {[
            {
              id: 'free' as const,
              title: 'Free',
              subtitle: 'Perfect for trying it out',
              price: '$0',
              period: 'forever free',
              highlight: null,
              features: [
                { text: '5 contacts total (one-time)', bold: true },
                { text: 'AI-powered card scanning', bold: false },
                { text: 'LinkedIn profile matching', bold: false },
                { text: 'Apollo email & phone finder', bold: true },
                { text: 'Company intel & research', bold: false },
                { text: 'Google reviews & photos', bold: false },
                { text: 'AI conversation starters', bold: false },
                { text: 'CSV export', bold: false }
              ],
              cta: 'Get Started Free',
              featured: false
            },
            {
              id: 'starter' as const,
              title: 'Starter',
              subtitle: 'For active networkers',
              price: '$9',
              period: '/month',
              highlight: 'MOST POPULAR',
              features: [
                { text: '10 enrichments/month', bold: true },
                { text: 'Everything in Free, plus:', bold: false },
                { text: 'Decision maker identification', bold: true },
                { text: 'GoHighLevel CRM sync', bold: false },
                { text: 'SMS & email templates', bold: false },
                { text: 'Buy extra credits anytime', bold: false },
                { text: 'Priority support', bold: false }
              ],
              cta: 'Start 7-Day Free Trial',
              featured: true
            },
            {
              id: 'growth' as const,
              title: 'Growth',
              subtitle: 'For serious networkers',
              price: '$29',
              period: '/month',
              highlight: 'BEST VALUE',
              features: [
                { text: '30 enrichments/month', bold: true },
                { text: 'Everything in Starter, plus:', bold: false },
                { text: '3x more enrichments', bold: true },
                { text: 'Bulk card import', bold: false },
                { text: 'Priority enrichment queue', bold: false },
                { text: 'Credits at $1.50/each (25% off)', bold: true }
              ],
              cta: 'Go Growth',
              featured: false
            }
          ].map((plan, i) => (
            <div
              key={i}
              className={`pricing-card ${plan.featured ? 'pricing-card-featured' : ''} bg-[#0D0D0D] border ${plan.featured ? 'border-[#3A83FE]/50' : 'border-[#2A2A2A]'} rounded-2xl p-6 sm:p-8 text-center relative group`}
              style={{
                boxShadow: plan.featured
                  ? '0 0 60px rgba(58, 131, 254, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)'
                  : '0 25px 50px rgba(0, 0, 0, 0.3)',
                background: plan.featured
                  ? 'linear-gradient(180deg, rgba(58, 131, 254, 0.08) 0%, rgba(13, 13, 13, 1) 100%)'
                  : '#0D0D0D'
              }}
            >
              {/* Badge */}
              {plan.highlight && (
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider ${
                  plan.featured
                    ? 'bg-gradient-to-r from-[#3A83FE] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(58,131,254,0.5)]'
                    : 'bg-[#1A1A1A] text-[#A1A09E] border border-[#2A2A2A]'
                }`}>
                  {plan.highlight}
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl sm:text-2xl font-bold mt-2">{plan.title}</h3>
              <p className="text-sm text-[#A1A09E] mt-1">{plan.subtitle}</p>

              {/* Price */}
              <div className={`my-6 sm:my-8 ${plan.featured ? 'price-glow' : ''}`}>
                <span className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-[#F3F3F2] to-[#A1A09E] bg-clip-text text-transparent">
                  {plan.price}
                </span>
                <span className="text-base sm:text-lg text-[#5E5E5C] font-normal ml-1">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="list-none my-6 sm:my-8 text-left space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className={`text-sm flex items-start gap-3 ${feature.bold ? 'text-[#F3F3F2]' : 'text-[#A1A09E]'}`}>
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      plan.featured
                        ? 'bg-gradient-to-br from-[#3A83FE] to-[#8B5CF6] text-white'
                        : 'bg-[#1A1A1A] text-[#3A83FE]'
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className={feature.bold ? 'font-semibold' : ''}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
                <PricingButton plan={plan.id} cta={plan.cta} featured={plan.featured} />
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                plan.featured ? '' : ''
              }`} style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(58, 131, 254, 0.1) 0%, transparent 60%)',
              }} />
            </div>
          ))}
        </div>

        {/* Credits info */}
        <div className="mt-10 sm:mt-12 md:mt-16 text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full">
            <span className="text-2xl">💳</span>
            <p className="text-[#A1A09E] text-sm sm:text-base">
              Need more? <span className="text-[#F3F3F2] font-semibold">Credit packs</span> from $15 for 10 enrichments. <span className="text-[#3A83FE]">Never expire.</span>
            </p>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-6 text-center relative z-10">
          <p className="text-[#5E5E5C] text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-day money-back guarantee. Cancel anytime.
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
