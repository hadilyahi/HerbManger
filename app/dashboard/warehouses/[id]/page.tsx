"use client";

import { useEffect, useState } from "react";
import AddWarehouseInvoiceModal from "@/app/Components/Warehouses/AddWarehouseInvoiceModal";
import ProductHistoryModal from "@/app/Components/Warehouses/ProductHistoryModal";
import AddPaymentModal from "@/app/Components/Warehouses/AddPaymentModal";
interface Warehouse {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes: string;
}
interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier: string;
  total: number;
  paid: number;
  remaining: number;
  status: string;
}

interface WarehouseProduct {
  id: number;
  name: string;
  quantity: number;
  last_purchase_price: number;
}
interface ProductHistory {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier: string;
  quantity: number;
  purchase_price: number;
}
interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  notes: string;
}

export default function WarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
const [selectedProduct, setSelectedProduct] =
  useState<WarehouseProduct | null>(null);

const [openHistory, setOpenHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // يجب أن يكون هنا وليس داخل useEffect
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openPreviousDebt, setOpenPreviousDebt] = useState(false);
const [previousDebt, setPreviousDebt] = useState("");
  async function loadInvoices(id: string) {
  const res = await fetch(`/api/warehouses/${id}/invoices`);
  const data = await res.json();

  setInvoices(data);
}
async function loadProducts(id: string) {
  const res = await fetch(`/api/warehouses/${id}/products`);
  const data = await res.json();

  setProducts(data);
}
async function loadHistory(productId: number) {
  const { id } = await params;

  const res = await fetch(
    `/api/warehouses/${id}/products/${productId}/history`
  );

  const data = await res.json();

  setHistory(data);
}
async function loadPayments(id:string){

  const res = await fetch(
    `/api/warehouses/${id}/payments`
  );

  const data = await res.json();

  setPayments(data);

}
  useEffect(() => {
    async function load() {
      const { id } = await params;

      const res = await fetch(`/api/warehouses/${id}`);
      const data = await res.json();

      setWarehouse(data);
      await loadInvoices(id);
      await loadProducts(id);
      await loadPayments(id);
    }

    load();
  }, [params]);

  if (!warehouse) {
    return (
      <div className="p-6">
        جاري التحميل...
      </div>
    );
  }
  const totalProducts = products.length;

const stockValue = products.reduce(
  (sum, product) =>
    sum +
    Number(product.quantity) * Number(product.last_purchase_price),
  0
);

const totalInvoices = invoices.length;
const totalInvoiceDebt = invoices.reduce(
  (sum, invoice) => sum + Number(invoice.remaining),
  0
);

const totalPayments = payments.reduce(
  (sum, payment) =>
    sum + Number(payment.amount),
  0
);


const currentDebt =
  Number(warehouse.previous_balance)
  +
  totalInvoiceDebt
  -
  totalPayments;
async function deleteInvoice(id: number) {

  if (!confirm("هل تريد حذف الفاتورة؟"))
    return;

  const res = await fetch(
    `/api/warehouse-invoices/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  const { id: warehouseId } = await params;

  await loadInvoices(warehouseId);
  await loadProducts(warehouseId);

}
  return (
    <div className="p-6 space-y-6">

      {/* العنوان */}

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">
            {warehouse.name}
          </h1>

          <p className="text-gray-500 mt-1">
            إدارة المخزن
          </p>
        </div>

        <button
          onClick={() => setOpenInvoiceModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          + فاتورة شراء
        </button>

      </div>

      {/* البطاقات */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

  {/* الرصيد السابق */}
  <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition">
    <p className="text-sm text-gray-500">
      الرصيد السابق
    </p>

    <button
onClick={()=>{

setPreviousDebt(
String(warehouse.previous_balance)
);

setOpenPreviousDebt(true);

}}
className="mt-3 text-4xl font-bold text-green-700"
>

{Number(warehouse.previous_balance).toFixed(2)}

</button>

    <p className="text-xs text-gray-400 mt-2">
      دج
    </p>
  </div>
  <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition">

  <p className="text-sm text-gray-500">
    الدين الحالي
  </p>

  <h2 className="mt-3 text-4xl font-bold text-red-600">
    {currentDebt.toFixed(2)}
  </h2>

  <p className="text-xs text-gray-400 mt-2">
    دج
  </p>

</div>
  {/* عدد المنتجات */}
  <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition">
    <p className="text-sm text-gray-500">
      عدد المنتجات
    </p>

    <h2 className="mt-3 text-4xl font-bold text-blue-600">
      {totalProducts}
    </h2>

    <p className="text-xs text-gray-400 mt-2">
      منتج داخل المخزن
    </p>
  </div>

  {/* قيمة المخزون */}
  {/* <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition">
    <p className="text-sm text-gray-500">
      قيمة المخزون
    </p>

    <h2 className="mt-3 text-4xl font-bold text-orange-600">
      {stockValue.toFixed(2)}
    </h2>

    <p className="text-xs text-gray-400 mt-2">
      دج
    </p>
  </div> */}

  {/* عدد الفواتير */}
  <div className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-lg transition">
    <p className="text-sm text-gray-500">
      عدد الفواتير
    </p>

    <h2 className="mt-3 text-4xl font-bold text-purple-600">
      {totalInvoices}
    </h2>

    <p className="text-xs text-gray-400 mt-2">
      فاتورة شراء
    </p>
  </div>

</div>

      {/* التبويبات */}

      <div className="bg-white rounded-xl shadow">

        <div className="flex gap-3 p-4 border-b bg-gray-50 rounded-t-xl">

          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 ${
              activeTab === "products"
                ? "border-b-2 border-green-600 text-green-600 font-bold"
                : ""
            }`}
          >
            المنتجات
          </button>

          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-6 py-3 ${
              activeTab === "invoices"
                ? "border-b-2 border-green-600 text-green-600 font-bold"
                : ""
            }`}
          >
            فواتير الشراء
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 ${
              activeTab === "payments"
                ? "border-b-2 border-green-600 text-green-600 font-bold"
                : ""
            }`}
          >
            المدفوعات
          </button>

        </div>

        <div className="p-6">

{activeTab === "products" && (
  

    <table className="w-full border-collapse">

      <thead className="border-b bg-gray-100 ">
  <tr>
    <th className="px-5 py-4 text-right font-semibold">
      المنتج
    </th>

    <th className="px-5 py-4 text-center font-semibold">
      الكمية
    </th>

    <th className="px-5 py-4 text-center font-semibold">
      آخر سعر شراء
    </th>

    <th className="px-5 py-4 text-center font-semibold">
      قيمة المخزون
    </th>

    <th className="px-5 py-4 text-center font-semibold">
      الإجراءات
    </th>
  </tr>
</thead>

      <tbody>
        {products.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className="py-10 text-center text-gray-500"
            >
              لا توجد منتجات داخل هذا المخزن
            </td>
          </tr>
        ) : (
          products.map((product) => (
            <tr
              key={product.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-5 py-4 font-medium">
                {product.name}
              </td>

              <td className="px-5 py-4 text-center">
                {product.quantity}
              </td>

              <td className="px-5 py-4 text-center text-green-700 font-semibold">
                {Number(product.last_purchase_price).toFixed(2)} دج
              </td>

              <td className="px-5 py-4 text-center font-bold">
                {(
                  Number(product.quantity) *
                  Number(product.last_purchase_price)
                ).toFixed(2)} دج
              </td>
              <td className="px-5 py-4 text-center">
  <button
    onClick={async () => {
      setSelectedProduct(product);
      await loadHistory(product.id);
      setOpenHistory(true);
    }}
    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
  >
    تفاصيل
  </button>
</td>
            </tr>
          ))
        )}
      </tbody>

    </table>

  
)}



{activeTab === "invoices" && (
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b bg-gray-100">
        <th className="p-3 text-right">رقم الفاتورة</th>
        <th className="p-3 text-right">التاريخ</th>
        <th className="p-3 text-right">المورد</th>
        <th className="p-3 text-right">الإجمالي</th>
        <th className="p-3 text-right">المدفوع</th>
        <th className="p-3 text-right">المتبقي</th>
        <th className="p-3 text-right">الحالة</th>
        <th className="p-3 text-center">الإجراءات</th>
      </tr>
    </thead>

    <tbody>
      {invoices.map((invoice) => (
        <tr key={invoice.id} className="border-b hover:bg-gray-50">
          <td className="p-3">{invoice.invoice_number}</td>
          <td className="p-3">
            {new Date(invoice.invoice_date).toLocaleDateString("fr-CA")}
          </td>
          <td className="p-3">{invoice.supplier}</td>
          <td className="p-3">{invoice.total} دج</td>
          <td className="p-3">{invoice.paid} دج</td>
          <td className="p-3">{invoice.remaining} دج</td>
          <td className="p-3">
            {invoice.status === "paid"
              ? "مدفوعة"
              : invoice.status === "partial"
              ? "مدفوعة جزئياً"
              : "غير مدفوعة"}
          </td>
          <td className="p-3 text-center">

  <button
    onClick={() => {
      setEditingInvoiceId(invoice.id);
      setOpenInvoiceModal(true);
    }}
    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    ✏ تعديل
  </button>
  <button
  onClick={() => deleteInvoice(invoice.id)}
  className="text-red-600 hover:underline"
>
  🗑 حذف
</button>

</td>
        </tr>
      ))}

      {invoices.length === 0 && (
        <tr>
          <td colSpan={7} className="text-center py-8 text-gray-500">
            لا توجد فواتير شراء
          </td>
        </tr>

      )}
    </tbody>
  </table>
)}

  {activeTab === "payments" && (

<div>


<button
onClick={() => setOpenPaymentModal(true)}
className="mb-5 bg-green-600 text-white px-5 py-2 rounded-lg"
>
+ إضافة دفعة
</button>



<table className="w-full border-collapse">

<thead>

<tr className="border-b bg-gray-100">

<th className="p-3 text-right">
التاريخ
</th>

<th className="p-3 text-right">
المبلغ
</th>

<th className="p-3 text-right">
ملاحظات
</th>

</tr>

</thead>


<tbody>


{payments.length === 0 ? (

<tr>

<td
colSpan={3}
className="text-center py-8 text-gray-500"
>
لا توجد دفعات
</td>

</tr>

):(


payments.map((payment)=>(

<tr
key={payment.id}
className="border-b"
>


<td className="p-3">

{new Date(payment.payment_date)
.toLocaleDateString("fr-CA")}

</td>


<td className="p-3 font-bold text-green-700">

{Number(payment.amount).toFixed(2)}
 دج

</td>


<td className="p-3">

{payment.notes || "-"}

</td>


</tr>

))

)}


</tbody>

</table>


</div>

)}

        </div>

      </div>

     <AddWarehouseInvoiceModal
  open={openInvoiceModal}
  warehouseId={warehouse.id}
  invoiceId={editingInvoiceId}
  onClose={() => {
    setOpenInvoiceModal(false);
    setEditingInvoiceId(null);
  }}
  onSuccess={async () => {
    setOpenInvoiceModal(false);
    setEditingInvoiceId(null);

    const { id } = await params;

    await loadInvoices(id);
    await loadProducts(id);
  }}
/>
      <ProductHistoryModal
  open={openHistory}
  onClose={() => setOpenHistory(false)}
  productName={selectedProduct?.name || ""}
  history={history}
/>
<AddPaymentModal
open={openPaymentModal}
warehouseId={warehouse.id}
onClose={()=>setOpenPaymentModal(false)}
onSuccess={async()=>{

setOpenPaymentModal(false);

const {id}=await params;

await loadPayments(id);

}}
/>
{openPreviousDebt && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">


<div className="bg-white rounded-xl p-6 w-[400px]">


<h2 className="text-xl font-bold mb-4">
إضافة دين سابق
</h2>


<input
type="number"
value={previousDebt}
onChange={(e)=>setPreviousDebt(e.target.value)}
className="w-full border p-3 rounded mb-4"
placeholder="المبلغ"
/>



<div className="flex gap-3">


<button
onClick={()=>setOpenPreviousDebt(false)}
className="px-4 py-2 bg-gray-300 rounded"
>
إلغاء
</button>



<button
onClick={async()=>{


const res = await fetch(
`/api/warehouses/${warehouse.id}/previous-balance`,
{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
amount:previousDebt
})
}
);



if(res.ok){

const data = await fetch(
`/api/warehouses/${warehouse.id}`
);

const warehouseData = await data.json();

setWarehouse(warehouseData);

setOpenPreviousDebt(false);

}


}}

className="px-4 py-2 bg-green-600 text-white rounded"
>
حفظ
</button>


</div>


</div>


</div>

)}
    </div>
  );
}                  


