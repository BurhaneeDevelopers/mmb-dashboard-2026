import type { Product, Master } from "@/lib/supabase/types";
import { Trash2, Edit, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive: { label: "Inactive", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
  draft: { label: "Draft", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
};

interface ProductCardProps {
  product: Product;
  category?: Master;
  onDelete: (id: string, name: string) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function ProductCard({ product, category, onDelete }: ProductCardProps) {
  const status = STATUS_CONFIG[product.status] || STATUS_CONFIG.draft;
  const filledAttrs = Object.entries(product.masterValues).filter(([, v]) => v.length > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="flex">
        <div
          className="w-1 shrink-0"
          style={{ background: category?.color ?? "#e2e8f0" }}
        />
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              {product.imageUrl ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-base shrink-0 shadow-sm"
                  style={{ background: category ? `${category.color}18` : "#f1f5f9" }}
                >
                  {category?.icon ?? "📦"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 text-sm">{product.name}</h3>
                  <span
                    className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", status.bg, status.text)}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <code className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {product.sku}
                  </code>
                  {category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${category.color}15`, color: category.color }}>
                      {category.icon} {category.name}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                {product.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description}</p>
                )}
                {filledAttrs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filledAttrs.slice(0, 3).map(([fieldId, values]) => {
                      const field = category?.fields.find((f) => f.id === fieldId);
                      if (!field) return null;
                      return values.slice(0, 2).map((val) => (
                        <span
                          key={`${fieldId}-${val}`}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border"
                          style={{
                            background: category ? `${category.color}08` : "#f1f5f9",
                            color: category?.color ?? "#64748b",
                            borderColor: category ? `${category.color}20` : "#e2e8f0",
                          }}
                        >
                          <span className="opacity-60 text-[9px] font-semibold uppercase">{field.label}:</span>
                          {val}
                        </span>
                      ));
                    })}
                    {filledAttrs.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-2 py-0.5">
                        +{filledAttrs.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/products/${product.id}/edit`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => onDelete(product.id, product.name)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
