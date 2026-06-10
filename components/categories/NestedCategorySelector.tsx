'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/supabase/types';

interface NestedCategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  showNoneOption?: boolean;
  error?: string;
  disabled?: boolean;
}

export function NestedCategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  showNoneOption = false,
  error,
  disabled = false,
}: NestedCategorySelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree structure - main categories with their subcategories
  const mainCategories = categories.filter(cat => cat.isMain);
  const categoryMap = new Map<string, Category[]>();
  
  categories.forEach(cat => {
    if (cat.parentId) {
      if (!categoryMap.has(cat.parentId)) {
        categoryMap.set(cat.parentId, []);
      }
      categoryMap.get(cat.parentId)!.push(cat);
    }
  });

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = categoryMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className="space-y-1">
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            onSelect(category.id);
            if (hasChildren && !isExpanded) {
              toggleExpand(category.id);
            }
          }}
          disabled={disabled}
          className={cn(
            'w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2',
            disabled && 'opacity-60 cursor-not-allowed',
            isSelected
              ? 'border-transparent shadow-md'
              : 'border-slate-200 hover:border-slate-300 bg-white',
            disabled && !isSelected && 'hover:border-slate-200'
          )}
          style={{
            marginLeft: `${level * 16}px`,
            ...(isSelected
              ? { background: `${category.color}12`, borderColor: category.color }
              : {}),
          }}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  toggleExpand(category.id);
                }
              }}
              disabled={disabled}
              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded transition-colors disabled:hover:bg-transparent"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <span className={cn("text-lg", level === 0 ? "text-xl" : "text-base")}>
            {category.icon}
          </span>
          
          <div className="flex-1 min-w-0">
            <p className={cn("font-semibold text-slate-800 truncate", level === 0 ? "text-sm" : "text-xs")}>
              {category.name}
            </p>
            {level === 0 && (
              <p className="text-[11px] text-slate-400 line-clamp-1">{category.description}</p>
            )}
          </div>

          {isSelected && (
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: category.color }}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      <div className="space-y-2">
        {showNoneOption && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className={cn(
              'w-full p-3 rounded-lg border-2 text-left transition-all',
              !selectedCategoryId
                ? 'border-slate-400 bg-slate-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            )}
          >
            <span className="text-lg">—</span>
            <p className="text-xs font-semibold text-slate-600 mt-1">No Category</p>
            <p className="text-[11px] text-slate-400">Skip for now</p>
          </button>
        )}

        {mainCategories.map((category) => renderCategory(category, 0))}

        {/* Show orphaned categories (subcategories without parents) */}
        {categories.filter(cat => !cat.isMain && !cat.parentId).map(category => (
          <div key={category.id} className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (disabled) return;
                onSelect(category.id);
              }}
              disabled={disabled}
              className={cn(
                'w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2',
                disabled && 'opacity-60 cursor-not-allowed',
                selectedCategoryId === category.id
                  ? 'border-transparent shadow-md'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              )}
              style={
                selectedCategoryId === category.id
                  ? { background: `${category.color}12`, borderColor: category.color }
                  : {}
              }
            >
              <div className="w-5" />
              <span className="text-lg">{category.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{category.name}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{category.description}</p>
              </div>
              {selectedCategoryId === category.id && (
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: category.color }}
                />
              )}
            </button>
          </div>
        ))}

        {mainCategories.length === 0 && categories.filter(cat => !cat.isMain && !cat.parentId).length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400">
            No categories available
          </div>
        )}
      </div>
    </div>
  );
}
