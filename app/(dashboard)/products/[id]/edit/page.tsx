import { Suspense } from "react";
import { ProductFormWrapper } from "@/components/products/ProductFormWrapper";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductFormWrapper mode="edit" productId={id} />
    </Suspense>
  );
}
