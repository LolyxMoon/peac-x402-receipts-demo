'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
    >
      {copied ? '✓ Copied!' : label}
    </button>
  );
}
