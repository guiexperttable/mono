/** An order of the row grouping demo ({@link generateSalesOrders}). */
export interface SalesOrderIf {
  id: number;
  country: string;
  city: string;
  product: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}
