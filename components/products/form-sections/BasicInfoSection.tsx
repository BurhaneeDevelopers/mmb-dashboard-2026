import { FormikProps } from "formik";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", emoji: "🟢", desc: "Visible and available", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "inactive", label: "Inactive", emoji: "🔴", desc: "Hidden from catalog", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
];

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive";
  masterValues: Record<string, string[]>;
};

interface BasicInfoSectionProps {
  formik: FormikProps<FormData>;
}

export function BasicInfoSection({ formik }: BasicInfoSectionProps) {
  const generateSKU = () => {
    const name = formik.values.name;
    const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
    const num = Math.floor(1000 + Math.random() * 9000);
    formik.setFieldValue("sku", `${prefix || "PRD"}-${num}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">1</div>
        <h2 className="text-sm font-semibold text-slate-700">Basic Information</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g., Heavy Duty Die Spring M12 x 50mm"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            SKU (Product Code) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="sku"
              value={formik.values.sku}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., DS-M12-50-HVY"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 font-mono"
            />
            <button
              type="button"
              onClick={generateSKU}
              className="px-4 py-3 border border-indigo-200 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              ✨ Auto
            </button>
          </div>
          {formik.touched.sku && formik.errors.sku && (
            <p className="mt-1 text-xs text-red-500">{formik.errors.sku}</p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">Unique code to identify this product in your inventory</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Optional — add any extra notes about this product..."
            rows={2}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => formik.setFieldValue("status", opt.value)}
                className={cn(
                  "flex-1 py-3 px-3 rounded-xl border-2 text-center transition-all",
                  formik.values.status === opt.value
                    ? `${opt.bg} ${opt.border} ${opt.color}`
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="text-lg mb-0.5">{opt.emoji}</div>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
