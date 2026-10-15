import { SalesOrderIf } from "./sales-order.if";

/** An order of the pivot demo ({@link generatePivotOrders}): a sales order with an order date (ISO, `YYYY-MM-DD`). */
export interface PivotOrderIf extends SalesOrderIf {
  date: string;
}
