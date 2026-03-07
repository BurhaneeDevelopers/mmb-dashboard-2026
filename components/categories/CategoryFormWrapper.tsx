"use client";

import { useStore } from "@/lib/store";
import { CategoryForm } from "./CategoryForm";

interface CategoryFormWrapperProps {
  mode: "create" | "edit";
  categoryId?: string;
}

export function CategoryFormWrapper({ mode, categoryId }: CategoryFormWrapperProps) {
  const { categories } = useStore();

  if (mode === "edit" && categoryId) {
    const category = categories.find((c) => c.id === categoryId);
    
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
