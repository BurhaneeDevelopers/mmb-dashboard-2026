import { Suspense } from "react";
import { MasterFormWrapper } from "@/components/masters/MasterFormWrapper";

export default function CreateMasterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MasterFormWrapper mode="create" />
    </Suspense>
  );
}
