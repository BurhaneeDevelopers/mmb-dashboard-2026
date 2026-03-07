"use client";

import { useState } from "react";
import { X, Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import QuickCreateMasterValues from "./QuickCreateMasterValues";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  colorful?: boolean;
  fieldId?: string;
  masterId?: string;
  enableQuickCreate?: boolean;
}

const TAG_COLORS = [
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
];

function getTagColor(val: string) {
  let hash = 0;
  for (let i = 0; i < val.length; i++) hash += val.charCodeAt(i);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select values...",
  colorful = true,
  fieldId,
  masterId,
  enableQuickCreate = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const handleValuesCreated = (newValues: string[]) => {
    // Auto-select the newly created values
    const updatedValue = [...value, ...newValues];
    onChange(updatedValue);
    setSheetOpen(false);
    setOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full min-h-[48px] flex flex-wrap items-center gap-1.5 p-2 border rounded-xl bg-white text-left transition-all",
            open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
          )}
        >
          {value.length === 0 ? (
            <span className="px-1 text-sm text-slate-400">{placeholder}</span>
          ) : (
            value.map((v) => {
              const c = colorful ? getTagColor(v) : TAG_COLORS[0];
              return (
                <span
                  key={v}
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                    c.bg, c.text, c.border
                  )}
                >
                  {v}
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); toggle(v); }}
                    className="hover:opacity-60 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              );
            })
          )}
          <ChevronDown className={cn("w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 max-h-52 overflow-y-auto">
              {enableQuickCreate && fieldId && masterId && (
                <button
                  type="button"
                  onClick={() => {
                    setSheetOpen(true);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-b border-slate-100"
                >
                  <Plus className="w-4 h-4" />
                  Quick Add New Values
                </button>
              )}
              {options.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-3">No options available</p>
              )}
              {options.map((opt) => {
                const selected = value.includes(opt);
                const c = colorful ? getTagColor(opt) : TAG_COLORS[0];
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors",
                      selected ? "bg-indigo-50" : "hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full", c.bg.replace("100", "400"))} />
                      {opt}
                    </span>
                    {selected && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Quick Create Sheet */}
      {enableQuickCreate && fieldId && masterId && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <QuickCreateMasterValues
              fieldId={fieldId}
              masterId={masterId}
              onValuesCreated={handleValuesCreated}
              onClose={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
