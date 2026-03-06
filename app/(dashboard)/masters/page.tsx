"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Layers, ArrowRight, Package, Search, X, FolderOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  select: "Options",
  color: "Color",
};

export default function MastersListPage() {
  const { masterCategories, deleteMasterCategory, products, categories } = useStore();
  const router = useRouter();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Categories</h1>
          <p className="text-slate-500 text-sm mt-1">
            {masterCategories.length} of 7 slots used · These define what attributes products can have
          </p>
        </div>
        {masterCategories.length < 7 && (
          <Link
            href="/masters/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <PlusCircle className="w-4 h-4" />
            New Master
          </Link>
        )}
      </div>

      {/* Slot bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-700">Master Slots Used</span>
          <span className="font-semibold text-indigo-600">{masterCategories.length} / 7</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-3 rounded-full transition-all duration-500"
              style={{
                background:
                  i < masterCategories.length
                    ? masterCategories[i]?.color || "#6366f1"
                    : "#e2e8f0",
              }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {7 - masterCategories.length} slot{7 - masterCategories.length !== 1 ? "s" : ""} remaining
        </p>
      </div>

      {/* Search & filter */}
      {masterCategories.length > 0 && (
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search masters..."
              className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-400 shadow-sm"
          >
            <option value="all">All Categories</option>
            <option value="none">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grid */}
      {masterCategories.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-600 font-medium">No masters match your search</p>
          <button
            onClick={() => { setSearch(""); setFilterCategoryId("all"); }}
            className="mt-3 text-sm text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cat) => {
            const productCount = products.filter((p) => p.categoryId === cat.id).length;
            const linkedCategory = categories.find((c) => c.id === cat.categoryId);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {/* Color top bar */}
                <div className="h-1.5" style={{ background: cat.color }} />

                <div className="p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                        style={{ background: `${cat.color}20` }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{cat.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Category badge */}
                  {linkedCategory ? (
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
                        style={{ background: linkedCategory.color }}
                      >
                        {linkedCategory.icon} {linkedCategory.name}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                        <FolderOpen className="w-3 h-3" /> Uncategorised
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-bold text-slate-800">{cat.fields.length}</p>
                      <p className="text-[10px] text-slate-400">Fields</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-lg font-bold text-slate-800">{productCount}</p>
                      <p className="text-[10px] text-slate-400">Products</p>
                    </div>
                  </div>

                  {/* Fields list */}
                  <div className="space-y-1.5">
                    {cat.fields.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {f.type === "text" ? "🔤" : f.type === "number" ? "🔢" : f.type === "color" ? "🎨" : "📋"}
                          </span>
                          <span className="text-xs font-medium text-slate-700">{f.label}</span>
                          {f.unit && (
                            <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                              {f.unit}
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${cat.color}15`, color: cat.color }}
                        >
                          {FIELD_TYPE_LABELS[f.type]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Options preview */}
                  {cat.fields.some((f) => f.type === "select" && f.options?.length) && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {cat.fields
                        .filter((f) => f.type === "select" && f.options?.length)
                        .map((f) => (
                          <div key={f.id} className="mb-2 last:mb-0">
                            <p className="text-[10px] text-slate-400 mb-1">{f.label} options:</p>
                            <div className="flex flex-wrap gap-1">
                              {f.options!.slice(0, 5).map((opt) => (
                                <span
                                  key={opt}
                                  className="px-2 py-0.5 text-[10px] rounded-full font-medium"
                                  style={{ background: `${cat.color}15`, color: cat.color }}
                                >
                                  {opt}
                                </span>
                              ))}
                              {f.options!.length > 5 && (
                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-400">
                                  +{f.options!.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Footer action */}
                  <Link
                    href={`/products/new?category=${cat.id}`}
                    className="mt-4 flex items-center gap-1.5 text-xs font-medium hover:gap-2.5 transition-all w-fit"
                    style={{ color: cat.color }}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Create product with this master
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Add new slot */}
          {masterCategories.length < 7 && (
            <Link
              href="/masters/new"
              className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <PlusCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">Add Master</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {7 - masterCategories.length} slot{7 - masterCategories.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="text-5xl mb-4">🏗️</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">No Masters Yet</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Masters define the attributes your products will have. Start by creating your first master like "Die Springs" or "Ejector Pins".
      </p>
      <Link
        href="/masters/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        <PlusCircle className="w-4 h-4" />
        Create First Master
      </Link>
    </div>
  );
}
