import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

interface SensitiveDataNoticeProps {
  message?: string;
  variant?: 'subtle' | 'banner';
}

export const SensitiveDataNotice: React.FC<SensitiveDataNoticeProps> = ({
  message = 'Restricted administrative surface. Raw payloads are securely masked and isolated to authorized admin sessions.',
  variant = 'subtle'
}) => {
  if (variant === 'banner') {
    return (
      <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Confidential Admin Surface</span>
          <span className="text-[11px] text-amber-800">
            {message}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[11px] text-[#71717A] bg-[#FAF9F5] border border-[#E4E3DD] px-3 py-1.5 rounded-lg">
      <Lock className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
      <span>{message}</span>
    </div>
  );
};
