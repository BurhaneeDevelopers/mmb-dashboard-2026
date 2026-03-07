import { useState } from "react";
import { Category, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/store";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CategoryEditCardProps {
  category: Category;
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
}

export function CategoryEditCard({ category, onSave, onCancel }: CategoryEditCardProps) {
  const [editName, setEditName] = useState(category.name);
  const [editDesc, setEditDesc] = useState(category.description);
  const [editColor, setEditColor] = useState(category.color);
  const [editIcon, setEditIcon] = useState(category.icon);

  const handleSave = () => {
    if (!editName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    onSave({ name: editName.trim(), description: editDesc.trim(), color: editColor, icon: editIcon });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
          <Edit2 className="w-3 h-3" /> Editing
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Check className="w-3 h-3" /> Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="rounded-xl border-l-4 px-3 py-2 bg-slate-50 flex items-center gap-2"
        style={{ borderLeftColor: editColor }}
      >
        <span className="text-xl">{editIcon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{editName || "Category name"}</p>
          <p className="text-xs text-slate-400">{editDesc || "Description"}</p>
        </div>
      </div>

      <input
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Category name"
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
      />
      <textarea
        value={editDesc}
        onChange={(e) => setEditDesc(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
      />

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setEditColor(c)}
              className={cn(
                "w-7 h-7 rounded-full transition-all",
                editColor === c ? "ring-2 ring-offset-1 ring-slate-500 scale-110" : "hover:scale-105"
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Icon</p>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORY_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setEditIcon(ic)}
              className={cn(
                "w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all",
                editIcon === ic
                  ? "border-indigo-400 bg-indigo-50 scale-110"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
