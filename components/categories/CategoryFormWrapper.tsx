"use client";

import { useCategory } from "@/lib/hooks";
import { CategoryForm } from "./CategoryForm";

interface CategoryFormWrapperProps {
  mode: "create" | "edit";
  categoryId?: string;
}

export function CategoryFormWrapper({ mode, categoryId }: CategoryFormWrapperProps) {
  const { data: category, isLoading } = useCategory(categoryId || "");

  if (mode === "edit" && categoryId) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Loading category...</div>
        </div>
      );
    }
    
    if (!category) {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">Category not found</p>
        </div>
      );
    }

    return (
      <CategoryForm
        mode="edit"
        categoryId={categoryId}
        initialData={{
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
        }}
      />
    );
  }

  return <CategoryForm mode="create" />;
}
