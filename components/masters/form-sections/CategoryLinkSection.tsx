import { FormikProps } from "formik";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  linkedCategoryId: string;
  fields: { label: string; type: "select" }[];
};

interface CategoryLinkSectionProps {
  formik: FormikProps<FormData>;
  categories: Array<{ id: string; name: string; icon: string; color: string; description: string }>;
  router: AppRouterInstance;
}

export function CategoryLinkSection({ formik, categories, router }: CategoryLinkSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">2</div>
        <h2 className="text-sm font-semibold text-slate-700">Link to Category</h2>
        <span className="text-xs text-slate-400 ml-auto">Optional</span>
      </div>

      {categories.length === 0 ? (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <FolderOpen className="w-5 h-5 text-slate-400" />
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium">No categories yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Create a category first to link this master.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/categories/new")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            Create →
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Linking to a category keeps your catalog organised. You can skip this and link later.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* None option */}
            <button
              type="button"
              onClick={() => formik.setFieldValue("linkedCategoryId", "")}
              className={cn(
                "p-3 rounded-xl border-2 text-left transition-all",
                !formik.values.linkedCategoryId
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <span className="text-lg">—</span>
              <p className="text-xs font-semibold text-slate-600 mt-1">No Category</p>
              <p className="text-[11px] text-slate-400">Skip for now</p>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => formik.setFieldValue("linkedCategoryId", cat.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  formik.values.linkedCategoryId === cat.id
                    ? "border-transparent shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
                style={
                  formik.values.linkedCategoryId === cat.id
                    ? { background: `${cat.color}12`, borderColor: cat.color }
                    : {}
                }
              >
                <span className="text-lg">{cat.icon}</span>
                <p className="text-xs font-semibold text-slate-800 mt-1">{cat.name}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
