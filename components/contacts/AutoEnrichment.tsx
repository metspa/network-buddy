'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Contact = {
  id: string;
  enrichment_status: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
};

type AutoEnrichmentProps = {
  contact: Contact;
};

type ProgressStep = {
  step: string;
  message: string;
  timestamp: number;
};

export default function AutoEnrichment({ contact }: AutoEnrichmentProps) {
  const router = useRouter();
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    // Auto-trigger enrichment for pending contacts
    if (contact.enrichment_status === 'pending' && !isEnriching) {
      triggerEnrichment();
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [contact.id, contact.enrichment_status]);

  const triggerEnrichment = async () => {
    setIsEnriching(true);
    setError(null);
    setProgressSteps([]);
    setCurrentStep('');
    setProgressMessage('Starting enrichment...');

    try {
      // Connect to SSE stream
      const eventSource = new EventSource(`/api/enrich/stream/${contact.id}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data);
        setCurrentStep(data.step || '');
        setProgressMessage(data.message);
        setProgressSteps((prev) => [
          ...prev,
          {
            step: data.step || 'unknown',
            message: data.message,
            timestamp: Date.now(),
          },
        ]);
      });

      eventSource.addEventListener('complete', (event) => {
        const data = JSON.parse(event.data);
        setProgressMessage(data.message);
        setCurrentStep('complete');

        // Close connection
        eventSource.close();
        eventSourceRef.current = null;

        // Refresh the page after a short delay
        setTimeout(() => {
          setIsEnriching(false);
          router.refresh();
        }, 1500);
      });

      eventSource.addEventListener('error', (event: any) => {
        console.error('SSE error:', event);

        const data = event.data ? JSON.parse(event.data) : null;
        const errorMessage = data?.message || 'Enrichment failed';

        setError(errorMessage);
        setIsEnriching(false);
        setCurrentStep('error');

        // Close connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection if connection dropped unexpectedly
        if (!data?.message && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          setProgressMessage(`Connection lost. Retrying (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            triggerEnrichment();
          }, 2000);
        } else {
          reconnectAttemptsRef.current = 0;
          router.refresh(); // Refresh to check final status
        }
      });

      // Handle connection errors
      eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE connection closed');
        }
      };
    } catch (err) {
      console.error('Enrichment error:', err);
      setError(err instanceof Error ? err.message : 'Enrichment failed');
      setIsEnriching(false);
    }
  };

  const handleManualRetry = () => {
    reconnectAttemptsRef.current = 0;
    triggerEnrichment();
  };

  // Get step icon and color
  const getStepIcon = (step: string) => {
    const icons: Record<string, string> = {
      fetch: '📋',
      linkedin: '💼',
      company: '🏢',
      news: '📰',
      reputation: '⭐',
      ai: '🤖',
      save: '💾',
      complete: '✅',
    };
    return icons[step] || '⏳';
  };

  // Show enrichment status
  if (contact.enrichment_status === 'pending' || contact.enrichment_status === 'processing' || isEnriching) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0 mt-0.5"
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
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              {currentStep === 'complete' ? 'Research Complete!' : 'Researching Contact'}
            </p>
            <p className="text-sm text-blue-700 mb-3">{progressMessage}</p>

            {/* Progress steps */}
            {progressSteps.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {progressSteps.slice(-4).map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-blue-600">
                    <span>{getStepIcon(step.step)}</span>
                    <span className="opacity-80">{step.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (contact.enrichment_status === 'failed' || (error && !isEnriching)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Enrichment Failed</p>
            {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
            <button
              onClick={handleManualRetry}
              disabled={isEnriching}
              className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 min-h-[40px] touch-manipulation"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completed enrichment - show re-enrich button
  if (contact.enrichment_status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-semibold text-green-900">Research Complete</p>
          </div>
          <button
            onClick={handleManualRetry}
            disabled={isEnriching}
            className="px-3 py-2 text-sm text-green-700 hover:text-green-800 font-medium hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 min-h-[40px] touch-manipulation"
          >
            Re-research
          </button>
        </div>
      </div>
    );
  }

  return null;
}
