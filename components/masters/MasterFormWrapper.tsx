"use client";

import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { MasterForm } from "./MasterForm";

interface MasterFormWrapperProps {
  mode: "create" | "edit";
  masterId?: string;
}

export function MasterFormWrapper({ mode, masterId }: MasterFormWrapperProps) {
  const searchParams = useSearchParams();
  const { masterCategories } = useStore();
  
  const preselectedCategoryId = searchParams.get("categoryId") ?? "";

  if (mode === "edit" && masterId) {
    const master = masterCategories.find((m) => m.id === masterId);
    
    if (!master) {
      return (
        <div className="text-center py-20">
          <p className="text-slate-500">Master not found</p>
        </div>
      );
    }

    return (
      <MasterForm
        mode="edit"
        masterId={masterId}
        initialData={{
          name: master.name,
          description: master.description,
          color: master.color,
          icon: master.icon,
          linkedCategoryId: master.categoryId || "",
          fields: master.fields.map((f) => ({ label: f.label, type: "select" as const })),
        }}
      />
    );
  }

  return (
    <MasterForm
      mode="create"
      initialData={{
        name: "",
        description: "",
        color: "",
        icon: "",
        linkedCategoryId: preselectedCategoryId,
        fields: [{ label: "", type: "select" }],
      }}
    />
  );
}
