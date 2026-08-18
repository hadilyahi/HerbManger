"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  Warehouse,
  Store,
  Archive,
  LogOut,
  Crown,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  {
    name: "الرئيسية",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "المنتجات",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "الفواتير",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "الموردون",
    href: "/dashboard/suppliers",
    icon: Users,
  },
  {
    name: "الإحصائيات",
    href: "/dashboard/statistics",
    icon: BarChart3,
  },
  {
    name: "المخزون",
    href: "/dashboard/warehouses",
    icon: Warehouse,
  },
  {
    name: "المحلات",
    href: "/dashboard/stores",
    icon: Store,
  },
  {
    name: "الأرشيف",
    href: "/dashboard/archive",
    icon: Archive,
  },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div
      dir="rtl"
      className="flex min-h-screen bg-slate-50 text-slate-800"
    >
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside className="sticky top-0 flex h-screen w-[280px] shrink-0 flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white shadow-2xl">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-teal-400/10 blur-3xl" />

        {/* =================================================
            LOGO / SHOP NAME
        ================================================== */}
        <div className="relative border-b border-white/10 px-5 py-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg">
              <Crown
                size={25}
                className="text-emerald-700"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-300">
                نظام إدارة المحل
              </p>

              <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight">
                تاج السلطان
              </h1>
            </div>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}
        <div className="relative flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-4 px-3 text-[30px] font-bold tracking-wider text-emerald-300/70">
            القائمة الرئيسية
          </p>

          <nav className="space-y-2 ">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group  relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                    isActive
                      ? "bg-white text-emerald-800 shadow-lg shadow-black/10"
                      : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-emerald-500" />
                  )}

                  <div
                    className={`flex h-9 w-9 shrink-0  items-center justify-center rounded-lg transition ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700 "
                        : "bg-white/5 text-emerald-200 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    <Icon size={19} strokeWidth={2} />
                  </div>

                  <span className="flex-1 text-[18px] font-bold">
                    {item.name}
                  </span>

                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </Link>
              );
            })}

          </nav>
        </div>

        {/* =================================================
            BOTTOM SECTION
        ================================================== */}
        <div className="relative border-t border-white/10 p-4">

          {/* Shop status */}
          <div className="mb-3 rounded-xl bg-white/5 px-4 py-3">

            <div className="flex items-center gap-3">

              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                  <Store
                    size={18}
                    className="text-emerald-300"
                  />
                </div>

                <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-950 bg-emerald-400" />
              </div>

              <div>
                <p className="text-[18px] text-emerald-300/70">
                  حالة النظام
                </p>

                <p className="text-[18px] font-bold text-white">
                  النظام يعمل
                </p>
              </div>

            </div>

          </div>

          {/* Logout */}
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 transition group-hover:bg-red-500/20">
              <LogOut size={18} />
            </div>

            <span className="flex-1 text-sm font-bold">
              تسجيل الخروج
            </span>
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="min-w-0 flex-1 bg-slate-50">
        {children}
      </main>
    </div>
  );
}