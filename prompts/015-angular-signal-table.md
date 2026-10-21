# TODO-Prompt 015: Signal-native Angular-Komponente `<guiexpert-table-signal>` (ab Angular 22)

> Status: **offen – als Nächstes abarbeiten** · angelegt 21.10.2026 · Slug `angular-signal-table`
> (Branch `feat/angular-signal-table`, Design `prompts/015-angular-signal-table.design.md`)
> Abhängigkeiten: keine Core-Features. Betrifft nur den Angular-Wrapper (`packages/angular-table`), das Build-Skript
> `scripts/sync-angular-src.mjs` und die Build-Pakete `angular-builds/ng22` (und jede spätere Major).
> ag-Grid: `ag-grid-angular` bietet (Stand prüfen!) weiterhin `@Input`/`@Output` plus `gridReady` – eine signal-native
> Komponente wäre ein Vorsprung. In Phase 1 auf ag-grid.com nachsehen, nichts behaupten, was nicht stimmt.
> Zielversion: **1.1.100** (`@guiexpert/angular-table@22.1.100`).
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Ab **Angular 22 und allen Folgeversionen** (ng23, ng24 … ohne weitere Handarbeit) bietet `@guiexpert/angular-table`
**zusätzlich** zur bestehenden `TableComponent` (`<guiexpert-table>`) eine komplett signal-native Komponente:

- Klasse `TableSignalComponent`, Selektor `guiexpert-table-signal` (Namen in Phase 1 bestätigen),
- Eingaben über `input()` (`tableModel`, `tableOptions`, `loading`, `debounceMouseClickDelay`),
- die `TableApi` als **Signal** über `model<TableApi | undefined>()` → `[(tableApi)]="api"` im Template, `api()` im Code,
  `undefined` nach `destroy()`,
- alle Ereignisse über `output()` (gleiche Menge wie `TableComponent`),
- Reaktivität über `effect()`/`untracked()` statt `ngOnChanges`/`SimpleChanges`, ohne `@Input`/`@Output`, ohne RxJS,
- **zoneless-tauglich** (`provideZonelessChangeDetection()`), weiter `OnPush`.

Die bestehende `TableComponent` bleibt in **allen** Majors (14–22+) unverändert im Verhalten – kein Breaking Change.
`ng14` … `ng21` bekommen die neue Komponente **nicht** (dort fehlen `input()`/`output()`/`model()` ganz oder sind noch
Developer Preview) und müssen weiter bauen.

Gewünschtes Ergebnis für Anwender (Video-tauglich, ≤ 15 Zeilen):

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

## Was es heute gibt (Code-Befund 21.10.2026)

- **Ein** gemeinsamer Quellcode `packages/angular-table/src` (8 Dateien, ~580 Zeilen) für neun Builds `angular-builds/ng14`
  … `ng22`. `scripts/sync-angular-src.mjs` kopiert ihn nach `angular-builds/<ng>/lib/src`, legt `overrides/` darüber
  (heute gibt es **keine** Overrides) und erzeugt `table.component.css` aus `packages/table/css/table*.css`.
- `public-api.ts` exportiert `TableComponent`, `ComponentRendererIf`, `DomService`, `RendererWrapper`,
  `RenderWrapperFactory`, `DetailComponentRendererIf`, `DetailRendererWrapper`, `DetailRenderWrapperFactory`.
- `TableComponent` (`src/lib/table.component.ts`, 316 Zeilen): `standalone`, `OnPush`, `ViewEncapsulation.None`,
  `providers: [DomService]`, Template leer, Host = Tabellen-Div. 17 `@Output`s als RxJS-`Subject`
  (`tableReady`, `scroll`, `mouseMoved`, `mouseDragging`, `mouseDraggingEnded`, `contextmenu`, `mouseClicked`,
  `modelChanged`, `selectionChanged`, `focusChanged`, `checkboxChanged`, `stateChanged`, `rowDragStart/Move/End`,
  `batchEditChanged`, `detailExpandedChanged`, `editingChanged`, `undoStackChanged`), 4 `@Input`s. Aufbau in
  `ngOnInit` → `initModel()` → `zone.runOutsideAngular(init)`; neues Modell/neue Options in `ngOnChanges` = Neuaufbau;
  `loading` ohne Neuaufbau (`applyLoading`, merkt sich `shownByInput`); Mausklick per RxJS `debounceTime`, dann
  `zone.run`; `ngOnDestroy` → `tableScope.destroy()`. Die Komponente ist selbst der `EventListenerIf`.
- `ng22`: Angular `^22.0.1`, TypeScript `~6.0.3`, `moduleResolution: "bundler"`, ein Entry-Point
  (`lib/ng-package.json` → `src/public-api.ts`), Dist-Tag `latest`. Anleitung „Adding Angular 23“ in
  `angular-builds/README.md` (ng22 kopieren).
- **Es gibt keinen Angular-Test.** `pnpm test:wrappers` deckt nur React, Preact, Solid, Svelte, Vue, Web Component ab;
  `TODO.md` führt „Angular-Wrapper-Smoke-Test (ng22)“ als offen.
- `apps/angular-table-demo` ist Angular 17 und nutzt npm-Pakete (`TODO.md` „Angular-Demo an lokale Builds koppeln“) –
  für die neue Komponente ungeeignet.
- Doku: `packages/angular-table/instructions.md` (Abschnitt 2 „The component“: Inputs/Outputs-Tabelle),
  `packages/angular-table/README.md`, `CLAUDE.md` §4, Training-Kapitel 9 `angular`.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| S1 | `<guiexpert-table-signal [tableModel]="m" [(tableApi)]="api">` in einer **zoneless** App | Tabelle sichtbar; `api()` wird genau einmal gesetzt; ein `computed(() => !!api())` im Template aktualisiert sich ohne Zone |
| S2 | Modell-Signal wechselt (`model.set(neu)`) | alte Tabelle `destroy()`, neue gebaut, `api()` = neue `TableApi` (anderes Objekt), dazwischen kein sichtbarer Zwischenzustand mit `undefined` außer bewusst so entschieden |
| S3 | `tableOptions` wechselt | wie S2 |
| S4 | `loading` wechselt `false → true → false` | Overlay an/aus, **kein** Neuaufbau (gleiche `TableApi`), ein vom Anwender selbst gezeigtes Overlay bleibt (wie `shownByInput`) |
| S5 | Modell wechselt, während `loading = true` | neue Tabelle zeigt das Overlay weiter |
| S6 | Komponente wird entfernt (`@if` false) | `destroy()` genau einmal, `api()` → `undefined`, keine Listener/Timer übrig (auch der Klick-Entpreller) |
| S7 | `(mouseClicked)` mit `debounceMouseClickDelay` 150 / 0 | ein Event je Klickfolge bzw. sofort; Handler läuft so, dass die Ansicht sich aktualisiert (zoneless: Signal-Schreibvorgang oder `markForCheck`) |
| S8 | Alle übrigen Outputs (`selectionChanged`, `stateChanged`, `rowDragEnd`, `editingChanged`, `undoStackChanged` …) | kommen mit denselben Event-Objekten wie bei `TableComponent` |
| S9 | `(contextmenu)` / `(scroll)` | genau **ein** Aufruf mit `GeMouseEvent` bzw. `GeScrollEvent` – nicht zusätzlich das native DOM-Event, das vom Tabelleninneren zum Host-Element hochblubbert (s. Frage 6) |
| S10 | SSR / `@angular/ssr` (Server-Render) | kein Zugriff auf `window`/DOM auf dem Server, kein Fehler; Tabelle entsteht im Browser |
| S11 | Anwender schreibt `api.set(x)` von außen (Zwei-Wege-Bindung) | definiertes Verhalten laut Phase 1 (ignorieren + Warnung oder überschreiben beim nächsten Aufbau) |
| S12 | Zwei Tabellen auf einer Seite, eine Detail-Tabelle per `DetailRenderWrapperFactory` | unabhängig, Renderer-Wrapper funktionieren auch in der Signal-Komponente |
| S13 | `ng14` … `ng21` | bauen unverändert; das `dist` enthält **keine** `TableSignalComponent`, die öffentlichen Typen sind identisch zu vorher (Diff der `.d.ts`) |
| S14 | `ng23` als Kopie von `ng22` (Probe im Branch, nicht committen, falls es Angular 23 noch nicht gibt: nur Skript-Logik testen) | enthält die Signal-Komponente ohne Zusatzarbeit |
| S15 | `TableComponent` in ng22 | Verhalten bit-gleich (Smoke-Test grün vor und nach dem Umbau) |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Versions-Schalter im Build** („ab 22 und Folgeversionen“). Optionen:
   (a) `angular-builds/ng22/overrides/` – müsste bei jeder neuen Major mitkopiert werden, `public-api.ts` würde
   dupliziert; (b) **neuer Mechanismus in `sync-angular-src.mjs`**: zusätzliche Quellordner mit Mindest-Major, z. B.
   `packages/angular-table/src-since-22/` (bzw. `src-ng22plus/`), werden für jede Ziel-Major ≥ 22 über `src` gelegt, und
   `public-api.ts` bekommt für diese Majors die zusätzlichen Exporte (generierte Zeile oder eine zweite Datei
   `public-api.since-22.ts`, die das Skript anhängt); (c) Secondary Entry-Point `@guiexpert/angular-table/signal`
   (ng-packagr), nur in ng22+ vorhanden. Empfehlung vermutlich (b), ggf. kombiniert mit (c) – begründen. Die Major wird aus
   dem Zielnamen (`ng22`) bzw. aus `package.json` gelesen; `angular-builds/README.md` beschreibt die Regel.
2. **Gemeinsame Logik statt Kopie:** Event-Weiterleitung, Aufbau/Abbau, `loading`/`shownByInput` und der Klick-Entpreller
   existieren heute nur in `TableComponent`. Ein Angular-freier Helfer (z. B. `TableHost`/`TableLifecycle` in
   `src/lib/table-host.ts`, plain TS, kompiliert auch unter ng14) übernimmt das; beide Komponenten nutzen ihn. Ohne
   Verhaltensänderung an `TableComponent` (S15) – oder die alte Komponente bewusst unangetastet lassen und nur die neue
   nutzt den Helfer? Abwägen (Risiko vs. doppelter Code).
3. **`tableApi`: `model()` oder schreibgeschütztes Signal?** `model()` erlaubt `[(tableApi)]`, `(tableApiChange)` und
   `viewChild(TableSignalComponent)?.tableApi()`, aber auch Schreiben von außen (S11). Alternative: `readonly tableApi =
   computed/asReadonly` + `output tableApiChange` (gleiche Template-Syntax `[(…)]` geht dann nicht). Empfehlung: `model()`
   wie gewünscht, Schreiben von außen definiert behandeln. Zusätzlich `output tableReady` für Umsteiger? (Doppelte Wege
   vermeiden oder bewusst anbieten.)
4. **Inputs:** `tableModel` als `input.required<TableModelIf>()` oder `input<TableModelIf | undefined>()` (dann: ohne
   Modell keine Tabelle, wie heute)? `tableOptions` mit Default `new TableOptions()` je Instanz (nicht geteilt!).
   `debounceMouseClickDelay` reaktiv (Wechsel wirkt sofort) oder nur beim Aufbau gelesen?
5. **Zeitpunkt des Aufbaus:** `effect()` im Konstruktor läuft in Angular 22 während der Change Detection – ist der Host
   dann im DOM und gemessen? `TableScope.firstInit()` misst Größen. Optionen: `effect` + `untracked`,
   `afterRenderEffect` (Phasen `write`/`read`), erster Aufbau über `afterNextRender` und danach `effect`. Mit einem
   Browser-Test belegen (Host-Höhe > 0 beim Aufbau, kein doppelter Aufbau beim Start). Zugleich SSR (S10): auf dem Server
   nicht bauen (`afterNextRender` läuft dort nicht bzw. `isPlatformBrowser`).
6. **Namen der Outputs:** `contextmenu` und `scroll` heißen wie native DOM-Events. Bei einer Komponente bindet
   `(contextmenu)="…"` **sowohl** den Output **als auch** das native Event am Host-Element (`contextmenu` blubbert aus
   der Tabelle hoch) → Handler läuft zweimal, einmal mit `MouseEvent`. In Phase 1 mit einem Test belegen (auch für die
   alte `TableComponent` – Befund dann in `TODO.md`). Die neue Komponente ist neue API: hier die Chance auf saubere Namen
   (z. B. `tableContextmenu`/`tableScroll` oder `geContextmenu`), oder Parität mit `TableComponent` für einfaches
   Umsteigen? Ebenso `mouseDraggingEnded` (Core heißt `onMouseDraggingEnd`) – angleichen?
7. **Zoneless & NgZone:** Brauchen wir `NgZone.runOutsideAngular` noch (bei Zone-Apps: ja, sonst CD bei jedem
   Mausereignis; zoneless: No-op)? Outputs aus Listenern außerhalb der Zone: `output().emit()` läuft im Handler des
   Anwenders – in zoneless Apps aktualisiert sich die Ansicht nur über Signale/`markForCheck`. Muss die Komponente nach
   Emits `ChangeDetectorRef.markForCheck()` am Eltern-View auslösen, oder ist das Sache des Anwenders? Für beide Modi
   (mit Zone.js / zoneless) festlegen und testen.
8. **Mehr Signale als nur die API?** Optional als Komfort lesbare Signale, z. B. `selection`, `state`, `isEditing`,
   `canUndo`/`canRedo`, `overlayState` (über `api.subscribe`). Empfehlung: in diesem Prompt **nur** `tableApi`, Rest als
   Vorschlag in `TODO.md` – außer ein Signal macht das Video deutlich besser.
9. **Testaufbau Angular (es gibt keinen):** Vitest-Browser-Modus wie die anderen Wrapper mit
   `@analogjs/vite-plugin-angular` (+ `@analogjs/vitest-angular`) **oder** Angular-eigener Vitest-Builder **oder** JIT
   mit `@angular/compiler` + `TestBed` ohne Plugin. Kriterien: läuft in `pnpm test:wrappers` und CI
   (`.github/workflows/test-wrappers.yml`), gegen `packages/table/src` per Alias, zoneless und mit Zone. Ort: neues
   Paket-Script in `angular-builds/ng22` (dort liegen die Angular-22-Abhängigkeiten) oder `packages/angular-table`.
   Mit dem Setup gleich den offenen Smoke-Test für `TableComponent` erledigen (`TODO.md`).
10. **Demo-App:** `apps/angular-table-demo` (Angular 17, npm) passt nicht. Neue kleine App
    `apps/angular22-signal-demo` (zoneless, standalone, gegen `angular-builds/ng22/dist` per `link:` bzw. `workspace:`
    und Core `workspace:`), Root-Script `serve:angular22-signal-demo` – oder nur die Test-Komponenten aus Phase 2 als
    Beispiel (`apps/table-demo` hat kein Angular). Entscheiden; Abhängigkeits-Fallen aus CLAUDE.md §2 beachten (Babel, Vite 6.4.4,
    `@angular/animations`-Hoisting, zwei Angular-Versionen im Vite-Vorab-Bundle).
11. **Versionierung/Publish:** `scripts/version.mjs` und `npm-publish.yml` brauchen keine Änderung (gleiches Paket,
    gleiche Dist-Tags) – bestätigen. Peer-Dependencies von ng22 unverändert.

## Phase 2 – Tests (zusätzlich zu 000)

- Angular-Test-Setup nach Frage 9; **Browser** (Chromium), Testkomponente mit `[tableModel]`, `[(tableApi)]`, Outputs.
- S1–S12 und S15 als Browser-Specs; jeweils **zoneless** (`provideZonelessChangeDetection()`), S1/S7 zusätzlich mit
  Zone.js.
- S6: Spion auf `TableApi.destroy`/`TableScope.destroy`, nach dem Entfernen keine laufenden Timer (Fake-Timer).
- S9: `contextmenu`-Event in einer Zelle auslösen und Aufrufe zählen – für beide Komponenten.
- S13/S14: Node-Test oder Skript-Test für `sync-angular-src.mjs` (Zielordner ng21 ohne, ng22/ng23 mit
  Signal-Dateien und Export); nach `pnpm build:angular` die `.d.ts` von ng14–21 gegen `main` vergleichen (nur
  Datumszeilen dürfen abweichen).
- Typen: `expectTypeOf` für `tableApi` (`ModelSignal<TableApi | undefined>`), Output-Typen.
- Wrapper-Tests der anderen Frameworks bleiben grün (`pnpm test:wrappers`).

## Phase 3 – Hinweise

- Neue Dateien im Signal-Quellordner aus Frage 1, z. B. `table-signal.component.ts`; gemeinsamer Helfer (Frage 2) im
  gemeinsamen `src/lib/` und in **plain TypeScript ohne Angular-22-APIs** (muss unter ng14 kompilieren).
- `providers: [DomService]`, `ViewEncapsulation.None`, `OnPush`, `styleUrls`/`styleUrl` → das generierte
  `table.component.css` mitbenutzen (gleiche Datei, nicht zweimal einbinden; prüfen, ob zwei Komponenten mit demselben
  Stylesheet die Styles doppelt ins Dokument hängen – ggf. nur eine Komponente hängt sie an).
- Kein RxJS in der neuen Komponente (Entpreller per `setTimeout`, im Abbau löschen). `rxjs` bleibt für `TableComponent`.
- JSDoc mit `@example` an Klasse, `tableApi` und jedem Output (wie in `TableComponent`), `@since 1.1.100`.
- `sync-angular-src.mjs`: Kopfkommentar und `angular-builds/README.md` (Regel „ab Major N“, „Adding Angular 23“) ergänzen.
- Builds: `pnpm build:core`, `pnpm build:angular` (alle neun), Größe von `angular-builds/ng22/dist` vorher/nachher.

## Phase 4–9 – Besonderheiten

- **Doku:** `packages/angular-table/instructions.md` neuer Abschnitt „Signal component (Angular 22+)“ (Inputs/Outputs-
  Tabelle, zoneless, `[(tableApi)]`, `viewChild`, Umstieg von `TableComponent`, SSR); Abschnitt 2 verweist darauf.
  Snippets kompilieren gegen Angular-22-Typen (CLAUDE.md §6). `packages/angular-table/README.md`, Root-`README.md`,
  `instructions.md` (Framework-Übersicht), beide `llms.txt`, `CLAUDE.md` §1 (Layout), §4 (Tabelle + „Angular: ein
  Quellcode, neun Builds“), `TODO.md` (Angular-Smoke-Test abhaken, Befund S9).
- **Website:** Eintrag in `src/features/new-features.ts` (Problem: „`(tableReady)` + Feld + `?`-Ketten in zoneless
  Apps“, Snippet ≤ 15 Zeilen, kein eigener Showcase nötig – Entscheidung in Phase 1), `/doc/`-Tabelle `EVENTS`/Framework-
  Abschnitt, Angular-Teil der Startseite falls vorhanden. `check:features` grün.
- **Training:** Abschnitt `#signals` im Kapitel 9 `angular` (`<Callout type="version">` „Angular 22+, since 1.1.100“),
  kein neues Kapitel. Framework-Code unter `training-examples/` (wird nicht kompiliert – trotzdem gegen die echte API
  geprüft).
- **Demo-Repo:** entfällt voraussichtlich (kein neues Kapitel); in Phase 1 bestätigen.
- **Video (optional):** „Angular Signals: Tabelle ohne `(tableReady)` – zoneless in 60 Sekunden“ (`videos/NN-angular-signals/`),
  Kernbotschaft „ein Core, alle Frameworks – Angular 14–22“.

## Abschluss-Review (Schwerpunkte)

Kein Verhaltensunterschied bei `TableComponent` (alle Majors); ng14–21 öffentliche Typen unverändert; Aufbau-Zeitpunkt
(kein Doppelaufbau, Host gemessen), Abbau ohne Lecks; zoneless **und** Zone.js; SSR; doppelte Events durch native
DOM-Namen; die Regel „ab 22“ greift für ng23 ohne Handarbeit.

## Definition of Done (zusätzlich zu 000)

- [ ] Design-Dokument mit Versions-Schalter, Helfer-Schnitt, `tableApi`-Form, Output-Namen, Aufbau-Zeitpunkt,
      Testaufbau, Demo-Entscheidung 🛑
- [ ] `TableSignalComponent` in ng22 (und automatisch in späteren Majors), nicht in ng14–21
- [ ] Angular-Test-Setup in `pnpm test:wrappers` + CI; S1–S15 grün; Smoke-Test `TableComponent` (TODO) erledigt
- [ ] `pnpm build:angular` (alle neun) grün, `.d.ts`-Diff ng14–21 leer
- [ ] Doku, Website-Eintrag, Training-Abschnitt; Demo-App wie entschieden
- [ ] Release-Befehle für **1.1.100** im Abschlussbericht (Phase 10, kopierfertig ohne `#`-Kommentare)
