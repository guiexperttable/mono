# Design 015: Signal-native Angular-Komponente `<guiexpert-table-signal>` (ab Angular 22)

> Prompt: `prompts/015-angular-signal-table.md` · Branch `feat/angular-signal-table` · Stand 21.10.2026 · Zielversion
> **1.1.100** (`@guiexpert/angular-table@22.1.100`)
> Status: **freigegeben 21.10.2026** (wie entworfen: kein `tableReady` – zwischenzeitlich gewünscht, am selben Abend zurückgenommen) · Umsetzung siehe „Fortschritt“

---

## 1. Befund (geprüft am Code und an Angular 22.2.2 in `angular-builds/ng22/node_modules`)

| Baustein | wofür | passt / fehlt / erweitern |
|---|---|---|
| `packages/angular-table/src` (gemeinsam, ng14–22) | Quelle aller Builds | **erweitern**: neue Datei `lib/table-signal.component.ts` – nur für Majors ≥ 22 |
| `scripts/sync-angular-src.mjs` | kopiert `src` + `overrides/` nach `angular-builds/<ng>/lib/src`, erzeugt CSS | **erweitern**: Versions-Marke `@since-angular N` (Abschnitt 3.1) |
| `public-api.ts` | Exporte | **erweitern** um eine Zeile mit Marke, die das Skript für ng14–21 entfernt |
| `TableComponent` | bestehende Komponente | **unverändert** (Code und Verhalten); nur Doku-Hinweis zu `(contextmenu)` |
| `DomService` (`Renderer2`) | DOM-Zugriff des Cores | passt, wird in der neuen Komponente ebenfalls als Provider genutzt |
| `RenderWrapperFactory`, `DetailRenderWrapperFactory` | Angular-Komponenten als Zellen/Details | passen unverändert (brauchen nur `ChangeDetectorRef`/Injector des Anwenders) |
| `TableScope` (Core) | `firstInit()`, `getApi()` (immer dasselbe Objekt je Scope), `showLoadingOverlay`/`hideOverlay`, `destroy()` (idempotent, meldet offenen Zustand per `onStateChanged`) | passt |
| `angular-builds/ng22` | Angular `^22.0.1` (installiert 22.2.2), TS ~6.0.3, ein Entry-Point | passt; bekommt das Test-Setup |
| Angular-Tests | – | **fehlen ganz** → neu (Abschnitt 6) |
| `apps/angular-table-demo` | Angular 17, npm-Pakete | ungeeignet → neue kleine App (Abschnitt 8) |

**Angular-22-Interna, die das Design bestimmen:**

1. **Doppel-Event bei DOM-Namen** (`_debug_node-chunk.mjs`, `listenerInternal`): steht `(contextmenu)="…"` an einem
   Element, das zugleich eine Komponente ist, registriert Angular **einen nativen DOM-Listener am Host-Element und**
   abonniert den gleichnamigen Output. Der Core lauscht auf `contextmenu` direkt am Host-Element
   (`MouseHandler`, ohne `stopPropagation`), das Host-Element **ist** das Komponenten-Element. Erwartung: der Handler
   der heutigen `TableComponent` läuft bei einem Rechtsklick **zweimal** – zuerst mit dem nativen `MouseEvent`, dann
   mit dem `GeMouseEvent`. Betrifft z. B. `apps/angular-table-demo/src/app/mouseevent` (`(contextmenu)="onContextmenu($event)"`).
   `scroll` ist praktisch harmlos (`scroll` blubbert nicht, der Host scrollt nicht – der Core scrollt im inneren Viewport).
   → Phase 2 belegt das mit einem Test (`it.fails` + `// BUG:` für `TableComponent`, Eintrag in `TODO.md`).
2. **Emit nach dem Zerstören**: `OutputEmitterRef.emit()` gibt nach dem Zerstören die Warnung NG0953 aus. Outputs
   melden sich über `DestroyRef` (der Eltern-LView) ab; dort laufen zuerst die `ngOnDestroy`-Hooks
   (`executeOnDestroys`), danach die `DestroyRef`-Callbacks (`processCleanups`) in Registrierungsreihenfolge.
   `TableScope.destroy()` kann noch `onStateChanged` auslösen → **Abbau in `ngOnDestroy`**, nicht in einem
   `DestroyRef.onDestroy`-Callback aus dem Konstruktor (der liefe nach den Output-Feldern → NG0953).
3. **Styles**: `SharedStylesHost` zählt Styles nach ihrem Text. Zwei Komponenten mit derselben CSS-Datei hängen sie
   **einmal** ins Dokument → die neue Komponente nutzt das generierte `table.component.css` einfach mit.
4. `input()`, `output()`, `model()` sind seit Angular 19 stabil, `provideZonelessChangeDetection()` seit 20.2,
   `afterRenderEffect` ist vorhanden. Gewünscht ist ausdrücklich **ab 22**; die Marke (3.1) erlaubt später, die Grenze
   mit einer Zahl zu senken.
5. **ag-Grid** ([Kompatibilitätsseite](https://www.ag-grid.com/angular-data-grid/compatibility/)): „fully compatible with
   Zoneless Angular applications“, eine signal-basierte Komponente/API wird dort nicht erwähnt. → In Marketing/Video
   **nicht** „ag-Grid kann das nicht“ behaupten, sondern nur zeigen, was GuiExpert bietet; vor dem Video erneut prüfen.

## 2. API

```ts
// packages/angular-table/src/lib/table-signal.component.ts   (Kopfzeile: // @since-angular 22)
@Component({
  selector: "guiexpert-table-signal",
  providers: [DomService],
  template: "",
  styleUrls: ["./table.component.css"],          // dieselbe generierte Datei, im Dokument nur einmal
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSignalComponent implements OnDestroy {
  // Eingaben
  readonly tableModel = input<TableModelIf | undefined>(undefined);
  readonly tableOptions = input<TableOptionsIf>(new TableOptions());   // je Instanz ein eigenes Objekt
  readonly loading = input<boolean>(false);
  readonly debounceMouseClickDelay = input<number>(150);              // wird beim Klick gelesen (reaktiv)

  // die API als Signal: [(tableApi)]="api" · (tableApiChange)="…" · viewChild(TableSignalComponent)?.tableApi()
  readonly tableApi = model<TableApi | undefined>(undefined);

  // Ereignisse (gleiche Menge und Typen wie TableComponent – bis auf contextMenu, s. 3.4)
  readonly mouseClicked = output<GeMouseEvent>();
  readonly mouseMoved = output<GeMouseEvent>();
  readonly mouseDragging = output<GeMouseEvent>();
  readonly mouseDraggingEnded = output<GeMouseEvent>();
  readonly contextMenu = output<GeMouseEvent>();          // ≠ "contextmenu" (Doppel-Event, 3.4)
  readonly scroll = output<GeScrollEvent>();
  readonly modelChanged = output<GeModelChangeEvent>();
  readonly selectionChanged = output<SelectionModelIf>();
  readonly focusChanged = output<FocusModelIf>();
  readonly checkboxChanged = output<any[]>();
  readonly stateChanged = output<GeStateChangeEvent>();
  readonly rowDragStart = output<GeRowDragEvent>();
  readonly rowDragMove = output<GeRowDragEvent>();
  readonly rowDragEnd = output<GeRowDragEvent>();
  readonly batchEditChanged = output<GeBatchEditEvent>();
  readonly detailExpandedChanged = output<GeDetailEvent>();
  readonly editingChanged = output<GeEditEvent>();
  readonly undoStackChanged = output<GeUndoEvent>();

  ngOnDestroy(): void;   // destroy() des Scopes, Klick-Timer weg, tableApi → undefined
}
```

- Der `EventListenerIf` ist ein **privates Objekt** (nicht die Komponente selbst wie bei `TableComponent`) – die
  öffentliche Oberfläche bleibt frei von `onXxx`-Methoden.
- **Kein `tableReady`-Output** (Freigabe 21.10.2026, nach kurzem Hin und Her bestätigt): `(tableApiChange)` deckt die
  Event-Form ab (liefert zusätzlich `undefined` beim Abbau). Ein zweiter Weg für dasselbe würde nur verwirren; ein Test
  hält fest, dass es den Output nicht gibt.
- Kein RxJS, kein `CommonModule`.

**Referenzbeispiel (Video, 12 Zeilen):**

```ts
@Component({
  selector: "app-orders",
  imports: [TableSignalComponent],
  template: `<guiexpert-table-signal class="table-div" [tableModel]="model" [(tableApi)]="api" />
             <button [disabled]="!api()" (click)="api()?.downloadExcel('orders.xlsx', 'me')">Excel</button>`
})
export class OrdersComponent {
  readonly model = TableFactory.createTableModel({ rows: orders, properties: ["id", "customer", "total"] });
  readonly api = signal<TableApi | undefined>(undefined);
  constructor() {
    effect(() => this.api()?.scrollToIndex(0, 0));
  }
}
```
Erwartung: Tabelle sichtbar, Button erst nach dem Aufbau aktiv, `effect` läuft genau einmal mit der API; zoneless und
mit Zone.js gleich.

## 3. Entscheidungen

### 3.1 Versions-Schalter (Frage 1) → **Marke `@since-angular N` im gemeinsamen Quellcode**

| Option | Bewertung |
|---|---|
| (a) `angular-builds/ng22/overrides/` | bei jeder neuen Major mitkopieren, `public-api.ts` doppelt – widerspricht „Folgeversionen ohne Handarbeit“ |
| (b1) eigener Ordner `src-since-ng22/` | Importe dort (`./service/dom-service`) lösen sich in der IDE nicht auf, weil die Dateien erst nach dem Kopieren nebeneinander liegen |
| **(b2) Marke im gemeinsamen `src/`** | Datei liegt neben den anderen (IDE, Importe, Suche funktionieren); das Skript lässt sie für kleinere Majors weg |
| (c) Secondary Entry-Point `@guiexpert/angular-table/signal` | zweiter Import-Pfad für Anwender, Pfad-Mapping auf den Haupt-Entry (`DomService`) nötig, mehr ng-packagr-Konfiguration – kein Nutzen |

Regel (in `sync-angular-src.mjs`, `angular-builds/README.md`, `CLAUDE.md` §4):
- Eine Datei, deren **erste Zeile** `// @since-angular N` ist, wird nur für Ziel-Majors ≥ N kopiert.
- Eine Zeile in `public-api.ts`, die mit `// @since-angular N` endet, wird für Ziel-Majors < N entfernt:
  `export * from './lib/table-signal.component'; // @since-angular 22`
- Die Major kommt aus dem Zielnamen (`ng22` → 22). `ng23` als Kopie von `ng22` bekommt die Komponente automatisch.
- Das Skript bekommt eine exportierte, testbare Funktion (`syncTarget(target, dirs)`), der CLI-Teil bleibt gleich.

### 3.2 Gemeinsame Logik (Frage 2) → **`TableComponent` bleibt unangetastet, kein gemeinsamer Helfer**

Der wiederverwendbare Teil (Aufbau/Abbau, `loading`/`shownByInput`) ist ~30 Zeilen. Ein Umbau von `TableComponent`
würde neun Majors betreffen, von denen nur ng22 Tests bekommt. Darum: die neue Komponente ist eigenständig, die alte
bleibt byte-gleich (S13/S15 damit trivial erfüllt). Ein späterer Helfer ist als Vorschlag in `TODO.md`, sobald
ältere Majors Tests haben.

### 3.3 `tableApi` (Frage 3) → **`model<TableApi | undefined>()`**

- Gesetzt nach `firstInit()` (synchron, im selben Durchlauf wie der Aufbau). Beim Neuaufbau (S2/S3) wird direkt die
  neue API gesetzt, **ohne** Zwischenzustand `undefined` (ein `effect` beim Anwender läuft so einmal mit der neuen API
  statt zweimal). `undefined` nur, solange kein Modell da ist, und in `ngOnDestroy`.
- **Schreiben von außen (S11):** ein eigener `effect` beobachtet `tableApi()`. Weicht der Wert von der API des Scopes
  ab, wird er zurückgesetzt (Anwender-Signal wird damit ebenfalls korrigiert) und im Dev-Modus einmal gewarnt
  (`console.warn`, „tableApi is set by the table; a value written from outside is replaced“).
- Mit einem **Signal** beim Anwender gibt es kein `ExpressionChangedAfterItHasBeenChecked` (Signal-Schreibvorgänge
  während der Change Detection markieren die Ansicht neu). Mit einem **Feld** (`[(tableApi)]="apiField"`) könnte es
  im Dev-Modus NG0100 geben, wenn das Template des Elternteils das Feld vor der Tabelle liest – Doku empfiehlt
  Signale; S1 prüft beides.

### 3.4 Eingaben und Output-Namen (Fragen 4 und 6)

- `tableModel` **optional** (`input<TableModelIf | undefined>()`): Modelle kommen oft asynchron
  (`[tableModel]="model()"` mit `undefined` bis zum Laden) – wie bei `TableComponent`.
- `tableOptions`: Default `new TableOptions()` je Instanz (Feld-Initialisierer).
- `debounceMouseClickDelay`: beim Klick gelesen (Wechsel wirkt sofort, kein Neuaufbau). `0` = **synchron** ohne Timer.
- **`contextMenu` statt `contextmenu`**: neuer Name in der neuen Komponente, weil `(contextmenu)` laut 1.1 doppelt
  feuert. DOM-Event-Namen sind case-sensitiv; `contextMenu` erzeugt keinen nativen Treffer. Umstieg = ein
  Großbuchstabe. Alle anderen Namen bleiben wie bei `TableComponent` (auch `scroll` und `mouseDraggingEnded`), damit der
  Umstieg nur den Tag-Namen, `[(tableApi)]` und `contextMenu` betrifft. Test S9 belegt, dass `(scroll)` genau einmal
  kommt.
- `TableComponent` behält `contextmenu` (Umbenennen = Breaking Change); Doku nennt den Doppelaufruf und den Filter
  `if (evt instanceof MouseEvent) return;` bzw. den Umstieg.

### 3.5 Zeitpunkt des Aufbaus, SSR (Frage 5) → **`effect()` + `untracked()` im Konstruktor, Browser-Weiche**

- Komponenten-Effects laufen in Angular 22 während der Change Detection **vor** dem Prüfen der eigenen Ansicht – also
  im selben Moment wie heute `ngOnInit` von `TableComponent` (der dort bewährt misst). Das Host-Element ist dann
  angelegt und eingehängt (auch in `@if`-Ansichten, die vor dem Refresh in den DOM kommen). `afterRenderEffect` wäre
  ein Frame später (sichtbares Flackern, `tableApi` erst nach dem ersten Render) – nicht nötig.
- Effekt 1 liest `tableModel()` und `tableOptions()` → ein Neuaufbau, auch wenn beide gleichzeitig wechseln.
- Effekt 2 liest `loading()` → `applyLoading()` (idempotent; beim Start nach Effekt 1 kein zweites `showLoadingOverlay`).
- Effekt 3 = Schutz von `tableApi` (3.3).
- **SSR (S10):** `isPlatformBrowser(inject(PLATFORM_ID))` – auf dem Server kein `TableScope`, `tableApi` bleibt
  `undefined`. Das Template ist leer, Hydration findet nichts zum Abgleichen; der Core füllt den Host im Browser.
- Belegt durch S1/S2 (Host-Höhe > 0 beim Aufbau, genau ein Aufbau beim Start) und S10 (Test mit `PLATFORM_ID: "server"`).

### 3.6 Zone.js und zoneless (Frage 7)

- Aufbau in `NgZone.runOutsideAngular` (zoneless = No-op; mit Zone.js sonst Change Detection bei jedem `mousemove`).
- Outputs werden **außerhalb** der Zone ausgelöst – auch `mouseClicked` (anders als `TableComponent`, das dort
  `zone.run` nutzt). Kein `markForCheck` je Event (bei `mouseMoved`/`scroll` wären das Dutzende Ticks pro Sekunde).
- Regel für Anwender (Doku): im Handler **ein Signal schreiben** – das plant die Change Detection zoneless und seit
  Angular 18 auch mit Zone.js (hybrides Scheduling). Wer ein Feld schreibt, ruft `markForCheck()` selbst. S7 prüft
  beides (Signal-Schreiben im Handler aktualisiert die Ansicht in beiden Modi).

### 3.7 Mehr Signale (Frage 8) → **nein, nur `tableApi`**

Lesbare Komfort-Signale (`selection`, `state`, `canUndo`, `isEditing`, `overlayState` über `api.subscribe`) als
Vorschlag in `TODO.md`. Das Video wird mit `[(tableApi)]` + `effect` + `computed` schon klar genug.

### 3.8 Testaufbau (Frage 9) → **Vitest-Browser in `angular-builds/ng22`, gegen das gebaute `dist`, JIT**

| Option | Bewertung |
|---|---|
| **Vitest-Browser + `@angular/compiler` (JIT) gegen `angular-builds/ng22/dist`** | testet genau das, was veröffentlicht wird (partiell kompilierte Deklarationen werden mit geladenem Compiler zur Laufzeit übersetzt); Testkomponenten nutzen nur Templates mit `[(…)]`/`signal()` (kein `input()` in Testkomponenten → kein JIT-Transform nötig); **keine neuen Abhängigkeiten** außer Vitest/Playwright, die die anderen Wrapper schon haben |
| `@analogjs/vite-plugin-angular` | neue Abhängigkeit, Versionsbindung an Angular 22 ungewiss, Babel-Konflikte (CLAUDE.md §2) |
| Angular CLI `@angular/build:unit-test` | braucht `angular.json` und `@angular/cli`, schwer in `pnpm test:wrappers` einzubinden |

- Ort: `angular-builds/ng22/test/*.browser.spec.ts`, `vitest.config.ts`, Script `test` (vorher `build`, damit das `dist`
  aktuell ist). Core per Alias auf `packages/table/src`; `@angular/*` aus `ng22/node_modules`.
- Root: `test:wrappers` nimmt `angular-build-ng22` mit auf (Filter erweitern), CI `test-wrappers.yml` baut vorher
  Core + ng22. Bei ng23 wandert das Script mit der Kopie mit (README-Hinweis: Tests nur in der neuesten Major).
- Zoneless (`provideZonelessChangeDetection()`) und mit Zone.js (`zone.js` als devDependency in ng22, falls nicht
  vorhanden).
- Gleiches Setup: Smoke-Test `TableComponent` (offener Punkt in `TODO.md`) + `it.fails` für das `contextmenu`-Doppel-Event.
- Node-Spec für `syncTarget` (ng21 ohne, ng22/ng23 mit Datei und Export) im selben Paket (Projekt `unit`).
- Risiko: JIT im Vitest-Browser mit Decorators über esbuild (`experimentalDecorators`, `useDefineForClassFields: false`
  in einer `tsconfig.spec.json`). Klappt das nicht, Ausweichen auf Analog – Entscheidung wird im Design-Fortschritt
  notiert, nicht erneut angehalten.

### 3.9 Demo-App (Frage 10) → **`apps/angular-signal-demo`** (klein, zoneless)

- Angular 22, `@angular/build:application` (esbuild, kein Vite-Vorab-Bundle der Babel-Kette), standalone, zoneless.
- `@guiexpert/angular-table: link:../../angular-builds/ng22/dist`, `@guiexpert/table: workspace:^`,
  `@guiexpert/demo-table-models: workspace:^`; Root-Script `serve:angular-signal-demo`.
- Inhalt: Referenzbeispiel (Bestellungen), Umschalter für Modell/`loading`, Kontextmenü-Ausgabe, Zähler über
  `computed`. Aufnahme-Umgebung des Videos.
- Abhängigkeits-Fallen (CLAUDE.md §2: Babel 8, Angular-14-Hoisting) beim Anlegen prüfen. Machen sie Ärger, wird die App
  verschoben (Eintrag `TODO.md`) und das Video nutzt die Test-Komponente in einer Vitest-UI – Feature und Tests hängen
  nicht daran.

### 3.10 Versionierung/Publish (Frage 11) → **keine Änderung**

`scripts/version.mjs` zählt numerisch (1.1.99 → 1.1.100, Angular `22.1.100`), `npm-publish.yml` baut alle Majors wie
bisher, Dist-Tags und Peer-Dependencies bleiben. Nur prüfen, dass `pnpm version:check` mit dreistelligem Patch
grün ist.

## 4. Referenzfälle → Tests

| # | Test (ng22, Chromium) |
|---|---|
| S1 | zoneless + Zone.js: Tabelle gerendert, `api()` einmal gesetzt, `computed` im Template aktualisiert, kein NG0100 (Signal), Host-Höhe > 0 beim Aufbau |
| S2/S3 | Modell- bzw. Options-Signal wechseln: alter Scope `destroy()` einmal, neue API ≠ alte, kein `undefined` dazwischen (Effect-Aufrufe zählen) |
| S4/S5 | `loading` an/aus ohne Neuaufbau (gleiche API); eigenes Overlay der App bleibt; Modellwechsel bei `loading` zeigt weiter |
| S6 | `@if` false: `destroy()` einmal, `api()` `undefined`, keine Timer (Fake-Timer), **kein NG0953** bei offenem `stateChanged` |
| S7 | Klick: 150 ms entprellt bzw. `0` synchron; Signal im Handler aktualisiert die Ansicht in beiden Modi |
| S8 | `selectionChanged`, `stateChanged`, `rowDragEnd`, `editingChanged`, `undoStackChanged`, `modelChanged`, `checkboxChanged` … – je ein Auslöser, Event-Objekt identisch zum Core |
| S9 | Rechtsklick: `(contextMenu)` genau einmal mit `GeMouseEvent`; `(scroll)` genau einmal; `TableComponent` `(contextmenu)`: `it.fails('fires once')` + `// BUG:` |
| S10 | `PLATFORM_ID` `"server"`: kein Scope, kein Fehler |
| S11 | `api.set({} as TableApi)` von außen → zurückgesetzt, eine Warnung |
| S12 | zwei Tabellen + Detail-Tabelle über `DetailRenderWrapperFactory` |
| S13 | Node: `syncTarget("ng21")` ohne Datei/Export; nach `pnpm build:angular` `.d.ts`-Diff ng14–21 gegen `main` leer |
| S14 | Node: `syncTarget("ng23")` (temporärer Ordner) mit Datei/Export |
| S15 | `TableComponent`-Smoke (Mount, `tableReady`, Klick, Modellwechsel, Unmount) grün; Datei unverändert (`git diff` leer) |

## 5. Was die Phasen 4–9 liefern

| Phase | Entscheidung |
|---|---|
| 4 Doku | `packages/angular-table/instructions.md` neuer Abschnitt „Signal component (Angular 22+)“ + Hinweis `(contextmenu)` in Abschnitt 2; `packages/angular-table/README.md`; Root-`README.md`, `instructions.md` (Framework-Übersicht), beide `llms.txt`, `CLAUDE.md` §1/§4, `angular-builds/README.md`, `TODO.md` |
| 5 Demo | `apps/angular-signal-demo` (3.9); keine Modell-Fabrik nötig (`demo-table-models` reicht) |
| 6 Website | Eintrag `src/features/new-features.ts` (ohne eigenen Showcase – Angular läuft auf der Website nicht; Link aufs Training), `/doc/` Framework-Abschnitt; `why.astro` nur, wenn dort Angular-Aussagen stehen |
| 7 Training | Abschnitt `#signals` in Kapitel 9 `angular` (`<Callout type="version">` „Angular 22+, since 1.1.100“), Code unter `training-examples/` |
| 8 Demo-Repo | **entfällt** (kein neues Kapitel) |
| 9 Video | ja: „Angular Signals: die Tabelle als Signal – zoneless in 60 Sekunden“, `videos/NN-angular-signals/`, Snippet = Referenzbeispiel, Aufnahme in `apps/angular-signal-demo`; kein „ohne Enterprise“ |

## 6. Freigabe (21.10.2026)

1. Namen `TableSignalComponent` / `guiexpert-table-signal` – **ja**
2. `contextMenu` statt `contextmenu` in der neuen Komponente – **ok**
3. `tableReady` – **nein** (erst „bleibt“, dann zurückgenommen: nur `[(tableApi)]` / `(tableApiChange)`)
4. Demo-App `apps/angular-signal-demo` – **ja**
5. Grenze – **Angular 22 und aufwärts**

## Fortschritt

- [x] Phase 1 – Design (21.10.2026), freigegeben
- [x] Phase 2/3 – `scripts/sync-angular-src.mjs` (Marke `@since-angular N`, `syncTarget`), `TableSignalComponent`,
      Test-Setup `angular-builds/ng22` (Vitest-Browser gegen `dist`, JIT über `test/setup-jit.ts`, `test:types`),
      31 Tests (5 Node, 26 Chromium; eins `it.fails` = `(contextmenu)`-Doppel-Event der alten Komponente), `pnpm
      test:wrappers` + CI. Abweichungen vom Design: Zone.js als Alias `zone.js-for-tests` = **0.14.10** (die im Lockfile
      vorhandene Version; 0.16 hätte die Peer-Auflösung **aller** Angular-Majors im Lockfile geändert – Angular 22 nennt
      `~0.15 || ~0.16` als Peer, die Tests laufen mit 0.14 trotzdem); der Core verschluckt ein Kontextmenü in den ersten
      50 ms nach dem Aufbau (bekannt, `mouse-handler.browser.spec.ts`) – die Specs stellen die Uhr vor.
- [x] Phase 4 – Doku: `packages/angular-table/instructions.md` Abschnitt 14 (+ Hinweis `(contextmenu)` in 2 und 10),
      `instructions.md` 4.8/6.5, READMEs, beide `llms.txt`, `CLAUDE.md`, `angular-builds/README.md`, `TODO.md`.
      Snippets mit `ngc` + `strictTemplates` gegen Angular-22-Typen geprüft.
- [x] Phase 5 – `apps/angular-signal-demo` (Playground + Video-Komponente). **Abweichung:** Vite 6.4.4 + JIT statt
      Angular CLI (die CLI hätte Vite 7 und weitere Peer-Varianten in den Lockfile gebracht); Bibliothek = gebautes
      `dist`, `check` = `ngc`, devDependency `angular-build-ng22: workspace:*` für die Build-Reihenfolge.
- [x] Phase 6 – What's new: 14. Eintrag **ohne Showcase** (`showcase` optional, `demo`, `thumb`, `framework`,
      `demoFile`; das Angular-Snippet muss wortgleich in der Demo-Datei stehen – `check:features`), Zahlwörter aus der
      Liste (`featureCountWord`), Startseite neu gruppiert (1.1.99 fehlte dort in jeder Gruppe), `/doc/`, Thumbnail.
- [x] Phase 7 – Training Kapitel 9 `#signals` (Snippet aus `new-features.ts`, eine Quelle). Phase 8 – entfällt.
- [x] Phase 9 – `videos/14-angular-signals/`, Backlog Nr. 38.
- [x] Phase 10 – alle Builds (Angular 14–22, ng14–21 byte-gleich), `test:wrappers` (Angular 34 Tests), Typen, Demo,
      Website-Build. Unabhängiges Review: keine Fehler in der Komponente; behoben: CLI-Erkennung des Sync-Skripts über
      Symlinks (`realpathSync`), Tests ergänzt (Master/Detail mit Angular-Komponente, `(scroll)` genau einmal je
      Core-Event, Events außerhalb der Zone, genau ein Aufbau mit Zone.js), Doku präzisiert (welche Events außerhalb
      der Zone kommen, warum `scroll` bleibt), Lockfile-Beschreibung korrigiert. Offen (bewusst): Zone.js-Tests mit
      0.14.10 statt 0.15/0.16; `.d.ts`-Diff ng14–21 nur über die byte-gleichen Quellen; Demo-`ngc` läuft in keinem CI-Job;
      Links auf `apps/angular-signal-demo` funktionieren erst nach dem Merge.
