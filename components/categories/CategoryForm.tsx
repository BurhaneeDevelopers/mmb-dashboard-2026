"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Sparkles, Info, FolderPlus } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/lib/hooks";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/store";
import { cn } from "@/lib/utils";

type FormData = {
  name: string;
  description: string;
  color: string;
  icon: string;
};

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: FormData;
  categoryId?: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Category name is required")
    .min(2, "At least 2 characters")
    .max(40, "Max 40 characters"),
  description: Yup.string()
    .required("Please add a short description")
    .min(5, "At least 5 characters")
    .max(200, "Max 200 characters"),
  color: Yup.string().required("Pick a color"),
  icon: Yup.string().required("Pick an icon"),
});

export function CategoryForm({ mode, initialData, categoryId }: CategoryFormProps) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const router = useRouter();

  const formik = useFormik<FormData>({
    initialValues: initialData ?? {
      name: "",
      description: "",
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    },
    validationSchema,
    onSubmit: async (values: FormData) => {
      try {
        if (mode === "edit" && categoryId) {
          await updateMutation.mutateAsync({ id: categoryId, input: values });
          toast.success(`Category "${values.name}" updated!`);
        } else {
          await createMutation.mutateAsync(values);
          toast.success(`Category "${values.name}" created!`, {
            description: "You can now link masters to this category.",
          });
        }
        router.push("/categories");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(mode === "edit" ? "Failed to update category" : "Failed to create category", {
          description: errorMessage,
        });
      }
    },
  });

  return (
    <div className="mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span
          className="hover:text-indigo-500 cursor-pointer transition-colors"
          onClick={() => router.push("/categories")}
        >
          Categories
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 font-medium">
          {mode === "edit" ? "Edit Category" : "New Category"}
        </span>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-xl"
            style={{ background: `linear-gradient(135deg, ${formik.values.color}cc, ${formik.values.color})` }}
          >
            {formik.values.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {mode === "edit" ? "Edit Category" : "New Category"}
            </h1>
            <p className="text-slate-500 text-sm">
              Group your masters under a logical category.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">What is a Category?</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Categories are top-level groups for your masters — for example, <strong>&quot;Springs&quot;</strong> can
            contain masters like &quot;Die Springs&quot; and &quot;Compression Springs&quot;.
            Think of them as folders that keep your catalog organised.
          </p>
        </div>
      </div>

      {/* Live preview chip */}
      {formik.values.name && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs text-slate-400">Preview:</span>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-sm"
            style={{ background: formik.values.color }}
          >
            {formik.values.icon} {formik.values.name}
          </span>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-700">Category Details</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g., Springs, Pins & Punches, Bolts, Washers..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {formik.errors.name}
              </p>
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
              placeholder="Briefly describe what types of products fall under this category..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {formik.errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <span className="text-base">🎨</span>
            <h2 className="text-sm font-semibold text-slate-700">Appearance</h2>
            <span className="text-xs text-slate-400 ml-auto">Used as the category badge color</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Badge Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => formik.setFieldValue("color", c)}
                  title={c}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all duration-150 shadow-sm",
                    formik.values.color === c
                      ? "ring-3 ring-offset-2 ring-slate-500 scale-110 shadow-md"
                      : "hover:scale-105 hover:shadow-md"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => formik.setFieldValue("icon", ic)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all duration-150",
                    formik.values.icon === ic
                      ? "border-indigo-400 bg-indigo-50 scale-110 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Full preview card */}
          {formik.values.name && (
            <div className="mt-2 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Card Preview</p>
              <div
                className="bg-white rounded-xl border-l-4 p-4 shadow-sm flex items-center gap-3"
                style={{ borderLeftColor: formik.values.color }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${formik.values.color}20` }}
                >
                  {formik.values.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{formik.values.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {formik.values.description || "No description yet"}
                  </p>
                </div>
                <span
                  className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: formik.values.color }}
                >
                  0 masters
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Current count note */}
        {mode === "create" && categories.length > 0 && (
          <p className="text-xs text-slate-400 text-center">
            You have <strong className="text-slate-600">{categories.length}</strong> existing{" "}
            {categories.length === 1 ? "category" : "categories"}.
          </p>
        )}

        {/* Actions */}
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
            style={{ background: `linear-gradient(135deg, ${formik.values.color}dd, ${formik.values.color})` }}
          >
            <Sparkles className="w-4 h-4" />
            {mode === "edit" ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
