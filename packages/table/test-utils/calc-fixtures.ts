// Reference data of prompt 008 (calculated columns, „Show values as“, formulas).
// Lives outside src/ on purpose: it must not end up in the npm package.
import { ColumnDef, TrueFn } from '@guiexpert/table';
import type { ColumnDefIf } from '@guiexpert/table';

export interface Item {
  product: string;
  price: number;
  quantity: number;
}

/** F1: totals 2598, 1047, 250 (sum 3895). */
export function createItems(): Item[] {
  return [
    { product: 'Laptop', price: 1299, quantity: 2 },
    { product: 'Monitor', price: 349, quantity: 3 },
    { product: 'Mouse', price: 25, quantity: 10 },
  ];
}

/** product, price (editable), quantity, total = price × quantity (sortable). */
export function itemColumns(extra: ColumnDefIf[] = []): ColumnDefIf[] {
  return [
    ColumnDef.create({ property: 'product', headerLabel: 'Product', sortable: TrueFn }),
    ColumnDef.create({ property: 'price', headerLabel: 'Price', editable: TrueFn, sortable: TrueFn }),
    ColumnDef.create({ property: 'quantity', headerLabel: 'Qty' }),
    ColumnDef.create({
      property: 'total', headerLabel: 'Total', sortable: TrueFn, editable: TrueFn,
      valueGetter: (o: Item) => o.price * o.quantity,
    }),
    ...extra,
  ];
}
