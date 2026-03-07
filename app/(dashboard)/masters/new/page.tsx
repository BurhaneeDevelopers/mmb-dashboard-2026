"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useStore, MASTER_COLORS, MASTER_ICONS } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Trash2, ChevronRight, Sparkles, Info, FolderOpen } from "lucide-react";
import { useState, Suspense } from "react";
import { cn } from "@/lib/utils";

const fieldSchema = yup.object({
  label: yup.string().required("Value is required"),
  type: yup.mixed<"select">().oneOf(["select"]).required(),
});

const schema = yup.object({
  name: yup.string().required("Master name is required").min(2, "At least 2 characters"),
  description: yup.string().required("Description is required"),
  color: yup.string().required(),
  icon: yup.string().required(),
  linkedCategoryId: yup.string().default(""),
  fields: yup
    .array(fieldSchema)
    .min(1, "Add at least one value")
    .required(),
});

type FormData = yup.InferType<typeof schema>;

function CreateMasterForm() {
  const { addMasterCategory, masterCategories, categories } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get("categoryId") ?? "";

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      color: MASTER_COLORS[0],
      icon: MASTER_ICONS[0],
      linkedCategoryId: preselectedCategoryId,
      fields: [{ label: "", type: "select" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });
  const watchColor = watch("color");
  const watchIcon = watch("icon");
  const watchName = watch("name");
  const watchLinkedCategoryId = watch("linkedCategoryId");

  const remaining = 7 - masterCategories.length;
  const linkedCategory = categories.find((c) => c.id === watchLinkedCategoryId);

  const onSubmit = (data: FormData) => {
    addMasterCategory({
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      categoryId: data.linkedCategoryId || undefined,
      fields: data.fields.map((f, i) => ({
        id: `f-${Date.now()}-${i}`,
        label: f.label,
        type: "select",
        options: [],
      })),
    });
    toast.success(`Master "${data.name}" created!`, {
      description: `${data.fields.length} value${data.fields.length > 1 ? "s" : ""} added.`,
    });
    router.push("/masters");
  };

  if (remaining <= 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Maximum Masters Reached</h2>
        <p className="text-slate-500 mb-6">You've used all master slots. Delete an existing one to create a new one.</p>
        <button
          onClick={() => router.push("/masters")}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          Manage Masters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span className="hover:text-indigo-500 cursor-pointer" onClick={() => router.push("/masters")}>
          Masters
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 font-medium">Create New</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create Master</h1>
        <p className="text-slate-500 text-sm mt-1">
          Masters define value types for your products (like Size, Color, Material).
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          A <strong>Master</strong> represents a value type (e.g., "Size", "Color") with specific values (e.g., 9, 10, 11 or Red, Blue, Green).
          Link it to a <strong>Category</strong> to keep things organised.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Step 1: Identity ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">1</div>
            <h2 className="text-sm font-semibold text-slate-700">Master Identity</h2>
          </div>

          {/* Live preview chip */}
          {watchName && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Preview:</span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm"
                style={{ background: watchColor }}
              >
                {watchIcon} {watchName}
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
                {...register("name")}
                placeholder="e.g., Size, Color, Material, Length..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                placeholder="Brief description of this value type..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Badge Color</label>
              <div className="flex gap-2 flex-wrap">
                {MASTER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setValue("color", c)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      watchColor === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {MASTER_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setValue("icon", ic)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-lg flex items-center justify-center border-2 transition-all",
                      watchIcon === ic
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

        {/* ── Step 2: Link to Category ───────────────────────────────────── */}
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
                  onClick={() => setValue("linkedCategoryId", "")}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    !watchLinkedCategoryId
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
                    onClick={() => setValue("linkedCategoryId", cat.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      watchLinkedCategoryId === cat.id
                        ? "border-transparent shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                    style={
                      watchLinkedCategoryId === cat.id
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

        {/* ── Step 3: Add Values ─────────────────────────────────────────────── */}
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

          {errors.fields && !Array.isArray(errors.fields) && (
            <p className="mb-3 text-xs text-red-500">{errors.fields.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                remove={remove}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ label: "", type: "select" })}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-sm text-indigo-500 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Value
          </button>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
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
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Sparkles className="w-4 h-4" />
            Create Master
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateMasterPage() {
  return (
    <Suspense>
      <CreateMasterForm />
    </Suspense>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
  index,
  register,
  errors,
  remove,
  canRemove,
}: any) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-400 flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <input
            {...register(`fields.${index}.label`)}
            placeholder="Value (e.g., 9, Red, Steel)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
          />
          {errors.fields?.[index]?.label && (
            <p className="mt-0.5 text-[10px] text-red-500">{errors.fields[index].label.message}</p>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
