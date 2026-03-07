import { Category } from "@/lib/store";
import { Edit2, Trash2, Layers, PlusCircle, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

interface CategoryCardProps {
  category: Category;
  masterCount: number;
  linkedMasters: Array<{ id: string; name: string; icon: string; fields: any[] }>;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({ category, masterCount, linkedMasters, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="h-1.5" style={{ background: category.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0"
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
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
              title="Quick Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <Link
              href={`/categories/${category.id}/edit`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Edit Page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

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
