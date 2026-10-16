/** An article of the price list demo (fill handle and batch edit, since 1.1.96). */
export interface PriceItemIf {
  id: number;
  sku: string;
  product: string;
  category: string;
  /** ISO date `YYYY-MM-DD` */
  validFrom: string;
  price: number;
  /** percent, 0 … 50 */
  discount: number;
  stock: number;
}
