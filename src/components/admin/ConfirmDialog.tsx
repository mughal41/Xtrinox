import React from 'react';
import { AdminDialog } from './AdminDialog';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isProcessing?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isProcessing = false
}) => {
  const icon =
    variant === 'danger' ? (
      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
    ) : variant === 'warning' ? (
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
    ) : (
      <Info className="w-5 h-5 text-[#0B0B0C] shrink-0" />
    );

  const confirmBtnClasses =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE]';

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] hover:bg-[#EBEAE5] text-[#0B0B0C] text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${confirmBtnClasses}`}
          >
            {isProcessing ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-1">
        {icon}
        <p className="text-xs text-[#52525B] leading-relaxed">
          {description}
        </p>
      </div>
    </AdminDialog>
  );
};
