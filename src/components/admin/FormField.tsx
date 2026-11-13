import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  isTextarea?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  isTextarea = false,
  rows = 4,
  className = '',
  id,
  ...props
}) => {
  const fieldId = id || `field_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const baseClasses = `w-full rounded-xl border ${
    error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-[#E4E3DD] focus:border-[#0B0B0C] focus:ring-[#0B0B0C]/10'
  } bg-[#FAF9F5] text-[#0B0B0C] text-xs px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all placeholder:text-[#71717A] ${className}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold text-[#0B0B0C]"
        >
          {label}
        </label>
        {props.required && (
          <span className="text-[10px] text-[#71717A] font-medium">Required</span>
        )}
      </div>

      {isTextarea ? (
        <textarea
          id={fieldId}
          rows={rows}
          className={baseClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          className={baseClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error ? (
        <p className="text-[11px] font-medium text-rose-600">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#71717A]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
