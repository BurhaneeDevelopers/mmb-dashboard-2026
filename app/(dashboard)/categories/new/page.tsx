"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useStore, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Sparkles, Info, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = yup.object({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "At least 2 characters")
    .max(40, "Max 40 characters"),
  description: yup
    .string()
    .required("Please add a short description")
    .min(5, "At least 5 characters")
    .max(200, "Max 200 characters"),
  color: yup.string().required("Pick a color"),
  icon: yup.string().required("Pick an icon"),
});

type FormData = yup.InferType<typeof schema>;

export default function NewCategoryPage() {
  const { addCategory, categories } = useStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    },
  });

  const watchColor = watch("color");
  const watchIcon = watch("icon");
  const watchName = watch("name");

  const onSubmit = (data: FormData) => {
    addCategory({
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
    });
    toast.success(`Category "${data.name}" created!`, {
      description: "You can now link masters to this category.",
    });
    router.push("/categories");
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span
          className="hover:text-indigo-500 cursor-pointer transition-colors"
          onClick={() => router.push("/categories")}
        >
          Categories
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 font-medium">New Category</span>
      </div>

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-xl"
            style={{ background: `linear-gradient(135deg, ${watchColor}cc, ${watchColor})` }}
          >
            {watchIcon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">New Category</h1>
            <p className="text-slate-500 text-sm">
              Group your masters under a logical category.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">What is a Category?</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Categories are top-level groups for your masters — for example, <strong>"Springs"</strong> can
            contain masters like "Die Springs" and "Compression Springs".
            Think of them as folders that keep your catalog organised.
          </p>
        </div>
      </div>

      {/* Live preview chip */}
      {watchName && (
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs text-slate-400">Preview:</span>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-sm"
            style={{ background: watchColor }}
          >
            {watchIcon} {watchName}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-700">Category Details</h2>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              placeholder="e.g., Springs, Pins & Punches, Bolts, Washers..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Briefly describe what types of products fall under this category..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.description.message}
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

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Badge Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  title={c}
                  className={cn(
                    "w-9 h-9 rounded-full transition-all duration-150 shadow-sm",
                    watchColor === c
                      ? "ring-3 ring-offset-2 ring-slate-500 scale-110 shadow-md"
                      : "hover:scale-105 hover:shadow-md"
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setValue("icon", ic)}
                  className={cn(
                    "w-11 h-11 rounded-xl text-xl flex items-center justify-center border-2 transition-all duration-150",
                    watchIcon === ic
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
          {watchName && (
            <div className="mt-2 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">Card Preview</p>
              <div
                className="bg-white rounded-xl border-l-4 p-4 shadow-sm flex items-center gap-3"
                style={{ borderLeftColor: watchColor }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${watchColor}20` }}
                >
                  {watchIcon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{watchName}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {watch("description") || "No description yet"}
                  </p>
                </div>
                <span
                  className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: watchColor }}
                >
                  0 masters
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Current count note */}
        {categories.length > 0 && (
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
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${watchColor}dd, ${watchColor})` }}
          >
            <Sparkles className="w-4 h-4" />
            Create Category
          </button>
        </div>
      </form>
    </div>
  );
}
