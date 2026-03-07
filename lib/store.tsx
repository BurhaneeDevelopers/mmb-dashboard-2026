"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface MasterField {
  id: string;
  label: string;
  type: "select";
  options: string[];
  unit?: string;
}

export interface MasterCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  categoryId?: string; // linked to Category
  fields: MasterField[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  masterValues: Record<string, string[]>;
  status: "active" | "inactive" | "draft";
  createdAt: string;
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface StoreContextType {
  categories: Category[];
  addCategory: (c: Omit<Category, "id" | "createdAt">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => string | null; // returns error msg or null

  masterCategories: MasterCategory[];
  addMasterCategory: (m: Omit<MasterCategory, "id" | "createdAt">) => void;
  updateMasterCategory: (id: string, m: Partial<MasterCategory>) => void;
  deleteMasterCategory: (id: string) => void;

  products: Product[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORY_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#a855f7", "#14b8a6",
];

export const CATEGORY_ICONS = ["📁", "🗂️", "🏷️", "📌", "⭐", "💡", "🔑", "🎯", "🚀", "🔖"];

export const MASTER_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444",
];

export const MASTER_ICONS = ["⚙️", "🔩", "🔧", "🛠️", "📐", "🔗", "⚡"];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Die Springs",
    description: "Compression springs used in die sets and molds",
    color: "#6366f1",
    icon: "🔗",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cat-2",
    name: "Ejector Pins",
    description: "Pins used to eject parts from molds",
    color: "#ec4899",
    icon: "📌",
    createdAt: new Date().toISOString(),
  },
];

const SEED_MASTERS: MasterCategory[] = [
  {
    id: "master-1",
    name: "Size",
    description: "Product size specification",
    color: "#6366f1",
    icon: "📐",
    categoryId: "cat-1",
    fields: [
      { id: "f1", label: "Size", type: "select", options: ["M6", "M8", "M10", "M12", "M16"] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "master-2",
    name: "Load",
    description: "Load capacity specification",
    color: "#f59e0b",
    icon: "⚡",
    categoryId: "cat-1",
    fields: [
      { id: "f2", label: "Load", type: "select", options: ["Light", "Medium", "Heavy", "Extra Heavy"] },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "master-3",
    name: "Length",
    description: "Product length measurement",
    color: "#ec4899",
    icon: "📏",
    categoryId: "cat-2",
    fields: [
      { id: "f3", label: "Length", type: "select", options: ["50mm", "75mm", "100mm", "150mm", "200mm"], unit: "mm" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "master-4",
    name: "Material",
    description: "Material composition",
    color: "#10b981",
    icon: "🔧",
    categoryId: "cat-2",
    fields: [
      { id: "f4", label: "Material", type: "select", options: ["SKD61", "SKH51", "Nitrided Steel", "Stainless Steel"] },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(SEED_MASTERS);
  const [products, setProducts] = useState<Product[]>([]);

  // ── Categories ──────────────────────────────────────────────────────────────

  const addCategory = (c: Omit<Category, "id" | "createdAt">) => {
    setCategories((prev) => [
      ...prev,
      { ...c, id: `grp-${Date.now()}`, createdAt: new Date().toISOString() },
    ]);
  };

  const updateCategory = (id: string, c: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...c } : cat)));
  };

  const deleteCategory = (id: string): string | null => {
    const linkedMasters = masterCategories.filter((m) => m.categoryId === id);
    if (linkedMasters.length > 0) {
      return `${linkedMasters.length} master${linkedMasters.length > 1 ? "s" : ""} are linked to this category. Unlink or delete them first.`;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return null;
  };

  // ── Masters ─────────────────────────────────────────────────────────────────

  const addMasterCategory = (m: Omit<MasterCategory, "id" | "createdAt">) => {
    setMasterCategories((prev) => [
      ...prev,
      { ...m, id: `cat-${Date.now()}`, createdAt: new Date().toISOString() },
    ]);
  };

  const updateMasterCategory = (id: string, m: Partial<MasterCategory>) => {
    setMasterCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...m } : c)));
  };

  const deleteMasterCategory = (id: string) => {
    setMasterCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Products ────────────────────────────────────────────────────────────────

  const addProduct = (p: Omit<Product, "id" | "createdAt">) => {
    setProducts((prev) => [
      ...prev,
      { ...p, id: `prod-${Date.now()}`, createdAt: new Date().toISOString() },
    ]);
  };

  const updateProduct = (id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((pr) => (pr.id === id ? { ...pr, ...p } : pr)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((pr) => pr.id !== id));
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        masterCategories,
        addMasterCategory,
        updateMasterCategory,
        deleteMasterCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
