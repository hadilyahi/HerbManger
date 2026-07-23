"use client";

import { useState } from "react";

export default function AddStorePaymentModal({
  open,
  onClose,
  storeId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onSuccess: () => void;
}) {

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);


  if (!open) return null;


  async function savePayment() {

    if (!amount) {
      alert("أدخل مبلغ الدفعة");
      return;
    }


    setLoading(true);


    const res = await fetch(
      `/api/stores/${storeId}/payments`,
      {
        method: "POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          amount,
          payment_method: method,
          notes
        })
      }
    );


    const data = await res.json();


    setLoading(false);


    if(!res.ok){

      alert(data.message);

      return;
    }


    setAmount("");
    setNotes("");
    setMethod("cash");


    onSuccess();

  }



  return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">


<div className="bg-white rounded-xl p-6 w-[400px]">


<h2 className="text-xl font-bold mb-5">
إضافة دفعة
</h2>



<label>
المبلغ
</label>

<input
type="number"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="w-full border rounded p-2 mb-4"
/>



<label>
طريقة الدفع
</label>


<select
value={method}
onChange={(e)=>setMethod(e.target.value)}
className="w-full border rounded p-2 mb-4"
>

<option value="cash">
نقدي
</option>

<option value="bank">
بنك
</option>

<option value="check">
شيك
</option>

<option value="transfer">
تحويل
</option>


</select>



<label>
ملاحظات
</label>

<textarea
value={notes}
onChange={(e)=>setNotes(e.target.value)}
className="w-full border rounded p-2 mb-5"
/>



<div className="flex gap-3">


<button
onClick={onClose}
className="px-4 py-2 bg-gray-300 rounded"
>
إلغاء
</button>


<button
disabled={loading}
onClick={savePayment}
className="px-4 py-2 bg-green-600 text-white rounded"
>

{loading ? "جاري الحفظ..." : "حفظ"}

</button>


</div>


</div>


</div>

  );
}