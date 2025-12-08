'use client';

import { useState, useRef } from 'react';

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  disabled?: boolean;
};

export default function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onCapture(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Camera capture area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative aspect-[4/3] rounded-lg border-2 border-dashed
          flex flex-col items-center justify-center
          transition-all cursor-pointer
          ${
            disabled
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
              : isDragging
              ? 'bg-blue-50 border-blue-500'
              : 'bg-gray-50 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        {/* Camera icon */}
        <svg
          className={`w-16 h-16 mb-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>

        {/* Instructions */}
        <div className="text-center px-4">
          <p className={`text-base font-medium mb-1 ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {disabled ? 'Processing...' : 'Tap to capture business card'}
          </p>
          <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
            or drag and drop an image
          </p>
        </div>

        {/* Mobile hint */}
        <p className="text-xs text-gray-400 mt-4 px-4 text-center">
          Your camera will open automatically on mobile devices
        </p>
      </div>

      {/* Tips */}
      <div className="mt-4 text-xs text-gray-600">
        <p className="font-medium mb-1">For best results:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Use good lighting</li>
          <li>Keep the card flat and in frame</li>
          <li>Make sure all text is readable</li>
        </ul>
      </div>
    </div>
  );
}
