import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    md: 'md:max-w-md',
    lg: 'md:max-w-xl',
    xl: 'md:max-w-2xl'
  }[width];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-[#0B0B0C]/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${widthClass} h-full bg-white border-l border-[#E4E3DD] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-5 border-b border-[#E4E3DD] bg-white/95 backdrop-blur-xs shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#0B0B0C] font-heading">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#71717A] mt-0.5 truncate max-w-sm">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#0B0B0C]">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="sticky bottom-0 z-20 p-4 border-t border-[#E4E3DD] bg-[#FAF9F5]/95 backdrop-blur-xs shrink-0 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
