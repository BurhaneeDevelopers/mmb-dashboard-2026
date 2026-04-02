"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Layers,
  Package,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight,
  Zap,
  Target,
  Lightbulb,
} from "lucide-react";
import { useCategories, useMasters, useProducts } from "@/lib/hooks";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: categories = [] } = useCategories();
  const { data: masters = [] } = useMasters();
  const { data: products = [] } = useProducts();

  const steps = [
    {
      id: "welcome",
      title: "Welcome to FastenersPro",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "categories",
      title: "Step 1: Create Categories",
      icon: FolderPlus,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "masters",
      title: "Step 2: Define Masters",
      icon: Layers,
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "products",
      title: "Step 3: Add Products",
      icon: Package,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "features",
      title: "Power Features",
      icon: Zap,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Getting Started Guide
        </h1>
        <p className="text-slate-500">
          Learn how to create detailed products with variants for your e-commerce site
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  currentStep === index
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-xs hidden md:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
              )}
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm min-h-[600px]">
        {/* Welcome Step */}
        {currentStep === 0 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl shadow-lg">
                🎯
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Build Your Product Catalog
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                FastenersPro helps you create detailed product listings with multiple variants.
                Perfect for e-commerce sites selling fasteners, hardware, and industrial components.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border-2 border-blue-100 bg-blue-50/50">
                <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-3">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Categories</h3>
                <p className="text-xs text-slate-600">
                  Organize products into logical groups like Springs, Bolts, Washers
                </p>
              </div>

              <div className="p-5 rounded-xl border-2 border-indigo-100 bg-indigo-50/50">
                <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Masters</h3>
                <p className="text-xs text-slate-600">
                  Define attributes like Size, Material, Finish that products can have
                </p>
              </div>

              <div className="p-5 rounded-xl border-2 border-pink-100 bg-pink-50/50">
                <div className="w-10 h-10 rounded-lg bg-pink-500 text-white flex items-center justify-center mb-3">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Products</h3>
                <p className="text-xs text-slate-600">
                  Create products with specific attribute values and variants
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">The Workflow</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  First create categories → Then define masters for those categories → Finally add products
                  with specific master values. This structure gives you maximum flexibility for variants.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories Step */}
        {currentStep === 1 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                📁
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Step 1: Create Categories
                </h2>
                <p className="text-slate-600">
                  Categories are top-level groups that organize your products. Think of them as folders.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Your Progress</p>
                <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                <p className="text-xs text-slate-500">categories</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  What are Categories?
                </h3>
                <p className="text-sm text-slate-700 mb-3">
                  Categories group similar products together. For a fasteners business, you might have:
                </p>
                <div className="grid md:grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-slate-700">🔩 Bolts &amp; Screws</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Hex bolts, machine screws, etc.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-slate-700">🌀 Springs</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Compression, extension springs</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-slate-700">⭕ Washers</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Flat, lock, spring washers</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-slate-700">📌 Pins &amp; Dowels</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Dowel pins, cotter pins</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  How to Create a Category
                </h3>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Click "New Category" in the sidebar or navigation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Enter a name (e.g., &quot;Springs&quot;) and description</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Pick a color and icon to make it visually distinct</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                    <span>Save and you're done! Now you can link masters to this category</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={() => router.push("/categories/new")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <FolderPlus className="w-5 h-5" />
                Create Your First Category
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Masters Step */}
        {currentStep === 2 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                🎨
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Step 2: Define Masters (Attributes)
                </h2>
                <p className="text-slate-600">
                  Masters are attribute types that products can have. They define what makes each product unique.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Your Progress</p>
                <p className="text-2xl font-bold text-indigo-600">{masters.length}</p>
                <p className="text-xs text-slate-500">masters</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  What are Masters?
                </h3>
                <p className="text-sm text-slate-700 mb-3">
                  Masters define the types of attributes products can have. For example, if you&apos;re selling bolts:
                </p>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📏</span>
                      <p className="text-sm font-semibold text-slate-800">Size Master</p>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Values: M6, M8, M10, M12, M16, M20</p>
                    <p className="text-[11px] text-slate-500">Products can have multiple sizes (e.g., available in M6, M8, M10)</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎨</span>
                      <p className="text-sm font-semibold text-slate-800">Finish Master</p>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Values: Zinc Plated, Black Oxide, Stainless Steel, Galvanized</p>
                    <p className="text-[11px] text-slate-500">Products can come in different finishes</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📐</span>
                      <p className="text-sm font-semibold text-slate-800">Length Master</p>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">Values: 10mm, 15mm, 20mm, 25mm, 30mm, 40mm, 50mm</p>
                    <p className="text-[11px] text-slate-500">Products available in various lengths</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  Linking Masters to Categories
                </h3>
                <p className="text-sm text-slate-700">
                  You can optionally link a master to a category. This helps organize masters and provides
                  smart suggestions when creating products in that category.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  How to Create a Master
                </h3>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Click "Create Master" in the sidebar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Name it (e.g., &quot;Thread Size&quot;, &quot;Material&quot;, &quot;Coating&quot;)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Optionally link it to a category for better organization</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
                    <span>Add values (e.g., M6, M8, M10 for a Size master)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">5</span>
                    <span>Save! Now products can use these attribute values</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={() => router.push("/masters/new")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Layers className="w-5 h-5" />
                Create Your First Master
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Products Step */}
        {currentStep === 3 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                📦
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Step 3: Add Products with Variants
                </h2>
                <p className="text-slate-600">
                  Now combine categories and masters to create detailed product listings with multiple variants.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Your Progress</p>
                <p className="text-2xl font-bold text-pink-600">{products.length}</p>
                <p className="text-xs text-slate-500">products</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-pink-50 border-l-4 border-pink-500 rounded-r-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-pink-600" />
                  The Product Creation Flow
                </h3>
                <div className="space-y-3 mt-3">
                  <div className="bg-white rounded-lg p-3 border border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">1</div>
                      <p className="text-sm font-semibold text-slate-800">Basic Info</p>
                    </div>
                    <p className="text-xs text-slate-600">Enter product name, SKU, and description</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">2</div>
                      <p className="text-sm font-semibold text-slate-800">Select Category</p>
                    </div>
                    <p className="text-xs text-slate-600">Choose which category this product belongs to</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">3</div>
                      <p className="text-sm font-semibold text-slate-800">Choose Master Values</p>
                    </div>
                    <p className="text-xs text-slate-600">Select specific values from available masters (e.g., M6, M8 for Size)</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Example: Creating a Hex Bolt Product
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Product Name:</span> Stainless Steel Hex Bolt</p>
                  <p><span className="font-semibold">Category:</span> Bolts & Screws</p>
                  <p><span className="font-semibold">Attributes:</span></p>
                  <ul className="ml-4 space-y-1 text-xs">
                    <li>• <span className="font-medium">Size:</span> M6, M8, M10, M12 (multiple values = variants)</li>
                    <li>• <span className="font-medium">Length:</span> 20mm, 25mm, 30mm, 40mm, 50mm</li>
                    <li>• <span className="font-medium">Material:</span> Stainless Steel 304</li>
                    <li>• <span className="font-medium">Finish:</span> Polished</li>
                  </ul>
                    <p className="text-xs text-slate-600 mb-2 bg-emerald-100 rounded p-2">
                      💡 This creates one product with multiple variants (4 sizes × 5 lengths = 20 variants!)
                    </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Important Notes
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-pink-500">•</span>
                    <span>All attributes are optional - only fill what applies to your product</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-500">•</span>
                    <span>You can select multiple values per master to create variants</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-500">•</span>
                    <span>Only masters linked to the selected category will appear</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-500">•</span>
                    <span>You can create new masters on-the-fly while adding products</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/products/new")}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Package className="w-5 h-5" />
                Create Your First Product
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Features Step */}
        {currentStep === 4 && (
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Power Features to Save Time
                </h2>
                <p className="text-slate-600">
                  FastenersPro includes smart features to make product creation faster and easier.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick Create Master Values */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Quick Create Master Values</h3>
                    <p className="text-sm text-slate-600">
                      Add new values to masters without leaving the product creation page
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">How it works:</p>
                  <ol className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>While creating a product, click the &quot;+&quot; button next to any master field</span>
                  </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">2.</span>
                      <span>A quick dialog opens where you can add new values instantly</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">3.</span>
                      <span>New values are immediately available for selection</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">4.</span>
                      <span>No need to navigate away or lose your progress!</span>
                    </li>
                  </ol>
                  <div className="mt-3 p-2 bg-emerald-50 rounded text-[11px] text-emerald-700">
                    💡 Perfect when you realize you need a new size or finish option mid-way through product creation
                  </div>
                </div>
              </div>

              {/* Smart Suggestions */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Smart Master Suggestions</h3>
                    <p className="text-sm text-slate-600">
                      Get suggestions from existing masters when creating new ones
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Example scenario:</p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>You created a "Size" master for the "Bolts" category with values: M6, M8, M10, M12</p>
                    <p className="text-blue-700 bg-blue-50 p-2 rounded">
                      ✨ When creating a "Size" master for "Washers" category, the system suggests: M6, M8, M10, M12
                    </p>
                    <p>You can quick-select these values instead of typing them again!</p>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-[11px] text-blue-700">
                    💡 Saves time when creating similar masters across different categories
                  </div>
                </div>
              </div>

              {/* Multi-Select for Variants */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Multi-Select for Variants</h3>
                    <p className="text-sm text-slate-600">
                      Select multiple values per attribute to create product variants automatically
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Create variants effortlessly:</p>
                  <div className="space-y-2">
                    <div className="text-xs bg-purple-50 p-2 rounded">
                      <p className="font-medium text-purple-800">Size: M6, M8, M10</p>
                      <p className="font-medium text-purple-800">Finish: Zinc, Black Oxide</p>
                      <p className="text-purple-600 mt-1">= 6 variants automatically (3 sizes × 2 finishes)</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-purple-50 rounded text-[11px] text-purple-700">
                    💡 Perfect for e-commerce where customers need to choose from multiple options
                  </div>
                </div>
              </div>

              {/* Category-Linked Masters */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Category-Linked Masters</h3>
                    <p className="text-sm text-slate-600">
                      Only relevant masters appear when creating products
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Smart filtering:</p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>When you select "Bolts" category, only masters linked to Bolts appear</p>
                    <p className="text-amber-700 bg-amber-50 p-2 rounded">
                      ✨ No clutter! You won&apos;t see &quot;Spring Rate&quot; master when creating a bolt product
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-amber-50 rounded text-[11px] text-amber-700">
                    💡 Keeps the product creation form clean and focused
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            style={{ background: `linear-gradient(135deg, ${steps[currentStep].color.split(" ")[0].replace("from-", "#")}dd, ${steps[currentStep].color.split(" ")[1].replace("to-", "#")})` }}
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            Go to Dashboard
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-slate-500 mb-1">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-xs text-slate-500 mb-1">Masters</p>
          <p className="text-2xl font-bold text-indigo-600">{masters.length}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
          <p className="text-xs text-slate-500 mb-1">Products</p>
          <p className="text-2xl font-bold text-pink-600">{products.length}</p>
        </div>
      </div>
    </div>
  );
}
