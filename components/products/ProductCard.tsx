import { Product } from "@/lib/store";
import { Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  draft: { label: "Draft", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  inactive: { label: "Inactive", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
};

interface ProductCardProps {
  product: Product;
  category?: { id: string; name: string; icon: string; color: string; fields: { id: string; label: string }[] };
  onDelete: (id: string, name: string) => void;
}

export function ProductCard({ product, category, onDelete }: ProductCardProps) {
  const status = STATUS_CONFIG[product.status];
  const filledAttrs = Object.entries(product.masterValues).filter(([, v]) => v.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex">
        <div
          className="w-1 shrink-0"
          style={{ background: category?.color ?? "#e2e8f0" }}
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
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
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/products/${product.id}/edit`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => onDelete(product.id, product.name)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

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
