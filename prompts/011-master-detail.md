# TODO-Prompt 011: Master/Detail (aufklappbare Detailzeile)

> Status: **umgesetzt** (16.10.2026, Branch `feat/master-detail`, selbständig; Demo-Repo `ep-038` und Angular-Demo nach dem Release) · angelegt 14.10.2026 · Slug `master-detail` (Branch `feat/master-detail`, Design `prompts/011-master-detail.design.md`)
> Abhängigkeiten: **001 (ARIA)**, **003 (Zustand)** für „aufgeklappte Details merken“. Technische Voraussetzung im
> Prompt selbst: variable Zeilenhöhen schnell machen (`TODO.md` „Performance, Teil 2“).
> ag-Grid: Master/Detail ist dort **Enterprise**.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Eine Zeile (Master) lässt sich aufklappen. Darunter erscheint eine **Detailzeile über die volle Breite** mit beliebigem
Inhalt: typischerweise eine zweite GuiExpert-Tabelle (Bestellung → Bestellpositionen), aber auch ein Formular, ein
Diagramm oder eine Framework-Komponente. Das Ganze muss mit Virtual Scrolling und Millionen Zeilen funktionieren.

Das ist der technisch anspruchsvollste Prompt: Er greift in das Rendering ein. Deshalb steht er spät in der Reihenfolge.

## Was es heute gibt (Code-Befund Okt. 2026)

- **Rendering:** `RenderScope.adjustArea()` leert bei jedem Render alle Area-Container (`child.innerText = ''`) und baut
  die sichtbaren Zeilen neu. Row-Divs werden zwar je Index gecacht (`ConvenienceDomService.getDivOrCreateDiv`), aber
  dabei geleert (`div.innerText = ""`). **Ein Detail-Inhalt (z. B. eine verschachtelte Tabelle) würde also bei jedem
  Scroll-Frame zerstört.** Er braucht eine eigene, dauerhafte Ebene oder einen Cache, aus dem DOM-Knoten wieder
  eingehängt werden (Verschieben erhält den Zustand).
- **Zeilenhöhen:** `AreaModelIf.getRowHeight(rowIndex)` erlaubt variable Höhen. Schnell ist aber nur der Fall mit
  konstanter Höhe (`getConstantRowHeight()` → Startindex direkt berechnet). Bei variablen Höhen ist die Suche nach der
  ersten sichtbaren Zeile O(n) je Frame: `TODO.md` „Performance, Teil 2: variable Zeilenhöhen weiterhin O(n) →
  Prefix-Summen + Binärsuche (Invalidierung bei Filter/Sortierung/Baum-Toggle beachten)“. Mit Details wird das zum
  Normalfall.
- **Breite:** Eine Zeile besteht aus drei Teilen (west/center/east). Col-/Rowspan (`drawBigCell`) wirkt nur innerhalb
  einer Seite. Eine Zeile „über alles“ gibt es nicht.
- **Ereignisse:** `MouseHandler` und Tastatur hängen am Host-Element. Ereignisse aus einer verschachtelten Tabelle
  würden zur äußeren Tabelle hochblubbern (Klick, Tasten, Ziehen).
- **Framework-Komponenten** als Zellinhalt gibt es (`ComponentRendererWrapper`, Angular `RenderWrapperFactory`), mit
  Cleanup-Funktionen (`RendererCleanupFnType`).
- Baum (`AreaModelTree`) hat Auf-/Zuklappen. Master/Detail ist aber etwas anderes: Das Detail hat eine andere Form als
  der Master.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| M1 | Bestellung aufklappen | darunter erscheint die Positionstabelle (eigene GuiExpert-Tabelle) über die volle Breite, fixierte Spalten eingeschlossen |
| M2 | Horizontal scrollen | die Detailzeile bleibt stehen (scrollt nicht mit den Spalten) |
| M3 | Vertikal scrollen mit 100.000 Mastern und 50 aufgeklappten Details | flüssig; Detail-Inhalt wird **nicht** bei jedem Frame neu erzeugt; Scrollposition innerhalb der Detailtabelle bleibt erhalten |
| M4 | Detail aus dem Sichtbereich scrollen und zurück | gleicher Zustand (Auswahl, Scrollposition im Detail) oder dokumentiertes Neu-Erzeugen nach Zeitlimit |
| M5 | Zuklappen | Detail verschwindet, verschachtelte Tabelle bekommt `destroy()`, Framework-Komponente wird ausgehängt |
| M6 | Master-Tabelle sortieren/filtern | Details bleiben an ihrem Master |
| M7 | Höhe | feste Höhe oder automatisch nach Inhalt (gemessen, `ResizeObserver`), Änderung verschiebt die Zeilen darunter korrekt |
| M8 | Klick, Tasten, Ziehen in der Detailtabelle | lösen nichts in der Master-Tabelle aus |
| M9 | Tastatur (mit 001) | Master-Zeile mit `aria-expanded`; Enter klappt auf; Tab wechselt in das Detail und zurück |
| M10 | `scrollToIndex` / `ensureRowIsVisible` mit aufgeklappten Details | landet auf der richtigen Zeile |
| M11 | Copy / Excel der Master-Tabelle | ohne Detailzeilen (oder Option) |
| M12 | Neu laden mit 003 | aufgeklappte Master (per `getRowId`) wieder aufgeklappt |
| M13 | React/Angular-Komponente als Detail | wird eingehängt, Änderungen in der Komponente bleiben beim Scrollen erhalten, beim Zuklappen sauber ausgehängt |
| M14 | Dark Theme, Rahmen | Detailzeile optisch abgesetzt (CSS-Variablen) |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Voraussetzung zuerst:** Prefix-Summen + Binärsuche für variable Zeilenhöhen (Startindex, `getYPosByRowIndex`,
   Gesamthöhe), Invalidierung bei Filter, Sortierung, Baum-Toggle und Detail-Auf/Zu. Als eigener erster Schritt mit
   eigenen Tests und Messung (Ziel: 2 Mio. Zeilen mit variablen Höhen so schnell wie mit konstanter Höhe ± 20 %).
2. **Detail-Ebene:** (a) eigene, absolut positionierte Ebene über/zwischen den Area-Containern (volle Breite, scrollt nur
   vertikal mit), (b) Detail als Zeile mit Colspan über alle Seiten (geht heute nicht), (c) anderes. Empfehlung
   begründen.
3. **Lebenszyklus des Inhalts:** Cache je Master (Schlüssel `getRowId` oder Zeilenobjekt), DOM-Knoten beim Scrollen nur
   umhängen; wann wird endgültig zerstört (Zuklappen, Modellwechsel, LRU-Grenze für weit weggescrollte Details)?
4. **API:** `tableOptions.masterDetail: { isMaster?(row), detailHeight: number | 'auto' | (row) => number,
   renderDetail(row, container, context): CleanupFn | void }` o. ä.; `api.setDetailExpanded(row, expanded)`,
   `api.isDetailExpanded(row)`, Events. Auf-/Zu-Symbol in einer Spalte (wie der Baum-Pfeil) oder eigene Spalte?
5. **Verschachtelte GuiExpert-Tabelle:** Helfer, der eine Tabelle im Detail anlegt und beim Zerstören `destroy()` ruft;
   Breite/Höhe; Theme erbt.
6. **Ereignis-Isolation** (M8): Ereignisse, deren Ziel im Detail liegt, im äußeren `MouseHandler`, in der Tastatur und in
   der Auswahl ignorieren; Fokus-Handling (Host-`tabindex`).
7. **Wrapper:** Detail als Framework-Komponente (React, Vue, Angular, Svelte, Solid, Preact) wie die vorhandenen
   Komponenten-Renderer; in allen Wrappern gleich und mit Smoke-Test.
8. **Verhältnis zu Baum und Gruppen:** Kann ein Baum- oder Gruppenknoten (006) ein Detail haben? Vorerst nur flache
   Master-Tabellen?
9. **Export/Copy:** Details nie exportieren oder Option.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: Prefix-Summen (Aufbau, Aktualisierung bei Höhenänderung, Binärsuche, Invalidierung), Detail-Cache (LRU).
- Bench: Scroll-Render mit variablen Höhen, vorher/nachher (Messung in Chromium wie bei Folge 01, nicht in `test:unit`).
- Browser: M1–M12 und M14; insbesondere „Detail-Inhalt bleibt dasselbe DOM-Objekt nach Scrollen“ (M3), Scrollposition
  in der Detailtabelle (M4), Ereignis-Isolation (M8), `scrollToIndex` (M10), Aufräumen (M5: keine Listener-Lecks,
  `destroy()` der inneren Tabelle aufgerufen).
- Wrapper: M13 für React und eine weitere Bibliothek; Unmount räumt auf.
- HTML-Injection: Daten des Masters im Detail-Text → escaped (Beispiel-Renderer und Helfer).

## Phase 3 – Hinweise

- Reihenfolge: Prefix-Summen → Detail-Ebene mit festem Inhalt → verschachtelte Tabelle → automatische Höhe →
  Framework-Komponenten → Zustand (003).
- Bestehende Specs (`horizontal-scrolling`, `scroll-to-index`, `tree-rendering`, `lifecycle`) müssen unverändert grün
  bleiben; die Prefix-Summen dürfen das Verhalten mit konstanter Höhe nicht ändern.
- CSS: `ge-table-detail-row`, `ge-table-detail-toggle`, Variablen `--ge-table-detail-bg`, `--ge-table-detail-border`.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` eigener Abschnitt mit Beispiel „Bestellungen → Positionen“; Hinweise zu Höhe und Lebenszyklus;
  `CLAUDE.md` §3.3 (Virtual Scrolling: variable Höhen jetzt O(log n)).
- **Training:** eigenes Kapitel in Teil 8 (Daten: `shared/orders` + generierte Positionen mit festem Seed).
- **Website:** Showcase `masterdetail`; Feature-Liste; `why.astro` evtl. Zeile „Master/detail“ (ag-Grid Enterprise).
- **Video:** „Master/Detail ohne Enterprise-Lizenz“.
- `TODO.md`: „Performance, Teil 2“ abhaken.

## Abschluss-Review (Schwerpunkte)

Speicherlecks (Listener, verschachtelte Tabellen, Framework-Komponenten), Scroll-Performance, Ereignis-Isolation,
unveränderte Ergebnisse für Tabellen ohne Details.

## Definition of Done (zusätzlich zu 000)

- [x] Design-Dokument mit Ebenen-Konzept, Lebenszyklus, API, Ereignis-Isolation 🛑 (selbständig, Empfehlungen übernommen)
- [x] Variable Zeilenhöhen mit Prefix-Summen, gemessen und getestet (`TODO.md` Teil 2 erledigt)
- [x] M1–M14 umgesetzt und getestet; keine Lecks (Lebenszyklus-Specs)
