"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Sparkles,
  Info,
  Package,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import TagInput from "@/components/TagInput";
import MultiSelect from "@/components/MultiSelect";

const schema = yup.object({
  name: yup.string().required("Product name is required").min(2, "At least 2 characters"),
  sku: yup.string().required("SKU is required"),
  categoryId: yup.string().required("Please select a master category"),
  description: yup.string().optional(),
  status: yup.mixed<"active" | "inactive" | "draft">().oneOf(["active", "inactive", "draft"]).required(),
  masterValues: yup.object().optional(),
});

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description?: string;
  status: "active" | "inactive" | "draft";
  masterValues?: Record<string, string[]>;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active", emoji: "🟢", desc: "Visible and available", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "draft", label: "Draft", emoji: "🟡", desc: "Saved but not published", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { value: "inactive", label: "Inactive", emoji: "🔴", desc: "Hidden from catalog", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
];

function CreateProductForm() {
  const { masterCategories, addProduct } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category") ?? "";

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      sku: "",
      categoryId: preselectedCategory,
      description: "",
      status: "draft",
      masterValues: {},
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedCategory = masterCategories.find((c) => c.id === selectedCategoryId);
  const watchMasterValues = watch("masterValues") ?? {};

  const generateSKU = () => {
    const name = watch("name");
    const prefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
    const num = Math.floor(1000 + Math.random() * 9000);
    setValue("sku", `${prefix || "PRD"}-${num}`);
  };

  const onSubmit = (data: FormData) => {
    addProduct({
      name: data.name,
      sku: data.sku,
      categoryId: data.categoryId,
      description: data.description ?? "",
      status: data.status,
      masterValues: (data.masterValues as Record<string, string[]>) ?? {},
    });
    toast.success(`Product "${data.name}" created!`, {
      description: `SKU: ${data.sku} · Status: ${data.status}`,
    });
    router.push("/products");
  };

  const filledFields = Object.values(watchMasterValues).filter((v) => v && v.length > 0).length;
  const totalFields = selectedCategory?.fields.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Products</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 font-medium">Add New Product</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Add New Product</h1>
        <p className="text-slate-500 text-sm mt-1">
          Each product is unique — fill in only the attributes that apply.
        </p>
      </div>

      {masterCategories.length === 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">No Master Categories Found</p>
            <p className="text-xs text-amber-700 mt-0.5">You need to create at least one master before adding products.</p>
          </div>
          <button
            onClick={() => router.push("/masters/new")}
            className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Create Master <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Info */}
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
                {...register("name")}
                placeholder="e.g., Heavy Duty Die Spring M12 x 50mm"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                SKU (Product Code) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  {...register("sku")}
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
              {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
              <p className="mt-1 text-[11px] text-slate-400">Unique code to identify this product in your inventory</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                {...register("description")}
                placeholder="Optional — add any extra notes about this product..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex-1 py-3 px-3 rounded-xl border-2 text-center transition-all",
                          field.value === opt.value
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
                )}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Choose Master Category */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center">2</div>
            <h2 className="text-sm font-semibold text-slate-700">Select Master Category</h2>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Choose the type of product. Once selected, all related attributes will appear below for you to fill in.
          </p>

          {errors.categoryId && <p className="mb-3 text-xs text-red-500">{errors.categoryId.message}</p>}

          <div className="grid grid-cols-2 gap-2.5">
            {masterCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setValue("categoryId", cat.id);
                  setValue("masterValues", {});
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
                    <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: cat.color }} />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                <p className="text-[11px] mt-1.5 font-medium" style={{ color: cat.color }}>
                  {cat.fields.length} attribute{cat.fields.length !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
            {masterCategories.length === 0 && (
              <div className="col-span-2 text-center py-8 text-sm text-slate-400">
                No masters available — create one first
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Fill Attributes */}
        {selectedCategory && (
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
              <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-700 leading-relaxed">
                All attributes are optional. Select multiple values for each — e.g., a product can come in M6, M8, M10 all at once. Just skip what doesn't apply.
              </p>
            </div>

            <div className="space-y-5">
              {selectedCategory.fields.map((field) => (
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

                  <Controller
                    control={control}
                    name={`masterValues.${field.id}`}
                    defaultValue={[]}
                    render={({ field: formField }) => {
                      const val = (formField.value as string[]) ?? [];
                      return (
                        <MultiSelect
                          options={field.options ?? []}
                          value={val}
                          onChange={formField.onChange}
                          placeholder={`Choose ${field.label.toLowerCase()} value(s)...`}
                          fieldId={field.id}
                          masterId={selectedCategoryId}
                          enableQuickCreate={true}
                        />
                      );
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Progress summary */}
            {filledFields > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-600 mb-2">Filled Attributes Summary</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.fields
                    .filter((f) => watchMasterValues[f.id]?.length > 0)
                    .map((f) => (
                      <div key={f.id} className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                        <span className="text-slate-500 font-medium">{f.label}:</span>{" "}
                        <span className="text-slate-700">{watchMasterValues[f.id]?.join(", ")}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
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
            disabled={isSubmitting || masterCategories.length === 0}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
          >
            <Sparkles className="w-4 h-4" />
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense>
      <CreateProductForm />
    </Suspense>
  );
}
