"use client";

import { useStore } from "@/lib/store";
import { Layers, Package, TrendingUp, Zap, ArrowRight, PlusCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

const TIPS = [
  "Start by creating Masters (size, diameter, material) before adding products.",
  "Each Master category can hold up to 7 custom fields.",
  "Products inherit all Masters from their category — fill in only what applies.",
  "Use multi-select to assign multiple values per field (e.g., sizes: M6, M8, M10).",
];

export default function DashboardPage() {
  const { masterCategories, products, categories } = useStore();

  const stats = [
    {
      label: "Categories",
      value: categories.length,
      icon: Layers,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/categories",
    },
    {
      label: "Masters",
      value: masterCategories.length,
      max: 7,
      icon: Zap,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      textColor: "text-indigo-600",
      href: "/masters",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: ShoppingBag,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
      textColor: "text-pink-600",
      href: "/products",
    },
    {
      label: "Active Products",
      value: products.filter((p) => p.status === "active").length,
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      href: "/products",
    },
  ];

  const quickActions = [
    {
      title: "New Category",
      desc: "Group your masters into product families",
      href: "/categories/new",
      icon: "📁",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Create a Master",
      desc: "Define size, dia, material and other attributes",
      href: "/masters/new",
      icon: "🏗️",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      title: "Add a Product",
      desc: "Link attributes and create a unique product entry",
      href: "/products/new",
      icon: "📦",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Browse Products",
      desc: "Search, filter and manage all products",
      href: "/products",
      icon: "🛒",
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back! 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here's what's happening with your fasteners catalog today.
          </p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <PlusCircle className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
          >
            <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-4`}>
              <s.icon className={`w-5 h-5 ${s.textColor}`} />
            </div>
            <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            {s.max && (
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${s.color}`}
                  style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%` }}
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="group bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-lg mb-4 shadow-sm`}
              >
                {a.icon}
              </div>
              <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {a.title}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Go <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">How it works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Create Masters",
              desc: "Set up attribute categories like Size, Diameter, Material with their possible values.",
              color: "bg-indigo-500",
            },
            {
              step: "2",
              title: "Add Products",
              desc: "Choose a master category — all its attributes appear automatically for you to fill.",
              color: "bg-pink-500",
            },
            {
              step: "3",
              title: "Multi-select Values",
              desc: "Each attribute supports multiple values — a product can come in M6, M8, M10 all at once.",
              color: "bg-amber-500",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div
                className={`w-7 h-7 rounded-full ${item.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                {item.step}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">💡 Tips for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TIPS.map((tip, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-xl p-4 flex gap-3 items-start"
            >
              <span className="text-lg mt-0.5">
                {["🎯", "🔢", "📝", "🏷️"][i]}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
