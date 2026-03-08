"use client";

import { useState, useEffect } from "react";
import { useMasters, useUpdateMaster } from "@/lib/hooks";
import { PlusCircle, Trash2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface QuickCreateMasterValuesProps {
  fieldId: string;
  masterId: string;
  onValuesCreated: (newValues: string[]) => void;
  onClose: () => void;
}

export default function QuickCreateMasterValues({
  fieldId,
  masterId,
  onValuesCreated,
  onClose,
}: QuickCreateMasterValuesProps) {
  const { data: masters = [] } = useMasters();
  const updateMaster = useUpdateMaster();
  
  const master = masters.find((m) => m.id === masterId);
  const field = master?.fields.find((f) => f.id === fieldId);

  const [newValues, setNewValues] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  if (!master || !field) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  const handleAddValue = () => {
    setNewValues([...newValues, ""]);
  };

  const handleRemoveValue = (index: number) => {
    if (newValues.length > 1) {
      setNewValues(newValues.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (index: number, value: string) => {
    const updated = [...newValues];
    updated[index] = value;
    setNewValues(updated);
  };

  const handleSave = async () => {
    const validValues = newValues.filter((v) => v.trim() !== "");
    
    if (validValues.length === 0) {
      toast.error("Add at least one value");
      return;
    }

    setSaving(true);

    try {
      // Update the master field with new options
      const updatedFields = master.fields.map((f) => {
        if (f.id === fieldId) {
          const existingOptions = f.options || [];
          const uniqueNewValues = validValues.filter(
            (v) => !existingOptions.includes(v)
          );
          return {
            ...f,
            options: [...existingOptions, ...uniqueNewValues],
          };
        }
        return f;
      });

      await updateMaster.mutateAsync({
        id: masterId,
        input: { fields: updatedFields },
      });

      toast.success(`Added ${validValues.length} value${validValues.length > 1 ? "s" : ""} to ${field.label}`);
      
      onValuesCreated(validValues);
    } catch (error) {
      toast.error("Failed to add values", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: master.color }}
          >
            {master.icon} {master.name}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Quick Add Values</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add new values to <span className="font-semibold">{field.label}</span>
        </p>
      </div>

      {/* Values List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 mb-4">
          {newValues.map((value, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3"
            >
              <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-xs font-bold text-slate-500 flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder={`Value ${index + 1}`}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white transition-all"
                autoFocus={index === newValues.length - 1}
              />
              {newValues.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddValue}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 rounded-xl text-sm text-indigo-500 font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Another Value
        </button>

        {/* Existing values preview */}
        {field.options && field.options.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-2">
              Existing Values ({field.options.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {field.options.map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                >
                  <Check className="w-3 h-3" />
                  {opt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          style={{ background: master.color }}
        >
          <Sparkles className="w-4 h-4" />
          {saving ? "Adding..." : "Add Values"}
        </button>
      </div>
    </div>
  );
}
