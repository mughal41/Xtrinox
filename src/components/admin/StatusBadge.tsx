import React from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

export type BadgeVariant =
  | 'operational'
  | 'suspended'
  | 'restoration_requested'
  | 'active'
  | 'inactive'
  | 'trusted'
  | 'blocked'
  | 'blocked_by_user'
  | 'blocked_by_admin'
  | 'restore_requested'
  | 'category';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'operational':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>{label || 'Operational'}</span>
        </span>
      );

    case 'suspended':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#F3F2EE] text-[#52525B] border border-[#E4E3DD] ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-[#71717A]" aria-hidden="true" />
          <span>{label || 'Suspended'}</span>
        </span>
      );

    case 'restoration_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" aria-hidden="true" />
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>{label || 'Restoration Requested'}</span>
        </span>
      );

    case 'active':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>{label || 'Active'}</span>
        </span>
      );

    case 'inactive':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#FAF9F5] text-[#71717A] border border-[#E4E3DD] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA]" aria-hidden="true" />
          <span>{label || 'Inactive'}</span>
        </span>
      );

    case 'trusted':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#E8F8D6] text-[#22570A] border border-[#C6EDB0] ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#22570A]" aria-hidden="true" />
          <span>{label || 'Trusted Device'}</span>
        </span>
      );

    case 'blocked':
    case 'blocked_by_user':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <Lock className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          <span>{label || 'Blocked by User'}</span>
        </span>
      );

    case 'blocked_by_admin':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
          <span>{label || 'Blocked by Admin'}</span>
        </span>
      );

    case 'restore_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" aria-hidden="true" />
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>{label || 'Restore Requested'}</span>
        </span>
      );

    case 'category':
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-[#FAF9F5] text-[#0B0B0C] border border-[#E4E3DD] uppercase tracking-wider ${sizeClasses}`}>
          {label || status}
        </span>
      );
  }
};
