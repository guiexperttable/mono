# Feature-Prompts – GuiExpert Table

Arbeitsaufträge für neue Features, jeweils für **eine neue Claude-Sitzung** im Mono-Repo. Jeder Prompt führt in Phasen
vom API-Entwurf über Vitest, Code, Doku, Demos, Website und Training bis zur Video-Folge. Nach dem API-Entwurf hält
er an und wartet auf Freigabe.

**So startet man einen Prompt:** neue Sitzung im Mono-Repo, dann z. B.
„Lies `prompts/000-arbeitsweise.md` und führe `prompts/002-overlays-laden-keine-daten.md` aus.“

Herkunft: Abgleich mit ag-Grid 36.2 (Okt. 2026). Die Lücken sind in `TODO.md` (Abschnitt „Feature-Prompts“) eingetragen.

## Reihenfolge

| Nr. | Prompt | Feature | ag-Grid | Braucht | Umfang |
|---|---|---|---|---|---|
| 000 | [000-arbeitsweise.md](000-arbeitsweise.md) | gemeinsamer Ablauf, Regeln, Phasen | – | – | – |
| 001 | [001-aria-screenreader.md](001-aria-screenreader.md) | Screenreader-Unterstützung (ARIA) | Community | – | L |
| 002 | [002-overlays-laden-keine-daten.md](002-overlays-laden-keine-daten.md) | Overlays „Lädt…“ / „Keine Daten“ (plain HTML/CSS) | Community | 001 | S |
| 003 | [003-zustand-speichern.md](003-zustand-speichern.md) | Zustand speichern vervollständigen + State-API | Community | – | M |
| 004 | [004-zeilennummern.md](004-zeilennummern.md) | Zeilennummern | Enterprise | 001 | S |
| 005 | [005-aggregation-gesamtzeile.md](005-aggregation-gesamtzeile.md) | Aggregation, Gesamtzeile, Auswahl-Summen | Enterprise | (001) | M |
| 006 | [006-row-grouping.md](006-row-grouping.md) | Row Grouping | Enterprise | 005 | L |
| 007 | [007-pivot.md](007-pivot.md) | Pivot-Tabellen | Enterprise | 005, 006 | L |
| 008 | [008-formeln-berechnete-spalten-show-values-as.md](008-formeln-berechnete-spalten-show-values-as.md) | Berechnete Spalten, „Show values as“, Formeln | Enterprise | 005 (006, 007 für Teil B) | XL |
| 009 | [009-row-drag.md](009-row-drag.md) | Zeilen ziehen (Row Drag) | Community | 001 (004, 006) | M |
| 010 | [010-fill-handle-batch-edit.md](010-fill-handle-batch-edit.md) | Fill-Handle, Batch-Edit | Enterprise | 001 (005, 008) | M |
| 011 | [011-master-detail.md](011-master-detail.md) | Master/Detail | Enterprise | 001, 003 | XL |
| 012 | [012-rtl.md](012-rtl.md) | Rechts-nach-links-Sprachen (RTL) | Community | alle vorherigen | L |
| 013 | [013-tabellenkalkulation.md](013-tabellenkalkulation.md) | Tabellenkalkulation: Excel-Bedienung, Zwischenablage, Undo/Redo, Zellformeln mit A1-Bezügen, Spreadsheet-Modus (5 Teile, 9 Etappen) | Enterprise (teils Community) | 001, 004, 008, 010, 012 | XL |
| 015 | [015-angular-signal-table.md](015-angular-signal-table.md) | signal-native Angular-Komponente `<guiexpert-table-signal>` (`input()`, `output()`, `model()` für die `TableApi`, zoneless) ab Angular 22 und allen Folgeversionen | – | – | M |

Umfang: S ≈ 1 Sitzung, M ≈ 2–3, L ≈ 3–5, XL = mehr (in Teilen liefern). Grobe Schätzung, nur zum Planen.

## Warum diese Reihenfolge

- **001 zuerst:** Barrierefreiheit ist die gefährlichste Lücke (bei ag-Grid kostenlos, für viele Kunden Pflicht) und
  betrifft jedes DOM-Element. Alle späteren Features setzen die ARIA-Regeln gleich mit um.
- **002–004:** kleine, sichtbare Gewinne mit Video-Potenzial. 003 schließt Lücken in einem Feature, das es halb schon
  gibt, und bietet einen State-Mechanismus, in den sich spätere Features einhängen.
- **005 → 006 → 007 → 008:** eine Kette. 005 baut die Aggregatoren, 006 die Gruppierung, 007 die Pivot-Spalten, 008
  „Show values as“ braucht alle drei.
- **009, 010:** Bedien-Features, die von Zeilennummern (Griff), Gruppen und berechneten Spalten profitieren.
- **011:** greift tief ins Rendering ein (variable Höhen, dauerhafte Detail-Ebene), daher spät.
- **012 zuletzt:** RTL spiegelt Layout, Scrollen, Maus und CSS **aller** Features. Einmal am Ende ist günstiger als
  jedes Feature zweimal. Die anderen Prompts bereiten das mit logischen CSS-Eigenschaften vor.
- **013 Tabellenkalkulation:** ein Excel-ähnliches Grid, das Anwender ohne Konfiguration bedienen (Vorbilder:
  Handsontable, HyperFormula, Google Sheets, Excel im Web). Die fünf Teile hängen eng zusammen (Editor ↔ Formel-Eingabe,
  Änderungssätze ↔ Einfügen ↔ Undo), deshalb **ein** Design mit einem Haltepunkt; umgesetzt in Etappen mit je eigenem PR,
  jede releasefähig; Website, Training und Video einmal am Ende. Sitzungswechsel laufen über den Abschnitt
  „Fortschritt“ im Design-Dokument. RTL (012) und ARIA (001) gelten von Anfang an.

- **015 Angular-Signal-Komponente:** reiner Wrapper-Prompt (kein Core-Feature), deshalb unabhängig von der Kette. Ab
  Angular 22 zusätzlich zu `TableComponent`; ng14–21 bleiben unverändert. Bringt nebenbei das erste Angular-Test-Setup.
  (`014 - webseite schaerfen.md` ist eine Notiz zur Website/SEO, kein Feature-Prompt.)

**Vorschlag (noch kein Prompt):** 014 Kontextmenü – ein eingebautes, barrierefreies Kontextmenü für alle Tabellen
(Ausschneiden/Kopieren/Einfügen, Zeilen/Spalten einfügen/löschen, eigene Einträge). 013 zeigt es nur als Beispiel
(`apps/table-demo/spreadsheet.html`, plain HTML über `onContextmenu`).

## Gemeinsame Konventionen

- Branch `feat/<slug>`, Design-Dokument `prompts/NNN-<slug>.design.md` (Slug steht im Kopf jedes Prompts).
- Neue Training-Kapitel kommen hinten in **Teil 8** (`"advanced"`), Nummer = höchste + 1. Tag im Demo-Repo `ep-NNN`.
- Nichts veröffentlichen, deployen, pushen oder hochzählen ohne ausdrückliche Anweisung.
- 006 und 007 sind älter und enthalten die Regeln noch ausführlich. Bei Widersprüchen gilt `000-arbeitsweise.md`.

## Status

Erledigte Prompts hier und in `TODO.md` abhaken; das Design-Dokument bleibt als Entscheidungsprotokoll liegen.

- [x] 001 (Screenreader-Tests offen) · [x] 002 (Angular-Smoke-Test offen) · [x] 003 (Demo-Repo entfällt, Angular-Demo nach dem Release) · [x] 004 (Demo-Repo entfällt, Angular-Demo nach dem Release) · [x] 005 (Demo-Repo entfällt, Angular-Demo nach dem Release) · [x] 006 (Demo-Repo `ep-036` und Angular-Demo nach dem Release) · [x] 007 (Demo-Repo `ep-037` und Angular-Demo nach dem Release) · [x] 008 (Demo-Repo `ep-039`, Videos offen) · [x] 009 (Angular-Demo nach dem Release; Demo-Repo entfällt) · [x] 010 (Angular-Demo nach dem Release; Demo-Repo entfällt) · [x] 011 (Demo-Repo `ep-038` und Angular-Demo nach dem Release) · [x] 012 (Firefox/Safari manuell, Angular-Demo nach dem Release; Demo-Repo entfällt) · [x] 013 (Screenreader und Excel-Rundreise in Firefox/Safari manuell, Demo-Repo `ep-040`; Angular-Demo-Route `spreadsheet` seit 1.1.99) · [x] 015 (Video 14 nach dem Release; AOT-App und SSR manuell; Demo-Repo entfällt)
