"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { MasterCard } from "./MasterCard";
import { MasterFilters } from "./MasterFilters";
import { EmptyState } from "./EmptyState";
import { NoResults } from "./NoResults";

export function MasterListClient() {
  const { masterCategories, deleteMasterCategory, products, categories } = useStore();
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("all");

  const handleDelete = (id: string, name: string) => {
    const linked = products.filter((p) => p.categoryId === id).length;
    if (linked > 0) {
      toast.error(`Cannot delete "${name}"`, {
        description: `${linked} product${linked > 1 ? "s" : ""} use this master. Remove them first.`,
      });
      return;
    }
    deleteMasterCategory(id);
    toast.success(`"${name}" deleted`);
  };

  const filtered = masterCategories.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategoryId === "all" || m.categoryId === filterCategoryId || (filterCategoryId === "none" && !m.categoryId);
    return matchSearch && matchCat;
  });

  const handleClearFilters = () => {
    setSearch("");
    setFilterCategoryId("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Attributes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {masterCategories.length} {masterCategories.length === 1 ? "master" : "masters"} · Define attributes like Size, Length, Material, Color
          </p>
        </div>
        <Link
          href="/masters/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <PlusCircle className="w-4 h-4" />
          New Master
        </Link>
      </div>

      {/* Search & filter */}
      {masterCategories.length > 0 && (
        <MasterFilters
          search={search}
          onSearchChange={setSearch}
          filterCategoryId={filterCategoryId}
          onCategoryChange={setFilterCategoryId}
          categories={categories}
        />
      )}

      {/* Grid */}
      {masterCategories.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <NoResults onClear={handleClearFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((master) => {
            const productCount = products.filter((p) => p.categoryId === master.id).length;
            const linkedCategory = categories.find((c) => c.id === master.categoryId);

            return (
              <MasterCard
                key={master.id}
                master={master}
                linkedCategory={linkedCategory}
                productCount={productCount}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
