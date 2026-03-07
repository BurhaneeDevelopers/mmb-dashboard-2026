import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
      <div className="text-5xl mb-4">🏗️</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">No Masters Yet</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
        Masters define attributes like &quot;Size&quot;, &quot;Length&quot;, &quot;Material&quot;, or &quot;Color&quot; that can be used across different product categories.
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
