"use client";

import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Sparkles } from "lucide-react";
import { useStore, MASTER_COLORS, MASTER_ICONS } from "@/lib/store";
import { IdentitySection } from "./form-sections/IdentitySection";
import { CategoryLinkSection } from "./form-sections/CategoryLinkSection";
import { ValuesSection } from "./form-sections/ValuesSection";

type FieldData = {
  label: string;
  type: "select";
};

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
  linkedCategoryId: string;
  fields: FieldData[];
};

interface MasterFormProps {
  mode: "create" | "edit";
  initialData?: FormData;
  masterId?: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Master name is required")
    .min(2, "At least 2 characters"),
  description: Yup.string()
    .required("Description is required"),
  color: Yup.string().required(),
  icon: Yup.string().required(),
  linkedCategoryId: Yup.string(),
  fields: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().required("Value is required"),
        type: Yup.string().oneOf(["select"]).required(),
      })
    )
    .min(1, "Add at least one value")
    .required(),
});

export function MasterForm({ mode, initialData, masterId }: MasterFormProps) {
  const { addMasterCategory, updateMasterCategory, categories } = useStore();
  const router = useRouter();

  const formik = useFormik<FormData>({
    initialValues: initialData ?? {
      name: "",
      description: "",
      color: MASTER_COLORS[0],
      icon: MASTER_ICONS[0],
      linkedCategoryId: "",
      fields: [{ label: "", type: "select" }],
    },
    validationSchema,
    onSubmit: (values: FormData) => {
      if (mode === "edit" && masterId) {
        updateMasterCategory(masterId, {
          name: values.name,
          description: values.description,
          color: values.color,
          icon: values.icon,
          categoryId: values.linkedCategoryId || undefined,
          fields: values.fields.map((f, i) => ({
            id: `f-${Date.now()}-${i}`,
            label: f.label,
            type: "select",
            options: [],
          })),
        });
        toast.success(`Master "${values.name}" updated!`);
      } else {
        addMasterCategory({
          name: values.name,
          description: values.description,
          color: values.color,
          icon: values.icon,
          categoryId: values.linkedCategoryId || undefined,
          fields: values.fields.map((f, i) => ({
            id: `f-${Date.now()}-${i}`,
            label: f.label,
            type: "select",
            options: [],
          })),
        });
        toast.success(`Master "${values.name}" created!`, {
          description: `${values.fields.length} value${values.fields.length > 1 ? "s" : ""} added.`,
        });
      }
      router.push("/masters");
    },
  });

  const linkedCategory = categories.find((c) => c.id === formik.values.linkedCategoryId);

  return (
    <FormikProvider value={formik}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="hover:text-indigo-500 cursor-pointer" onClick={() => router.push("/masters")}>
            Masters
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 font-medium">
            {mode === "edit" ? "Edit Master" : "Create New"}
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === "edit" ? "Edit Master" : "Create Master"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Masters define attribute types for your products (like Size, Color, Material).
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <IdentitySection formik={formik} linkedCategory={linkedCategory} />

          <CategoryLinkSection formik={formik} categories={categories} router={router} />

          <ValuesSection formik={formik} />

          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Sparkles className="w-4 h-4" />
              {mode === "edit" ? "Update Master" : "Create Master"}
            </button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
}
