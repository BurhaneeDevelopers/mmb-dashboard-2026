"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { useCategories, useMasters, useCreateProduct, useUpdateProduct } from "@/lib/hooks";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { AttributesSection } from "./form-sections/AttributesSection";
import { CategorySection } from "./form-sections/CategorySection";

type FormData = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive";
  masterValues: Record<string, string[]>;
};

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: FormData;
  productId?: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Product name is required")
    .min(2, "At least 2 characters"),
  sku: Yup.string()
    .required("SKU is required")
    .min(3, "At least 3 characters"),
  categoryId: Yup.string()
    .required("Please select a category"),
  description: Yup.string(),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Status is required"),
  masterValues: Yup.object(),
});

export function ProductForm({ mode, initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: allMasters = [], isLoading: mastersLoading } = useMasters();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const formik = useFormik<FormData>({
    initialValues: initialData ?? {
      name: "",
      sku: "",
      categoryId: "",
      description: "",
      status: "active",
      masterValues: {},
    },
    validationSchema,
    onSubmit: async (values: FormData) => {
      try {
        if (mode === "edit" && productId) {
          await updateProduct.mutateAsync({
            id: productId,
            input: {
              name: values.name,
              sku: values.sku,
              categoryId: values.categoryId,
              description: values.description || undefined,
              status: values.status,
              masterValues: values.masterValues,
            },
          });
          toast.success(`Product "${values.name}" updated!`);
        } else {
          await createProduct.mutateAsync({
            name: values.name,
            sku: values.sku,
            categoryId: values.categoryId,
            description: values.description || undefined,
            status: values.status,
            masterValues: values.masterValues,
          });
          toast.success(`Product "${values.name}" created!`);
        }
        router.push("/products");
      } catch (error) {
        toast.error(mode === "edit" ? "Failed to update product" : "Failed to create product", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    },
  });

  // Filter masters by selected category
  const categoryMasters = allMasters.filter((m) => m.categoryId === formik.values.categoryId);

  if (categoriesLoading || mastersLoading) {
    return (
      <div className="mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span>Products</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 font-medium">
            {mode === "edit" ? "Edit Product" : "Add New Product"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Each product is unique — fill in only the attributes that apply.
        </p>
      </div>

      {categories.length === 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">No Categories Found</p>
            <p className="text-xs text-amber-700 mt-0.5">You need to create at least one category before adding products.</p>
          </div>
          <button
            onClick={() => router.push("/categories/new")}
            className="text-xs font-semibold text-amber-700 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Create Category <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <BasicInfoSection formik={formik} />

        <CategorySection
          selectedCategoryId={formik.values.categoryId}
          categories={categories}
          formik={formik}
        />

        {formik.values.categoryId && categoryMasters.length > 0 && (
          <AttributesSection
            categoryId={formik.values.categoryId}
            masters={categoryMasters}
            formik={formik}
          />
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
            disabled={formik.isSubmitting || categories.length === 0 || createProduct.isPending || updateProduct.isPending}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
          >
            <Sparkles className="w-4 h-4" />
            {mode === "edit" ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
