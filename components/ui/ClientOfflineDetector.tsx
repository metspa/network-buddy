'use client';

import dynamic from 'next/dynamic';

const OfflineDetector = dynamic(() => import('./OfflineDetector'), {
  ssr: false
});

export default function ClientOfflineDetector() {
  return <OfflineDetector />;
}
