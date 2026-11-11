import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  accentColor?: string;
}

export const ModernModal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onMinimize,
  children, 
  maxWidth = 'max-w-[480px]',
  accentColor = 'bg-primary'
}) => {
  if (!isOpen) return null;

  const resolvedMaxWidth = (() => {
    if (maxWidth === 'max-w-md') return '448px';
    if (maxWidth === 'max-w-lg') return '512px';
    const arbitraryWidth = maxWidth.match(/max-w-\[(\d+)px\]/)?.[1];
    return arbitraryWidth ? `${arbitraryWidth}px` : '480px';
  })();

  const resolvedAccentColor = accentColor === 'bg-error'
    ? '#ba1a1a'
    : accentColor === 'bg-tertiary'
      ? '#924700'
      : '#0058be';

  const modalContent = (
    <div 
      className="xt-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 3vw, 24px)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        className="xt-modal-content animate-in zoom-in-95 duration-300"
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: resolvedMaxWidth,
          maxHeight: 'calc(100dvh - 20px)',
          borderRadius: 'clamp(16px, 3vw, 24px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflowX: 'hidden',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div style={{ height: '6px', width: '100%', flexShrink: 0, backgroundColor: resolvedAccentColor }}></div>
        
        {onMinimize && (
          <button
            onClick={onMinimize}
            aria-label="Minimize dialog"
            title="Minimize"
            style={{
              position: 'absolute',
              top: '16px',
              right: onClose ? '48px' : '16px',
              color: '#727785',
              backgroundColor: '#f2f3fd',
              border: '1px solid #c2c6d6',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>minimize</span>
          </button>
        )}

        {onClose && (
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              zIndex: 10
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
