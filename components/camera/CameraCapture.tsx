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
    <div className="w-full max-w-md mx-auto">
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

      {/* Camera capture area - compact and dark themed */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center
          transition-all cursor-pointer
          py-12 px-8
          ${
            disabled
              ? 'bg-gray-800/50 border-gray-600 cursor-not-allowed'
              : isDragging
              ? 'bg-violet-500/20 border-violet-400 shadow-lg shadow-violet-500/20'
              : 'bg-gray-800/50 border-gray-600 hover:border-violet-400 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/10'
          }
        `}
      >
        {/* Camera icon with gradient */}
        <div className={`
          p-4 rounded-2xl mb-4 transition-all
          ${disabled
            ? 'bg-gray-700'
            : isDragging
            ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/50'
            : 'bg-gradient-to-br from-violet-500/80 to-purple-600/80 group-hover:from-violet-500 group-hover:to-purple-600'
          }
        `}>
          <svg
            className="w-10 h-10 text-white"
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
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className={`text-lg font-semibold mb-1 ${disabled ? 'text-gray-500' : 'text-white'}`}>
            {disabled ? 'Processing...' : 'Tap to scan card'}
          </p>
          <p className={`text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
            or drag and drop an image
          </p>
        </div>

        {/* Mobile hint */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Camera opens automatically on mobile
        </p>
      </div>

      {/* Tips - dark themed */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <p className="font-medium text-gray-300 text-sm mb-2">Tips for best results:</p>
        <ul className="space-y-1 text-xs text-gray-400">
          <li className="flex items-center gap-2">
            <span className="text-green-400">•</span>
            Good lighting
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">•</span>
            Keep card flat and in frame
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">•</span>
            Make sure text is readable
          </li>
        </ul>
      </div>
    </div>
  );
}
