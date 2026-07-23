import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {

    const { id } = await params;

    const body = await request.json();

    const amount = Number(body.amount);


    await query(
      `
      UPDATE stores
      SET 
        previous_balance = previous_balance + ?,
        current_balance = current_balance + ?
      WHERE id = ?
      `,
      [
        amount,
        amount,
        id,
      ]
    );


    return NextResponse.json({
      success:true
    });


  } catch(error){

    console.error(error);

    return NextResponse.json(
      {
        success:false,
        message:"حدث خطأ"
      },
      {
        status:500
      }
    );

  }
}