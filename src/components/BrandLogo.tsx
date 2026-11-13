import React from 'react';
import { assetUrl } from '../utils/assetUrl';

export type BrandLogoVariant =
  | 'dark'       // Ink Black X mark (default for light surfaces)
  | 'acid'       // Acid Green X mark (for dark surfaces)
  | 'app-dark'   // Black squircle with Acid Green X
  | 'app-acid'   // Acid Green squircle with Ink Black X
  | 'banner-dark'  // Full official dark pill banner
  | 'banner-light'; // Full official light pill banner

export interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  markOnly?: boolean;
  variant?: BrandLogoVariant;
  withDot?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  markOnly = false,
  variant = 'dark',
  withDot = true
}) => {
  // Full pre-rendered pill banners
  if (variant === 'banner-dark') {
    const bannerHeight = size === 'xs' ? 'h-6' : size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : size === 'xl' ? 'h-14' : 'h-10';
    const bannerHeightPx = size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'lg' ? 48 : size === 'xl' ? 56 : 40;
    return (
      <img
        src={assetUrl('assets/aistudio/main5_466adf9a.png')}
        alt="Xtrinox"
        width={bannerHeightPx * 4}
        height={bannerHeightPx}
        className={`${bannerHeight} w-auto object-contain select-none ${className}`}
        loading="eager"
        decoding="async"
      />
    );
  }

  if (variant === 'banner-light') {
    const bannerHeight = size === 'xs' ? 'h-6' : size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : size === 'xl' ? 'h-14' : 'h-10';
    const bannerHeightPx = size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'lg' ? 48 : size === 'xl' ? 56 : 40;
    return (
      <img
        src={assetUrl('assets/aistudio/main6_17556724.png')}
        alt="Xtrinox"
        width={bannerHeightPx * 4}
        height={bannerHeightPx}
        className={`${bannerHeight} w-auto object-contain select-none ${className}`}
        loading="eager"
        decoding="async"
      />
    );
  }

  // Dimension mapping
  const markSize =
    size === 'xs'
      ? 'w-4 h-4'
      : size === 'sm'
      ? 'w-5 h-5'
      : size === 'lg'
      ? 'w-8 h-8 sm:w-9 sm:h-9'
      : size === 'xl'
      ? 'w-10 h-10 sm:w-12 sm:h-12'
      : 'w-6 h-6 sm:w-7 sm:h-7';

  const markPx =
    size === 'xs'
      ? 16
      : size === 'sm'
      ? 20
      : size === 'lg'
      ? 36
      : size === 'xl'
      ? 48
      : 28;

  const textSize =
    size === 'xs'
      ? 'text-xs'
      : size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-2xl'
      : size === 'xl'
      ? 'text-3xl'
      : 'text-lg sm:text-xl';

  const dotSize =
    size === 'xs'
      ? 'w-1.5 h-1.5'
      : size === 'sm'
      ? 'w-1.5 h-1.5'
      : size === 'lg'
      ? 'w-2.5 h-2.5'
      : size === 'xl'
      ? 'w-3 h-3'
      : 'w-2 h-2';

  // Mark asset selection
  let assetSrc = assetUrl('assets/aistudio/main4_2dfa90c9.png'); // Ink Black mark
  if (variant === 'acid') {
    assetSrc = assetUrl('assets/aistudio/main3_6b2be1d5.png'); // Acid Green mark
  } else if (variant === 'app-dark') {
    assetSrc = assetUrl('assets/aistudio/main2_dc044820.png'); // Black squircle app icon
  } else if (variant === 'app-acid') {
    assetSrc = assetUrl('assets/aistudio/main_3e408729.png'); // Acid squircle app icon
  }

  return (
    <div
      className={`inline-flex items-center gap-2 select-none tracking-tight ${className}`}
      aria-label="Xtrinox"
    >
      <img
        src={assetSrc}
        alt="Xtrinox Symbol"
        width={markPx}
        height={markPx}
        className={`${markSize} object-contain shrink-0`}
        loading="eager"
        decoding="async"
      />
      {!markOnly && (
        <span className={`font-heading font-black tracking-[-0.045em] text-[var(--text)] flex items-center gap-1.5 ${textSize}`}>
          <span>Xtrinox</span>
          {withDot && (
            <span
              className={`${dotSize} rounded-full bg-[#B6FF2E] shrink-0 inline-block shadow-[0_0_8px_rgba(182,255,46,0.8)]`}
              aria-hidden="true"
            />
          )}
        </span>
      )}
    </div>
  );
};
