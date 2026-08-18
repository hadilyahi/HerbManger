
import Image from "next/image";
import {
  Package,
  Boxes,
  ShoppingCart,
  Store,
  ArrowLeft,
} from "lucide-react";

export default function DashboardPage() {
  return (
    
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ================= HERO ================= */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-600 px-6 py-10 shadow-xl sm:px-10 lg:px-14">

            {/* Decorative circles */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-white/5" />
            <div className="absolute right-1/2 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-2">

              {/* Text */}
              <div className="text-white">

                <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700">
                    <Store size={22} />
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-emerald-100">
                      نظام إدارة
                    </p>

                    <p className="font-bold">
                      تاج السلطان
                    </p>
                  </div>

                </div>

                <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                  مرحبًا بك في
                  <span className="mt-2 block text-emerald-100">
                    تاج السلطان
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50 sm:text-lg">
                  نظامك المتكامل لإدارة المنتجات والمخزون والفواتير
                  والمبيعات بكل سهولة وتنظيم.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <button
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50 active:scale-95"
                  >
                    ابدأ العمل
                    <ArrowLeft size={18} />
                  </button>

                  <div className="flex items-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur">
                    نظام إدارة المحل
                  </div>

                </div>

              </div>

              {/* Image */}
              <div className="relative flex justify-center lg:justify-end">

                <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />

                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">

                  <Image
                    src="/assets/Logoacheb.png"
                    alt="تاج السلطان"
                    width={600}
                    height={200}
                    priority
                    className="h-auto w-full max-w-[600px] rounded-2xl object-cover"
                  />

                </div>

              </div>

            </div>
          </section>

          {/* ================= QUICK STATS ================= */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Products */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    المنتجات
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  <Package size={23} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                إجمالي المنتجات المسجلة
              </p>

            </div>

            {/* Stock */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    المخزون
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                  <Boxes size={23} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                حالة المخزون الحالية
              </p>

            </div>

            {/* Invoices */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    الفواتير
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    —
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                  <ShoppingCart size={23} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                الفواتير المسجلة
              </p>

            </div>

            {/* Store */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    المحل
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-800">
                    تاج السلطان
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-100">
                  <Store size={23} />
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                لوحة التحكم الرئيسية
              </p>

            </div>

          </section>

          {/* ================= WELCOME CARD ================= */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-sm font-semibold text-emerald-600">
                    لوحة التحكم
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-800">
                  كل شيء تحت السيطرة
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  يمكنك من هنا إدارة منتجات تاج السلطان، متابعة
                  المخزون، تسجيل الفواتير ومتابعة عمليات البيع والشراء
                  بسهولة.
                </p>

              </div>

              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:flex">
                <Store size={30} />
              </div>

            </div>

          </section>

        </div>
      </div>
    
  );
}