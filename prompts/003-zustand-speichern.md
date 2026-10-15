# TODO-Prompt 003: Zustand speichern vervollständigen (`autoRestoreOptions` + State-API)

> Status: **umgesetzt** (15.10.2026, Branch `feat/table-state`) · angelegt 14.10.2026 · Slug `table-state` (Branch `feat/table-state`, Design `prompts/003-zustand-speichern.design.md`)
> Abhängigkeiten: keine (001 ARIA vorher ist gut, aber nicht nötig). Spätere Prompts hängen ihren Zustand hier ein
> (006 Gruppen auf/zu, 009 Zeilenreihenfolge nicht, 011 aufgeklappte Details).
> ag-Grid: „Grid State“ (`getState()`, `initialState`, Event bei Änderung) ist **Community**.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Ausgangslage: Analyse vom 14.10.2026

„Zustand speichern“ gibt es schon, aber nur zum Teil. Befund im Code (`table-scope.ts` Z. ~123–136 und ~1017–1095,
`service/store-state-*.service.ts`, `data/options/auto-restore-options*.ts`):

| Option / Zustand | Stand | Details |
|---|---|---|
| `autoRestoreSortingState` | ✔ funktioniert | `StoreStateSortingService`, Schlüssel `<key>sortingState`. Gespeichert wird `[{ columnIndex, sortState }]`, also **nach Spaltenindex**, nicht nach Property. Der Header-Klick speichert nur **ein** `SortItem` (`setSortItems([sortItem])`), obwohl Speicher und `doSort()` mehrere können. |
| `autoRestoreScrollPosition` | ✔ funktioniert | `StoreStateScrollPosService`, Schlüssel `<key>scrollState`, `[scrollLeft, scrollTop]` |
| `autoRestoreCollapsedExpandedState` | ✔ funktioniert (nur Baum) | `StoreStateCollapsedExpandService`, braucht `getRowId`; alle Ebenen werden wiederhergestellt |
| `autoRestoreCheckedState` | ✘ **nur deklariert** | Option in Interface und Klasse, aber kein Service, keine Auswertung. Stilles No-op. |
| `autoRestoreSelectedState` | ✘ **nur deklariert** | wie oben; nur `CoverGridFactory` setzt sie auf `false` |
| `isSame` (Option) | ✘ ungenutzt | definiert, nirgends aufgerufen |
| Spaltenbreiten (Resize) | ✘ | `RenderScope.storeColumnWidths()` merkt sie nur im Speicher (für das Wieder-Einblenden), nicht in `localStorage` |
| Spaltenreihenfolge (Drag) | ✘ | `changeColumnOrder` wird nicht gespeichert |
| Spaltensichtbarkeit (`setColumnVisible`) | ✘ | nicht gespeichert |
| Header-Gruppen auf/zu | ✘ | nicht gespeichert |
| Filter | – | extern (`externalFilterFunction`) und damit Sache der Anwendung; evtl. Platz für eigene Daten im State |
| State-API (`getState`/`applyState`) | ✘ | nur `localStorage`, kein Export/Import, kein Event; serverseitiges Speichern (Benutzerprofil) unmöglich |

Weitere Befunde:

- **Doku falsch:** Die JSDoc von `AutoRestoreOptionsIf` sagt, ohne `getStorageKeyFn` werde ein fester Schlüssel
  `'autorestoreoptionsif'` benutzt. Im Code (`TableScope`-Konstruktor) wird ohne `getStorageKeyFn` **gar nichts**
  gespeichert, auch keine Warnung.
- **Vermutlicher Fehler (erst mit Test bestätigen):** Spalte per Drag verschieben → sortieren → neu laden. Die Reihenfolge
  ist wieder die Standardreihenfolge, der gespeicherte `columnIndex` zeigt aber auf die verschobene Position → die
  falsche Spalte wird sortiert.
- Das Training-Kapitel `persist-state` nennt ehrlich nur die drei funktionierenden Optionen.

## Auftrag

1. Die zwei nur deklarierten Optionen **umsetzen** (oder begründet mit `@deprecated` markieren; in Phase 1 entscheiden).
2. **Spaltenlayout** speichern: Breite, Reihenfolge, Sichtbarkeit, Header-Gruppen auf/zu. Immer **nach Property**,
   nicht nach Index.
3. Sortierung **nach Property** speichern (altes Format beim Laden erkennen und umsetzen), Mehrspalten-Sortierung im
   Speicher erhalten.
4. Eine **State-API** wie bei ag-Grid: Zustand als JSON holen, anwenden, beim Start vorgeben und über Änderungen
   informiert werden, damit Anwendungen den Zustand auch auf dem Server speichern können.
5. Doku korrigieren; Warnung, wenn `autoRestore…`-Flags ohne `getStorageKeyFn` gesetzt sind.

## Referenzfälle

| # | Situation | Erwartung nach Neuaufbau mit gleichem Schlüssel |
|---|---|---|
| S1 | Spalte „Total“ auf 240 px gezogen | Breite 240 px |
| S2 | Spalte „City“ an Position 1 gezogen | Reihenfolge wie vorher |
| S3 | `setColumnVisible('city', false)` | Spalte bleibt ausgeblendet |
| S4 | Header-Gruppe „Customer“ zugeklappt | bleibt zugeklappt |
| S5 | Spalte verschoben, danach nach „Total“ sortiert | sortiert nach „Total“, nicht nach der Spalte, die jetzt an dem Index steht |
| S6 | Zeilen 3, 7, 9 angehakt (Checkbox-Spalte, `getRowId`) | wieder angehakt, auch wenn die Daten neu sortiert ankommen |
| S7 | Zeilen ausgewählt (Typ `row`) bzw. Zellbereich (Typ `range`) | Auswahl wie in Phase 1 festgelegt wiederhergestellt |
| S8 | Altes Sortierformat `[{"columnIndex":2,"sortState":"desc"}]` im Speicher | wird gelesen und umgesetzt, danach im neuen Format gespeichert |
| S9 | Gespeicherter Zustand nennt eine Spalte, die es nicht mehr gibt | wird ignoriert, Rest wird angewendet, keine Exception |
| S10 | `api.getState()` → JSON → neue Tabelle mit `tableOptions.initialState` | gleicher sichtbarer Zustand |
| S11 | Benutzer ändert Breite/Sortierung | Event `onStateChanged` (entprellt) mit dem neuen Zustand |
| S12 | `localStorage` gesperrt (privater Modus) | Tabelle startet normal (gibt es schon, nicht kaputt machen) |
| S13 | `autoRestoreSortingState: true`, aber keine `getStorageKeyFn` | einmalige `console.warn` |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Zustandsformat** (`TableStateIf`, JSON-fähig, mit `version`): `columns: [{ property, width, visible }]` (Reihenfolge =
   Array-Reihenfolge), `sort: [{ property, sortState }]`, `scroll: { left, top }` bzw. erste sichtbare Zeile,
   `expandedRowIds`, `checkedRowIds`, `selection`, `headerGroups`, `custom?: unknown` (für den Filter der Anwendung).
2. **API:** `api.getState(parts?)`, `api.applyState(state, { parts?, partial? })`, `tableOptions.initialState`,
   `EventListenerIf.onStateChanged?(state)` (additiv, optional, entprellt). Verhältnis zu `autoRestoreOptions`: dieses
   wird intern auf die neue Mechanik umgestellt, die bisherigen Optionen bleiben gültig.
3. **Speicher-Adapter:** `StateStorageIf { get(key), set(key, value), remove(key) }`, Standard `localStorage`. Damit
   gehen `sessionStorage`, IndexedDB oder ein Server.
4. **Auswahl speichern:** über Zeilen-IDs (`getRowId`) und Spalten-Properties statt Indizes. Was passiert bei
   eigenen `AreaModel`s ohne Objekte (z. B. `LargeBodyModel`)?
5. **Checked/Selected:** umsetzen oder `@deprecated`? Empfehlung begründen (umsetzen ist erwartbar, weil dokumentiert).
6. **Scroll-Position:** Pixel (heute) oder „erste sichtbare Zeile“ (robuster bei geänderten Zeilenhöhen/Daten)?
7. **Migration:** alte Schlüssel (`<key>sortingState`, `<key>scrollState`, Collapsed-Schlüssel) weiterlesen; eine
   Version lang beide Formate?
8. **Datenschutz:** im Zustand stehen nur IDs und Layout, keine Zellwerte. In der Doku erwähnen (IDs können
   personenbezogen sein, z. B. E-Mail als ID).

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: Serialisierung/Deserialisierung, Migration S8, unbekannte Spalten S9, Speicher-Adapter (In-Memory-Storage aus
  `test-utils/memory-storage.ts`), Warnung S13, `isSame`/`getRowId`-Verhalten.
- **Zuerst** einen roten Test für den vermuteten Fehler S5 (`it.fails` + `// BUG:`, solange er besteht).
- Browser: S1–S7, S10–S12 mit echtem Neuaufbau (`destroyAllTables()`, dann `mountTable` mit gleichem Schlüssel);
  Baum-Restore (bestehende Specs bleiben grün).
- Bestehende Specs `store-state-*.service.spec.ts` bleiben grün oder werden bewusst an das neue Format angepasst
  (Migration testen).

## Phase 3 – Hinweise

- Zentrale Stellen: `TableScope` (Konstruktor, `autoRestore…`-Methoden, Header-Klick-Sortierung ~Z. 734–738,
  Spalten-Drag ~Z. 428), `RenderScope.storeColumnWidths`, `AbstractStoreStateService`, `TableApi`
  (`setColumnVisible`, `setColumnWidth`, `sortByColumn`), `AreaModelCellGroups` (Gruppen-Toggle), Checkbox-Modelle
  (`checkbox/`), `SelectionModel` (`createSnapshot`/`restoreSnapshot` gibt es schon).
- `autoRestoreOptions` intern auf die State-Mechanik umstellen, ohne das öffentliche Verhalten zu brechen.

## Phase 4–9 – Besonderheiten

- **Doku:** JSDoc von `AutoRestoreOptionsIf` korrigieren; `instructions.md` (Abschnitt Persistenz) mit State-API und
  Server-Beispiel (`onStateChanged` → `fetch`).
- **Training:** Kapitel `persist-state` (Kap. 33) erweitern: Tabelle „What can be remembered“, Abschnitt State-API,
  `<Callout type="version">`. Kein neues Kapitel.
- **Website:** Feature-Liste („State persistence: layout, sorting, selection – localStorage or your server“).
- **Video:** CLAUDE.md §10 hat schon Folge 19 „Zustand merken (Sortierung, Scroll)“: erweitern um Spaltenlayout und
  State-API („Spalten anpassen, neu laden, alles noch da“).
- **Release-Notes:** Speicherformat geändert (Migration), Sortierung nach Property, neue Optionen wirksam.

## Abschluss-Review (Schwerpunkte)

Migration alter Zustände, keine Indizes im Speicher, nichts Personenbezogenes außer IDs, Verhalten bei gesperrtem
Speicher, keine doppelten Speicherzugriffe pro Scroll-Frame.

## Definition of Done (zusätzlich zu 000)

- [x] Befund oben bestätigt (inkl. Test für S5) und im Design-Dokument festgehalten 🛑
- [x] `autoRestoreCheckedState` / `autoRestoreSelectedState` umgesetzt oder `@deprecated` mit Begründung
- [x] Spaltenlayout (Breite, Reihenfolge, Sichtbarkeit, Header-Gruppen) und Sortierung nach Property gespeichert
- [x] State-API (`getState`, `applyState`, `initialState`, `onStateChanged`, Speicher-Adapter) mit Tests
- [x] JSDoc korrigiert, Warnung ohne `getStorageKeyFn`, Kapitel `persist-state` aktualisiert
