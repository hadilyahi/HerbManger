"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-8 bg-white text-black">
        {children}
      </main>

      {/* Sidebar */}
      <aside className="w-64 bg-green-200 p-6 flex flex-col justify-between text-black">
        <div className="space-y-6">
          <div className="flex items-start mb-24 justify-end gap-2 text-right">
            <span className="text-2xl font-extrabold">عشاب السلطان</span>
            <Image src="/assets/user.svg" alt="User Icon" width={30} height={30} />
          </div>

          <nav className="flex flex-col gap-8 font-extrabold text-right">
            <Link href="/dashboard" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>الرئيسية</span>
              <Image src="/assets/dashboard.svg" alt="dashboard Icon" width={25 } height={25} />
            </Link>
            <Link href="/dashboard/products" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>المنتجات</span>
              <Image src="/assets/products.svg" alt="Products Icon" width={25} height={25} />
            </Link>
            <Link href="/dashboard/invoices" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>الفواتير</span>
              <Image src="/assets/fatora.svg" alt="Invoices Icon" width={25} height={25} />
            </Link>
            <Link href="/dashboard/suppliers" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>الموردون</span>
              <Image src="/assets/fournissour.svg" alt="Suppliers Icon" width={25} height={25} />
            </Link>
            <Link href="/dashboard/statistics" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>الإحصائيات</span>
              <Image src="/assets/statistique.svg" alt="Suppliers Icon" width={25} height={25} />
            </Link>
            <Link href="/dashboard/archive" className="hover:bg-green-300 p-2 rounded flex items-center gap-2 justify-end">
              <span>الأرشيف</span>
                <Image src="/assets/archive.svg" alt="Archive Icon" width={25} height={25} />
            </Link>
          </nav>
        </div>

        <div>
          <button className="w-full p-2 font-extrabold  text-black rounded flex items-center gap-2 justify-end">
            <span>تسجيل الخروج</span>
            <Image src="/assets/logout.svg" alt="Logout Icon" width={25} height={25} />
          </button>
        </div>
      </aside>
    </div>
  );
}
