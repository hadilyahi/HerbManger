import { NextRequest, NextResponse } from "next/server";
import { updateStoreInvoice } from "@/lib/services/storeInvoice.service";
import { query } from "@/lib/db";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{id:string}>
  }
){

  const {id}=await params;


  const [invoice]:any = await query(
    `
    SELECT
      id,
      invoice_number,
      warehouse_id,
      paid,
      remaining,
      total
    FROM store_invoices
    WHERE id = ?
    `,
    [Number(id)]
  );


  const items:any = await query(
    `
    SELECT
      sii.id,
      sii.product_id,
      p.name,

      sii.quantity,
      sii.purchase_price,
      sii.selling_price,

      sii.warehouse_invoice_id,
      sii.warehouse_invoice_item_id

    FROM store_invoice_items sii

    INNER JOIN products p
      ON p.id = sii.product_id

    WHERE sii.invoice_id = ?

    `,
    [Number(id)]
  );


  return NextResponse.json({
    ...invoice,
    items
  });

}
export async function PUT(
 request: NextRequest,
 {
  params
 }: {
  params: Promise<{id:string}>
 }
){

 try {

  const {id}=await params;

  const body=await request.json();


  const result =
    await updateStoreInvoice(
      Number(id),
      body
    );


  return NextResponse.json(result);


 } catch(error){

  console.error(error);

  return NextResponse.json(
   {
    success:false,
    message:"حدث خطأ أثناء تعديل الفاتورة"
   },
   {
    status:500
   }
  );

 }

}