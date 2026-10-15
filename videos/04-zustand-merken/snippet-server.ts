import { EventAdapter, TableOptions } from "@guiexpert/table";
import type { GeStateChangeEvent, TableStateIf } from "@guiexpert/table";

// Statt localStorage: der Zustand pro Benutzer auf dem Server
const saved = (await (await fetch("/api/prefs/bestellungen")).json()) as TableStateIf | null;
const tableOptions = { ...new TableOptions(), initialState: saved ?? undefined };

const listener = new EventAdapter();
listener.onStateChanged = (evt: GeStateChangeEvent) =>
  void fetch("/api/prefs/bestellungen", { method: "PUT", body: JSON.stringify(evt.state) });
export { tableOptions, listener };
