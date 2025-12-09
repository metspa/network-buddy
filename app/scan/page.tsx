'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CameraCapture from '@/components/camera/CameraCapture';
import ImagePreview from '@/components/camera/ImagePreview';
import OCRResultEditor, { type OCRFields } from '@/components/ocr/OCRResultEditor';
import EnrichmentProgress from '@/components/enrichment/EnrichmentProgress';

type Step = 'capture' | 'preview' | 'processing' | 'edit' | 'enriching';

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

type AutoFillData = {
  filled: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  autoFilledFields: string[];
  source: string;
  confidence: number;
  summary: string;
  decisionMakers?: any[];
};

export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('capture');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Enrichment state
  const [enrichmentProgress, setEnrichmentProgress] = useState<EnrichmentProgressItem[]>([]);
  const [gmbData, setGmbData] = useState<GMBData | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState<string | null>(null);
  const [enrichmentPhase, setEnrichmentPhase] = useState<string>('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [autoFillData, setAutoFillData] = useState<AutoFillData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

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

  const handleCapture = async (file: File) => {
    setCapturedFile(file);
    setError(null);
    setStep('preview');
  };

  const handleRetake = () => {
    setCapturedFile(null);
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

    try {
      // Step 1: Upload image
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
      setOcrResult(ocrData);

      // Step 3: Start preview enrichment with auto-fill
      // This will fetch GMB data AND auto-fill missing contact info
      setEnrichmentPhase('Looking up company information...');
      startPreviewEnrichment(ocrData.fields, (filledFields) => {
        // Update OCR result with auto-filled data
        setOcrResult((prev: any) => ({
          ...prev,
          fields: { ...prev.fields, ...filledFields },
        }));
      });

      setStep('edit');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('preview');
    }
  };

  // Preview enrichment - fetch GMB data and auto-fill missing contact info
  const startPreviewEnrichment = async (
    fields: { firstName?: string; lastName?: string; company?: string; email?: string; phone?: string; jobTitle?: string },
    onAutoFill?: (filled: Record<string, string>) => void
  ) => {
    console.log('🔍 Starting preview enrichment with fields:', fields);

    // Check if we need auto-fill (missing name or contact info)
    const needsAutoFill = !fields.firstName || !fields.lastName || !fields.email || !fields.phone;
    const hasCompanyOrEmail = fields.company || fields.email;

    if (!hasCompanyOrEmail) {
      console.log('❌ No company or email, skipping enrichment');
      setEnrichmentPhase('');
      return;
    }

    try {
      if (needsAutoFill) {
        setEnrichmentPhase('Finding contact information...');
      } else {
        setEnrichmentPhase(`Searching for "${fields.company}" on Google...`);
      }

      // Fetch GMB data AND auto-fill missing info
      const response = await fetch('/api/enrich/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: fields.company,
          firstName: fields.firstName,
          lastName: fields.lastName,
          email: fields.email,
          phone: fields.phone,
          jobTitle: fields.jobTitle,
          autoFill: needsAutoFill,
        }),
      });

      console.log('📡 Preview API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Preview API data:', data);

        // Handle auto-fill results
        if (data.autoFill && data.autoFill.autoFilledFields?.length > 0) {
          console.log('🤖 Auto-filled fields:', data.autoFill.autoFilledFields);
          setAutoFillData(data.autoFill);
          setEnrichmentPhase(data.autoFill.summary || 'Found decision maker!');

          // Update the form with auto-filled data
          if (onAutoFill && data.autoFill.filled) {
            const filledFields: Record<string, string> = {};
            if (data.autoFill.filled.firstName) filledFields.firstName = data.autoFill.filled.firstName;
            if (data.autoFill.filled.lastName) filledFields.lastName = data.autoFill.filled.lastName;
            if (data.autoFill.filled.company) filledFields.company = data.autoFill.filled.company;
            if (data.autoFill.filled.jobTitle) filledFields.jobTitle = data.autoFill.filled.jobTitle;
            if (data.autoFill.filled.email) filledFields.email = data.autoFill.filled.email;
            if (data.autoFill.filled.phone) filledFields.phone = data.autoFill.filled.phone;
            onAutoFill(filledFields);
          }
        }

        // Handle GMB data
        if (data.gmb && data.gmb.rating) {
          console.log(`✅ Found GMB data: ${data.gmb.rating} stars, ${data.gmb.review_count} reviews`);
          setGmbData({
            name: data.gmb.name,
            rating: data.gmb.rating || 0,
            reviewCount: data.gmb.review_count || 0,
            reviews: data.gmb.reviews || [],
            photos: data.gmb.photos || [],
            hours: data.gmb.hours,
            address: data.gmb.address,
            phone: data.gmb.phone,
            website: data.gmb.website,
            categories: data.gmb.categories || [],
            priceRange: data.gmb.price_range,
          });

          if (!data.autoFill?.autoFilledFields?.length) {
            setEnrichmentPhase(`Found ${data.gmb.review_count || 0} reviews!`);
          }
        } else if (!data.autoFill?.autoFilledFields?.length) {
          console.log('⚠️ No GMB data found');
          setEnrichmentPhase('No reviews found (that\'s okay!)');
          setTimeout(() => setEnrichmentPhase(''), 3000);
        }
      } else {
        console.error('❌ Preview API error:', response.status);
        setEnrichmentPhase('');
      }
    } catch (err) {
      console.error('❌ Preview enrichment error:', err);
      setEnrichmentPhase('');
    }
  };

  const handleSaveContact = async (fields: OCRFields) => {
    setIsSaving(true);
    setError(null);

    try {
      // Step 1: Save contact
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fields.firstName,
          lastName: fields.lastName,
          email: fields.email,
          phone: fields.phone,
          company: fields.company,
          jobTitle: fields.jobTitle,
          cardImageUrl: uploadedImageUrl,
          cardImagePath: uploadedImagePath,
          ocrConfidence: ocrResult?.confidence,
          ocrRawText: ocrResult?.rawText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle scan limit reached
        if (errorData.error === 'scan_limit_reached') {
          setShowUpgradeModal(true);
          setIsSaving(false);
          return;
        }

        throw new Error(errorData.message || errorData.error || 'Failed to save contact');
      }

      const { contact } = await response.json();

      // Step 2: Trigger enrichment with real-time streaming
      const shouldEnrich = (fields.company || (fields.firstName && fields.lastName));

      if (shouldEnrich) {
        setStep('enriching');
        setEnrichmentPhase('Starting enrichment...');

        // Connect to SSE endpoint for real-time progress
        const eventSource = new EventSource(`/api/enrich/stream/${contact.id}`);
        let enrichmentComplete = false;

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Update progress
            setEnrichmentProgress((prev) => [...prev, {
              step: data.step,
              message: data.message,
              data: data.data,
            }]);

            // Phase 1: GMB data (PRIORITY - show immediately!)
            if (data.step === 'gmb' && data.data) {
              setEnrichmentPhase('Found Google My Business data!');
              setGmbData({
                rating: data.data.rating || 0,
                reviewCount: data.data.reviewCount || 0,
                reviews: data.data.reviews || [],
                photos: data.data.photos || [],
              });
            }

            // Phase 2: LinkedIn profile
            if (data.step === 'linkedin' && data.data?.url) {
              setEnrichmentPhase('Found LinkedIn profile!');
              setLinkedInUrl(data.data.url);
            }

            // Phase 3: Deep research
            if (data.step === 'deep') {
              setEnrichmentPhase('Deep research complete!');
            }

            // Enrichment complete
            if (data.type === 'complete') {
              enrichmentComplete = true;
              setEnrichmentPhase('Enrichment complete!');
              eventSource.close();

              // Redirect after showing results for 2 seconds
              setTimeout(() => {
                router.push(`/contacts/${contact.id}`);
              }, 2000);
            }

            // Handle errors
            if (data.type === 'error') {
              console.error('Enrichment error:', data.message);
              setEnrichmentPhase('Enrichment had some issues, but contact was saved');
              eventSource.close();

              // Still redirect after a delay
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

          // Redirect even if streaming fails - contact is already saved
          if (!enrichmentComplete) {
            setEnrichmentPhase('Enrichment continuing in background...');
            setTimeout(() => {
              router.push(`/contacts/${contact.id}`);
            }, 1500);
          }
        };

        // Timeout after 20 seconds
        setTimeout(() => {
          if (!enrichmentComplete) {
            eventSource.close();
            setEnrichmentPhase('Taking longer than expected, redirecting...');
            setTimeout(() => {
              router.push(`/contacts/${contact.id}`);
            }, 1000);
          }
        }, 20000);
      } else {
        // No enrichment needed, redirect immediately
        router.push(`/contacts/${contact.id}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save contact');
      setIsSaving(false);
    }
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
              {step === 'processing' && 'Processing...'}
              {step === 'edit' && 'Review and edit'}
              {step === 'enriching' && 'Enriching contact...'}
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

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin"
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
            <p className="text-lg font-semibold text-gray-900 mb-2">Processing your business card...</p>
            <p className="text-sm text-gray-600">
              We're extracting contact information and uploading the image.
            </p>
          </div>
        )}

        {/* Step 4: Edit */}
        {step === 'edit' && ocrResult && (
          <div className="space-y-4">
            {/* Compact Image Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ImagePreview file={capturedFile} showRetake={false} />
            </div>

            {/* GMB Preview Data (shows while user edits) */}
            {gmbData && gmbData.rating > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Header with rating and business info */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      {gmbData.name && (
                        <h3 className="font-bold text-gray-900 text-lg">{gmbData.name}</h3>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= Math.round(gmbData.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-bold text-gray-900">{gmbData.rating.toFixed(1)}</span>
                        <span className="text-gray-600">({gmbData.reviewCount.toLocaleString()} reviews)</span>
                      </div>
                      {/* Categories and hours */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-600">
                        {gmbData.categories && gmbData.categories.length > 0 && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{gmbData.categories[0]}</span>
                        )}
                        {gmbData.hours && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {gmbData.hours}
                          </span>
                        )}
                        {gmbData.priceRange && (
                          <span className="text-green-600 font-medium">{gmbData.priceRange}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                {(gmbData.address || gmbData.phone || gmbData.website) && (
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm">
                    <div className="flex flex-wrap gap-4">
                      {gmbData.address && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate max-w-[200px]">{gmbData.address}</span>
                        </div>
                      )}
                      {gmbData.phone && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{gmbData.phone}</span>
                        </div>
                      )}
                      {gmbData.website && (
                        <a href={gmbData.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos Grid */}
                {gmbData.photos && gmbData.photos.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">Business Photos</h4>
                      {gmbData.photos.length > 6 && (
                        <button
                          onClick={() => setShowAllPhotos(!showAllPhotos)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {showAllPhotos ? 'Show less' : `+${gmbData.photos.length - 6} more`}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {gmbData.photos.slice(0, showAllPhotos ? 12 : 6).map((photo, index) => (
                        <img
                          key={index}
                          src={photo.thumbnail || photo.url}
                          alt={photo.title || `Business photo ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                          onClick={() => window.open(photo.url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Reviews */}
                {gmbData.reviews && gmbData.reviews.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Customer Reviews</h4>
                      {gmbData.reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {showAllReviews ? 'Show less' : `See all ${gmbData.reviews.length} reviews`}
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {gmbData.reviews.slice(0, showAllReviews ? 10 : 3).map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                {review.author.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-900 text-sm">{review.author}</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {review.date && <span>{review.date}</span>}
                              {review.likes > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                  </svg>
                                  {review.likes}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No reviews message */}
                {(!gmbData.reviews || gmbData.reviews.length === 0) && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <p>No detailed reviews available yet.</p>
                    <p className="text-xs mt-1">Reviews will be fetched during full enrichment.</p>
                  </div>
                )}
              </div>
            )}

            {/* GMB Loading Skeleton */}
            {enrichmentPhase && !gmbData && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Header skeleton */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-yellow-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-700">{enrichmentPhase}</span>
                    </div>
                  </div>
                  {/* Skeleton content */}
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
                {/* Photos skeleton */}
                <div className="p-4 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-2 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                {/* Reviews skeleton */}
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-Fill Indicator */}
            {autoFillData && autoFillData.autoFilledFields.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900">
                      Auto-filled from {autoFillData.source === 'apollo' ? 'Apollo.io' : autoFillData.source === 'perplexity' ? 'company research' : 'multiple sources'}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {autoFillData.summary}
                    </p>
                    {autoFillData.decisionMakers && autoFillData.decisionMakers.length > 1 && (
                      <p className="text-xs text-blue-600 mt-2">
                        {autoFillData.decisionMakers.length - 1} other decision maker{autoFillData.decisionMakers.length > 2 ? 's' : ''} found
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {autoFillData.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* OCR Editor - More Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <OCRResultEditor
                initialFields={ocrResult.fields}
                confidence={ocrResult.confidence}
                onSave={handleSaveContact}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}

        {/* Step 5: Enriching - Full screen progress */}
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
          <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Scan Limit Reached</h2>
              <p className="text-gray-400 text-sm">
                You've used all your monthly scans. Upgrade to Pro for 50 scans/month, or purchase credits to continue.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  setUpgradeLoading(true);
                  try {
                    const response = await fetch('/api/stripe/create-checkout', {
                      method: 'POST',
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
                {upgradeLoading ? 'Loading...' : 'Upgrade to Pro - $9.99/mo'}
              </button>

              <button
                onClick={() => router.push('/settings')}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Buy Credits
              </button>

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
    </main>
  );
}
