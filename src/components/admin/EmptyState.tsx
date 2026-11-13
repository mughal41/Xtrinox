import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-dashed border-[#E4E3DD] bg-white shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-[#F3F2EE] border border-[#E4E3DD] text-[#71717A] flex items-center justify-center mb-3.5 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#0B0B0C]">
        {title}
      </h3>
      <p className="text-xs text-[#52525B] max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#0B0B0C] hover:bg-[#232326] text-[#F3F2EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
