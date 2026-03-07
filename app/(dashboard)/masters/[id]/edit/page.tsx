import { Suspense } from "react";
import { MasterFormWrapper } from "@/components/masters/MasterFormWrapper";

interface EditMasterPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMasterPage({ params }: EditMasterPageProps) {
  const { id } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MasterFormWrapper mode="edit" masterId={id} />
    </Suspense>
  );
}
