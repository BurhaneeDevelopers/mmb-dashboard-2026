"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCategories, useUpdateCategory, useDeleteCategory } from "@/lib/hooks";
import { useMasters } from "@/lib/hooks";
import type { Category } from "@/lib/supabase/types";
import { CategoryCard } from "./CategoryCard";
import { CategoryEditCard } from "./CategoryEditCard";
import { CategorySearch } from "./CategorySearch";
import { StatCard } from "./StatCard";
import { EmptyState } from "./EmptyState";
import { NoResults } from "./NoResults";
import { AddCategorySlot } from "./AddCategorySlot";

export function CategoryListClient() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: masterCategories = [] } = useMasters();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (cat: Category) => {
    try {
      await deleteMutation.mutateAsync(cat.id);
      toast.success(`"${cat.name}" deleted`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(`Cannot delete "${cat.name}"`, { 
        description: errorMessage 
      });
    }
  };

  const handleUpdate = async (id: string, data: Partial<Category>) => {
    try {
      await updateMutation.mutateAsync({ id, input: data });
      toast.success("Category updated");
      setEditingId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      toast.error("Failed to update category", {
        description: errorMessage
      });
    }
  };

  const linkedMastersCount = masterCategories.filter((m) => m.categoryId).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">
            {categories.length} {categories.length === 1 ? "category" : "categories"} ·
            Group your masters into logical product families
          </p>
        </div>
        <Link
          href="/categories/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <PlusCircle className="w-4 h-4" />
          New Category
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon="📁"
          label="Total Categories"
          value={categories.length}
          color="#6366f1"
        />
        <StatCard
          icon="⚙️"
          label="Total Masters"
          value={masterCategories.length}
          color="#ec4899"
          sub="/ 7 slots"
        />
        <StatCard
          icon="🔗"
          label="Linked Masters"
          value={linkedMastersCount}
          color="#10b981"
          sub={`of ${masterCategories.length}`}
        />
      </div>

      {/* Search */}
      {categories.length > 0 && (
        <CategorySearch search={search} onSearchChange={setSearch} />
      )}

      {/* List */}
      {filtered.length === 0 ? (
        categories.length === 0 ? (
          <EmptyState />
        ) : (
          <NoResults search={search} onClear={() => setSearch("")} />
        )
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filtered.map((cat) => {
            const linkedMasters = masterCategories.filter((m) => m.categoryId === cat.id);
            const isEditing = editingId === cat.id;

            return isEditing ? (
              <CategoryEditCard
                key={cat.id}
                category={cat}
                onSave={(data) => handleUpdate(cat.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <CategoryCard
                key={cat.id}
                category={cat}
                masterCount={linkedMasters.length}
                linkedMasters={linkedMasters}
                onEdit={() => setEditingId(cat.id)}
                onDelete={() => handleDelete(cat)}
              />
            );
          })}

          {/* Add new card */}
          <AddCategorySlot />
        </div>
      )}
    </div>
  );
}
