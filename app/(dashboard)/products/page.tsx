"use client";

import { useStore, Product } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Trash2,
  Search,
  Filter,
  Package,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  draft: { label: "Draft", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  inactive: { label: "Inactive", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

export default function ProductsListPage() {
  const { products, deleteProduct, masterCategories } = useStore();
  const router = useRouter();
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

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    toast.success(`"${name}" deleted`);
  };

  const statCounts = {
    all: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    inactive: products.filter((p) => p.status === "inactive").length,
  };

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

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "active", "draft", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
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
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400"
        >
          <option value="all">All Categories</option>
          {masterCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        products.length === 0 ? <EmptyState /> : <NoResults onClear={() => { setSearch(""); setFilterStatus("all"); setFilterCategory("all"); }} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (id: string, name: string) => void;
}) {
  const { masterCategories } = useStore();
  const category = masterCategories.find((c) => c.id === product.categoryId);
  const status = STATUS_CONFIG[product.status];
  const filledAttrs = Object.entries(product.masterValues).filter(([, v]) => v.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Left color bar from category */}
      <div className="flex">
        <div
          className="w-1 flex-shrink-0"
          style={{ background: category?.color ?? "#e2e8f0" }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                style={{ background: category ? `${category.color}18` : "#f1f5f9" }}
              >
                {category?.icon ?? "📦"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 text-sm">{product.name}</h3>
                  <span
                    className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", status.bg, status.text)}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {product.sku}
                  </code>
                  {category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${category.color}15`, color: category.color }}>
                      {category.icon} {category.name}
                    </span>
                  )}
                </div>
                {product.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onDelete(product.id, product.name)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Attribute tags */}
          {filledAttrs.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2 font-medium">Attributes</p>
              <div className="flex flex-wrap gap-1.5">
                {filledAttrs.map(([fieldId, values]) => {
                  const field = category?.fields.find((f) => f.id === fieldId);
                  if (!field) return null;
                  return values.map((val) => (
                    <span
                      key={`${fieldId}-${val}`}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium border"
                      style={{
                        background: category ? `${category.color}10` : "#f1f5f9",
                        color: category?.color ?? "#64748b",
                        borderColor: category ? `${category.color}30` : "#e2e8f0",
                      }}
                    >
                      <span className="opacity-60 text-[9px] font-semibold uppercase tracking-wide">{field.label}:</span>
                      {val}
                    </span>
                  ));
                })}
              </div>
            </div>
          )}

          {filledAttrs.length === 0 && (
            <div className="mt-3 pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-400 italic">No attributes filled in yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="text-5xl mb-4">📦</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">No Products Yet</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Add your first fastener product. Make sure you've created a Master Category first.
      </p>
      <Link
        href="/products/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
        style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
      >
        <PlusCircle className="w-4 h-4" />
        Add First Product
      </Link>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="text-base font-bold text-slate-800 mb-1">No Results Found</h3>
      <p className="text-slate-500 text-sm mb-4">Try a different search or clear your filters.</p>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}
