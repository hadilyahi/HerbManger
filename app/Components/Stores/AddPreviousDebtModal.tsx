"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onSuccess: () => void;
}

export default function AddPreviousDebtModal({
  open,
  onClose,
  storeId,
  onSuccess,
}: Props) {

  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");

  if (!open) return null;


  async function save(){

    if(amount <= 0){
      alert("أدخل مبلغ صحيح");
      return;
    }


    const res = await fetch(
      `/api/stores/${storeId}/previous-debt`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          amount,
          note
        })
      }
    );


    const data = await res.json();


    if(!res.ok){
      alert(data.message);
      return;
    }


    alert("تمت إضافة الدين");

    setAmount(0);
    setNote("");

    onSuccess();
    onClose();

  }


  return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[450px]">


<h2 className="text-xl font-bold mb-5">
إضافة دين سابق
</h2>


<label>
المبلغ
</label>

<input
type="number"
className="border rounded w-full p-2 mb-4"
value={amount}
onChange={(e)=>setAmount(Number(e.target.value))}
/>


<label>
ملاحظة
</label>

<textarea
className="border rounded w-full p-2 mb-5"
value={note}
onChange={(e)=>setNote(e.target.value)}
/>


<div className="flex justify-end gap-3">

<button
onClick={onClose}
className="bg-gray-300 px-4 py-2 rounded"
>
إلغاء
</button>


<button
onClick={save}
className="bg-green-600 text-white px-4 py-2 rounded"
>
حفظ
</button>


</div>


</div>

</div>

  );
}