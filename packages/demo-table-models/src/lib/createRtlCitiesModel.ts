import {
  ColumnDef,
  FocusModel,
  px100,
  px120,
  px140,
  SelectionModel,
  TableFactory,
  TableModelAndOptions,
  TableModelAndOptionsIf,
  TableOptions,
  TableOptionsIf
} from "@guiexpert/table";
import type { TableDirection } from "@guiexpert/table";
import { RtlCitySalesIf } from "../model/rtl-city-sales.if";

/** [city, country, IATA code] – Arabic names, the code is Latin (mixed text in the branch column). */
const CITIES: [string, string, string][] = [
  ["الرياض", "السعودية", "RUH"], ["جدة", "السعودية", "JED"], ["مكة", "السعودية", "MKK"], ["الدمام", "السعودية", "DMM"],
  ["دبي", "الإمارات", "DXB"], ["أبوظبي", "الإمارات", "AUH"], ["الشارقة", "الإمارات", "SHJ"], ["الدوحة", "قطر", "DOH"],
  ["الكويت", "الكويت", "KWI"], ["المنامة", "البحرين", "BAH"], ["مسقط", "عُمان", "MCT"], ["القاهرة", "مصر", "CAI"],
  ["الإسكندرية", "مصر", "ALY"], ["عمّان", "الأردن", "AMM"], ["بيروت", "لبنان", "BEY"], ["بغداد", "العراق", "BGW"],
  ["تونس", "تونس", "TUN"], ["الجزائر", "الجزائر", "ALG"], ["الرباط", "المغرب", "RBA"], ["الدار البيضاء", "المغرب", "CMN"],
];

/** January … December in Arabic. */
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** A small seeded PRNG (mulberry32) – the same seed gives the same rows. */
function seeded(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sales of branches in Arabic cities per month (since 1.1.98) – data for right-to-left demos. The same count and
 * seed give the same rows.
 *
 * @param count - number of branches (default 2,000; cities repeat with a higher branch number)
 * @param seed - the same seed gives the same rows
 */
export function generateRtlCitySales(count = 2_000, seed = 7): RtlCitySalesIf[] {
  const rnd = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const [city, country, code] = CITIES[i % CITIES.length];
    const base = 5_000 + Math.round(rnd() * 25_000);
    const m = () => Math.round(base * (0.7 + rnd() * 0.6));
    return {
      id: i + 1,
      city,
      country,
      branch: `فرع ${code}-${String(Math.floor(i / CITIES.length) + 1).padStart(2, "0")}`,
      m1: m(), m2: m(), m3: m(), m4: m(), m5: m(), m6: m(), m7: m(), m8: m(), m9: m(), m10: m(), m11: m(), m12: m()
    };
  });
}

/**
 * Right-to-left demo (since 1.1.98): Arabic headers and data, row numbers and the city fixed at the **start** (on the
 * right in right-to-left), a calculated total fixed at the end, a total row, range selection and focus.
 * The same model works left-to-right – pass `"ltr"` to compare.
 *
 * @param direction - `"rtl"` (default), `"ltr"` or `"auto"` (`tableOptions.direction`)
 * @param rows - the rows (default: {@link generateRtlCitySales})
 */
export function createRtlCitiesModelAndOptions(
  direction: TableDirection = "rtl",
  rows: RtlCitySalesIf[] = generateRtlCitySales()
): TableModelAndOptionsIf {
  const selectionModel = new SelectionModel("range", "multi");
  const focusModel = new FocusModel("cell");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    direction,
    hoverColumnVisible: false,
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,
    ariaLabel: "المبيعات حسب المدينة",
  };
  const number = ["ge-table-text-align-right"];       // "right" = end: left-aligned in right-to-left
  const monthColumns = MONTHS.map((headerLabel, i) => ColumnDef.create({
    property: `m${i + 1}`, headerLabel, width: px100, bodyClasses: number, footerClasses: number, sortable: () => true
  }));
  const columnDefs = [
    ColumnDef.create({ property: "city", headerLabel: "المدينة", width: px120, sortable: () => true }),
    ColumnDef.create({ property: "country", headerLabel: "البلد", width: px120, sortable: () => true }),
    ColumnDef.create({ property: "branch", headerLabel: "الفرع", width: px140 }),
    ...monthColumns,
    ColumnDef.create({
      property: "total", headerLabel: "المجموع", width: px120, bodyClasses: number, footerClasses: number,
      sortable: () => true,
      valueGetter: (row: RtlCitySalesIf) => MONTHS.reduce((sum, _m, i) => sum + (row[`m${i + 1}` as keyof RtlCitySalesIf] as number), 0)
    }),
  ];
  const sums = Object.fromEntries([...monthColumns.map(c => c.property), "total"].map(p => [p, "sum" as const]));
  const tableModel = TableFactory.createTableModel({
    rows,
    columnDefs,
    rowNumbersVisible: true,
    fixedLeftColumnCount: 1,                            // the city stays at the start (right)
    fixedRightColumnCount: 1,                           // the total stays at the end (left)
    footerAggregates: {
      rows: [{ label: "المجموع", aggregates: sums }],
      labelProperty: "branch"
    },
    tableOptions,
  });
  return new TableModelAndOptions(tableModel, tableOptions);
}
