import React from 'react';

interface AdminMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
  collectionName?: string;
  onClick?: () => void;
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  icon,
  label,
  value,
  loading = false,
  collectionName,
  onClick
}) => {
  if (loading) {
    return (
      <div
        role="status"
        aria-label={`Loading ${label} metric`}
        className="p-5 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F3F2EE] animate-pulse" />
          <div className="w-16 h-4 rounded bg-[#FAF9F5] animate-pulse" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="w-20 h-4 rounded bg-[#FAF9F5] animate-pulse" />
          <div className="w-14 h-7 rounded bg-[#F3F2EE] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`p-5 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs transition-all duration-200 ${
        onClick
          ? 'cursor-pointer hover:border-[#0B0B0C] hover:shadow-md hover:-translate-y-0.5'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-[#F3F2EE] text-[#0B0B0C] border border-[#E4E3DD] flex items-center justify-center shrink-0 shadow-2xs">
          {icon}
        </div>
        {collectionName && (
          <span className="text-[10px] font-mono font-medium text-[#71717A] bg-[#F3F2EE] border border-[#E4E3DD] px-2 py-0.5 rounded">
            {collectionName}
          </span>
        )}
      </div>

      <div className="mt-4">
        <span className="text-xs font-medium text-[#71717A] block">
          {label}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-[#0B0B0C] font-heading">
            {value.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#71717A] font-medium">real total</span>
        </div>
      </div>
    </div>
  );
};
