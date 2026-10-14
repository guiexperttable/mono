// Chapter 35 – an accessible table: a name for screen readers, own announcement texts, keyboard navigation.
// #region options
import { TableOptions, type AriaTextsIf, type SortState, type TableOptionsIf } from "@guiexpert/table";

const german: Partial<AriaTextsIf> = {
  sorted: (column: string, state: SortState) =>
    state ? `Sortiert nach ${column}, ${state === "asc" ? "aufsteigend" : "absteigend"}` : `${column} unsortiert`,
  filtered: (rowCount: number) => `${rowCount} Zeilen`,
  copied: (cellCount: number) => `${cellCount} Zellen kopiert`,
};

export function createAccessibleOptions(language: "en" | "de"): TableOptionsIf {
  return {
    ...new TableOptions(),
    ariaLabel: "Orders",                              // or ariaLabelledBy: "id-of-a-heading"
    ariaTexts: language === "de" ? german : undefined // English defaults otherwise
  };
}
// #endregion options

import { EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableScope } from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(1_000);
  let language: "en" | "de" = "en";
  let search = "";
  let scope: TableScope | undefined;
  let observer: MutationObserver | undefined;

  const create = () => {
    observer?.disconnect();
    scope?.destroy();
    const selectionModel = new SelectionModel("range", "multi");
    const options: TableOptionsIf = {
      ...createAccessibleOptions(language),
      getSelectionModel: () => selectionModel,
      externalFilterFunction: (o: Order) => !search || `${o.customer} ${o.city}`.toLowerCase().includes(search)
    };
    const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: createOrderColumns(), tableOptions: options });
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), options, new EventAdapter());
    scope.firstInit();
    // #region announce
    const api = scope.getApi();
    api.announce(language === "de" ? "1.000 Bestellungen geladen" : "1,000 orders loaded");
    // #endregion announce
    // show what the screen reader hears (the live region is visually hidden)
    const region = scope.liveAnnouncer.getElement();
    if (region) {
      observer = new MutationObserver(() => region.textContent && ctx.info(`🔊 ${region.textContent}`));
      observer.observe(region, { childList: true, characterData: true, subtree: true });
    }
  };

  ctx.search("filter customer or city", value => {
    search = value.trim().toLowerCase();
    scope?.getApi().externalFilterChanged();
  });
  ctx.toggle("Deutsch", false, checked => {
    language = checked ? "de" : "en";
    create();
  });
  ctx.button("focus table", () => ctx.host.focus());
  create();
  return () => {
    observer?.disconnect();
    scope?.destroy();
  };
}
