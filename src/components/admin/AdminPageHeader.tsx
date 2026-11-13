import React from 'react';

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-[#E4E3DD]">
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] block">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0B0C] font-heading">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-[#52525B] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">{actions}</div>}
    </div>
  );
};
