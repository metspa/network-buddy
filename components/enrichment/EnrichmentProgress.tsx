'use client';

import { useState, useEffect } from 'react';

type EnrichmentStep = {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
};

type EnrichmentProgressProps = {
  currentPhase: string;
  progress: { step: string; message: string; data?: any }[];
  onComplete?: () => void;
};

const ENRICHMENT_STEPS: Omit<EnrichmentStep, 'status' | 'message'>[] = [
  {
    id: 'gmb',
    label: 'Google Reviews',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Profile',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    id: 'perplexity',
    label: 'Deep Research',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'complete',
    label: 'Complete',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export default function EnrichmentProgress({ currentPhase, progress }: EnrichmentProgressProps) {
  const [steps, setSteps] = useState<EnrichmentStep[]>(
    ENRICHMENT_STEPS.map((step) => ({ ...step, status: 'pending' }))
  );
  const [currentMessage, setCurrentMessage] = useState('Starting enrichment...');
  const [progressPercent, setProgressPercent] = useState(5);

  // Map SSE step IDs to our step IDs
  const stepMapping: Record<string, string> = {
    'gmb': 'gmb',
    'linkedin': 'linkedin',
    'deep': 'perplexity',
    'perplexity': 'perplexity',
    'summary': 'ai',
    'ai': 'ai',
    'complete': 'complete',
  };

  useEffect(() => {
    if (progress.length === 0) return;

    const latestProgress = progress[progress.length - 1];
    setCurrentMessage(latestProgress.message);

    // Update step statuses based on progress
    const completedStepIds = new Set<string>();
    let activeStepId: string | null = null;

    progress.forEach((p) => {
      const mappedId = stepMapping[p.step] || p.step;
      if (p.step !== 'error') {
        completedStepIds.add(mappedId);
      }
    });

    // Find the active step (last one that's completed)
    const mappedLatest = stepMapping[latestProgress.step] || latestProgress.step;
    activeStepId = mappedLatest;

    // Calculate progress percentage
    const stepOrder = ['gmb', 'linkedin', 'perplexity', 'ai', 'complete'];
    const currentIndex = stepOrder.indexOf(mappedLatest);
    const newPercent = Math.min(100, ((currentIndex + 1) / stepOrder.length) * 100);
    setProgressPercent(newPercent);

    setSteps((prevSteps) =>
      prevSteps.map((step) => {
        const isCompleted = completedStepIds.has(step.id) && step.id !== activeStepId;
        const isActive = step.id === activeStepId;
        return {
          ...step,
          status: isCompleted ? 'completed' : isActive ? 'active' : 'pending',
          message: isActive ? latestProgress.message : step.message,
        };
      })
    );
  }, [progress]);

  // Also update based on currentPhase for immediate feedback
  useEffect(() => {
    if (currentPhase) {
      setCurrentMessage(currentPhase);
    }
  }, [currentPhase]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent pb-8 pt-2 px-4">
      <div className="max-w-screen-lg mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 shadow-2xl">
          {/* Header with animated icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-xl border-2 border-violet-400 animate-ping opacity-30" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Researching Contact</h3>
              <p className="text-gray-400 text-sm truncate">{currentMessage}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${step.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : step.status === 'active'
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50 animate-pulse'
                        : 'bg-gray-700/50 text-gray-500 border border-gray-600/50'
                      }
                    `}
                  >
                    {step.status === 'completed' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.status === 'active' ? (
                      <div className="relative">
                        {step.icon}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </div>
                    ) : (
                      step.icon
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`
                      mt-2 text-xs font-medium text-center
                      ${step.status === 'completed'
                        ? 'text-green-400'
                        : step.status === 'active'
                        ? 'text-violet-400'
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-1/2 w-full h-0.5 bg-gray-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        step.status === 'completed' ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Live feed of what's happening */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-start gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 animate-pulse" />
              <div className="flex-1">
                <span className="text-gray-400">Live: </span>
                <span className="text-gray-300">{currentMessage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
