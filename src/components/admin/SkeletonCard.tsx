import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="p-5 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-[#F3F2EE]" />
        <div className="w-16 h-4 rounded bg-[#FAF9F5]" />
      </div>
      <div className="w-3/4 h-5 rounded bg-[#F3F2EE]" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-[#FAF9F5]"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 5,
  rows = 5
}) => {
  return (
    <div className="w-full rounded-2xl border border-[#E4E3DD] bg-white overflow-hidden shadow-xs animate-pulse">
      <div className="border-b border-[#E4E3DD] bg-[#FAF9F5] px-5 py-3.5 flex items-center gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 rounded bg-[#F3F2EE] flex-1"
          />
        ))}
      </div>
      <div className="divide-y divide-[#E4E3DD]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-5 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-4 rounded bg-[#FAF9F5] flex-1"
                style={{ opacity: 1 - r * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
