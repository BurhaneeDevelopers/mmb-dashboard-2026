"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Master } from "@/lib/supabase/types";

const STATUS_CONFIG = {
  active: { label: "Active", dot: "bg-emerald-500" },
  draft: { label: "Draft", dot: "bg-amber-500" },
  inactive: { label: "Inactive", dot: "bg-red-400" },
};

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  categories: Master[];
  statCounts: {
    all: number;
    active: number;
    draft: number;
    inactive: number;
  };
}

export function ProductFilters({
  search,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCategory,
  onCategoryChange,
  categories,
  statCounts,
}: ProductFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "draft", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border",
              filterStatus === status
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            {status !== "all" && (
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[status].dot)} />
            )}
            {status === "all" ? "All" : STATUS_CONFIG[status].label}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px]",
                filterStatus === status ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {statCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Category filter */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or SKU..."
            className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
