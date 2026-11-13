import React from 'react';
import { RouteName } from '../types';
import { BrandLogo } from './BrandLogo';
import { PAYMENT_DESTINATIONS } from '../data/products';

interface SharedFooterProps {
  onNavigate: (route: RouteName) => void;
}

export const SharedFooter: React.FC<SharedFooterProps> = ({ onNavigate }) => {
  const cleanNumber = PAYMENT_DESTINATIONS.whatsappNumber.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanNumber}?text=Hello%20Xtrinox%20Support`;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-deep)] text-[var(--muted)] text-xs py-7 transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BrandLogo size="xs" variant="dark" withDot />
          <span className="text-[var(--border-strong)]">·</span>
          <span className="text-[var(--sub)]">AI tools, thoughtfully managed.</span>
        </div>

        <nav aria-label="Footer legal and support links" className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-[var(--sub)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            Marketplace
          </button>
          <span className="text-[var(--sub)] cursor-default">
            Privacy Policy
          </span>
          <span className="text-[var(--sub)] cursor-default">
            Terms of Service
          </span>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--sub)] hover:text-[var(--brand)] transition-colors cursor-pointer"
          >
            WhatsApp Support
          </a>
        </nav>
      </div>
    </footer>
  );
};
