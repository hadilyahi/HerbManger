"use client";

import { useState } from "react";


export default function AddPaymentModal({
  open,
  warehouseId,
  onClose,
  onSuccess
}:{
  open:boolean;
  warehouseId:number;
  onClose:()=>void;
  onSuccess:()=>void;
}){


const [amount,setAmount]=useState("");
const [notes,setNotes]=useState("");



if(!open) return null;



async function savePayment(){

const res = await fetch(
`/api/warehouses/${warehouseId}/payments`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
amount,
notes
})
}
);


const data = await res.json();


if(!res.ok){
alert(data.message);
return;
}


setAmount("");
setNotes("");

onSuccess();

}



return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white rounded-xl p-6 w-[400px]">


<h2 className="text-xl font-bold mb-5">
إضافة دفعة
</h2>


<input
type="number"
placeholder="المبلغ"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="w-full border p-3 rounded mb-3"
/>


<textarea
placeholder="ملاحظات"
value={notes}
onChange={(e)=>setNotes(e.target.value)}
className="w-full border p-3 rounded mb-4"
/>


<div className="flex gap-3">

<button
onClick={onClose}
className="px-4 py-2 bg-gray-300 rounded"
>
إلغاء
</button>


<button
onClick={savePayment}
className="px-4 py-2 bg-green-600 text-white rounded"
>
حفظ
</button>

</div>


</div>

</div>

)

}