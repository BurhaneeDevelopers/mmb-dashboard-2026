"use client";

import { useSearchParams } from "next/navigation";
import { useMaster } from "@/lib/hooks";
import { MasterForm } from "./MasterForm";

interface MasterFormWrapperProps {
  mode: "create" | "edit";
  masterId?: string;
}

export function MasterFormWrapper({ mode, masterId }: MasterFormWrapperProps) {
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get("categoryId") ?? "";

  const { data: master, isLoading, error } = useMaster(masterId || "");

  if (mode === "edit" && masterId) {
    if (isLoading) {
      return (
        <div className="mx-auto py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-4">Loading master...</p>
        </div>
      );
    }

    if (error || !master) {
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
