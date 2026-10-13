// Chapter 14 – no objects needed: header, body and footer as two-dimensional arrays (here from a CSV file).
// #region csv
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

async function loadCsv(url: string): Promise<string[][]> {
  const text = await (await fetch(url)).text();
  return text.trim().split("\n").map(line => line.split(","));   // simple CSV: no quoted commas
}

function totalsRow(rows: string[][]): string[] {
  const total = rows.reduce((sum, row) => sum + Number(row[9]), 0);   // column 9 = total
  return ["", "", "", "", "", "", "", "", "Σ", total.toFixed(2), `${rows.length} rows`];
}
// #endregion csv

import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  let scope: TableScope | undefined;
  // #region model
  async function main(host: HTMLDivElement): Promise<void> {
    const [header, ...rows] = await loadCsv("/data/training/orders.csv"); // @show: const [header, ...rows] = await loadCsv("/data/orders.csv");
    const tableModel = TableFactory.createTableModel({
      headerData: [header],
      bodyData: rows,
      footerData: [totalsRow(rows)],
      columnSizes: [70, 120, 160, 120, 110, 150, 110, 70, 90, 100, 100]
    });
    scope = new TableScope(host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter()); // @show: new TableScope(host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter())
    scope.firstInit(); // @show:   .firstInit();
    ctx.info(`${rows.length} rows from orders.csv`); // @hide
  }
  // #endregion model
  main(ctx.host);
  return () => scope?.destroy();
}
