import React from 'react';
import { assetUrl } from '../utils/assetUrl';

export interface BrandSpinnerProps {
  /** Size preset: xs (16px), sm (20px), md (28px), lg (40px), xl (56px) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom extra classes */
  className?: string;
  /** Tone for the mark: 'dark' (Ink Black) or 'acid' (Acid Green) */
  tone?: 'dark' | 'acid';
  /** Style variant: 'mark-spin' (default: pure minimal spinning logo) or 'orbital' (with delicate spinning arc) */
  variant?: 'mark-spin' | 'orbital';
  /** Compatibility prop: always transparent */
  badge?: boolean;
}

export const BrandSpinner: React.FC<BrandSpinnerProps> = ({
  size = 'md',
  className = '',
  tone = 'dark',
  variant = 'mark-spin'
}) => {
  const dimensions = {
    xs: { wrapper: 'w-4 h-4', markPx: 16 },
    sm: { wrapper: 'w-5 h-5', markPx: 20 },
    md: { wrapper: 'w-7 h-7', markPx: 28 },
    lg: { wrapper: 'w-10 h-10', markPx: 40 },
    xl: { wrapper: 'w-14 h-14', markPx: 56 },
  }[size];

  const markSrc =
    tone === 'acid'
      ? assetUrl('assets/aistudio/main3_6b2be1d5.png') // Acid Green X
      : assetUrl('assets/aistudio/main4_2dfa90c9.png'); // Ink Black X

  if (variant === 'orbital') {
    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 bg-transparent ${dimensions.wrapper} ${className}`}
        role="status"
        aria-label="Loading"
      >
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '1.1s' }}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[var(--border)] opacity-30"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#B6FF2E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset="85"
          />
        </svg>
        <img
          src={markSrc}
          alt="Loading"
          width={Math.round(dimensions.markPx * 0.65)}
          height={Math.round(dimensions.markPx * 0.65)}
          className="object-contain select-none"
          loading="eager"
          decoding="async"
        />
      </span>
    );
  }

  // Pure minimal transparent spinning logo (default)
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 bg-transparent ${dimensions.wrapper} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <img
        src={markSrc}
        alt="Loading"
        width={dimensions.markPx}
        height={dimensions.markPx}
        className="w-full h-full object-contain animate-spin select-none"
        style={{ animationDuration: '1.4s' }}
        loading="eager"
        decoding="async"
      />
    </span>
  );
};
