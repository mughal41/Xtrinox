import React from 'react';
import { Package } from 'lucide-react';
import {
  ProductKey,
  normalizeProductKey,
  getProductBrandMeta
} from '../utils/productIdentity';

export interface ProductIconProps extends React.SVGProps<SVGSVGElement> {
  productId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  brandColored?: boolean;
  className?: string;
}

const SIZE_MAP: Record<string, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-9 h-9',
  '2xl': 'w-12 h-12'
};

/**
 * Renders the authentic, recognizable SVG logo for any Xtrinox marketplace product.
 * Falls back gracefully to a clean package icon for unrecognized tools.
 */
export const ProductIcon: React.FC<ProductIconProps> = ({
  productId,
  size = 'md',
  brandColored = false,
  className = '',
  style,
  ...rest
}) => {
  const key = normalizeProductKey(productId);
  const meta = key ? getProductBrandMeta(key) : null;

  const sizeClass = typeof size === 'number' ? '' : SIZE_MAP[size] || SIZE_MAP.md;
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};

  const iconStyle: React.CSSProperties = {
    ...sizeStyle,
    ...(brandColored && meta ? { color: meta.brandColor } : {}),
    ...style
  };

  if (!key || !meta) {
    return (
      <Package
        className={`${sizeClass} shrink-0 ${className}`}
        style={iconStyle}
        aria-hidden="true"
      />
    );
  }

  // 1. ChatGPT (OpenAI Spiral)
  if (key === 'chatgpt') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${sizeClass} shrink-0 transition-transform ${className}`}
        style={iconStyle}
        aria-label={meta.canonicalName}
        {...rest}
      >
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0201-1.1683a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4022-.6815zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6613zM8.3065 12.863l-2.02-1.1636a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813l-.0048 6.7219zm1.145-1.9221l2.5484-1.472 2.5483 1.472v2.944l-2.5483 1.472-2.5484-1.472z" />
      </svg>
    );
  }

  // 2. Claude AI (Anthropic Starburst)
  if (key === 'claude') {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${sizeClass} shrink-0 transition-transform ${className}`}
        style={iconStyle}
        aria-label={meta.canonicalName}
        {...rest}
      >
        <g stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" fill="none">
          <path d="M24 4v11M24 33v11M4 24h11M33 24h11M10 10l8 8m12 12 8 8M38 10l-8 8M18 30l-8 8M5.5 15.5 10 19m28 10 4.5 3.5M15.5 5.5 19 10m10 28 3.5 4.5M5.5 32.5 10 29m28-10 4.5-3.5M15.5 42.5 19 38m10-28 3.5-4.5" />
        </g>
      </svg>
    );
  }

  // 3. QuillBot Pro (Writing Assistant Glyph)
  if (key === 'quillbot') {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${sizeClass} shrink-0 transition-transform ${className}`}
        style={iconStyle}
        aria-label={meta.canonicalName}
        {...rest}
      >
        <rect x="8" y="12" width="32" height="28" rx="9" fill="currentColor" />
        <path d="M18 12V7m12 5V7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="18" cy="24" r="2.9" fill="white" />
        <circle cx="30" cy="24" r="2.9" fill="white" />
        <rect x="18" y="31" width="12" height="2.8" rx="1.4" fill="white" />
      </svg>
    );
  }

  // 4. Stealth Writer (Shield / Brain Nuance Glyph)
  if (key === 'stealth') {
    return (
      <svg
        viewBox="0 0 48 48"
        className={`${sizeClass} shrink-0 transition-transform ${className}`}
        style={iconStyle}
        aria-label={meta.canonicalName}
        {...rest}
      >
        <path
          d="M24 7c-4-6-13-3-13 4-8 1-9 13-3 16-3 7 3 14 10 12 3 4 9 4 12 0 7 2 13-5 10-12 6-3 5-15-3-16-1-7-9-10-13-4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.3"
        />
        <path
          d="M24 7v34M13 19c7 1 5 8 11 7m11-7c-7 1-5 8-11 7m-9 7c6-3 7-1 9 0m9 0c-6-3-7-1-9 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 5. Turnitin Instructor (Similarity Return Arrow)
  return (
    <svg
      viewBox="0 0 48 48"
      className={`${sizeClass} shrink-0 transition-transform ${className}`}
      style={iconStyle}
      aria-label={meta.canonicalName}
      {...rest}
    >
      <path
        d="M13 10h24v24H25M19 39l14-14m0 0H20m13 0v13"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export interface ProductAvatarProps {
  productId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  brandColored?: boolean;
  className?: string;
  containerClassName?: string;
}

const AVATAR_CONTAINER_SIZE: Record<string, string> = {
  xs: 'w-6 h-6 rounded-md p-1',
  sm: 'w-7 h-7 rounded-lg p-1',
  md: 'w-9 h-9 rounded-xl p-1.5',
  lg: 'w-12 h-12 rounded-xl p-2',
  xl: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5 sm:p-3',
  '2xl': 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-3 sm:p-3.5'
};

const AVATAR_ICON_SIZE: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
  '2xl': 'xl'
};

/**
 * Standardized, theme-faithful product avatar container.
 * Surfaces pure Chalk White / Ink Black aesthetics with subtle borders and centering.
 */
export const ProductAvatar: React.FC<ProductAvatarProps> = ({
  productId,
  size = 'md',
  brandColored = false,
  className = '',
  containerClassName = ''
}) => {
  const containerSize = AVATAR_CONTAINER_SIZE[size] || AVATAR_CONTAINER_SIZE.md;
  const iconSize = AVATAR_ICON_SIZE[size] || 'sm';

  return (
    <div
      className={`bg-white border border-[#E4E3DD] flex items-center justify-center shrink-0 shadow-2xs text-[#0B0B0C] ${containerSize} ${containerClassName}`}
    >
      <ProductIcon
        productId={productId}
        size={iconSize}
        brandColored={brandColored}
        className={className}
      />
    </div>
  );
};
