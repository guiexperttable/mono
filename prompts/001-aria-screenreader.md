# TODO-Prompt 001: Screenreader-Unterstützung (ARIA)

> Status: **offen** · angelegt 14.10.2026 · Slug `aria` (Branch `feat/aria`, Design `prompts/001-aria-screenreader.design.md`)
> Abhängigkeiten: keine. **Alle späteren Prompts bauen darauf auf**: neue DOM-Elemente bekommen ab hier Rollen und
> `aria-*`-Attribute nach den Regeln, die dieser Prompt festlegt.
> ag-Grid: ARIA und Tastaturbedienung sind dort **Community** (kostenlos). Bei GuiExpert fehlt beides fürs Screenreading.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen** (Ablauf, Phasen, Regeln). Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Die Tabelle soll mit Screenreadern (NVDA, JAWS, VoiceOver) bedienbar sein: Rollen und Zustände nach dem
WAI-ARIA-Muster „Grid“ bzw. „Treegrid“ (ARIA Authoring Practices), Ansagen bei Fokuswechsel, Sortierung, Filter,
Auswahl und Kopieren. Prüfmaßstab: WCAG 2.1 AA bzw. EN 301 549, relevant u. a. für das Barrierefreiheitsstärkungsgesetz
(BFSG, seit Juni 2025). Ohne das scheidet die Tabelle bei vielen Behörden- und Unternehmenskunden aus.

## Warum zuerst

ARIA betrifft jede Zelle, jede Zeile und jedes Bedienelement. Kommt es später, müssen alle danach gebauten Features
(Overlays, Zeilennummern, Gruppenzeilen, Row Drag, Fill-Handle, Master/Detail) nachgerüstet werden. Kommt es zuerst,
setzt jedes neue Feature die Regeln gleich um.

## Was es heute gibt (Code-Befund Okt. 2026)

- **Kein einziges `aria-*`- oder `role`-Attribut** im Core (`packages/table/src/lib/table`).
- Host-Element: `ele-scope.ts` setzt `tabindex="0"` (für Tastatur-Events) und die Klasse `ge-table`. Die Tastatur läuft
  über den Host (`ShortcutService`, `ActionId`, `shortcutActionIdMapping`). Der Fokus ist ein Modell (`FocusModel`:
  Zeile/Spalte), kein DOM-Fokus auf Zellen.
- Layout: 3 × 3 Areas (`header|body|footer` × `west|center|east`). **Eine logische Zeile besteht aus bis zu drei
  Row-Divs** (west, center, east): `ConvenienceDomService.addRowDiv` (Klassen `ge-table-row-div`,
  `ge-table-row-div-<index>`), Zellen über `addColumnDiv` (Klasse `ge-table-col-div`, Attribute `data-row-index`,
  `data-col-index`, `data-area`).
- Virtual Scrolling: nur sichtbare Zeilen und Spalten sind im DOM. Bei jedem Render wird neu aufgebaut
  (`RenderScope.adjustArea`, Row-Div-Cache `getDivOrCreateDiv` / `pruneRowDivCache`).
- Weitere Elemente: Baum-Pfeil `addArrowDiv` (`ge-table-tree-arrow-div`), Checkbox `addCheckboxToDiv` (HTML-String mit
  `ge-table-row-checkbox`), Sortier-Icon `addSortedIcon`, Header-Gruppen-Toggle, Resize-Handles
  (`ge-table-column-resize-handle`), Hover-Divs, Drag-Ghost, Rahmen-Divs, Tooltips per `title`.
- Editor: Input/Select (`renderer/edit/`), Escape bricht ab (`input-handler.ts`).
- Selektion: `SelectionModel` (`none|cell|row|column|range`), Strg/⌘+A, Strg/⌘+C (`CopyService`).
- Eingebaute Renderer mit rein visueller Aussage: Fortschrittsbalken, Sterne, Wahr/Falsch, Männlich/Weiblich-Icon.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| A1 | Tabelle mit 1.000 Zeilen, 10 Spalten, 1 Header-Zeile | Host `role="grid"`, `aria-rowcount="1001"` (alle, nicht nur gerenderte), `aria-colcount="10"`, Name über `aria-label` bzw. `aria-labelledby` aus den Optionen |
| A2 | jede gerenderte Zelle | `role="gridcell"` bzw. `columnheader`/`rowheader`, `aria-colindex` = Modellindex + 1 (über west/center/east); Zeile `role="row"`, `aria-rowindex` (1-basiert, inkl. Header) |
| A3 | Pfeiltaste nach unten | Fokus wandert, `aria-activedescendant` am Host zeigt auf die ID der neuen Zelle, das Element existiert nach dem Render |
| A4 | Ans Ende scrollen (2 Mio. Zeilen) | letzte Zeile hat `aria-rowindex="2000001"` (+ Header) |
| A5 | Header-Klick sortiert absteigend | Header-Zelle `aria-sort="descending"`, andere sortierbare `none`; Ansage „Sorted by Total, descending“ |
| A6 | Baum: Knoten auf-/zuklappen | `role="treegrid"`, Zeilen mit `aria-level`, `aria-expanded`, `aria-setsize`, `aria-posinset` |
| A7 | Auswahl (Klick, Shift-Klick, Strg+A) | `aria-selected="true"` auf ausgewählten Zellen bzw. Zeilen; `aria-multiselectable` am Host, wenn erlaubt |
| A8 | Checkbox-Spalte, Baum mit Teilauswahl | zugängliche Checkbox mit Namen („Select row 5“), `aria-checked="mixed"` bei Teilauswahl |
| A9 | Header-Gruppen, Row-/Colspan | `aria-colspan`/`aria-rowspan`; Gruppen-Toggle ist ein Button mit `aria-expanded` und Namen |
| A10 | Editor (F2) | Eingabefeld hat Namen (Spaltenüberschrift), Escape bricht ab, Fokus kehrt zur Tabelle zurück |
| A11 | Filter, Kopieren | Live-Region (`role="status"`, `aria-live="polite"`) sagt „42 rows“ bzw. „12 cells copied“ |
| A12 | Dekoratives (Rahmen, Hover-Divs, Drag-Ghost, Resize-Handles) | `aria-hidden="true"` |
| A13 | Fokus sichtbar | Fokusrahmen mit ausreichendem Kontrast (eigene CSS-Variable), nicht nur Farbe |
| A14 | Standard-Theme light/dark | Text-Kontrast ≥ 4,5 : 1, UI-Elemente ≥ 3 : 1 (`table-color-vars.css` prüfen) |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Zeilen über drei Areas:** (a) `role="row"` in jedem Area-Container mit gleichem `aria-rowindex` (so macht es
   ag-Grid bei fixierten Spalten), (b) Area-Zeilen `role="presentation"` + eine logische Zeile per `aria-owns`,
   (c) anderes. Empfehlung erst nach Test mit echten Screenreadern; Testmatrix im Design-Dokument (NVDA + Firefox/Chrome,
   JAWS + Chrome, VoiceOver + Safari).
2. **Fokus:** `aria-activedescendant` (Host behält den DOM-Fokus, passt zur heutigen Architektur) vs. Roving-Tabindex
   (DOM-Fokus auf der Zelle; Zellen werden aber bei jedem Render neu erzeugt → Fokusverlust). Empfehlung begründen.
3. **ID-Schema:** stabil und eindeutig auch bei mehreren Tabellen pro Seite, z. B. `ge-<tableId>-<area>-r<row>-c<col>`.
4. **Rollen der Container:** `rowgroup` für Header/Body/Footer (je Seite?), Scroll-Viewport, Content-Wrapper.
5. **Virtual Scrolling:** Zählung (`aria-rowcount`/`aria-colcount`) über alle Zeilen und sichtbaren Spalten; ausgeblendete
   Spalten (`setColumnVisible`) zählen nicht oder doch? Verhalten bei `-1` (unbekannte Zeilenzahl, später für
   Server-Modelle).
6. **Renderer:** Textalternativen für die eingebauten visuellen Renderer (z. B. `aria-label="75 %"`, unsichtbarer Text
   `ge-table-sr-only`). Was müssen eigene Renderer und Framework-Komponenten tun? Regel für `CellRendererIf` dokumentieren.
7. **Optionen** (in `TableOptionsIf`, additiv): `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`, Ansagetexte
   (englische Defaults, überschreibbar, z. B. `ariaAnnouncements: { sorted, filtered, copied, … }` als Funktionen).
8. **Tastatur nach APG:** Home/End, Strg+Home/End, Bild↑/↓, Baum auf/zu (→/← oder Enter), Fokus in den Header
   (Sortieren per Enter?). Vorhandene Belegung in `ShortcutService` prüfen, nur Fehlendes ergänzen, Konflikte mit
   bestehenden Kürzeln vermeiden.
9. **Tooltips:** `title` ist per Tastatur nicht erreichbar. Beschreibung per `aria-describedby` oder bewusst offenlassen.
10. **Performance:** zusätzliche Attribute je Zelle kosten DOM-Schreibzugriffe. Budget festlegen (z. B. ≤ 10 % mehr
    Renderzeit im Showcase „Large dataset“ mit 2 Mio. Zeilen), vorher/nachher messen.
11. **Werkzeuge:** `axe-core` als **devDependency** für Browser-Specs (Runtime bleibt abhängigkeitsfrei); Protokoll der
    manuellen Screenreader-Tests im Design-Dokument.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: ID-Bildung, Zählungen (Header + Body + Footer, ausgeblendete Spalten), Ansagetexte.
- Browser: A1–A12 einzeln; insbesondere
  - `aria-rowindex` nach `scrollToIndex` in die Mitte und ans Ende (A4),
  - `aria-activedescendant` zeigt nach jeder Pfeiltaste und nach jedem Scroll auf ein **existierendes** Element (A3),
  - Baum-Attribute nach Auf-/Zuklappen und nach Filter (A6),
  - fixierte Spalten links/rechts: Zeile über drei Areas wie in Frage 1 entschieden,
  - Live-Region-Text nach `externalFilterChanged()`, Sortieren, `copyToClipboard()` (A11).
- **axe-core**: keine Verstöße für die Modelle „einfach“, „Baum“, „Header-Gruppen“, „fixierte Spalten“, „Checkboxen“.
- HTML-Injection: Spaltenüberschrift `"><img src=x onerror=…>` landet als Namen in `aria-label`/Checkbox-Label →
  kein Element, Text korrekt. Besonders `addCheckboxToDiv` baut heute einen HTML-String: dort escapen.
- Wrapper: `role="grid"` vorhanden in React und Web Component (Smoke).

## Phase 3 – Hinweise

- Zentrale Stellen: `EleScope` (Host, Container, Live-Region), `ConvenienceDomService.addRowDiv`/`addColumnDiv`,
  Header-/Body-/Footer-Rendering in `RenderScope`, Baum- und Checkbox-Helfer, `TableScope` (Sortierung, Filter, Copy).
- Attribute immer über `DomServiceIf.setAttribute` (Angular nutzt `Renderer2`).
- CSS: `ge-table-sr-only` (visuell versteckt, für Screenreader lesbar), Fokusrahmen-Variable
  `--ge-table-focus-outline-color` o. ä. in light und dark.
- Bestehende CSS-Klassen und `data-*`-Attribute nicht ändern (Anwender-CSS und Tests hängen daran).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` neuer Abschnitt „Accessibility“ (Optionen, Tastaturtabelle, Regeln für eigene Renderer
  und Framework-Komponenten, Testprotokoll); `CLAUDE.md` §3.6 (Interaktion) und §5 (Konvention: jedes neue DOM-Element
  bekommt Rolle/ARIA).
- **Website:** Feature-Liste; in `why.astro` ggf. eine Zeile „Accessibility (WAI-ARIA, keyboard)“ (ag-Grid Community ✔,
  GuiExpert ✔). Optional eine kurze Seite zur Barrierefreiheit.
- **Training:** eigenes Kapitel in Teil 8 empfohlen („Accessible tables: keyboard and screen readers“).
- **Video:** „Barrierefreie Tabelle in 60 Sekunden“, mit hörbarer Screenreader-Ausgabe (VoiceOver), Untertitel.

## Abschluss-Review (Schwerpunkte)

Ergebnisse der echten Screenreader-Tests, axe ohne Verstöße, keine messbare Verschlechterung beim Scrollen großer
Tabellen, keine geänderten Klassen/Attribute, Escaping in Attributen.

## Definition of Done (zusätzlich zu 000)

- [ ] Design-Dokument mit Entscheidungen zu Zeilenstruktur, Fokusmodell, ID-Schema, Optionen, Tastatur 🛑
- [ ] A1–A14 umgesetzt und getestet; axe ohne Verstöße; Screenreader-Protokoll im Design-Dokument
- [ ] Performance-Messung vorher/nachher dokumentiert, Budget eingehalten
- [ ] Regel „neues DOM-Element → Rolle/ARIA“ in `CLAUDE.md` §5 und in `prompts/000-arbeitsweise.md` bestätigt
