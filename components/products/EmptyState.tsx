import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="text-5xl mb-4">📦</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">No Products Yet</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Add your first fastener product. Make sure you&apos;ve created a Master Category first.
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
