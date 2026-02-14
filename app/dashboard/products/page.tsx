"use client";

import { useEffect, useState } from "react";
import AddProductModal from "../../Components/popup/AddProductModal";
import DeleteProductModal from "../../Components/popup/DeleteProductModal";
import AddCategoryModal from "../../Components/popup/AddCategoryModal";

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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // مودالات
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchData = async () => {
    try {
      const productsRes = await fetch("/api/products");
      const categoriesRes = await fetch("/api/categories");

      const productsData = productsRes.ok ? await productsRes.json() : [];
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  useEffect(() => {
    const fetchAndSetData = async () => {
      await fetchData();
    };
    fetchAndSetData();
  }, []);
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) =>
      filterCategory
        ? p.categoryId === Number(filterCategory)
        : true
    );
 
   
  return (
    <div className="bg-gray-50 min-h-screen font-cairo p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          إدارة المنتجات
        </h1>

        {/* أدوات الفلترة والإضافة */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md shadow"
            >
              إضافة منتج جديد
            </button>

            <button
              onClick={() => setShowAddCategory(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md shadow"
            >
              إضافة فئة جديدة
            </button>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-200 px-4 py-2 rounded-md shadow"
            >
              <option value="">فرز حسب الفئة</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-200 px-4 py-2 rounded-md shadow w-full md:w-64 outline-none"
          />
        </div>

        {/* جدول المنتجات */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse shadow rounded-lg overflow-hidden">
            <thead className="bg-green-500 text-white text-left">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">الفئة</th>
                <th className="p-3 text-center w-36">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="bg-white hover:bg-gray-100 transition-colors"
                >
                  <td className="p-3 border-b">{product.name}</td>
                  <td className="p-3 border-b">
                    {categories.find((cat) => cat.id === product.categoryId)?.name || "-"}
                  </td>
                  <td className="p-3 border-b text-center flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDelete(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">
                    لا توجد منتجات للعرض
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودالات */}
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
          onClose={() => setShowDelete(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
