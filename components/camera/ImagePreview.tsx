'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

type ImagePreviewProps = {
  file: File | null;
  onRetake?: () => void;
  showRetake?: boolean;
};

export default function ImagePreview({ file, onRetake, showRetake = true }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file || !preview) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden max-h-[200px]">
        <Image
          src={preview}
          alt="Business card preview"
          fill
          className="object-contain"
        />

        {/* Overlay with retake button */}
        {showRetake && onRetake && (
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onRetake}
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retake Photo
            </button>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="mt-2 text-xs text-gray-600">
        <p>
          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      </div>
    </div>
  );
}
