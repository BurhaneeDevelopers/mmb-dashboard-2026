"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useProducts, useMasters, useDeleteProduct } from "@/lib/hooks";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { EmptyState } from "./EmptyState";
import { NoResults } from "./NoResults";

export function ProductListClient() {
  const { data: products = [], isLoading } = useProducts();
  const { data: masterCategories = [] } = useMasters();
  const deleteProductMutation = useDeleteProduct();
  
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchCat = filterCategory === "all" || p.categoryId === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success(`"${name}" deleted`);
    } catch (error) {
      toast.error(`Failed to delete "${name}"`, {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const statCounts = {
    all: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterCategory("all");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categories={masterCategories}
        statCounts={statCounts}
      />

      {filtered.length === 0 ? (
        products.length === 0 ? (
          <EmptyState />
        ) : (
          <NoResults onClear={handleClearFilters} />
        )
      ) : (
        <div className="grid gap-3">
          {filtered.map((product) => {
            const category = masterCategories.find((c) => c.id === product.categoryId);
            return (
              <ProductCard
                key={product.id}
                product={product}
                category={category}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
