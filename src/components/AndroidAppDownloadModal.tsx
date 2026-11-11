import React from 'react';
import { ModernModal } from './ModernModal';

interface AndroidAppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const AndroidAppDownloadModal: React.FC<AndroidAppDownloadModalProps> = ({
  isOpen,
  onClose,
  onMinimize
}) => (
  <ModernModal
    isOpen={isOpen}
    onClose={onClose}
    onMinimize={onMinimize}
    maxWidth="max-w-[520px]"
  >
    <div className="p-5 sm:p-10">
      <div className="mb-5 flex items-start gap-3 pr-14 sm:mb-6 sm:gap-4 sm:pr-16">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary sm:h-14 sm:w-14 sm:rounded-2xl">
          <span className="material-symbols-outlined text-[26px] sm:text-[30px]">android</span>
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary sm:text-[10px]">Official Android app</span>
          <h2 className="mt-1 text-xl font-bold leading-tight text-on-surface sm:text-2xl">Xtrinox for Android</h2>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant sm:text-sm">
            Access your eligible Xtrinox products from one focused mobile workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
        <div className="px-2 py-3 text-center sm:p-4">
          <span className="block text-[8px] font-bold uppercase tracking-wider text-outline sm:text-[9px]">Version</span>
          <span className="mt-1 block text-xs font-bold text-on-surface sm:text-sm">1.0.2</span>
        </div>
        <div className="border-x border-outline-variant px-2 py-3 text-center sm:p-4">
          <span className="block text-[8px] font-bold uppercase tracking-wider text-outline sm:text-[9px]">Size</span>
          <span className="mt-1 block text-xs font-bold text-on-surface sm:text-sm">3.00 MB</span>
        </div>
        <div className="px-2 py-3 text-center sm:p-4">
          <span className="block text-[8px] font-bold uppercase tracking-wider text-outline sm:text-[9px]">Requires</span>
          <span className="mt-1 block text-xs font-bold text-on-surface sm:text-sm">Android 7+</span>
        </div>
      </div>

      <div className="mt-5 space-y-3 sm:mt-6">
        {[
          'One app for all supported Xtrinox product entitlements.',
          'Signed production release with secure Firebase authentication.',
          'Lightweight installation with optimized session handling.'
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-[13px] leading-5 text-on-surface-variant sm:gap-3 sm:text-sm">
            <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary">check_circle</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <a
        href={`${import.meta.env.BASE_URL}downloads/Xtrinox-v1.0.2-release.apk`}
        download
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.98] sm:mt-7 sm:h-12 sm:text-base"
      >
        <span className="material-symbols-outlined text-[20px]">download</span>
        Download APK
      </a>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-outline sm:mt-4 sm:text-[11px]">
        <span className="material-symbols-outlined text-[15px]">verified_user</span>
        Signed release • Updated 11 November 2026
      </div>
    </div>
  </ModernModal>
);

export const AndroidAppRestoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-3 right-3 z-[9998] flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-left shadow-xl transition-all hover:-translate-y-0.5 hover:border-primary sm:bottom-5 sm:right-5 sm:px-4 sm:py-3"
    aria-label="Restore Android app download dialog"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
      <span className="material-symbols-outlined text-[20px]">android</span>
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[12px] font-bold text-on-surface">Xtrinox for Android</span>
      <span className="block truncate text-[10px] font-medium text-on-surface-variant">Tap to restore download</span>
    </span>
    <span className="material-symbols-outlined shrink-0 text-[18px] text-primary">open_in_full</span>
  </button>
);
