"use client";

import { useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/hooks";
import { ProductForm } from "./ProductForm";

interface ProductFormWrapperProps {
  mode: "create" | "edit";
  productId?: string;
}

export function ProductFormWrapper({ mode, productId }: ProductFormWrapperProps) {
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category") ?? "";

  const { data: product, isLoading, error } = useProduct(productId || "");

  if (mode === "edit" && productId) {
    if (isLoading) {
      return (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-4">Loading product...</p>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">Product not found</p>
        </div>
      );
    }

    return (
      <ProductForm
        mode="edit"
        productId={productId}
        initialData={{
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          description: product.description,
          status: product.status,
          masterValues: product.masterValues,
        }}
      />
    );
  }

  return (
    <ProductForm
      mode="create"
      initialData={{
        name: "",
        sku: "",
        categoryId: preselectedCategory,
        description: "",
        status: "active",
        masterValues: {},
      }}
    />
  );
}
