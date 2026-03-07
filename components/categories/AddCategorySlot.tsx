import { PlusCircle } from "lucide-react";
import Link from "next/link";

export function AddCategorySlot() {
  return (
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
  );
}
