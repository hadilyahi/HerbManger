// lib/services/warehouseInvoice.service.ts

import { pool } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";


// ===============================
// Types
// ===============================

export interface WarehouseInvoiceItem {
  productId:number;
  quantity:number;
  purchasePrice:number;
}


export interface CreateWarehouseInvoiceInput {

  warehouseId:number;

  invoiceNumber:string;

  supplierId?:number|null;

  invoiceDate:string;

  total:number;

  paid:number;

  remaining:number;

  notes?:string;

  items:WarehouseInvoiceItem[];

}



// ===============================
// Create Invoice
// ===============================


export async function createWarehouseInvoice(
 data:CreateWarehouseInvoiceInput
){


const connection = await pool.getConnection();


try{


await connection.beginTransaction();



let status:
"paid"|
"partial"|
"unpaid";



if(data.remaining<=0){

status="paid";

}
else if(data.paid>0){

status="partial";

}
else{

status="unpaid";

}




// ===============================
// Insert Invoice
// ===============================


const [invoiceResult] =
await connection.execute<ResultSetHeader>(

`

INSERT INTO warehouse_purchase_invoices

(
warehouse_id,
invoice_number,
supplier_id,
invoice_date,
total,
paid,
remaining,
status,
notes
)

VALUES (?,?,?,?,?,?,?,?,?)

`,

[

data.warehouseId,

data.invoiceNumber || null,

data.supplierId ?? null,

data.invoiceDate,

data.total,

data.paid,

data.remaining,

status,

data.notes || null

]

);



const invoiceId =
invoiceResult.insertId;



// ===============================
// Items
// ===============================


for(const item of data.items){



await connection.execute(
  `
  INSERT INTO warehouse_purchase_invoice_items
  (
    invoice_id,
    product_id,
    quantity,
    remaining_quantity,
    purchase_price
  )
  VALUES (?,?,?,?,?)
  `,
  [
    invoiceId,
    item.productId,
    item.quantity,
    item.quantity,
    item.purchasePrice,
  ]
);



// ===============================
// Update Warehouse Stock
// ===============================


await connection.execute(
`
INSERT INTO warehouse_stock
(
warehouse_id,
product_id,
quantity
)
VALUES (?,?,?)
ON DUPLICATE KEY UPDATE
quantity = quantity + VALUES(quantity)
`,
[
  data.warehouseId,
  item.productId,
  item.quantity
]
);



}



await connection.commit();



return {

success:true,

invoiceId,

total:data.total,

remaining:data.remaining

};



}
catch(error){

await connection.rollback();

throw error;

}
finally{

connection.release();

}


}
