'use client';

import { useState } from 'react';
import Iconify from './Iconify';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'outline';
}

export default function CopyButton({ text, className = '', variant = 'default' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baseStyles = variant === 'outline'
    ? 'bg-transparent shadow-sm border border-border text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
    : 'bg-primary text-primary-foreground opacity-90 hover:opacity-100 shadow-sm hover:translate-y-[-1px]';

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-all ${baseStyles} ${className}`}
    >
      <Iconify icon={copied ? 'solar:check-circle-linear' : 'solar:copy-linear'} />
      {copied ? 'Copied!' : 'Copy Prompt'}
    </button>
  );
}
