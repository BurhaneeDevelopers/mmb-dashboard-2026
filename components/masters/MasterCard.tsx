import { MasterCategory } from "@/lib/store";
import { Trash2, Edit, Package, ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  select: "Options",
  color: "Color",
};

interface MasterCardProps {
  master: MasterCategory;
  linkedCategory?: { id: string; name: string; icon: string; color: string };
  productCount: number;
  onDelete: (id: string, name: string) => void;
}

export function MasterCard({ master, linkedCategory, productCount, onDelete }: MasterCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="h-1.5" style={{ background: master.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ background: `${master.color}20` }}
            >
              {master.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{master.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{master.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/masters/${master.id}/edit`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => onDelete(master.id, master.name)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

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

        <div className="flex gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-slate-800">{master.fields.length}</p>
            <p className="text-[10px] text-slate-400">Fields</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
            <p className="text-lg font-bold text-slate-800">{productCount}</p>
            <p className="text-[10px] text-slate-400">Products</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {master.fields.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">📋</span>
                <span className="text-xs font-medium text-slate-700">{f.label}</span>
                {f.unit && (
                  <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                    {f.unit}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${master.color}15`, color: master.color }}
              >
                {FIELD_TYPE_LABELS[f.type]}
              </span>
            </div>
          ))}
        </div>

        {master.fields.some((f) => f.type === "select" && f.options?.length) && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {master.fields
              .filter((f) => f.type === "select" && f.options?.length)
              .map((f) => (
                <div key={f.id} className="mb-2 last:mb-0">
                  <p className="text-[10px] text-slate-400 mb-1">{f.label} options:</p>
                  <div className="flex flex-wrap gap-1">
                    {f.options!.slice(0, 5).map((opt) => (
                      <span
                        key={opt}
                        className="px-2 py-0.5 text-[10px] rounded-full font-medium"
                        style={{ background: `${master.color}15`, color: master.color }}
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

        <Link
          href={`/products/new?category=${master.id}`}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium hover:gap-2.5 transition-all w-fit"
          style={{ color: master.color }}
        >
          <Package className="w-3.5 h-3.5" />
          Create product with this master
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
