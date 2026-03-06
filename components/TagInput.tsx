"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  colorful?: boolean;
  className?: string;
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

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter to add...",
  suggestions = [],
  colorful = true,
  className,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className="min-h-[48px] flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl bg-white cursor-text focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => {
          const c = colorful ? getTagColor(tag) : TAG_COLORS[0];
          return (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                c.bg, c.text, c.border
              )}
            >
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="hover:opacity-60 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={handleKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-700 py-0.5 px-1"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 max-h-48 overflow-y-auto">
          {filtered.map((s) => {
            const c = colorful ? getTagColor(s) : TAG_COLORS[0];
            return (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <span className={cn("w-2 h-2 rounded-full", c.bg.replace("bg-", "bg-").replace("-100", "-400"))} />
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* Helper */}
      <p className="mt-1.5 text-[11px] text-slate-400">
        Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">,</kbd> to add a value
        {suggestions.length > 0 && " · suggestions appear as you type"}
      </p>
    </div>
  );
}
