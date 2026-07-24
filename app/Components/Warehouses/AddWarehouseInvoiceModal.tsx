"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import AddProductModal from "../popup/AddProductModal";

interface Category {
  id: number;
  name: string;
}
interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface InvoiceItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

interface Props {
  open: boolean;
  warehouseId: number;
  invoiceId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWarehouseInvoiceModal({
  open,
  warehouseId,
  invoiceId,
  onClose,
  onSuccess,
}: Props) {

  // ===========================
  // بيانات الفاتورة
  // ===========================

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [paid, setPaid] = useState(0);

  const [notes, setNotes] = useState("");

  // ===========================
  // المورد
  // ===========================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [supplierId, setSupplierId] = useState(0);

  const [supplierSearch, setSupplierSearch] = useState("");
const [categories, setCategories] = useState<Category[]>([]);
const [showAddProduct, setShowAddProduct] = useState(false);
const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showSupplierDropdown, setShowSupplierDropdown] =
    useState(false);

  // ===========================
  // المنتجات
  // ===========================

  const [products, setProducts] = useState<Product[]>([]);

  const [searchTerms, setSearchTerms] = useState<
    Record<number, string>
  >({});

  const [activeDropdown, setActiveDropdown] =
    useState<number | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      productId: 0,
      productName: "",
      quantity: 1,
      purchasePrice: 0,
    },
  ]);

  // ===========================
  // تحميل البيانات
  // ===========================

  useEffect(() => {

    if (!open) return;

    async function load() {

      const [productsRes, suppliersRes, categoriesRes] =
  await Promise.all([
    fetch("/api/products"),
    fetch("/api/suppliers"),
    fetch("/api/categories"),
  ]);


const categoriesData = await categoriesRes.json();


setCategories(categoriesData);

      const productsData =
        await productsRes.json();

      const suppliersData =
        await suppliersRes.json();

      setProducts(productsData);

      setSuppliers(suppliersData);

    }

    load();

  }, [open]);
  useEffect(() => {

  if (!open || !invoiceId) return;

  async function loadInvoice() {

    const res = await fetch(`/api/warehouse-invoices/${invoiceId}`);

    const invoice = await res.json();

    setInvoiceNumber(invoice.invoice_number);

    setInvoiceDate(
      new Date(invoice.invoice_date)
        .toISOString()
        .split("T")[0]
    );

    setSupplierId(invoice.supplier_id);
    const supplier = suppliers.find(
  s => s.id === invoice.supplier_id
);

if (supplier) {
  setSupplierSearch(supplier.name);
}

    setPaid(Number(invoice.paid));

    setNotes(invoice.notes ?? "");

  const loadedItems: InvoiceItem[] = invoice.items.map((item: any) => ({
  productId: item.product_id,
  productName: item.name,
  quantity: Number(item.quantity),
  purchasePrice: Number(item.purchase_price),
}));

setItems(loadedItems);

const terms: Record<number, string> = {};

loadedItems.forEach((item: InvoiceItem, index: number) => {
  terms[index] = item.productName;
});

setSearchTerms(terms);
  }

  loadInvoice();

}, [open, invoiceId, suppliers]);

  // ===========================
  // الموردين بعد البحث
  // ===========================

  const filteredSuppliers = useMemo(() => {

    if (!supplierSearch.trim())
      return suppliers;

    return suppliers.filter((s) =>
      s.name
        .toLowerCase()
        .includes(
          supplierSearch.toLowerCase()
        )
    );

  }, [supplierSearch, suppliers]);

  // ===========================
  // إضافة منتج
  // ===========================

  function addRow() {

    setItems([
      ...items,
      {
        productId: 0,
        productName: "",
        quantity: 1,
        purchasePrice: 0,
      },
    ]);

  }

  // ===========================
  // حذف منتج
  // ===========================

  function removeRow(index: number) {

    const arr = items.filter(
      (_, i) => i !== index
    );

    setItems(arr);

  }

  // ===========================
  // تغيير السعر
  // ===========================

  function changePrice(
    index: number,
    value: number
  ) {

    const arr = [...items];

    arr[index].purchasePrice = value;

    setItems(arr);

  }

  // ===========================
  // تغيير الكمية
  // ===========================

  function changeQuantity(
    index: number,
    value: number
  ) {

    const arr = [...items];

    arr[index].quantity = value;

    setItems(arr);

  }

  // ===========================
  // اختيار المنتج
  // ===========================

  function selectProduct(
    index: number,
    product: Product
  ) {

    // منع التكرار

    if (
      items.some(
        (i, x) =>
          x !== index &&
          i.productId === product.id
      )
    ) {

      alert("المنتج موجود بالفعل");

      return;

    }

    const arr = [...items];

    arr[index].productId = product.id;

    arr[index].productName =
      product.name;

    setItems(arr);

    setSearchTerms({
      ...searchTerms,
      [index]: product.name,
    });

    setActiveDropdown(null);

  }

  // ===========================
  // الإجمالي
  // ===========================

  const total = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        item.purchasePrice,
    0
  );

  if (!open) return null;

  return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-[#f3f6f3] w-[1000px] max-h-[92vh] rounded-[30px] shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="p-8 text-center flex justify-between border-b bg-[#f3f6f3]">

        <h2 className="text-2xl font-bold">
          فاتورة شراء جديدة
        </h2>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-600"
        >
          <X size={26} />
        </button>

      </div>

      {/* Body */}

      <div className="flex-1 overflow-y-auto p-8">

        <div className="grid grid-cols-3 gap-6">

          {/* رقم الفاتورة */}

          <div>

            <label className="block mb-2 font-medium">
              رقم الفاتورة
            </label>

            <input
              value={invoiceNumber}
              onChange={(e)=>
                setInvoiceNumber(e.target.value)
              }
              className="w-full border rounded-xl p-3 bg-white"
            />

          </div>

          {/* المورد */}

          <div className="relative">

            <label className="block mb-2 font-medium">
              المورد
            </label>

            <input
              value={supplierSearch}
              placeholder="ابحث عن المورد..."
              onFocus={()=>
                setShowSupplierDropdown(true)
              }
              onChange={(e)=>{
                setSupplierSearch(e.target.value);
                setShowSupplierDropdown(true);
              }}
              className="w-full border rounded-xl p-3 bg-white"
            />

            {showSupplierDropdown && (

              <div className="absolute z-50 w-full bg-white border rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">

                {filteredSuppliers.map((supplier)=>(

                  <div
                    key={supplier.id}
                    onClick={()=>{

                      setSupplierId(supplier.id);

                      setSupplierSearch(
                        supplier.name
                      );

                      setShowSupplierDropdown(false);

                    }}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer"
                  >

                    {supplier.name}

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* التاريخ */}

          <div>

            <label className="block mb-2 font-medium">
              التاريخ
            </label>

            <input
              type="date"
              value={invoiceDate}
              onChange={(e)=>
                setInvoiceDate(e.target.value)
              }
              className="w-full border rounded-xl p-3 bg-white"
            />

          </div>

        </div>

        {/* جدول المنتجات */}

        <div className="mt-8 overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-3 text-right">
                  المنتج
                </th>

                <th className="p-3">
                  سعر الشراء
                </th>

                <th className="p-3">
                  الكمية
                </th>

                <th className="p-3">
                  الإجمالي
                </th>

                <th className="p-3"></th>

              </tr>

            </thead>

            <tbody>

              {items.map((item,index)=>(

                <tr
                  key={index}
                  className="border-b"
                >

                  {/* المنتج */}

                  <td className="p-2">
  <div className="flex gap-2">
    <div className="relative flex-1">

      <input
        value={searchTerms[index] ?? item.productName ?? ""}
        placeholder="ابحث عن المنتج..."
        onFocus={() => setActiveDropdown(index)}
        onChange={(e) => {
          setSearchTerms({
            ...searchTerms,
            [index]: e.target.value,
          });
          setActiveDropdown(index);
        }}
        className="w-full border rounded-xl p-3 bg-white"
      />

      {activeDropdown === index && (
        <div className="absolute z-40 bg-white border rounded-xl shadow-lg mt-1 w-full max-h-60 overflow-y-auto">

          {products
            .filter((p) =>
              p.name
                .toLowerCase()
                .includes((searchTerms[index] || "").toLowerCase())
            )
            .map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(index, product)}
                className="px-4 py-3 hover:bg-green-50 cursor-pointer"
              >
                {product.name}
              </div>
            ))}
        </div>
      )}

    </div>

    <button
      type="button"
      onClick={() => {
        setCurrentIndex(index);
        setShowAddProduct(true);
      }}
      className="bg-green-600 hover:bg-green-700 text-white px-3 rounded-xl"
    >
      <Plus size={16} />
    </button>
  </div>
</td>
                  {/* السعر */}

                  <td className="p-2">

                    <input

                      type="number"

                      value={
                        item.purchasePrice
                      }

                      onChange={(e)=>

                        changePrice(

                          index,

                          Number(e.target.value)

                        )

                      }

                      className="w-full border rounded-xl p-3 bg-white"

                    />

                  </td>

                  {/* الكمية */}

                  <td className="p-2">

                    <input

                      type="number"

                      value={
                        item.quantity
                      }

                      onChange={(e)=>

                        changeQuantity(

                          index,

                          Number(e.target.value)

                        )

                      }

                      className="w-full border rounded-xl p-3 bg-white"

                    />

                  </td>

                  {/* الإجمالي */}

                  <td className="text-center font-bold">

                    {(
                      item.quantity*
                      item.purchasePrice
                    ).toFixed(2)}

                  </td>

                  {/* حذف */}

                  <td className="text-center">

                    {items.length>1 && (

                      <button
                        onClick={()=>
                          removeRow(index)
                        }
                        className="text-red-600"
                      >

                        <Trash2 size={18}/>

                      </button>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <button

            onClick={addRow}

            className="mt-5 flex items-center gap-2 text-green-700"

          >

            <Plus size={18}/>

            إضافة منتج

          </button>

        </div>
                {/* المجاميع */}

        <div className="grid grid-cols-3 gap-6 mt-10">

          <div>

            <label className="block mb-2 font-medium">
              المدفوع
            </label>

            <input
              type="number"
              value={paid}
              onChange={(e)=>
                setPaid(Number(e.target.value))
              }
              className="w-full border rounded-xl p-3 bg-white"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              الإجمالي
            </label>

            <div className="bg-white border rounded-xl p-3 text-center text-lg font-bold">

              {total.toFixed(2)}

            </div>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              المتبقي
            </label>

            <div className="bg-white border rounded-xl p-3 text-center text-lg font-bold text-red-600">

              {(total - paid).toFixed(2)}

            </div>

          </div>

        </div>

        {/* الملاحظات */}

        <div className="mt-8">

          <label className="block mb-2 font-medium">
            ملاحظات
          </label>

          <textarea
            rows={4}
            value={notes}
            onChange={(e)=>
              setNotes(e.target.value)
            }
            className="w-full border rounded-xl p-3 bg-white"
          />

        </div>

      </div>

      {/* Footer */}

      <div className="border-t bg-white p-6 flex justify-between items-center">

        <div className="text-gray-600">

          عدد المنتجات : <b>{items.length}</b>

        </div>

        <div className="flex gap-3">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border hover:bg-gray-100"
          >
            إلغاء
          </button>

          <button
            onClick={async ()=>{

              if(!supplierId){

                alert("اختر المورد");

                return;

              }

              if(items.some(i=>i.productId===0)){

                alert("اختر جميع المنتجات");

                return;

              }

              if(items.some(i=>i.quantity<=0)){

                alert("تحقق من الكميات");

                return;

              }

              if(items.some(i=>i.purchasePrice<=0)){

                alert("تحقق من أسعار الشراء");

                return;

              }

              const body = {
  warehouseId,
  supplierId,
  invoiceNumber,
  invoiceDate,
  total,
  paid,
  remaining: total - paid,
  notes,
  items,
};

try {
  const url = invoiceId
  ? `/api/warehouse-invoices/${invoiceId}`
  : "/api/warehouse-invoices";

const method = invoiceId ? "PUT" : "POST";

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "حدث خطأ أثناء حفظ الفاتورة");
    return;
  }

  alert("تم حفظ الفاتورة بنجاح");

  onSuccess();
} catch (err) {
  console.error(err);
  alert("فشل الاتصال بالخادم");
}

              console.log(body);

              /*
              لاحقاً سنستبدل هذا بـ :

              await fetch("/api/warehouse-invoices",{
                method:"POST",
                headers:{
                  "Content-Type":"application/json"
                },
                body:JSON.stringify(body)
              });

              */

              onSuccess();

            }}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
          >
            حفظ الفاتورة
          </button>

        </div>

      </div>

    </div>
    console.log(categories);
    {showAddProduct && (
  <AddProductModal
    categories={categories}
    onClose={() => setShowAddProduct(false)}
    onSuccess={() => {
      fetch("/api/products")
        .then((res) => res.json())
        .then(setProducts);

      setShowAddProduct(false);
    }}
  />
)}
  </div>

);
}