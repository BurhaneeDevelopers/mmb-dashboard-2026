import { CategoryFormWrapper } from "@/components/categories/CategoryFormWrapper";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  
  return <CategoryFormWrapper mode="edit" categoryId={id} />;
}
