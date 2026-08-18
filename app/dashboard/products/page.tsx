"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  FolderPlus,
  Search,
  Filter,
  Package,
  Boxes,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import AddProductModal from "../../Components/popup/AddProductModal";
import DeleteProductModal from "../../Components/popup/DeleteProductModal";
import AddCategoryModal from "../../Components/popup/AddCategoryModal";
import EditProductModal from "../../Components/popup/EditProductModal";

interface Product {
  id: number;
  name: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | number>("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      const productsData = productsRes.ok
        ? await productsRes.json()
        : [];

      const categoriesData = categoriesRes.ok
        ? await categoriesRes.json()
        : [];

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        filterCategory
          ? product.categoryId === Number(filterCategory)
          : true
      );
  }, [products, searchTerm, filterCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-600 p-6 sm:p-8 text-white shadow-xl">

          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Package size={26} />
                </div>

                <div>
                  <p className="text-sm text-emerald-100">
                    إدارة المخزون
                  </p>

                  <h1 className="text-2xl font-bold sm:text-3xl">
                    إدارة المنتجات
                  </h1>
                </div>
              </div>

              <p className="max-w-xl text-sm leading-6 text-emerald-50">
                أضف منتجاتك ونظّمها حسب الفئات، مع إمكانية تعديل
                أو حذف أي منتج بسهولة.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50 active:scale-95"
              >
                <Plus size={19} />
                إضافة منتج
              </button>

              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
              >
                <FolderPlus size={19} />
                إضافة فئة
              </button>

            </div>
          </div>
        </div>

        {/* ================= STATISTICS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي المنتجات
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {products.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Package size={24} />
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي الفئات
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {categories.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Boxes size={24} />
              </div>

            </div>
          </div>

        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* Search */}
            <div className="relative flex-1">

              <Search
                size={20}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="ابحث عن اسم المنتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-12 pl-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={17} />
                </button>
              )}

            </div>

            {/* Category */}
            <div className="relative w-full lg:w-64">

              <Filter
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="">جميع الفئات</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

            </div>

            {(searchTerm || filterCategory) && (
              <button
                onClick={clearFilters}
                className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                مسح الفلاتر
              </button>
            )}

          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

            <p className="text-sm text-slate-500">
              عرض{" "}
              <span className="font-bold text-slate-800">
                {filteredProducts.length}
              </span>{" "}
              من أصل{" "}
              <span className="font-bold text-slate-800">
                {products.length}
              </span>{" "}
              منتج
            </p>

            {filterCategory && (
              <p className="text-xs text-emerald-600">
                فلترة حسب الفئة مفعلة
              </p>
            )}

          </div>

        </div>

        {/* ================= PRODUCTS TABLE ================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                قائمة المنتجات
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                جميع المنتجات المسجلة في النظام
              </p>
            </div>

            <div className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 sm:block">
              {filteredProducts.length} منتج
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px] text-right">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    #
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    المنتج
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    الفئة
                  </th>

                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                    الإجراءات
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredProducts.map((product, index) => {

                  const category = categories.find(
                    (cat) => cat.id === product.categoryId
                  );

                  return (
                    <tr
                      key={product.id}
                      className="group transition hover:bg-emerald-50/40"
                    >

                      {/* Number */}
                      <td className="px-6 py-4">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                          {index + 1}
                        </span>

                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <Package size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {product.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              رقم المنتج #{product.id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">

                        {category ? (
                          <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            بدون فئة
                          </span>
                        )}

                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            title="تعديل المنتج"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowEdit(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 active:scale-95"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="حذف المنتج"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDelete(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 active:scale-95"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

                {/* Empty */}
                {filteredProducts.length === 0 && (
                  <tr>

                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Package size={30} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-700">
                          لا توجد منتجات
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {searchTerm || filterCategory
                            ? "لم نجد أي منتج يطابق خيارات البحث الحالية."
                            : "لم تتم إضافة أي منتجات حتى الآن."}
                        </p>

                        {(searchTerm || filterCategory) && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            مسح الفلاتر
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>

      {/* ================= MODALS ================= */}

      {showAdd && (
        <AddProductModal
          categories={categories}
          onClose={() => setShowAdd(false)}
          onSuccess={fetchData}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onSuccess={fetchData}
        />
      )}

      {showDelete && selectedProduct && (
        <DeleteProductModal
          product={selectedProduct}
          onClose={() => {
            setShowDelete(false);
            setSelectedProduct(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showEdit && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => {
            setShowEdit(false);
            setSelectedProduct(null);
          }}
          onSuccess={fetchData}
        />
      )}

    </div>
  );
}