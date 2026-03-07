"use client";

import { Search, X } from "lucide-react";

interface CategorySearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function CategorySearch({ search, onSearchChange }: CategorySearchProps) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search categories..."
        className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
      />
      {search && (
        <button onClick={() => onSearchChange("")} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
