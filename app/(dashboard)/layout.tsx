"use client";

import Sidebar from "@/components/Sidebar";
import { Bell, Search, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div style={{ marginLeft: 260 }}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-72">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              placeholder="Search anything..."
              className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-pointer">
              A
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
