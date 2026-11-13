import React from 'react';
import { Loader2, Check } from 'lucide-react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isSaving?: boolean;
  isSaved?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  isSaving = false,
  isSaved = false
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="space-y-0.5">
        <span className="text-xs font-semibold text-[#0B0B0C] block">
          {label}
        </span>
        {description && (
          <p className="text-[11px] text-[#71717A] leading-snug">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isSaving && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#0B0B0C] font-semibold">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </span>
        )}
        {isSaved && !isSaving && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium animate-in fade-in">
            <Check className="w-3 h-3" />
            <span>Saved</span>
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled || isSaving}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            checked ? 'bg-[#0B0B0C]' : 'bg-[#E4E3DD]'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
