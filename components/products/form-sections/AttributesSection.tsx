import { FormikProps } from "formik";
import { Info, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import MultiSelect from "@/components/MultiSelect";
import type { Master } from "@/lib/supabase/types";

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive";
  masterValues: Record<string, string[]>;
};

interface AttributesSectionProps {
  categoryId: string;
  masters: Master[];
  formik: FormikProps<FormData>;
}

export function AttributesSection({ categoryId, masters, formik }: AttributesSectionProps) {
  const router = useRouter();
  const masterValues = formik.values.masterValues || {};
  
  // Count total fields across all masters
  const totalFields = masters.reduce((sum, master) => sum + master.fields.length, 0);
  const filledFields = Object.values(masterValues).filter((v) => v && v.length > 0).length;

  if (masters.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">3</div>
          <h2 className="text-sm font-semibold text-slate-700">Product Attributes</h2>
        </div>

        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-400 mb-3">No attribute masters available for this category</p>
          <button
            type="button"
            onClick={() => router.push(`/masters/new?categoryId=${categoryId}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Master for this Category
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center">3</div>
          <h2 className="text-sm font-semibold text-slate-700">Select Values from Masters</h2>
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

      <div className="space-y-6">
        {masters.map((master) => (
          <div key={master.id} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">{master.icon}</span>
              <h3 className="text-sm font-semibold text-slate-700">{master.name}</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium ml-auto">
                {master.fields.length} field{master.fields.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {master.fields.map((field) => (
                <div key={field.id}>
                  <MultiSelect
                    options={field.options ?? []}
                    value={(formik.values.masterValues && formik.values.masterValues[field.id]) ?? []}
                    onChange={(value) => formik.setFieldValue(`masterValues.${field.id}`, value)}
                    placeholder={`${field.label}${field.unit ? ` (${field.unit})` : ""} - optional, multi-select`}
                    fieldId={field.id}
                    masterId={master.id}
                    enableQuickCreate={true}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => router.push(`/masters/new?categoryId=${categoryId}`)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Plus className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">Add New Master</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Create a new attribute type for this category</p>
          </div>
        </button>
      </div>

      {filledFields > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-2">Filled Attributes Summary</p>
          <div className="flex flex-wrap gap-2">
            {masters.flatMap((master) =>
              master.fields
                .filter((f) => masterValues[f.id]?.length > 0)
                .map((f) => (
                  <div key={f.id} className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <span className="text-slate-500 font-medium">{f.label}:</span>{" "}
                    <span className="text-slate-700">{masterValues[f.id]?.join(", ")}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
