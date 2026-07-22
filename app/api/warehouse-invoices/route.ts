import { NextResponse } from "next/server";
import { createWarehouseInvoice } from "@/lib/services/warehouseInvoice.service";


export async function POST(req: Request) {

  try {

    const body = await req.json();



    // ==========================
    // Validation
    // ==========================

    if (!body.invoiceNumber) {

      return NextResponse.json(
        {
          message: "رقم الفاتورة مطلوب"
        },
        {
          status:400
        }
      );

    }



    if (!body.invoiceDate) {

      return NextResponse.json(
        {
          message:"تاريخ الفاتورة مطلوب"
        },
        {
          status:400
        }
      );

    }



    if (!Array.isArray(body.items) || body.items.length === 0) {

      return NextResponse.json(
        {
          message:"يجب إضافة منتجات للفاتورة"
        },
        {
          status:400
        }
      );

    }




    // تنظيف البيانات قبل إرسالها للـ service

   const invoiceData = {

  warehouseId: Number(body.warehouseId),

  invoiceNumber: String(body.invoiceNumber ?? ""),

  supplierId:
    body.supplierId != null
      ? Number(body.supplierId)
      : null,

  invoiceDate: body.invoiceDate,

  total: Number(body.total ?? 0),

  paid: Number(body.paid ?? 0),

  remaining: Number(body.remaining ?? 0),

  notes: body.notes ?? null,

  items: body.items.map((item: any) => ({

    productId: Number(item.productId),

    quantity: Number(item.quantity),

    purchasePrice: Number(item.purchasePrice),

  })),

};




    const result =
      await createWarehouseInvoice(invoiceData);



    return NextResponse.json({

      success:true,

      data:result

    });



  } catch(error:any) {


    console.error(
      "WAREHOUSE INVOICE ERROR:",
      error
    );



    return NextResponse.json(

      {

        success:false,

        message:
          error.message ??
          "حدث خطأ أثناء حفظ الفاتورة"

      },

      {
        status:500
      }

    );


  }

}