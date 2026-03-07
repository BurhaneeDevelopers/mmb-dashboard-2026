"use client";

import { Search, X } from "lucide-react";

interface MasterFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{ id: string; name: string; icon: string }>;
}

export function MasterFilters({
  search,
  onSearchChange,
  filterCategoryId,
  onCategoryChange,
  categories,
}: MasterFiltersProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search masters..."
          className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
        />
        {search && (
          <button onClick={() => onSearchChange("")} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={filterCategoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
      >
        <option value="all">All Categories</option>
        <option value="none">Uncategorised</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
