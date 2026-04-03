"use client";

import { useSearchParams } from "next/navigation";
import { useMaster } from "@/lib/hooks";
import { MasterForm } from "./MasterForm";
import { MASTER_COLORS, MASTER_ICONS } from "@/lib/store";

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
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
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
          // Convert options array back to fields array for the form
          fields: master.fields.length > 0 && master.fields[0].options.length > 0
            ? master.fields[0].options.map((opt) => ({ label: opt, type: "select" as const }))
            : [{ label: "", type: "select" as const }],
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
        color: MASTER_COLORS[0],
        icon: MASTER_ICONS[0],
        linkedCategoryId: preselectedCategoryId,
        fields: [{ label: "", type: "select" }],
      }}
    />
  );
}
