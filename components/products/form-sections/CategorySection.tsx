import { FormikProps } from "formik";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive" | "draft";
  masterValues: Record<string, string[]>;
};

interface CategorySectionProps {
  selectedCategoryId: string;
  categories: Array<{ id: string; name: string; icon: string; color: string; description: string; fields: { id: string; label: string }[] }>;
  formik: FormikProps<FormData>;
}

export function CategorySection({ selectedCategoryId, categories, formik }: CategorySectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">2</div>
        <h2 className="text-sm font-semibold text-slate-700">Select Master Category</h2>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Choose the type of product. Once selected, all related attributes will appear below for you to fill in.
      </p>

      {formik.touched.categoryId && formik.errors.categoryId && (
        <p className="mb-3 text-xs text-red-500">{formik.errors.categoryId}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              formik.setFieldValue("categoryId", cat.id);
              formik.setFieldValue("masterValues", {});
            }}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              selectedCategoryId === cat.id
                ? "border-transparent shadow-md"
                : "border-slate-200 hover:border-slate-300 bg-white"
            )}
            style={
              selectedCategoryId === cat.id
                ? { background: `${cat.color}12`, borderColor: cat.color }
                : {}
            }
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">{cat.icon}</span>
              {selectedCategoryId === cat.id && (
                <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: cat.color }} />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
            <p className="text-[11px] mt-1.5 font-medium" style={{ color: cat.color }}>
              {cat.fields.length} attribute{cat.fields.length !== 1 ? "s" : ""}
            </p>
          </button>
        ))}
        {categories.length === 0 && (
          <div className="col-span-2 text-center py-8 text-sm text-slate-400">
            No masters available — create one first
          </div>
        )}
      </div>
    </div>
  );
}
