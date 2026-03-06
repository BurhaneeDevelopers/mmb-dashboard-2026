"use client";

import { useState } from "react";
import { useStore, CATEGORY_COLORS, CATEGORY_ICONS, Category } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  FolderOpen,
  ChevronRight,
  Layers,
  ArrowRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, masterCategories, deleteCategory, updateCategory } = useStore();
  const router = useRouter();
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
          sub={`/ 7 slots`}
        />
        <StatCard
          icon="🔗"
          label="Linked Masters"
          value={masterCategories.filter((m) => m.categoryId).length}
          color="#10b981"
          sub={`of ${masterCategories.length}`}
        />
      </div>

      {/* Search */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        categories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-600 font-medium">No categories match "{search}"</p>
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-sm text-indigo-500 hover:text-indigo-700 font-medium"
            >
              Clear search
            </button>
          </div>
        )
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {filtered.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              masterCount={masterCategories.filter((m) => m.categoryId === cat.id).length}
              isEditing={editingId === cat.id}
              onEditStart={() => setEditingId(cat.id)}
              onEditEnd={() => setEditingId(null)}
              onDelete={() => handleDelete(cat)}
              onUpdate={(data) => {
                updateCategory(cat.id, data);
                toast.success("Category updated");
                setEditingId(null);
              }}
            />
          ))}

          {/* Add new card */}
          <Link
            href="/categories/new"
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <PlusCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Add Category</p>
              <p className="text-xs text-slate-400 mt-0.5">Organise more masters</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  masterCount,
  isEditing,
  onEditStart,
  onEditEnd,
  onDelete,
  onUpdate,
}: {
  category: Category;
  masterCount: number;
  isEditing: boolean;
  onEditStart: () => void;
  onEditEnd: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<Category>) => void;
}) {
  const [editName, setEditName] = useState(category.name);
  const [editDesc, setEditDesc] = useState(category.description);
  const [editColor, setEditColor] = useState(category.color);
  const [editIcon, setEditIcon] = useState(category.icon);
  const { masterCategories } = useStore();

  const linkedMasters = masterCategories.filter((m) => m.categoryId === category.id);

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    onUpdate({ name: editName.trim(), description: editDesc.trim(), color: editColor, icon: editIcon });
  };

  const handleCancel = () => {
    setEditName(category.name);
    setEditDesc(category.description);
    setEditColor(category.color);
    setEditIcon(category.icon);
    onEditEnd();
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
            <Edit2 className="w-3 h-3" /> Editing
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Check className="w-3 h-3" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div
          className="rounded-xl border-l-4 px-3 py-2 bg-slate-50 flex items-center gap-2"
          style={{ borderLeftColor: editColor }}
        >
          <span className="text-xl">{editIcon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{editName || "Category name"}</p>
            <p className="text-xs text-slate-400">{editDesc || "Description"}</p>
          </div>
        </div>

        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Category name"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
        />

        {/* Color */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setEditColor(c)}
                className={cn(
                  "w-7 h-7 rounded-full transition-all",
                  editColor === c ? "ring-2 ring-offset-1 ring-slate-500 scale-110" : "hover:scale-105"
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Icon</p>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORY_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setEditIcon(ic)}
                className={cn(
                  "w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all",
                  editIcon === ic
                    ? "border-indigo-400 bg-indigo-50 scale-110"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Top color bar */}
      <div className="h-1.5" style={{ background: category.color }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
              style={{ background: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm leading-tight">{category.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEditStart}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Master count badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${category.color}15`, color: category.color }}
          >
            <Layers className="w-3 h-3" />
            {masterCount} {masterCount === 1 ? "master" : "masters"} linked
          </span>
          <span className="text-[11px] text-slate-400">
            Created {new Date(category.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Linked masters list */}
        {linkedMasters.length > 0 && (
          <div className="border-t border-slate-100 pt-3 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Linked Masters</p>
            <div className="flex flex-col gap-1.5">
              {linkedMasters.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5"
                >
                  <span>{m.icon}</span>
                  <span className="font-medium">{m.name}</span>
                  <span className="ml-auto text-slate-400">{m.fields.length} fields</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {linkedMasters.length === 0 && (
          <div className="border-t border-slate-100 pt-3 mb-3">
            <p className="text-xs text-slate-400 italic">No masters linked yet</p>
          </div>
        )}

        {/* Footer action */}
        <Link
          href={`/masters/new?categoryId=${category.id}`}
          className="mt-1 flex items-center gap-1.5 text-xs font-medium hover:gap-2.5 transition-all w-fit"
          style={{ color: category.color }}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add a master to this category
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">
          {value}
          {sub && <span className="text-sm font-normal text-slate-400 ml-1">{sub}</span>}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="text-5xl mb-4">📁</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">No Categories Yet</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Categories help you organise masters into logical product families — like "Springs", "Bolts", or "Washers". Create your first one now.
      </p>
      <Link
        href="/categories/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        <PlusCircle className="w-4 h-4" />
        Create First Category
      </Link>
    </div>
  );
}
