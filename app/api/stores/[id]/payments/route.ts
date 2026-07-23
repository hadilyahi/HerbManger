import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";


export async function GET(
request: NextRequest,
{
params,
}: {
params: Promise<{id:string}>
}
){

try {

const {id}=await params;

const payments = await query(
`
SELECT 
id,
amount,
payment_date,
payment_method,
reference_number,
notes
FROM store_payments
WHERE store_id=?
ORDER BY payment_date DESC
`,
[id]
);


return NextResponse.json(payments);


}catch(error){

return NextResponse.json(
{message:"خطأ في جلب الدفعات"},
{status:500}
);

}

}





export async function POST(
request:NextRequest,
{
params,
}:{
params:Promise<{id:string}>
}
){

try{


const {id}=await params;

const body=await request.json();


await query(
`
INSERT INTO store_payments
(
store_id,
amount,
payment_date,
payment_method,
reference_number,
notes
)
VALUES
(
?,
?,
CURDATE(),
?,
?,
?
)
`,
[
id,
body.amount,
body.payment_method || "cash",
body.reference_number || null,
body.notes || null
]
);



return NextResponse.json({
message:"تمت إضافة الدفعة"
});



}catch(error){

console.error(error);

return NextResponse.json(
{
message:"خطأ أثناء إضافة الدفعة"
},
{
status:500
}
);

}

}