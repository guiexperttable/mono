import {
  AreaModel, CellRendererIf,
  ColumnDef,
  ColumnDefIf,
  FalseFn, NumberCellProgressBarCellRenderer,
  px120,
  px200,
  RowNumberColumnDef,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions
} from '@guiexpert/table';


function createLargeColumnDefs(): ColumnDefIf[] {

  return [
    ColumnDef.create({
      headerLabel: 'ID',
      width: px120,
      bodyClasses: ['ge-table-text-align-left'],
      headerClasses: ['ge-table-text-align-left'],
      sortable: FalseFn
    }),
    ColumnDef.create({
      headerLabel: 'Value',
      width: px200,
      bodyClasses: ['ge-table-text-align-left'],
      headerClasses: ['ge-table-text-align-left'],
      sortable: FalseFn
    }),
    ColumnDef.create({
      headerLabel: " ",
      width: px200,
      bodyClasses: ["ge-table-text-align-right"],
      headerClasses: ["ge-table-text-align-right"]
    }),
  ];
}

function createLargeTableOptions(): TableOptions {
  const selectionModel = new SelectionModel();
  return {
    ...new TableOptions(), hoverColumnVisible: false, defaultRowHeights: {
      header: 34, body: 34, footer: 0
    }, getSelectionModel: () => selectionModel
  };
}

/**
 * Two million rows (or `rowcount`) without row objects: an own body model computes the cells.
 *
 * @param rowcount - number of rows
 * @param rowNumbersVisible - since 1.1.93: a fixed row number column in front ("#", 1 … 2,000,000)
 */
export function createLargeModelAndOptions(rowcount: number = 1000000, rowNumbersVisible = false): TableModelAndOptionsIf {
  const tableOptions = createLargeTableOptions();
  // an own body model: the factory flag rowNumbersVisible does not apply – the column definition goes in front,
  // the body model shifts its column indices by one
  const columnDefs: ColumnDefIf[] = rowNumbersVisible
    ? [new RowNumberColumnDef({ format: n => n.toLocaleString('en-US') }), ...createLargeColumnDefs()]
    : createLargeColumnDefs();
  const offset = rowNumbersVisible ? 1 : 0;
  const bodyAreaModel = new LargeBodyModel(rowcount, offset);
  return new TableModelAndOptions(TableFactory.createTableModel({
    bodyAreaModel, columnDefs, tableOptions, fixedLeftColumnCount: offset
  }), tableOptions);
}

export class LargeBodyModel extends AreaModel {

  private readonly nf = new Intl.NumberFormat('en-Us', { });

  private barRenderer:CellRendererIf;

  /**
   * @param rowcount - number of rows
   * @param columnOffset - columns in front of the data columns (1 for a RowNumberColumnDef)
   */
  constructor(private rowcount: number = 1000000, private readonly columnOffset = 0) {
    super();
    this.barRenderer = new NumberCellProgressBarCellRenderer(rowcount, false);
  }

  override getRowCount(): number {
    return this.rowcount;
  }

  override getRowHeight(_rowIndex: number): number {
    return 34;
  }

  override getConstantRowHeight(): number | undefined {
    return 34; // all rows have the same height -> fast rendering at any scroll position
  }

  override getValueAt(rowIndex: number, col: number): number | string {
    const columnIndex = col - this.columnOffset;
    if (columnIndex < 0) return '';
    if (columnIndex === 0) return 'id' + rowIndex;
    if (columnIndex === 1) return this.nf.format(rowIndex);
    return rowIndex;
  }

  override getCellRenderer(_rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    if (columnIndex - this.columnOffset === 2) return this.barRenderer;
    return undefined;
  }

  override getYPosByRowIndex(rowIndex: number): number {
    return rowIndex * this.getRowHeight(0);
  }

}