import {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  ColumnDef,
  ColumnDefIf,
  DomServiceIf,
  RendererCleanupFnType,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf,
  TrueFn,
  px100,
  px110,
  px120,
  px180,
  px80,
  px90,
} from "@guiexpert/table";
import type { AccountRecordIf } from "../model/account-record.if";

const PREFIXES = [
  "Acme", "Apex", "Beacon", "Blue", "Bright", "Cedar", "Cobalt", "Crest", "Delta", "Echo",
  "Fable", "Forge", "Granite", "Harbor", "Helix", "Indigo", "Kestrel", "Lumen", "Maple", "Nimbus",
  "North", "Nova", "Onyx", "Orbit", "Peak", "Pulse", "Quartz", "Ridge", "River", "Signal",
  "Silver", "Solar", "Spark", "Summit", "Swift", "Terra", "Timber", "Vector", "Vertex", "Zephyr",
];
const SUFFIXES = ["GmbH", "Inc", "AG", "Ltd", "SAS", "Corp", "Labs", "Systems", "Cloud", "Works"];
const REGIONS = ["EMEA", "AMER", "APAC", "LATAM"];
const PLANS = ["Starter", "Growth", "Pro", "Enterprise"];
const STATUSES = ["Active", "Active", "Active", "Trial", "At Risk", "Churned"];

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

class CurrencyCellRenderer implements CellRendererIf {
  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: unknown,
    domService: DomServiceIf,
  ): RendererCleanupFnType | undefined {
    if (typeof cellValue === "number") {
      const div = domService.createElement<HTMLDivElement>("div");
      domService.addClass(div, "ge-table-label-div");
      const label = domService.createElement<HTMLDivElement>("div");
      domService.addClass(label, "ge-table-label");
      domService.appendChild(label, domService.createText(CURRENCY.format(cellValue)));
      domService.appendChild(div, label);
      domService.appendChild(cellDiv, div);
    }
    return undefined;
  }
}

/** Deterministic PRNG (fixed seed) so demos and screenshots are reproducible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Generates deterministic SaaS account rows for the column filter demo (ID, Company, Region, Plan, Seats, MRR, Created, Status).
 *
 * @param count - number of rows (default 200,000)
 */
export function generateAccountRecords(count = 200_000): AccountRecordIf[] {
  const rand = lcg(20261124);
  const startDay = Date.UTC(2024, 0, 1);
  const daySpan = 1050;
  const rows: AccountRecordIf[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const p1 = PREFIXES[Math.floor(rand() * PREFIXES.length)];
    const p2 = PREFIXES[Math.floor(rand() * PREFIXES.length)];
    const suf = SUFFIXES[Math.floor(rand() * SUFFIXES.length)];
    const planIdx = Math.floor(rand() * PLANS.length);
    const plan = PLANS[planIdx];
    const baseSeats = planIdx === 0 ? 5 : planIdx === 1 ? 20 : planIdx === 2 ? 60 : 180;
    const seats = baseSeats + Math.floor(rand() * baseSeats * 2);
    const rate = planIdx === 0 ? 19 : planIdx === 1 ? 39 : planIdx === 2 ? 69 : 119;
    const mrr = seats * rate;
    const date = new Date(startDay + Math.floor(rand() * daySpan) * 86_400_000);
    const created = date.toISOString().slice(0, 10);

    rows[i] = {
      id: i + 1,
      company: p1 === p2 ? `${p1} ${suf}` : `${p1} ${p2} ${suf}`,
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      plan,
      seats,
      mrr,
      created,
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
    };
  }
  return rows;
}

/**
 * Column filter demo (since 1.1.114): 200,000 accounts with persistent filter row (`filterRow: true`),
 * per-column filter menus (`columnFilterMenu: true`) and a sum footer (`footerAggregates`).
 *
 * @param count - number of rows (default 200,000)
 */
export function createColumnFilterModelAndOptions(count = 200_000): TableModelAndOptionsIf {
  const currency = new CurrencyCellRenderer();
  const right = ["ge-table-text-align-right"];

  const columnDefs: ColumnDefIf[] = [
    ColumnDef.create({
      property: "id",
      headerLabel: "ID",
      width: px80,
      sortable: TrueFn,
      hideable: false,
      bodyClasses: right,
    }),
    ColumnDef.create({
      property: "company",
      headerLabel: "Company",
      width: px180,
      sortable: TrueFn,
    }),
    ColumnDef.create({
      property: "region",
      headerLabel: "Region",
      width: px100,
      sortable: TrueFn,
    }),
    ColumnDef.create({
      property: "plan",
      headerLabel: "Plan",
      width: px110,
      sortable: TrueFn,
    }),
    ColumnDef.create({
      property: "seats",
      headerLabel: "Seats",
      width: px90,
      sortable: TrueFn,
      bodyClasses: right,
    }),
    ColumnDef.create({
      property: "mrr",
      headerLabel: "MRR",
      width: px120,
      sortable: TrueFn,
      bodyClasses: right,
      bodyRenderer: currency,
    }),
    ColumnDef.create({
      property: "created",
      headerLabel: "Created",
      width: px110,
      sortable: TrueFn,
    }),
    ColumnDef.create({
      property: "status",
      headerLabel: "Status",
      width: px110,
      sortable: TrueFn,
    }),
  ];

  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    filterRow: true,
    columnFilterMenu: true,
  };

  const tableModel = TableFactory.createTableModel({
    rows: generateAccountRecords(count),
    columnDefs,
    footerAggregates: {
      rows: [
        {
          label: (rowCount: number) => `Total · ${rowCount.toLocaleString("en-US")} accounts`,
          aggregates: { seats: "sum", mrr: "sum" },
        },
      ],
      labelProperty: "company",
    },
    tableOptions,
  });

  return new TableModelAndOptions(tableModel, tableOptions);
}
