export interface InvoiceItem {
  productId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface InvoiceData {
  supplierId: number;
  invoiceDate: string; // أو Date
  paidAmount: number;
  items: InvoiceItem[];
}

export interface CreatedInvoiceResult {
  invoiceId: number;
  totalAmount: number;
  remaining: number;
}
export interface InsertResult {
  insertId: number;
  affectedRows: number;
}
