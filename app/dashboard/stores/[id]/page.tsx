"use client";

import { useEffect, useState } from "react";
import CreateStoreInvoice from "@/app/Components/Stores/CreateStoreInvoice";
import AddPreviousDebtModal 
from "@/app/Components/Stores/AddPreviousDebtModal";
import AddStorePaymentModal 
from "@/app/Components/Stores/AddStorePaymentModal";
interface Store {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  current_balance: number;
  notes: string;
}

type Tab = "products" | "invoices" | "payments" | "statement";
interface Payment {
  id:number;
  amount:number;
  payment_date:string;
  payment_method:string;
  notes:string;
}
export default function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [store, setStore] = useState<Store | null>(null);
  const [tab, setTab] = useState<Tab>("products");
  const [invoices, setInvoices] = useState<any[]>([]);
const [openInvoice, setOpenInvoice] = useState(false);

const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
const [products, setProducts] = useState<any[]>([]);
const [openDebt,setOpenDebt]=useState(false);
const [payments,setPayments]=useState<Payment[]>([]);
const [openPayment,setOpenPayment]=useState(false);
  
  useEffect(() => {
    async function load() {
      const { id } = await params;

      const res = await fetch(`/api/stores/${id}`);
      const data = await res.json();

      setStore(data);
      const details = await fetch(`/api/stores/${id}/details`);
const result = await details.json();

setInvoices(result.invoices);
setProducts(result.products);

const paymentsRes = await fetch(
  `/api/stores/${id}/payments`
);

const paymentsData = await paymentsRes.json();

setPayments(paymentsData);
    }

    load();
  }, [params]);

  if (!store) {
    return (
      <div className="p-8 text-center">
        جاري التحميل...
      </div>
    );
  }
 const currentDebt =
  Number(store.previous_balance) +
  invoices.reduce(
    (sum, invoice) => sum + Number(invoice.remaining),
    0
  );

  return (
    <div className="p-6">

      <div className="bg-white rounded-xl shadow p-6 mb-6">

        <h1 className="text-3xl font-bold mb-2">
          {store.name}
        </h1>

        <div className="grid grid-cols-4 gap-4 mt-6">

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-gray-500">
              الدين الحالي
            </div>

            <div className="text-2xl font-bold">
              {currentDebt.toFixed(2)} دج
            </div>
          </div>

          
            <div className="bg-blue-50 rounded-lg p-4 relative flex justify-between gap-8">

<button
onClick={()=>setOpenDebt(true)}
className="top-2 left-2 text-sm bg-blue-600 text-white px-2 py-1 rounded"
>
+ إضافة  دين السابق
</button>
            

            <div className="text-2xl font-bold">
              {store.previous_balance} دج
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-gray-500">
              الهاتف
            </div>

            <div className="font-bold">
              {store.phone || "-"}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-gray-500">
              العنوان
            </div>

            <div className="font-bold">
              {store.address || "-"}
            </div>
          </div>

        </div>

      </div>

      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded ${
            tab === "products"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          المنتجات
        </button>

        <button
          onClick={() => setTab("invoices")}
          className={`px-4 py-2 rounded ${
            tab === "invoices"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          الفواتير
        </button>

        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-2 rounded ${
            tab === "payments"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          الدفعات
        </button>

        {/* <button
          onClick={() => setTab("statement")}
          className={`px-4 py-2 rounded ${
            tab === "statement"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          كشف الحساب
        </button> */}

      </div>

      <div className="bg-white rounded-xl shadow p-6 min-h-[400px]">

        {tab === "products" && (
  <div>
    <h2 className="text-xl font-bold mb-4">
      منتجات المحل
    </h2>

    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">المنتج</th>
          <th className="p-2">الكمية</th>
          <th className="p-2">سعر الشراء</th>
          <th className="p-2">سعر البيع</th>
        </tr>
      </thead>

      <tbody>
  {products.map((item, index) => (
    <tr key={`${item.product_id}-${index}`} className="border-t">
      <td className="p-2">{item.product_name}</td>
      <td className="p-2">{item.quantity}</td>
      <td className="p-2">{item.purchase_price}</td>
      <td className="p-2">{item.selling_price}</td>
    </tr>
  ))}
</tbody>
    </table>
  </div>
)}

        {tab === "invoices" && (
  <div>

    <div className="flex justify-between mb-5">

      <h2 className="text-xl font-bold">
        فواتير المحل
      </h2>

      <button
 onClick={() => {
   setSelectedInvoice(null);
   setOpenInvoice(true);
 }}
 className="bg-green-600 text-white px-4 py-2 rounded"
>
 + فاتورة جديدة
</button>

    </div>

    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">رقم الفاتورة</th>
          <th className="p-2">التاريخ</th>
          <th className="p-2">الإجمالي</th>
          <th className="p-2">المدفوع</th>
          <th className="p-2">المتبقي</th>
          <th className="p-2">الحالة</th>
          <th className="p-2">إجراء</th>
        </tr>
      </thead>

      <tbody>
        {invoices.map((invoice) => (
          <tr key={invoice.id} className="border-t">
            <td className="p-2">{invoice.invoice_number}</td>
            <td className="p-2">{invoice.invoice_date}</td>
            <td className="p-2">{invoice.total}</td>
            <td className="p-2">{invoice.paid}</td>
            <td className="p-2">{invoice.remaining}</td>
            <td className="p-2">{invoice.status}</td>
            <td className="p-2">
 <button
  onClick={() => {
    setSelectedInvoice(invoice.id);
    setOpenInvoice(true);
  }}
  className="bg-blue-600 text-white px-3 py-1 rounded"
>
  تعديل
</button>
</td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
)}

        {tab === "payments" && (

<div>

<button
onClick={()=>setOpenPayment(true)}
className="bg-green-600 text-white px-4 py-2 rounded mb-5"
>
+ إضافة دفعة
</button>


<table className="w-full border">

<thead className="bg-gray-100">

<tr>
<th className="p-2">التاريخ</th>
<th className="p-2">المبلغ</th>
<th className="p-2">طريقة الدفع</th>
<th className="p-2">ملاحظات</th>
</tr>

</thead>


<tbody>

{payments.map((payment)=>(

<tr key={payment.id} className="border-t">

<td className="p-2">
{payment.payment_date}
</td>

<td className="p-2 text-green-700 font-bold">
{payment.amount} دج
</td>

<td className="p-2">
{payment.payment_method}
</td>

<td className="p-2">
{payment.notes || "-"}
</td>

</tr>

))}

</tbody>

</table>


</div>

)}

        {/* {tab === "statement" && (
          <h2 className="text-xl font-bold">
            كشف الحساب
          </h2>
        )} */}

      </div>
         <CreateStoreInvoice
  open={openInvoice}
  onClose={() => {
    setOpenInvoice(false);
    setSelectedInvoice(null);
  }}
  storeId={store.id}
  invoiceId={selectedInvoice}
  onSuccess={async () => {
  setOpenInvoice(false);
  setSelectedInvoice(null);

  const details = await fetch(`/api/stores/${store.id}/details`);
  const result = await details.json();

  setInvoices(result.invoices);
  setProducts(result.products);

  const paymentsRes = await fetch(
    `/api/stores/${store.id}/payments`
  );

  const paymentsData = await paymentsRes.json();

  setPayments(paymentsData);

  const storeRes = await fetch(`/api/stores/${store.id}`);
  const storeData = await storeRes.json();

  setStore(storeData);
}}
/>
<AddPreviousDebtModal
open={openDebt}
onClose={()=>setOpenDebt(false)}
storeId={store.id}
onSuccess={async()=>{

 const res = await fetch(`/api/stores/${store.id}`);
 const data = await res.json();

 setStore(data);

}}
/>
<AddStorePaymentModal

open={openPayment}

onClose={()=>{
  setOpenPayment(false);
}}

storeId={store.id}

onSuccess={async()=>{

  setOpenPayment(false);


  const res = await fetch(
    `/api/stores/${store.id}/payments`
  );

  const data = await res.json();

  setPayments(data);



  const storeRes = await fetch(
    `/api/stores/${store.id}`
  );

  const storeData = await storeRes.json();

  setStore(storeData);

}}

/>
    </div>
  );
}