import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  helperText?: string;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  helperText,
  error,
  id,
  className = '',
  ...props
}) => {
  const fieldId = id || `select_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="text-xs font-semibold text-[#0B0B0C] block"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          className={`w-full appearance-none rounded-xl border ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-[#E4E3DD] focus:border-[#0B0B0C] focus:ring-[#0B0B0C]/10'
          } bg-[#FAF9F5] text-[#0B0B0C] text-xs pl-3.5 pr-9 py-2.5 focus:outline-none focus:ring-2 transition-all cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#71717A]">{helperText}</p>
      ) : null}
    </div>
  );
};
