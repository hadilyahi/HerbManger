import { pool } from "@/lib/db";
import { ResultSetHeader } from "mysql2";


interface StoreInvoiceItem {
  warehouseInvoiceItemId:number;
  productId:number;
  quantity:number;
  purchasePrice:number;
  sellingPrice:number;
}


interface CreateStoreInvoiceInput {

  storeId:number;

  warehouseInvoiceId:number;

  warehouseId:number;

  total:number;

  paid:number;

  remaining:number;

  items:StoreInvoiceItem[];

}



// ==========================
// إنشاء فاتورة بيع
// ==========================

export async function createStoreInvoice(
 data:CreateStoreInvoiceInput
){

const connection = await pool.getConnection();


try{

await connection.beginTransaction();



let status:
"paid"|"partial"|"unpaid";


if(data.remaining <= 0)
status="paid";

else if(data.paid>0)
status="partial";

else
status="unpaid";




// إنشاء الفاتورة

const invoiceNumber="S-"+Date.now();


const [invoice] =
await connection.execute<ResultSetHeader>(
`
INSERT INTO store_invoices
(
invoice_number,
warehouse_id,
store_id,
invoice_date,
total,
paid,
remaining,
status,
notes
)
VALUES
(?,?,?,CURDATE(),?,?,?,?,?)
`,
[
invoiceNumber,
data.warehouseId,
data.storeId,
data.total,
data.paid,
data.remaining,
status,
null
]
);



const invoiceId=invoice.insertId;



// المنتجات

for(const item of data.items){



// إضافة تفاصيل الفاتورة

await connection.execute(
`
INSERT INTO store_invoice_items
(
invoice_id,
warehouse_invoice_id,
warehouse_invoice_item_id,
product_id,
quantity,
purchase_price,
selling_price,
total
)
VALUES
(?,?,?,?,?,?,?,?)
`,
[
invoiceId,
data.warehouseInvoiceId,
item.warehouseInvoiceItemId,
item.productId,
item.quantity,
item.purchasePrice,
item.sellingPrice,
item.quantity*item.sellingPrice
]
);





// نقص من مخزون المخزن

const [stock]:any =
await connection.execute(
`
SELECT quantity
FROM warehouse_stock
WHERE warehouse_id=?
AND product_id=?
FOR UPDATE
`,
[
data.warehouseId,
item.productId
]
);



if(!stock[0] || stock[0].quantity < item.quantity){

throw new Error(
`الكمية غير كافية للمنتج ${item.productId}`
);

}



await connection.execute(
`
UPDATE warehouse_stock
SET quantity = quantity - ?
WHERE warehouse_id=?
AND product_id=?
`,
[
item.quantity,
data.warehouseId,
item.productId
]
);





// تحديث كمية الفاتورة الأصلية

await connection.execute(
`
UPDATE warehouse_purchase_invoice_items
SET remaining_quantity =
remaining_quantity - ?
WHERE id=?
`,
[
item.quantity,
item.warehouseInvoiceItemId
]
);



}





// تحديث دين المحل

await connection.execute(
`
UPDATE stores
SET current_balance =
current_balance + ?
WHERE id=?
`,
[
data.remaining,
data.storeId
]
);



await connection.commit();



return {
success:true,
invoiceId
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







// ==========================
// تعديل فاتورة بيع
// ==========================


export async function updateStoreInvoice(
  invoiceId: number,
  data: CreateStoreInvoiceInput
) {

  const connection = await pool.getConnection();

  try {

    await connection.beginTransaction();


    /*
      1- جلب الفاتورة القديمة
    */

    const [oldInvoice]: any = await connection.execute(
      `
      SELECT 
        remaining,
        store_id
      FROM store_invoices
      WHERE id = ?
      `,
      [
        invoiceId
      ]
    );


    if (!oldInvoice[0]) {
      throw new Error("الفاتورة غير موجودة");
    }



    /*
      2- جلب المنتجات القديمة
    */

    const [oldItems]: any = await connection.execute(
      `
      SELECT
        sii.product_id,
        sii.quantity,
        sii.warehouse_invoice_item_id,
        si.warehouse_id
      FROM store_invoice_items sii
      JOIN store_invoices si
      ON si.id = sii.invoice_id
      WHERE sii.invoice_id = ?
      `,
      [
        invoiceId
      ]
    );



    /*
      3- إعادة المنتجات القديمة للمخزون
    */

    for (const item of oldItems) {


      await connection.execute(
        `
        UPDATE warehouse_stock
        SET quantity = quantity + ?
        WHERE warehouse_id = ?
        AND product_id = ?
        `,
        [
          item.quantity,
          item.warehouse_id,
          item.product_id
        ]
      );



      await connection.execute(
        `
        UPDATE warehouse_purchase_invoice_items
        SET remaining_quantity =
            remaining_quantity + ?
        WHERE id = ?
        `,
        [
          item.quantity,
          item.warehouse_invoice_item_id
        ]
      );

    }



    /*
      4- حذف المنتجات القديمة
    */

    await connection.execute(
      `
      DELETE FROM store_invoice_items
      WHERE invoice_id = ?
      `,
      [
        invoiceId
      ]
    );




    /*
      5- حساب حالة الفاتورة
    */

    let status:
      "paid" | "partial" | "unpaid";


    if (data.remaining <= 0) {

      status = "paid";

    } 
    else if (data.paid > 0) {

      status = "partial";

    } 
    else {

      status = "unpaid";

    }




    /*
      6- تحديث رأس الفاتورة
    */

    await connection.execute(
      `
      UPDATE store_invoices
      SET
        total = ?,
        paid = ?,
        remaining = ?,
        status = ?
      WHERE id = ?
      `,
      [
        data.total,
        data.paid,
        data.remaining,
        status,
        invoiceId
      ]
    );





    /*
      7- تحديث دين المحل
    */


    // حذف الدين القديم

    await connection.execute(
      `
      UPDATE stores
      SET current_balance =
          current_balance - ?
      WHERE id = ?
      `,
      [
        oldInvoice[0].remaining,
        oldInvoice[0].store_id
      ]
    );



    // إضافة الدين الجديد

    await connection.execute(
      `
      UPDATE stores
      SET current_balance =
          current_balance + ?
      WHERE id = ?
      `,
      [
        data.remaining,
        data.storeId
      ]
    );






    /*
      8- إضافة المنتجات الجديدة
    */

    for (const item of data.items) {



      // التأكد من توفر المخزون

      const [stock]: any =
      await connection.execute(
        `
        SELECT quantity
        FROM warehouse_stock
        WHERE warehouse_id = ?
        AND product_id = ?
        FOR UPDATE
        `,
        [
          data.warehouseId,
          item.productId
        ]
      );



      if (
        !stock[0] ||
        stock[0].quantity < item.quantity
      ) {

        throw new Error(
          `الكمية غير كافية للمنتج ${item.productId}`
        );

      }




      // إضافة المنتج للفاتورة

      await connection.execute(
        `
        INSERT INTO store_invoice_items
        (
          invoice_id,
          warehouse_invoice_id,
          warehouse_invoice_item_id,
          product_id,
          quantity,
          purchase_price,
          selling_price,
          total
        )
        VALUES
        (?,?,?,?,?,?,?,?)
        `,
        [
          invoiceId,
          data.warehouseInvoiceId,
          item.warehouseInvoiceItemId,
          item.productId,
          item.quantity,
          item.purchasePrice,
          item.sellingPrice,
          item.quantity * item.sellingPrice
        ]
      );





      // خصم المخزون

      await connection.execute(
        `
        UPDATE warehouse_stock
        SET quantity = quantity - ?
        WHERE warehouse_id = ?
        AND product_id = ?
        `,
        [
          item.quantity,
          data.warehouseId,
          item.productId
        ]
      );





      // تحديث الكمية المتبقية من فاتورة الشراء

      await connection.execute(
        `
        UPDATE warehouse_purchase_invoice_items
        SET remaining_quantity =
            remaining_quantity - ?
        WHERE id = ?
        `,
        [
          item.quantity,
          item.warehouseInvoiceItemId
        ]
      );


    }





    await connection.commit();


    return {
      success:true,
      invoiceId
    };



  } catch(error) {


    await connection.rollback();

    throw error;


  } finally {


    connection.release();


  }

}