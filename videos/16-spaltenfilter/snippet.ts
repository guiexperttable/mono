import { ColumnDef, EventAdapter, TableApi, TableFactory, TableOptions, TableOptionsIf } from "@guiexpert/table";
type Account = { id: number; company: string; region: string; mrr: number };
declare const rows: Account[], tableApi: TableApi, columnsBtn: HTMLButtonElement;
const tableModel = TableFactory.createTableModel({
  rows, footerAggregates: { mrr: "sum" }, columnDefs: [
    ColumnDef.create({ property: "id", headerLabel: "ID", hideable: false, filter: "number" }),
    ColumnDef.create({ property: "region", headerLabel: "Region" }),
    ColumnDef.create({ property: "mrr", headerLabel: "MRR", filter: "number" }),
  ],
});
const tableOptions: TableOptionsIf = { ...new TableOptions(), filterRow: true, columnFilterMenu: true };
const listener = new EventAdapter();
listener.onFilterChanged = evt => console.log(`${evt.rowCount} / ${evt.unfilteredRowCount}`);
columnsBtn.onclick = () => tableApi.showColumnChooser(columnsBtn);
export { tableModel, tableOptions, listener };
