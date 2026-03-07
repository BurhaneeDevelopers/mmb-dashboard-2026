import { FormikProps, FieldArray } from "formik";
import { PlusCircle, Trash2 } from "lucide-react";

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  linkedCategoryId: string;
  fields: { label: string; type: "select" }[];
};

interface ValuesSectionProps {
  formik: FormikProps<FormData>;
}

export function ValuesSection({ formik }: ValuesSectionProps) {
  const fieldsError = formik.errors.fields;
  const hasGeneralError = typeof fieldsError === "string";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">3</div>
          <h2 className="text-sm font-semibold text-slate-700">Add Values</h2>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Add possible values for this master — like <strong>9, 10, 11</strong> for sizes or <strong>Red, Blue, Green</strong> for colors.
        These values will be available when creating products.
      </p>

      {hasGeneralError && (
        <p className="mb-3 text-xs text-red-500">{fieldsError}</p>
      )}

      <FieldArray name="fields">
        {({ push, remove }) => (
          <>
            <div className="space-y-3">
              {formik.values.fields.map((field, index) => (
                <FieldRow
                  key={index}
                  index={index}
                  formik={formik}
                  remove={remove}
                  canRemove={formik.values.fields.length > 1}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => push({ label: "", type: "select" })}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-sm text-indigo-500 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Value
            </button>
          </>
        )}
      </FieldArray>
    </div>
  );
}

interface FieldRowProps {
  index: number;
  formik: FormikProps<FormData>;
  remove: (index: number) => void;
  canRemove: boolean;
}

function FieldRow({ index, formik, remove, canRemove }: FieldRowProps) {
  const fieldError = formik.errors.fields?.[index];
  const fieldTouched = formik.touched.fields?.[index];
  const labelError = typeof fieldError === "object" && fieldError?.label;

  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <input
            name={`fields.${index}.label`}
            value={formik.values.fields[index].label}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Value (e.g., 9, Red, Steel)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
          />
          {fieldTouched?.label && labelError && (
            <p className="mt-0.5 text-[10px] text-red-500">{labelError}</p>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
