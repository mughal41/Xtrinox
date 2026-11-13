import React, { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Sparkles } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  height?: string;
  error?: string;
  helperText?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  label = 'Cookie JSON Array',
  placeholder,
  height = 'h-48',
  error,
  helperText
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 2000);
    } catch {
      // Keep as-is if invalid
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#0B0B0C]">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#71717A] hover:text-[#0B0B0C] p-1 rounded hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            title="Beautify JSON"
          >
            {formatSuccess ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Formatted</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Format</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsRevealed(!isRevealed)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#71717A] hover:text-[#0B0B0C] p-1 rounded hover:bg-[#FAF9F5] transition-colors cursor-pointer"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-3 h-3 text-[#71717A]" />
                <span>Mask Payload</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-[#71717A]" />
                <span>Reveal Payload</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`w-full ${height} rounded-xl border ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-[#E4E3DD] focus:border-[#0B0B0C] focus:ring-[#0B0B0C]/10'
          } bg-[#0B0B0C] text-[#B6FF2E] font-mono text-[11px] leading-relaxed p-3.5 focus:outline-none focus:ring-2 transition-all resize-y ${
            !isRevealed ? 'blur-xs select-none' : ''
          }`}
        />
        {!isRevealed && (
          <div
            onClick={() => setIsRevealed(true)}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0B0C]/40 rounded-xl cursor-pointer backdrop-blur-xs transition-opacity hover:bg-[#0B0B0C]/30"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0B0C] border border-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-lg">
              <Eye className="w-3.5 h-3.5 text-[#B6FF2E]" />
              <span>Click to Reveal Masked JSON</span>
            </div>
            <span className="text-[10px] text-[#A1A1AA] mt-1 font-mono">
              Admin session protected
            </span>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-[11px] text-[#71717A]">{helperText}</p>
      ) : null}
    </div>
  );
};
