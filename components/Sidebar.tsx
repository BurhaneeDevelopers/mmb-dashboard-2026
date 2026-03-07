"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  ShoppingBag,
  FolderOpen,
  FolderPlus,
  Layers,
  Package,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
    ],
  },
  {
    label: "Categories",
    items: [
      { href: "/categories/new", icon: FolderPlus, label: "New Category", exact: false },
      { href: "/categories", icon: FolderOpen, label: "All Categories", exact: true },
    ],
  },
  {
    label: "Masters",
    items: [
      { href: "/masters/new", icon: PlusCircle, label: "Create Master", exact: false },
      { href: "/masters", icon: Layers, label: "All Masters", exact: true },
    ],
  },
  {
    label: "Products",
    items: [
      { href: "/products/new", icon: Package, label: "Add Product", exact: false },
      { href: "/products", icon: ShoppingBag, label: "All Products", exact: true },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { masterCategories, products, categories } = useStore();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-100 shadow-sm"
      style={{ width: 260 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
          style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
        >
          F
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">FastenersPro</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          active ? "text-indigo-500" : "text-slate-400"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom stats panel */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* Categories bar */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Categories</span>
            <span className="font-bold text-indigo-600">{categories.length}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.slice(0, 6).map((c) => (
              <span
                key={c.id}
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium leading-none"
                style={{ background: c.color }}
              >
                {c.icon}
              </span>
            ))}
            {categories.length === 0 && (
              <span className="text-[11px] text-slate-400">None yet</span>
            )}
          </div>
        </div>

        {/* Masters bar */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium text-slate-600">Masters</span>
            <span className="font-bold text-indigo-600">{masterCategories.length}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {masterCategories.slice(0, 8).map((m) => (
              <span
                key={m.id}
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium leading-none"
                style={{ background: m.color }}
              >
                {m.icon}
              </span>
            ))}
            {masterCategories.length === 0 && (
              <span className="text-[11px] text-slate-400">None yet</span>
            )}
          </div>
        </div>

        {/* Products count */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Products</span>
            <span className="font-bold text-pink-600 text-lg">{products.length}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
