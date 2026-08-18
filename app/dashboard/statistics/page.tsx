"use client";

import {
  useEffect,
  useMemo,
  useState,
  ReactElement,
  useRef,
} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* =======================
   Interfaces
======================= */

interface ProductStat {
  id: number;
  invoice_date: string;
  total_quantity: number;
  purchase_price: number;
  selling_price: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
}

interface SupplierDebt {
  supplier_id: number;
  supplier_name: string;
  total_invoices: number;
  paid: number;
  remaining: number;
}

interface Product {
  id: number;
  name: string;
}

/* =======================
   Page
======================= */

export default function StatisticsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [productId, setProductId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] =
  useState(false);

const productSearchRef = useRef<HTMLDivElement>(null);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [suppliersDebt, setSuppliersDebt] = useState<SupplierDebt[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  /* =======================
     Fetch data
  ======================= */

  useEffect(() => {
    if (!startDate || !endDate) return;

    fetch(
      `/api/statistics?startDate=${startDate}&endDate=${endDate}${
        productId ? `&productId=${productId}` : ""
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setProductStats(data.productStats || []);
        setTopProducts(data.topProducts || []);
        setSuppliersDebt(data.suppliersDebt || []);
        setProductsList(data.productsList || []);
      })
      .catch(console.error);
  }, [startDate, endDate, productId]);
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      productSearchRef.current &&
      !productSearchRef.current.contains(
        event.target as Node
      )
    ) {
      setProductDropdownOpen(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);
  /* =======================
     Default dates
  ======================= */

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();

    lastMonth.setDate(today.getDate() - 30);

    setStartDate(lastMonth.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  /* =======================
     Chart Data
  ======================= */

  const chartData = useMemo(
    () =>
      productStats
        .map((p) => ({
          id: p.id,
          date: new Date(p.invoice_date).getTime(),
          label: p.invoice_date,
          quantity: p.total_quantity,
          purchasePrice: Number(p.purchase_price),
          sellingPrice: Number(p.selling_price),
          xValue:
            new Date(p.invoice_date).getTime() + p.id,
        }))
        .sort((a, b) => a.xValue - b.xValue),
    [productStats]
  );

  /* =======================
     Date formatter
  ======================= */

  const formatDate = (value: number) => {
    return new Date(value).toLocaleDateString("ar-DZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================
     Search products
  ======================= */

  const filteredProducts = useMemo(
    () =>
      productsList.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [productsList, search]
  );

  /* =======================
     Top products
  ======================= */

  const sortedTopProducts = useMemo(
    () =>
      [...topProducts].sort(
        (a, b) => b.total_quantity - a.total_quantity
      ),
    [topProducts]
  );

  /* =======================
     Summary
  ======================= */

  const totalQuantity = useMemo(
    () =>
      productStats.reduce(
        (sum, item) => sum + Number(item.total_quantity || 0),
        0
      ),
    [productStats]
  );

  const averagePurchasePrice = useMemo(() => {
    if (!productStats.length) return 0;

    return (
      productStats.reduce(
        (sum, item) => sum + Number(item.purchase_price || 0),
        0
      ) / productStats.length
    );
  }, [productStats]);

  const averageSellingPrice = useMemo(() => {
    if (!productStats.length) return 0;

    return (
      productStats.reduce(
        (sum, item) => sum + Number(item.selling_price || 0),
        0
      ) / productStats.length
    );
  }, [productStats]);

  const priceDifference =
    averageSellingPrice - averagePurchasePrice;

  /* =======================
     Render
  ======================= */

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* ================= HEADER ================= */}

        <div className="rounded-3xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-700 p-6 md:p-8 text-white shadow-xl">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
                  📊
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    لوحة الإحصائيات
                  </h1>

                  <p className="mt-1 text-sm text-slate-300">
                    تحليل المبيعات والمشتريات وحركة المنتجات
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-xs text-slate-300">
                الفترة الحالية
              </p>

              <p className="mt-1 font-semibold">
                {startDate || "..."}{" "}
                <span className="mx-1 text-slate-400">←</span>{" "}
                {endDate || "..."}
              </p>
            </div>

          </div>
        </div>

        {/* ================= FILTERS ================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              🔎
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                تصفية الإحصائيات
              </h2>

              <p className="text-xs text-slate-500">
                اختر الفترة والمنتج الذي تريد تحليله
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Start Date */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                من تاريخ
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* End Date */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                إلى تاريخ
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* Product */}

           <div ref={productSearchRef} className="relative">
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    المنتج
  </label>

  {/* Search Input */}

  <div className="relative">

    {/* Search Icon */}

    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-400"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </div>

    <input
      type="text"
      placeholder="ابحث عن منتج..."
      value={
        productId
          ? productsList.find(
              (p) => p.id === productId
            )?.name || search
          : search
      }
      onFocus={() =>
        setProductDropdownOpen(true)
      }
      onChange={(e) => {
        setSearch(e.target.value);
        setProductId(null);
        setProductDropdownOpen(true);
      }}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-10 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    />

    {/* Clear Button */}

    {(search || productId) && (
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setProductId(null);
          setProductDropdownOpen(true);
        }}
        className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition hover:text-red-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    )}
  </div>

  {/* Dropdown */}

  {productDropdownOpen && (
    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

      {/* Header */}

      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between">

          <span className="text-xs font-semibold text-slate-500">
            المنتجات
          </span>

          <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600">
            {filteredProducts.length}
          </span>

        </div>
      </div>

      {/* All Products */}

      <button
        type="button"
        onClick={() => {
          setProductId(null);
          setSearch("");
          setProductDropdownOpen(false);
        }}
        className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-right transition ${
          productId === null && !search
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm">
          📦
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold">
            جميع المنتجات
          </p>

          <p className="text-xs text-slate-400">
            عرض إحصائيات جميع المنتجات
          </p>
        </div>

        {productId === null && !search && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-indigo-600"
          >
            <path d="m5 12 5 5L20 7" />
          </svg>
        )}
      </button>

      {/* Products List */}

      <div className="max-h-64 overflow-y-auto">

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const selected =
              product.id === productId;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setProductId(product.id);
                  setSearch(product.name);
                  setProductDropdownOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-right transition ${
                  selected
                    ? "bg-indigo-50"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Product Icon */}

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                    selected
                      ? "bg-indigo-100"
                      : "bg-slate-100"
                  }`}
                >
                  🌿
                </div>

                {/* Product Name */}

                <div className="min-w-0 flex-1">

                  <p
                    className={`truncate text-sm font-semibold ${
                      selected
                        ? "text-indigo-700"
                        : "text-slate-700"
                    }`}
                  >
                    {product.name}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    رقم المنتج #{product.id}
                  </p>

                </div>

                {/* Selected */}

                {selected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-indigo-600"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                )}
              </button>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center">

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">
              🔍
            </div>

            <p className="text-sm font-semibold text-slate-600">
              لم يتم العثور على المنتج
            </p>

            <p className="mt-1 text-xs text-slate-400">
              جرّب كتابة اسم مختلف
            </p>

          </div>
        )}

      </div>
    </div>
  )}
</div>

          </div>
        </div>

        {/* ================= SUMMARY CARDS ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            icon="📦"
            title="إجمالي الكمية"
            value={totalQuantity.toLocaleString("ar-DZ")}
            subtitle="خلال الفترة المحددة"
          />

          <SummaryCard
            icon="💰"
            title="متوسط سعر الشراء"
            value={`${averagePurchasePrice.toLocaleString(
              "ar-DZ",
              {
                maximumFractionDigits: 2,
              }
            )} دج`}
            subtitle="متوسط تكلفة الشراء"
          />

          <SummaryCard
            icon="💵"
            title="متوسط سعر البيع"
            value={`${averageSellingPrice.toLocaleString(
              "ar-DZ",
              {
                maximumFractionDigits: 2,
              }
            )} دج`}
            subtitle="متوسط سعر البيع"
          />

          <SummaryCard
            icon="📈"
            title="فرق السعر"
            value={`${priceDifference.toLocaleString(
              "ar-DZ",
              {
                maximumFractionDigits: 2,
              }
            )} دج`}
            subtitle="بيع مقابل شراء"
          />

        </div>

        {/* ================= PRODUCT CHARTS ================= */}

        {productId && (
          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-slate-800" />

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  تحليل المنتج
                </h2>

                <p className="text-sm text-slate-500">
                  متابعة تغير الكمية والأسعار عبر الزمن
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

              {/* Quantity */}

              <ChartCard
                title="تطور الكمية"
                icon="📦"
              >
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    type="number"
                    domain={[
                      "dataMin",
                      "dataMax",
                    ]}
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                    }}
                    labelFormatter={(value) =>
                      new Date(
                        Number(value)
                      ).toLocaleDateString(
                        "ar-DZ",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    }
                    formatter={(value) => [
                      Number(value).toLocaleString(
                        "ar-DZ"
                      ),
                      "الكمية",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ChartCard>

              {/* Purchase Price */}

              <ChartCard
                title="تطور سعر الشراء"
                icon="💰"
              >
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="xValue"
                    type="number"
                    domain={[
                      "dataMin",
                      "dataMax",
                    ]}
                    tickFormatter={(_, index) =>
                      chartData[index]
                        ? new Date(
                            chartData[index].date
                          ).toLocaleDateString(
                            "ar-DZ",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )
                        : ""
                    }
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                    }}
                    labelFormatter={(value) =>
                      new Date(
                        Number(value)
                      ).toLocaleDateString(
                        "ar-DZ",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    }
                    formatter={(value) => [
                      `${Number(value).toLocaleString(
                        "ar-DZ"
                      )} دج`,
                      "سعر الشراء",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="purchasePrice"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ChartCard>

              {/* Selling Price */}

              <ChartCard
                title="تطور سعر البيع"
                icon="💵"
              >
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    type="number"
                    domain={[
                      "dataMin",
                      "dataMax",
                    ]}
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11 }}
                  />

                  <YAxis
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #e2e8f0",
                    }}
                    labelFormatter={(value) =>
                      new Date(
                        Number(value)
                      ).toLocaleDateString(
                        "ar-DZ",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    }
                    formatter={(value) => [
                      `${Number(value).toLocaleString(
                        "ar-DZ"
                      )} دج`,
                      "سعر البيع",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="sellingPrice"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ChartCard>

            </div>
          </div>
        )}

        {/* ================= TOP PRODUCTS ================= */}

        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="h-8 w-1 rounded-full bg-slate-800" />

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  المنتجات الأكثر شراءً
                </h2>

                <p className="text-sm text-slate-500">
                  ترتيب المنتجات حسب الكمية
                </p>
              </div>

            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
              {sortedTopProducts.length} منتجات
            </div>

          </div>

          <ChartCard
            title=""
            icon="🏆"
          >
            <BarChart
              data={sortedTopProducts}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 30,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="product_name"
                tick={{
                  fontSize: 11,
                }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />

              <YAxis
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(value) => [
                  Number(value).toLocaleString(
                    "ar-DZ"
                  ),
                  "الكمية",
                ]}
              />

              <Bar
                dataKey="total_quantity"
                fill="#6366f1"
                radius={[
                  8,
                  8,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ChartCard>

        </div>

      </div>
    </div>
  );
}

/* =======================
   Summary Card
======================= */

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl transition group-hover:scale-110">
          {icon}
        </div>

      </div>
    </div>
  );
}

/* =======================
   Chart Card
======================= */

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactElement;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">

      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              {icon}
            </div>

            <h3 className="font-bold text-slate-800">
              {title}
            </h3>

          </div>

        </div>
      )}

      <div className="h-80 w-full p-4">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {children}
        </ResponsiveContainer>
      </div>

    </div>
  );
}