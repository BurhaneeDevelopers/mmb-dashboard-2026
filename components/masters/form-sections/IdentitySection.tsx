import { FormikProps } from "formik";
import { cn } from "@/lib/utils";
import { MASTER_COLORS, MASTER_ICONS } from "@/lib/store";
import { Info } from "lucide-react";
import type { Category } from "@/lib/supabase/types";

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  linkedCategoryId: string;
  fields: { label: string; type: "select" }[];
};

interface IdentitySectionProps {
  formik: FormikProps<FormData>;
  linkedCategory?: Category;
}

export function IdentitySection({ formik, linkedCategory }: IdentitySectionProps) {
  return (
    <>
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          A <strong>Master</strong> represents an attribute type (e.g., &quot;Size&quot;, &quot;Length&quot;, &quot;Material&quot;) with specific values (e.g., M6, M8, M10 or Red, Blue, Green).
          Link it to <strong>Categories</strong> to make it available for products in those categories.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">1</div>
          <h2 className="text-sm font-semibold text-slate-700">Master Identity</h2>
        </div>

        {/* Live preview chip */}
        {formik.values.name && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Preview:</span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm"
              style={{ background: formik.values.color }}
            >
              {formik.values.icon} {formik.values.name}
            </span>
            {linkedCategory && (
              <>
                <span className="text-slate-300 text-xs">in</span>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: linkedCategory.color }}
                >
                  {linkedCategory.icon} {linkedCategory.name}
                </span>
              </>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Master Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Size, Color, Material, Length..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Brief description of this value type..."
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Badge Color</label>
            <div className="flex gap-2 flex-wrap">
              {MASTER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => formik.setFieldValue("color", c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    formik.values.color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {MASTER_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => formik.setFieldValue("icon", ic)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-lg flex items-center justify-center border-2 transition-all",
                    formik.values.icon === ic
                      ? "border-indigo-400 bg-indigo-50 scale-110"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
