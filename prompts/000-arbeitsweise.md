# TODO-Prompt 000: Gemeinsame Arbeitsweise für alle Feature-Prompts

> Gilt für alle Prompts in `prompts/` (Index und Reihenfolge: `prompts/README.md`). Jeder Feature-Prompt verweist
> hierher und beschreibt nur, was für sein Feature dazukommt. **Zuerst diese Datei lesen, dann den Feature-Prompt.**
> Die Prompts 006 (Row Grouping) und 007 (Pivot) sind älter und enthalten die Regeln noch vollständig. Bei
> Widersprüchen gilt diese Datei, außer der Feature-Prompt weicht ausdrücklich ab.

---

## 1. Vor dem Start

- **`CLAUDE.md`** vollständig lesen (Konventionen §5, Tests §6, Lizenz §8, Sicherheit §9, Videos §10, Training §11),
  dazu `TODO.md` und `instructions.md` §5.
- **Abhängigkeiten prüfen:** Jeder Prompt nennt oben, welche Prompts vorher umgesetzt sein sollten. Fehlt etwas,
  anhalten und fragen (zuerst den anderen Prompt ausführen oder bewusst ohne ihn arbeiten).
- Prüfen, ob es schon einen Stand gibt: Branch, Design-Dokument, abgehakte Punkte in der Definition of Done.
- Auf Branch **`feat/<slug>`** (von `main`) arbeiten; `<slug>` steht im Feature-Prompt. Commits nur nach Rückfrage.
  **Kein** Push, `npm publish`, GitHub-Release, Website-Deploy (`deploy.cjs`) und kein Versionssprung ohne
  ausdrückliche Anweisung.
- **Zielversion** für `since`-Angaben und Release-Notes: die Version des Releases, mit dem das Feature erscheint.
  In `packages/table/package.json` nachsehen (Stand Okt. 2026: 1.1.90 → nächste 1.1.91). Nur eintragen, nicht hochzählen.
- Eine Taskliste mit einem Eintrag pro Phase führen. Erledigtes in der Definition of Done des Feature-Prompts abhaken.

## 2. Phasen

| Phase | Ergebnis | Haltepunkt |
|---|---|---|
| 1 | Design-Dokument `prompts/NNN-<slug>.design.md`: Bausteine, Signaturen, Entscheidungen, Beispiele | 🛑 Freigabe abwarten |
| 2 | Vitest-Specs – zuerst rot | |
| 3 | Implementierung – Specs grün | |
| 4 | Doku | |
| 5 | Demo-Modelle und Demo-Apps | |
| 6 | Website gui.expert | 🛑 kein Deploy |
| 7 | Training | |
| 8 | Demo-Repo | 🛑 Freigabe vor Anlegen/Push/Tag |
| 9 | Video | |
| 10 | Abschlussprüfung | |

Kleine Features dürfen Phasen zusammenlegen oder begründet auslassen (z. B. kein eigenes Trainingskapitel). Das wird
in Phase 1 entschieden und im Design-Dokument festgehalten.

### Phase 1 – Bausteine prüfen und API entwerfen 🛑

- Die im Feature-Prompt genannten Code-Stellen lesen und eine Tabelle „Baustein → wofür → passt / fehlt / muss
  erweitert werden“ anlegen, mit Hinweis auf mögliche Breaking Changes. Bestehende APIs nur **additiv** ändern
  (optionale Member, neue Klassen). Tippfehler-APIs nicht umbenennen (CLAUDE.md §5).
- Für jede Entscheidungsfrage im Feature-Prompt: Optionen, Empfehlung, Begründung. TypeScript-Signaturen
  (Interfaces als eigene `.if.ts`-Dateien gedacht, Namen wie im Code üblich).
- Beispiele (≤ 15 Zeilen, Video-tauglich) für die Referenzfälle des Feature-Prompts, mit erwartetem Ergebnis.
- Entscheiden, was es an Website, Training, Demo-Repo und Video braucht (s. Phasen 6–9).
- Ergebnis als `prompts/NNN-<slug>.design.md`. **Danach anhalten** und die Entscheidungen bestätigen lassen.

### Phase 2 – Tests zuerst (Vitest)

Regeln aus CLAUDE.md §6:

- Specs **neben dem Code**: `*.spec.ts` = Node (Projekt `unit`), `*.browser.spec.ts` = Chromium (Projekt `browser`,
  Helfer `test-utils/mount-table.ts`: `mountTable`, `nextFrame`, `renderedRows`, `areaRows`, `cellDiv`, `columnIndices`,
  `stylePx`, `createRows`, `destroyAllTables`). Importe wie Anwender: `from '@guiexpert/table'`.
- Erst gegen die API aus dem Design-Dokument schreiben (rot), dann implementieren (grün).
- Gemeinsame Testdaten in `packages/table/test-utils/` (kommt nie ins npm-Paket). Vorhandene Fixtures wiederverwenden
  (z. B. `grouping-fixtures.ts`, sobald es sie gibt).
- Unit-Projekt läuft mit `isolate: false`: kein Modulzustand, Singletons im `beforeEach` zurücksetzen. Einmal
  `pnpm --filter @guiexpert/table test:unit --sequence.shuffle`.
- Browser-Specs: Zeit über `nextFrame()` / `vi.waitFor`, keine festen `setTimeout`s, keine pixelgenauen Textbreiten.
- **HTML-Injection-Test** für jeden Text, der aus Daten oder Optionen ins DOM kommt: `<img src="x" onerror=…>` → kein
  `img`-Element, Text sichtbar (Muster: `renderer/renderer.browser.spec.ts` „HTML injection“).
- **Barrierefreiheit** (Prompt 001 ist umgesetzt, Regeln: `CLAUDE.md` §5, Entscheidungen:
  `prompts/001-aria-screenreader.design.md`): jedes neue DOM-Element bekommt eine passende Rolle bzw. `aria-*`-Attribute –
  innerhalb der Tabelle sind Kinder eines `role="row"` nur Zellen (`gridcell`/`columnheader`) oder `aria-hidden`;
  Bedienelemente haben einen Namen (Texte als neue Funktion in `AriaTextsIf` + englischer Default in `AriaTexts`, über
  `tableOptions.ariaTexts` überschreibbar); Dekoratives `aria-hidden="true"` (`ConvenienceDomService.setAriaHidden`);
  Zustandsänderungen, die man nicht sieht, über `tableScope.announce()`; keine eigenen Tab-Stopps (die Tabelle ist ein
  Tab-Stopp, Tastatur über `ActionId` + Shortcut-Mappings). Test: Attribute im Browser-Spec und
  `expect(await axeViolations(host)).toEqual([])` (`test-utils/axe.ts`). Neue Elemente außerhalb der Tabelle
  (Overlays, Menüs, Dialoge) folgen dem passenden APG-Muster (z. B. `role="dialog"`, `role="menu"`).
- Performance: keine Zeit-Assertions in `test:unit`. Messungen als `vitest bench`; Bench-Dateien nicht unter `src/`
  ablegen oder in `vitest.config.ts` → `coverage.exclude` aufnehmen (heute ausgeschlossen: `*.spec.ts`, `*.demo.ts`,
  `*.if.ts`, `index.ts`).
- **Wrapper:** Betrifft das Feature die Wrapper (neue Events, neue Optionen, DOM außerhalb der Zellen), einen Smoke-Test
  in mindestens React und Web Component (`pnpm test:wrappers`, Helfer `packages/table/test-utils/wrapper-test-utils.ts`).
- Außerdem: `test:types` (Vitest prüft keine Typen; `expectTypeOf` für Generik), `docs:check`, Export-Snapshot
  (`pnpm exec vitest run -u src/index.spec.ts` in `packages/table`, Diff prüfen: nur Zugänge), `test:coverage` (neue
  Dateien ≥ 95 % Zeilen / ≥ 90 % Zweige, Gesamtabdeckung ~97 % sinkt nicht).
- Fehler in bestehendem Code: zuerst roter Test; nicht sofort behoben → `it.fails('<richtiges Verhalten>')` +
  `// BUG:` + Eintrag in `TODO.md`.

### Phase 3 – Implementierung

- **0 Runtime-Abhängigkeiten.** Dev-Abhängigkeiten nur für Tests (z. B. `axe-core`).
- Daten nie unescaped in `innerHTML`: `escapeHtml()` (`common/escape-html.ts`) oder Text-APIs.
- DOM nur über `DomServiceIf` / `ConvenienceDomService`.
- `instanceof` über Paketgrenzen meiden → `instanceof-workaround.ts` erweitern.
- CSS: Klassen `ge-table-<feature>-*` in `packages/table/css/`, Variablen `--ge-table-<feature>-*` in
  `table-color-vars.css` für light **und** dark (`html[data-theme]`). Angular übernimmt das CSS beim Build.
- **RTL vorbereiten** (Prompt 012 kommt später): in neuem CSS logische Eigenschaften verwenden (`margin-inline-start`,
  `padding-inline-end`, `inset-inline-start`), wo das Layout nicht ohnehin per JS in Pixeln gesetzt wird.
- Event-Typen `Ge…`, Interfaces in `.if.ts`, neue öffentliche Dateien in `packages/table/src/index.ts`, jedes Symbol mit
  `@category` (neue Kategorie → `packages/table/typedoc.json` → `categoryOrder`), JSDoc mit `@example`.
- Lebenszyklus: alles, was Listener, Observer oder Timer anlegt, wird in `TableScope.destroy()` freigegeben
  (`listenerAbortController`, Renderer-Cleanups).
- Builds grün: `pnpm build:core`, `pnpm build:libs`, `pnpm build:angular`. Größe von `packages/table/dist` vorher und
  nachher notieren.

### Phase 4 – Doku

- JSDoc + `pnpm --filter @guiexpert/table docs:check` (Okt. 2026: 297 Beispiele, 0 Fehler).
- `pnpm --filter @guiexpert/table typedoc:website`: erneuert die API-Doku und `apps/webpage-guiexpert/src/training/api-index.json`
  (ohne ihn bauen die `<ApiLink>`s im Training nicht).
- `instructions.md`: Abschnitt an passender Stelle; alle `ts`-Blöcke kompilieren (Snippets extrahieren → `tsc` strict mit
  `paths` auf `packages/*/src`). `packages/angular-table/instructions.md`, wenn Angular-spezifisch etwas zu sagen ist.
- `README.md` (Root), `packages/table/README.md` („Features“), `llms.txt` (Root) **und**
  `apps/webpage-guiexpert/public/llms.txt` („Key Features“, Kapitelzahl).
- `CLAUDE.md`: betroffene Abschnitte (§3 Architektur, §6 Zahlen, §10 Backlog, §11 Kapitelzahl).
- `TODO.md`: Eintrag abhaken, „Für die Release-Notes (nächstes Release)“ ergänzen, Funde eintragen.

### Phase 5 – Demo-Modelle und Demo-Apps

- `packages/demo-table-models`: Modell-Fabrik mit festem Seed, in `src/index.ts` exportieren, bauen.
- `apps/table-demo` (Plain TS, Aufnahme-Umgebung der Videos): Beispiel.
- `apps/angular-table-demo`: Route + Eintrag in `apps/angular-table-demo/instructions.md`. Achtung: nutzt noch die
  npm-Pakete (s. `TODO.md`), läuft also erst nach dem Release oder nach Kopplung an lokale Builds.
- Framework-Demos (`apps/react-table-demo` …): optional.

### Phase 6 – Website gui.expert (`apps/webpage-guiexpert`) 🛑 kein Deploy

- Showcase (Muster `timetable`): `src/pages/showcase/<name>/run.astro` + `info.astro`,
  `src/components/showcase/<name>/run.astro`, Vorschaubild `src/assets/screens/thumbs/<name>.png`, Kachel in
  `src/components/showcase/index.astro`, optional `src/content/showcase/<name>.json`. Name klein, ohne Bindestrich.
- Feature-Liste: `src/components/features.astro`.
- Vergleichsaussagen prüfen und ggf. anpassen: `src/components/home/why.astro` (Tabelle `ROWS` + „Rule of thumb“),
  `src/pages/training/build-buy-or-guiexpert.astro`, `src/pages/training/checklist.astro`, Beiträge unter
  `src/pages/post/` bzw. `src/components/post/`. Ehrlich bleiben: was fehlt, bleibt als fehlend stehen.
  Wortwahl nach CLAUDE.md §8 („MIT-lizenziert, kostenlos auch kommerziell“, keine Preise; ag-Grid sachlich).
- Bauen: `pnpm build:core && pnpm --filter @guiexpert/demo-table-models build && pnpm build:webpage-guiexpert`;
  lokal `pnpm serve:webpage-guiexpert`, in light **und** dark ansehen. **Kein Deploy.**

### Phase 7 – Training (gui.expert/training)

- **Platzierung:** Kapitelnummer `no` und `episode` hängen am Git-Tag `ep-NNN` des Demo-Repos. Neue Kapitel werden
  **nicht** einsortiert (das würde alle späteren Nummern, Tags und Links verschieben), sondern hinten angehängt: in
  **Teil 8** (`PartId` `"advanced"`, Titel z. B. „Beyond the basics“). Den Teil legt der erste Prompt an, der ein
  Kapitel braucht – Prompt 001 hat ihn angelegt („Beyond the basics“, Kapitel 35 `accessibility`). Nummer = höchste
  vorhandene + 1 (in `src/training/chapters.ts` nachsehen; Stand Okt. 2026: 35).
- Kleine Features können stattdessen einen Abschnitt in einem bestehenden Kapitel bekommen (keine neue Nummer), mit
  `<Callout type="version">`. In Phase 1 entscheiden.
- Umsetzung (Ablauf CLAUDE.md §11): Eintrag in `chapters.ts` (`slug`, `lead`, `learn`, `api`, `showcases`, `since`),
  Seite `src/pages/training/<slug>.astro` mit `<TrainingLayout slug=…>`, Live-Demo `src/training/demos/<slug>.ts`
  (Daten aus `./shared/orders`, fester Seed, `// #region` für `<Snippet>`), Screenshot-Eintrag in
  `scripts/training-screenshots.mjs`, Bilder `src/assets/training/shots/demo-<slug>-light|dark.png`,
  `pnpm --filter webpage-guiexpert check:training`.
- Zahlen nachziehen (Kapitel, Folgen, Live-Demos): `CLAUDE.md` §6 + §11, beide `llms.txt`, `TODO.md`,
  `training-examples/README.md`, Kopfkommentar von `chapters.ts`. Mit `grep -rn` nach der alten Zahl suchen.

### Phase 8 – Demo-Repo 🛑

- Jedes Kapitel verlinkt einen Tag im Demo-Repo **`krocon/guiexpert-table-step-by-step-demo`** (`DEMO_REPO` /
  `demoTagUrl()` in `chapters.ts`). Das Repo liegt nicht im Mono-Repo und muss erst verbunden bzw. geklont werden.
- Empfehlung: neue Folge im bestehenden Repo (Commit + Tag `ep-NNN` = Kapitelnummer). Ein eigenes Repo nur mit Grund.
- Nutzt das Demo-Repo die npm-Pakete, gibt es das Feature dort erst nach dem Release: bis dahin Branch, Tag danach.
- Offener Punkt aus `TODO.md`: Tags `ep-001` … `ep-034` sind evtl. noch nicht gepusht, `ep-035` (Prompt 001) ist noch
  nicht angelegt. Fehlende zusammen pushen.
- Anlegen, Pushen, Tags: **nur nach ausdrücklicher Freigabe**.
- Im Training gezeigter Framework-Code → `apps/webpage-guiexpert/training-examples/` (README dort: Tag aktualisieren).

### Phase 9 – Video („GuiExpert Table in 60 Sekunden“)

- Ordner `videos/NN-<slug>/` (NN = nächste freie Nummer; Muster `videos/01-zwei-millionen-zeilen/`): `script.md`
  (Hook 0–8 s → Code 8–40 s → Ergebnis live 40–55 s → CTA gui.expert 55–60 s), `snippet.ts` (≤ 15 Zeilen, kompiliert
  gegen die echte API), `demo.html` (Aufnahme-Seite). Snippet vorher in `apps/table-demo` ausführen.
- `videos/README.md` (Tabelle) und `CLAUDE.md` §10 Episoden-Backlog ergänzen.
- Ist das Feature bei ag-Grid Enterprise: Titel „… ohne Enterprise-Lizenz“ möglich. Vorher auf ag-grid.com prüfen.

### Phase 10 – Abschlussprüfung

```bash
pnpm build:core
pnpm --filter @guiexpert/table test:types
pnpm --filter @guiexpert/table docs:check
pnpm test:core                                   # Unit + Browser
pnpm --filter @guiexpert/table test:unit --sequence.shuffle
pnpm --filter @guiexpert/table test:coverage
pnpm test:wrappers
pnpm build:libs && pnpm build:angular
pnpm --filter @guiexpert/demo-table-models build
pnpm --filter @guiexpert/table typedoc:website
pnpm --filter webpage-guiexpert check:training
pnpm build:webpage-guiexpert
```

Danach: Showcase und Training-Demo im Browser ansehen (light und dark); `instructions.md`-Snippets kompilieren;
Referenzfälle gegen eine unabhängige Rechnung bzw. Beobachtung prüfen. Abschluss-Review durch einen separaten
Agenten, der den Code nicht geschrieben hat (Schwerpunkte stehen im Feature-Prompt).

## 3. Definition of Done (gilt zusätzlich zu der des Feature-Prompts)

- [ ] Design-Dokument freigegeben 🛑
- [ ] Specs (Unit, Browser, ggf. Wrapper, Typen) grün; Shuffle-Lauf grün; Coverage-Ziele; Export-Snapshot nur Zugänge
- [ ] Core, Libs und Angular 14–22 bauen
- [ ] JSDoc + `docs:check`, API-Doku neu erzeugt, `instructions.md`, READMEs, beide `llms.txt`, `CLAUDE.md`, `TODO.md`
- [ ] Demos, Website, Training, Video wie in Phase 1 entschieden; `pnpm build:webpage-guiexpert` grün
- [ ] Kein Publish, kein Deploy, keine Versionsänderung, kein Push ohne ausdrückliche Anweisung
