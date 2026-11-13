import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface AdminActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  destination: string;
  onNavigate: (route: any) => void;
  accent?: string;
}

export const AdminActionCard: React.FC<AdminActionCardProps> = ({
  icon,
  title,
  description,
  destination,
  onNavigate
}) => {
  return (
    <button
      type="button"
      onClick={() => onNavigate(destination)}
      className="group text-left p-5 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs hover:border-[#0B0B0C] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer w-full"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3F2EE] text-[#0B0B0C] border border-[#E4E3DD] flex items-center justify-center group-hover:bg-[#B6FF2E] group-hover:border-[#B6FF2E] transition-colors shadow-2xs">
            {icon}
          </div>
          <div className="w-7 h-7 rounded-full bg-transparent group-hover:bg-[#B6FF2E]/25 flex items-center justify-center text-[#71717A] group-hover:text-[#0B0B0C] transition-colors">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
        <h3 className="text-sm font-bold text-[#0B0B0C] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E4E3DD] flex items-center justify-between text-[11px] font-mono text-[#71717A] group-hover:text-[#0B0B0C] transition-colors">
        <span>{destination}</span>
        <span className="font-sans font-semibold">Open &rarr;</span>
      </div>
    </button>
  );
};
