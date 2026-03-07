"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useStore, Category } from "@/lib/store";
import { CategoryCard } from "./CategoryCard";
import { CategoryEditCard } from "./CategoryEditCard";
import { CategorySearch } from "./CategorySearch";
import { StatCard } from "./StatCard";
import { EmptyState } from "./EmptyState";
import { NoResults } from "./NoResults";
import { AddCategorySlot } from "./AddCategorySlot";

export function CategoryListClient() {
  const { categories, masterCategories, deleteCategory, updateCategory } = useStore();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (cat: Category) => {
    const err = deleteCategory(cat.id);
    if (err) {
      toast.error(`Cannot delete "${cat.name}"`, { description: err });
    } else {
      toast.success(`"${cat.name}" deleted`);
    }
  };

  const handleUpdate = (id: string, data: Partial<Category>) => {
    updateCategory(id, data);
    toast.success("Category updated");
    setEditingId(null);
  };

  const linkedMastersCount = masterCategories.filter((m) => m.categoryId).length;

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
