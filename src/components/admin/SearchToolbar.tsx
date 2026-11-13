import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  totalCount?: number;
  filteredCount?: number;
  filters?: React.ReactNode;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  totalCount,
  filteredCount,
  filters
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl border border-[#E4E3DD] bg-white shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-9 rounded-xl border border-[#E4E3DD] bg-[#FAF9F5] text-[#0B0B0C] text-xs focus:outline-none focus:ring-2 focus:ring-[#0B0B0C]/10 focus:border-[#0B0B0C] transition-all placeholder:text-[#71717A]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="p-1 rounded-md text-[#71717A] hover:text-[#0B0B0C] absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters and count */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {filters}

        {typeof filteredCount === 'number' && typeof totalCount === 'number' && (
          <span className="text-[11px] font-medium text-[#71717A] px-2.5 py-1 rounded-lg bg-[#F3F2EE] border border-[#E4E3DD] shrink-0 font-mono">
            {filteredCount === totalCount ? `${totalCount} total` : `${filteredCount} of ${totalCount}`}
          </span>
        )}
      </div>
    </div>
  );
};
