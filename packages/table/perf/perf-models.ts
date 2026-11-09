// Table models for the performance checks (prompt 021): values on demand, so 10 million rows cost no memory.
import { AreaModel, ColumnDef, DefaultRowHeights, TableFactory, px100 } from '@guiexpert/table';
import type { EventListenerIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';
import { mountTable, nextFrame } from '../test-utils/mount-table';
import type { MountedTable } from '../test-utils/mount-table';

export const ROW_HEIGHT = 20;

/** A body of `rowCount` rows: values computed on demand, written values in a Map; constant or variable heights. */
export class BigBody extends AreaModel {
  private readonly written = new Map<number, unknown>();

  constructor(public rowCount: number, private readonly columnCount: number, private readonly variable = false) {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return this.rowCount;
  }

  override getRowHeight(rowIndex: number): number {
    return this.variable ? ROW_HEIGHT + (rowIndex % 3) * 10 : ROW_HEIGHT;
  }

  override getConstantRowHeight(): number | undefined {
    return this.variable ? undefined : ROW_HEIGHT;
  }

  override getValueAt(row: number, col: number): any {
    const key = row * this.columnCount + col;
    return this.written.has(key) ? this.written.get(key) : `r${row}c${col}`;
  }

  override setValue(row: number, col: number, value: any): boolean {
    this.written.set(row * this.columnCount + col, value);
    return true;
  }
}

export interface PerfTable extends MountedTable {
  body: BigBody;
  viewport: HTMLElement;
}

/** Mounts a table over a {@link BigBody} and waits until the first render (and resize callback) is through. */
export async function mountBig(rowCount: number, opts: {
  columns?: number; variable?: boolean; tableOptions?: Partial<TableOptionsIf>; eventListener?: EventListenerIf;
} = {}): Promise<PerfTable> {
  const columns = opts.columns ?? 5;
  const body = new BigBody(rowCount, columns, opts.variable);
  const model: TableModelIf = TableFactory.createTableModel({
    bodyAreaModel: body,
    columnDefs: Array.from({ length: columns }, (_, i) => new ColumnDef('c' + i, 'C' + i, px100)),
    defaultRowHeights: new DefaultRowHeights(34, ROW_HEIGHT, 34),
  });
  const table = mountTable(model, {
    width: 1000, height: 600, eventListener: opts.eventListener, tableOptions: { resizeEventDebounceDelay: 10, ...opts.tableOptions },
  });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  return { ...table, body, viewport: table.host.querySelector<HTMLElement>('.ge-table-scroll-viewport')! };
}
