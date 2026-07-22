import { query } from "@/lib/db";

export interface Warehouse {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes: string;
}

// جلب المخازن
export async function getWarehouses() {
  return await query<Warehouse[]>(
    `
    SELECT *
    FROM warehouses
    ORDER BY id DESC
    `
  );
}

// إضافة مخزن
export async function createWarehouse(data: {
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes: string;
}) {
  return await query(
    `
    INSERT INTO warehouses
    (
      name,
      phone,
      address,
      previous_balance,
      notes
    )
    VALUES
    (?,?,?,?,?)
    `,
    [
      data.name,
      data.phone,
      data.address,
      data.previous_balance,
      data.notes,
    ]
  );
}

// تعديل مخزن
export async function updateWarehouse(
  id: number,
  data: {
    name: string;
    phone: string;
    address: string;
    previous_balance: number;
    notes: string;
  }
) {
  return await query(
    `
    UPDATE warehouses
    SET
      name = ?,
      phone = ?,
      address = ?,
      previous_balance = ?,
      notes = ?
    WHERE id = ?
    `,
    [
      data.name,
      data.phone,
      data.address,
      data.previous_balance,
      data.notes,
      id,
    ]
  );
}

// حذف مخزن
export async function deleteWarehouse(id: number) {
  return await query(
    `
    DELETE FROM warehouses
    WHERE id = ?
    `,
    [id]
  );
}


// جلب مخزن واحد
export async function getWarehouseById(id: number) {
  const rows = await query<Warehouse[]>(
    `
    SELECT *
    FROM warehouses
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
}