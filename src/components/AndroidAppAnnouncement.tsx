import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/useAuthStore';
import { ModernModal } from './ModernModal';

const ANNOUNCEMENT_ID = 'android-app-v1';

export const AndroidAppAnnouncement: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const readKey = user ? `xtrinox:announcement:${ANNOUNCEMENT_ID}:${user.uid}` : '';
  const disabledKey = user ? `xtrinox:announcement:android-app-disabled:${user.uid}` : '';

  React.useEffect(() => {
    if (!user || location.pathname !== '/marketplace') {
      setIsOpen(false);
      return;
    }

    try {
      const wasRead = window.localStorage.getItem(readKey) === 'read';
      const isDisabled = window.localStorage.getItem(disabledKey) === 'true';
      setIsOpen(!wasRead && !isDisabled);
    } catch {
      setIsOpen(true);
    }
  }, [disabledKey, location.pathname, readKey, user]);

  const markAsRead = () => {
    try {
      window.localStorage.setItem(readKey, 'read');
    } catch {
      // Storage may be disabled; closing still works for the current page.
    }
    setIsOpen(false);
  };

  const disableFutureAnnouncements = () => {
    try {
      window.localStorage.setItem(disabledKey, 'true');
    } catch {
      // Storage may be disabled; closing still works for the current page.
    }
    setIsOpen(false);
  };

  const viewAndroidApp = () => {
    markAsRead();
    navigate('/workspace?androidApp=1');
  };

  return (
    <ModernModal isOpen={isOpen} maxWidth="max-w-[520px]">
      <div className="p-5 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-fixed-dim bg-primary-fixed text-primary shadow-sm sm:mb-6 sm:h-20 sm:w-20">
          <span className="material-symbols-outlined text-[34px] sm:text-[40px]">android</span>
        </div>
        <span className="mb-3 inline-flex rounded-full bg-primary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary-fixed-variant">
          New release
        </span>
        <h2 className="text-xl font-bold text-on-surface sm:text-2xl">Xtrinox is now on Android</h2>
        <p className="mx-auto mt-3 max-w-[380px] text-[14px] leading-6 text-on-surface-variant sm:text-[15px]">
          Access your eligible Xtrinox products from the lightweight, signed Xtrinox Android app.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-left">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">Version</span>
            <span className="mt-1 block text-sm font-bold text-on-surface">1.0.2</span>
          </div>
          <div className="border-l border-outline-variant pl-4">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">Download</span>
            <span className="mt-1 block text-sm font-bold text-on-surface">3.00 MB</span>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <button
            onClick={viewAndroidApp}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">smartphone</span>
            View Android App
          </button>
          <button
            onClick={markAsRead}
            className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-6 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            Mark as read
          </button>
          <button
            onClick={disableFutureAnnouncements}
            className="mt-1 text-xs font-semibold text-outline transition-colors hover:text-primary"
          >
            Don’t show Android app announcements again
          </button>
        </div>
      </div>
    </ModernModal>
  );
};
