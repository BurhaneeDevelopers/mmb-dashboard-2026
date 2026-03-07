"use client";

import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { ProductForm } from "./ProductForm";

interface ProductFormWrapperProps {
  mode: "create" | "edit";
  productId?: string;
}

export function ProductFormWrapper({ mode, productId }: ProductFormWrapperProps) {
  const searchParams = useSearchParams();
  const { products } = useStore();
  
  const preselectedCategory = searchParams.get("category") ?? "";

  if (mode === "edit" && productId) {
    const product = products.find((p) => p.id === productId);
    
    if (!product) {
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
