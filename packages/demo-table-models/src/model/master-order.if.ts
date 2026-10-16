/** One item of an order of the master/detail demo (since 1.1.97). */
export interface MasterOrderItemIf {
  sku: string;
  product: string;
  quantity: number;
  unitPrice: number;
}

/** An order of the master/detail demo (since 1.1.97): the master row; its items are the detail. */
export interface MasterOrderIf {
  id: number;
  orderNo: string;
  customer: string;
  city: string;
  /** ISO date `YYYY-MM-DD` */
  date: string;
  status: string;
  total: number;
  items: MasterOrderItemIf[];
}
