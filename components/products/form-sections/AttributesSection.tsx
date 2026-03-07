import { FormikProps } from "formik";
import { Info } from "lucide-react";
import MultiSelect from "@/components/MultiSelect";
import type { Master } from "@/lib/supabase/types";

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive" | "draft";
  masterValues: Record<string, string[]>;
};

interface AttributesSectionProps {
  category: Master;
  formik: FormikProps<FormData>;
}

export function AttributesSection({ category, formik }: AttributesSectionProps) {
  const masterValues = formik.values.masterValues || {};
  const filledFields = Object.values(masterValues).filter((v) => v && v.length > 0).length;
  const totalFields = category.fields.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">3</div>
          <h2 className="text-sm font-semibold text-slate-700">Product Attributes</h2>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
          {filledFields} / {totalFields} filled
        </span>
      </div>

      <div className="mb-4 flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-indigo-700 leading-relaxed">
          All attributes are optional. Select multiple values for each — e.g., a product can come in M6, M8, M10 all at once. Just skip what doesn&apos;t apply.
        </p>
      </div>

      <div className="space-y-5">
        {category.fields.map((field) => (
          <div key={field.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📋</span>
              <label className="text-sm font-medium text-slate-700">{field.label}</label>
              {field.unit && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  {field.unit}
                </span>
              )}
              <span className="text-[10px] text-slate-400 ml-auto">optional · multi-select</span>
            </div>

            <MultiSelect
              options={field.options ?? []}
              value={(formik.values.masterValues && formik.values.masterValues[field.id]) ?? []}
              onChange={(value) => formik.setFieldValue(`masterValues.${field.id}`, value)}
              placeholder={`Choose ${field.label.toLowerCase()} value(s)...`}
              fieldId={field.id}
              masterId={category.id}
              enableQuickCreate={true}
            />
          </div>
        ))}
      </div>

      {filledFields > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-2">Filled Attributes Summary</p>
          <div className="flex flex-wrap gap-2">
            {category.fields
              .filter((f) => masterValues[f.id]?.length > 0)
              .map((f) => (
                <div key={f.id} className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <span className="text-slate-500 font-medium">{f.label}:</span>{" "}
                  <span className="text-slate-700">{masterValues[f.id]?.join(", ")}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
