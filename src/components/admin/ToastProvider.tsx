import React, { useEffect, useState } from 'react';
import { adminStore } from '../../services/adminStore';
import { ToastItem } from '../../types/admin';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastProvider: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>(adminStore.toasts);

  useEffect(() => {
    return adminStore.subscribe(() => {
      setToasts([...adminStore.toasts]);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border border-[#E4E3DD] bg-white/95 text-[#0B0B0C] shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 fade-in duration-200"
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#0B0B0C]" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold leading-tight">{t.title}</h4>
            {t.message && (
              <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                {t.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => adminStore.removeToast(t.id)}
            className="p-1 rounded-md text-[#71717A] hover:text-[#0B0B0C] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
