import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface AddMasterSlotProps {
  remaining: number;
}

export function AddMasterSlot({ remaining }: AddMasterSlotProps) {
  return (
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
          {remaining} slot{remaining !== 1 ? "s" : ""} available
        </p>
      </div>
    </Link>
  );
}
