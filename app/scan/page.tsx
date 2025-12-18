'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CameraCapture from '@/components/camera/CameraCapture';
import ImagePreview from '@/components/camera/ImagePreview';
import EnrichmentProgress from '@/components/enrichment/EnrichmentProgress';
import CreditsPurchaseModal from '@/components/credits/CreditsPurchaseModal';
import { shouldHideExternalPayments, getWebPurchaseUrl } from '@/lib/utils/platform';
import type { GeoLocation } from '@/lib/services/geolocation';

type SubscriptionInfo = {
  plan: string;
  scansRemaining: number;
  scansLimit: number;
  scansUsed: number;
};

type CreditsInfo = {
  balance: number;
};

type Step = 'capture' | 'preview' | 'processing' | 'enriching';

type EnrichmentProgressItem = {
  step: string;
  message: string;
  data?: any;
};

type GMBData = {
  name?: string;
  rating: number;
  reviewCount: number;
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
    likes: number;
  }[];
  photos: {
    url: string;
    thumbnail: string;
    title?: string;
  }[];
  hours?: string;
  address?: string;
  phone?: string;
  website?: string;
  categories?: string[];
  priceRange?: string;
};

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('capture');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Enrichment state
  const [enrichmentProgress, setEnrichmentProgress] = useState<EnrichmentProgressItem[]>([]);
  const [gmbData, setGmbData] = useState<GMBData | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState<string | null>(null);
  const [enrichmentPhase, setEnrichmentPhase] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [currentCredits, setCurrentCredits] = useState<CreditsInfo | null>(null);

  // Location state (GPS captured when scanning)
  const [capturedLocation, setCapturedLocation] = useState<GeoLocation | null>(null);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/contacts?limit=1');
        if (response.status === 401) {
          // User is not authenticated, redirect to login with return URL
          router.push('/auth/login?returnUrl=/scan');
          return;
        }
        setIsCheckingAuth(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleCapture = async (file: File, location: GeoLocation | null) => {
    setCapturedFile(file);
    setCapturedLocation(location);
    setError(null);
    setStep('preview');
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setCapturedLocation(null);
    setUploadedImageUrl('');
    setUploadedImagePath('');
    setOcrResult(null);
    setError(null);
    setStep('capture');
  };

  const handleProcessImage = async () => {
    if (!capturedFile) return;

    setStep('processing');
    setError(null);
    setEnrichmentProgress([]);

    try {
      // Step 1: Upload image
      setEnrichmentPhase('Uploading image...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', capturedFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || 'Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      setUploadedImageUrl(uploadData.url);
      setUploadedImagePath(uploadData.path);

      // Step 2: Run OCR
      setEnrichmentPhase('Reading business card with AI...');
      const ocrFormData = new FormData();
      ocrFormData.append('file', capturedFile);

      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: ocrFormData,
      });

      if (!ocrResponse.ok) {
        const ocrError = await ocrResponse.json();
        throw new Error(ocrError.error || 'Failed to process image');
      }

      const ocrData = await ocrResponse.json();
      console.log('🔍 OCR Result received:', JSON.stringify(ocrData, null, 2));
      setOcrResult(ocrData);

      // Step 3: IMMEDIATELY save contact and start enrichment (skip edit step)
      setEnrichmentPhase('Saving contact...');

      const fields = ocrData.fields || {};
      const saveResponse = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName,
          lastName: fields.lastName,
          email: fields.email,
          phone: fields.phone,
          company: fields.company,
          jobTitle: fields.jobTitle,
          website: fields.website,
          address: fields.address,
          cardImageUrl: uploadData.url,
          cardImagePath: uploadData.path,
          ocrConfidence: ocrData.confidence,
          ocrRawText: ocrData.rawText,
          scanLatitude: capturedLocation?.latitude,
          scanLongitude: capturedLocation?.longitude,
          scanLocationAccuracy: capturedLocation?.accuracy,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();

        // Handle scan limit reached
        if (errorData.error === 'scan_limit_reached') {
          // Capture subscription and credits info for the modal
          if (errorData.subscription) {
            setCurrentSubscription(errorData.subscription);
          }
          if (errorData.credits) {
            setCurrentCredits(errorData.credits);
          }
          setShowUpgradeModal(true);
          setStep('preview');
          return;
        }

        throw new Error(errorData.message || errorData.error || 'Failed to save contact');
      }

      const { contact } = await saveResponse.json();

      // Step 4: Start enrichment with futuristic UI
      setStep('enriching');
      setEnrichmentPhase('Initializing AI enrichment...');

      // Add initial progress items for the futuristic effect
      setEnrichmentProgress([
        { step: 'save', message: '✅ Contact saved successfully', data: null },
        { step: 'init', message: '🚀 Starting deep research...', data: null },
      ]);

      // Connect to SSE endpoint for real-time progress
      const eventSource = new EventSource(`/api/enrich/stream/${contact.id}`);
      let enrichmentComplete = false;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Update progress with futuristic messages
          const progressMessage = getEnrichmentMessage(data.step, data.message, data.data);
          setEnrichmentProgress((prev) => [...prev, {
            step: data.step,
            message: progressMessage,
            data: data.data,
          }]);

          // Phase 1: GMB data (PRIORITY - show immediately!)
          if (data.step === 'gmb' && data.data) {
            setEnrichmentPhase('🏢 Business intel acquired!');
            setGmbData({
              rating: data.data.rating || 0,
              reviewCount: data.data.reviewCount || 0,
              reviews: data.data.reviews || [],
              photos: data.data.photos || [],
            });
          }

          // Phase 2: LinkedIn profile
          if (data.step === 'linkedin' && data.data?.url) {
            setEnrichmentPhase('💼 LinkedIn profile found!');
            setLinkedInUrl(data.data.url);
          }

          // Enrichment complete
          if (data.type === 'complete') {
            enrichmentComplete = true;
            setEnrichmentPhase('✨ Enrichment complete!');
            eventSource.close();

            setTimeout(() => {
              router.push(`/contacts/${contact.id}`);
            }, 1500);
          }

          // Handle errors
          if (data.type === 'error') {
            console.error('Enrichment error:', data.message);
            setEnrichmentPhase('⚠️ Some data couldn\'t be found');
            eventSource.close();

            setTimeout(() => {
              router.push(`/contacts/${contact.id}`);
            }, 2000);
          }
        } catch (parseError) {
          console.error('Error parsing SSE message:', parseError);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection closed or failed');
        eventSource.close();

        if (!enrichmentComplete) {
          setEnrichmentPhase('🔄 Enrichment continuing in background...');
          setTimeout(() => {
            router.push(`/contacts/${contact.id}`);
          }, 1500);
        }
      };

      // Timeout after 25 seconds
      setTimeout(() => {
        if (!enrichmentComplete) {
          eventSource.close();
          setEnrichmentPhase('⏳ Taking longer than expected, redirecting...');
          setTimeout(() => {
            router.push(`/contacts/${contact.id}`);
          }, 1000);
        }
      }, 25000);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('preview');
    }
  };

  // Helper function to generate futuristic progress messages
  const getEnrichmentMessage = (step: string, message: string, data: any): string => {
    const messages: Record<string, string> = {
      'start': '🔌 Connecting to data networks...',
      'gmb': data?.rating ? `⭐ Found ${data.rating} star rating with ${data.reviewCount || 0} reviews` : '🔍 Searching Google Maps...',
      'linkedin': data?.url ? '💼 LinkedIn profile acquired' : '🔍 Searching LinkedIn...',
      'apollo': '📧 Verifying contact data with Apollo...',
      'parallel': '⚡ Running parallel data extraction...',
      'perplexity': '🧠 AI analyzing company profile...',
      'social': '📱 Finding social media presence...',
      'news': '📰 Scanning recent news mentions...',
      'summary': '✍️ Generating AI insights...',
      'complete': '✅ All data sources processed!',
    };
    return messages[step] || message;
  };

  const handleCancel = () => {
    router.push('/');
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Network Buddy"
              width={200}
              height={50}
              className="h-10 sm:h-12 w-auto drop-shadow-[0_2px_8px_rgba(58,131,254,0.5)]"
              priority
              style={{ filter: 'brightness(1.15)' }}
            />
          </Link>
          <div className="ml-auto">
            <p className="text-sm text-gray-300 text-right">
              {step === 'capture' && 'Capture a new contact'}
              {step === 'preview' && 'Review your photo'}
              {step === 'processing' && 'Processing card...'}
              {step === 'enriching' && 'AI enrichment in progress...'}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-300">Error</p>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Capture */}
        {step === 'capture' && (
          <div className="py-4">
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && capturedFile && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ImagePreview file={capturedFile} onRetake={handleRetake} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 px-4 py-4 border-2 border-gray-400 text-gray-200 bg-gray-700/50 rounded-lg font-semibold hover:bg-gray-600/50 hover:border-gray-300 transition-colors min-h-[48px] active:scale-95 touch-manipulation"
              >
                Retake Photo
              </button>
              <button
                onClick={handleProcessImage}
                className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors min-h-[48px] active:scale-95 touch-manipulation"
              >
                Process Card
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing - Futuristic UI */}
        {step === 'processing' && (
          <div className="space-y-6">
            {/* Futuristic Processing Card */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border border-violet-500/30 p-8 text-center relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse" />

              {/* Spinning rings */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/30 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border-4 border-blue-500/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                <div className="absolute inset-4 rounded-full border-4 border-cyan-500/50 animate-spin" style={{ animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-violet-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-2 relative z-10">
                {enrichmentPhase || 'Initializing AI...'}
              </h2>
              <p className="text-gray-400 text-sm relative z-10">
                Our AI is reading and analyzing your business card
              </p>

              {/* Progress bar */}
              <div className="mt-6 relative z-10">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            {/* Card preview (smaller) */}
            {capturedFile && (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                <p className="text-xs text-gray-500 mb-2">SCANNING</p>
                <div className="relative aspect-[1.6/1] max-w-xs mx-auto rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(capturedFile)}
                    alt="Business card"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 to-transparent" />
                  {/* Scanning line effect */}
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 animate-bounce" style={{ top: '50%', animationDuration: '1s' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Enriching - Full screen progress */}
        {step === 'enriching' && (
          <>
            {/* Sticky Progress Bar at Top */}
            <EnrichmentProgress
              currentPhase={enrichmentPhase}
              progress={enrichmentProgress}
            />

            {/* Content area with padding for fixed header */}
            <div className="pt-52 space-y-6">
              {/* Success message */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/30 p-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Contact Saved!</h2>
                <p className="text-gray-400">Now gathering detailed information about this contact...</p>
              </div>

              {/* Live Results Feed */}
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live Results
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {enrichmentProgress.length === 0 ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connecting to data sources...</span>
                    </div>
                  ) : (
                    enrichmentProgress.map((progress, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                          index === enrichmentProgress.length - 1
                            ? 'bg-violet-500/10 border border-violet-500/30'
                            : 'bg-gray-700/30'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          index === enrichmentProgress.length - 1
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {index === enrichmentProgress.length - 1 ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            index === enrichmentProgress.length - 1 ? 'text-white' : 'text-gray-300'
                          }`}>
                            {progress.message}
                          </p>
                          {progress.data && (
                            <p className="text-xs text-gray-500 mt-1">
                              {progress.data.rating && `⭐ ${progress.data.rating} stars`}
                              {progress.data.reviewCount && ` • ${progress.data.reviewCount} reviews`}
                              {progress.data.url && 'Profile found'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* GMB Reviews Preview (if found) */}
              {gmbData && gmbData.rating > 0 && (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Google Reviews Found!</h3>
                        <p className="text-yellow-400 text-sm">
                          {gmbData.rating.toFixed(1)} stars • {gmbData.reviewCount.toLocaleString()} reviews
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Photos preview */}
                  {gmbData.photos && gmbData.photos.length > 0 && (
                    <div className="p-4 border-b border-gray-700">
                      <div className="grid grid-cols-4 gap-2">
                        {gmbData.photos.slice(0, 4).map((photo, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img
                              src={photo.thumbnail}
                              alt={photo.title || 'Business photo'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top review preview */}
                  {gmbData.reviews && gmbData.reviews.length > 0 && (
                    <div className="p-4">
                      <div className="bg-gray-700/30 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white text-sm font-medium">{gmbData.reviews[0].author}</span>
                          <span className="text-yellow-400 text-sm">{'⭐'.repeat(gmbData.reviews[0].rating)}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{gmbData.reviews[0].text}</p>
                      </div>
                      {gmbData.reviews.length > 1 && (
                        <p className="text-gray-500 text-xs mt-2 text-center">
                          +{gmbData.reviews.length - 1} more reviews
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Found */}
              {linkedInUrl && (
                <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">LinkedIn Profile Found</p>
                      <a
                        href={linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline"
                      >
                        View Profile →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upgrade Modal - Shown when scan limit reached */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700 relative">
            {/* Close button */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {currentSubscription?.plan === 'growth' ? 'Monthly Limit Reached' : 'Scan Limit Reached'}
              </h2>
              <p className="text-gray-400 text-sm">
                {currentSubscription?.plan === 'free' && (
                  <>You've used all 5 free contacts. Upgrade to Starter for 10 enrichments/month, or purchase credits.</>
                )}
                {currentSubscription?.plan === 'starter' && (
                  <>You've used all 10 Starter contacts. Upgrade to Growth for 30 enrichments/month, or purchase credits.</>
                )}
                {currentSubscription?.plan === 'growth' && (
                  <>You've used all 30 Growth contacts this month. Purchase credits to continue scanning.</>
                )}
                {!currentSubscription?.plan && (
                  <>You've reached your limit. Upgrade your plan or purchase credits to continue.</>
                )}
              </p>
            </div>

            <div className="space-y-3">
              {/* iOS: Show web redirect message */}
              {shouldHideExternalPayments() ? (
                <>
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-2">
                    <p className="text-violet-300 text-sm text-center">
                      To upgrade or purchase credits, please visit our website. Your account will sync automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(getWebPurchaseUrl() + '/pricing', '_blank')}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Website to Upgrade
                  </button>
                </>
              ) : (
                <>
                  {/* Upgrade button - only show if not on highest plan */}
                  {currentSubscription?.plan !== 'growth' && (
                    <button
                      onClick={async () => {
                        setUpgradeLoading(true);
                        const nextPlan = currentSubscription?.plan === 'starter' ? 'growth' : 'starter';
                        try {
                          const response = await fetch('/api/stripe/create-checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: nextPlan }),
                          });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            alert('Failed to start upgrade. Please try again.');
                            setUpgradeLoading(false);
                          }
                        } catch (error) {
                          console.error('Upgrade error:', error);
                          alert('Failed to start upgrade. Please try again.');
                          setUpgradeLoading(false);
                        }
                      }}
                      disabled={upgradeLoading}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                    >
                      {upgradeLoading ? 'Loading...' : (
                        currentSubscription?.plan === 'starter'
                          ? 'Upgrade to Growth - $29/mo'
                          : 'Upgrade to Starter - $9/mo'
                      )}
                    </button>
                  )}

                  {/* Buy Credits button */}
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setShowCreditsModal(true);
                    }}
                    className={`w-full py-3 ${
                      currentSubscription?.plan === 'growth'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400'
                        : 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 border border-yellow-600/30'
                    } text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" />
                    </svg>
                    Buy Credits
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  router.push('/contacts');
                }}
                className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                View Existing Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits Purchase Modal */}
      {showCreditsModal && (
        <CreditsPurchaseModal onClose={() => setShowCreditsModal(false)} />
      )}
    </main>
  );
}
