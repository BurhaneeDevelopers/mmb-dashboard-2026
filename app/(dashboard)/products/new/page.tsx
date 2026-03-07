import { Suspense } from "react";
import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductFormWrapper mode="create" />
    </Suspense>
  );
}
