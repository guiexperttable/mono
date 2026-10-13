# Release & npm-Publish

Alle npm-Pakete des Mono-Repos werden von **einem** Workflow veröffentlicht:
[`.github/workflows/npm-publish.yml`](.github/workflows/npm-publish.yml). Er nutzt **npm Trusted Publishing (OIDC)**:
GitHub weist sich bei npm selbst aus – es gibt **kein npm-Token und kein GitHub-Secret**, nichts läuft ab, und jedes
Paket bekommt auf npmjs.com einen Herkunftsnachweis (Provenance).

| Paket | Quelle | Dist-Tag |
|---|---|---|
| `@guiexpert/table` (zuerst), `demo-table-models`, `react-table`, `preact-table`, `solid-table`, `svelte-table`, `vue3-table`, `webcomponent-table` | `packages/*` (`pnpm pack` → `npm publish <tgz>`) | `latest` |
| `@guiexpert/angular-table` 14 … 22 | `angular-builds/ngNN/dist` | `a14` … `a21`, `latest` = neueste Major |

Bereits veröffentlichte Versionen werden übersprungen – ein abgebrochener Lauf kann einfach neu gestartet werden.

**Vorher laufen die Core-Tests** (Job `test`, wiederverwendbarer Workflow `.github/workflows/test-core.yml`: Typen,
JSDoc-Beispiele, Unit- und Browser-Tests von `@guiexpert/table`). Erst wenn sie grün sind, startet der Job `publish` –
auch beim Dry-Run. Rote Tests = kein Release.

Vor dem ersten Upload prüft das Skript in GitHub Actions für **jedes** ausgewählte Paket, ob npm die OIDC-Anmeldung
akzeptiert (`trusted publishing ok` / `FAILED` im Log). Schlägt eine fehl, wird gar nichts veröffentlicht. Das gilt
auch für den Dry-Run – er testet also die npm-Einrichtung mit.

## Einmalig: Trusted Publisher auf npmjs.com eintragen

Für **jedes** der 9 Pakete (als `guiexpert` eingeloggt):
`https://www.npmjs.com/package/@guiexpert/<paket>/access` → **Trusted Publisher** → **GitHub Actions**

| Feld | Wert |
|---|---|
| Organization or user | `guiexperttable` |
| Repository | `mono` |
| Workflow filename | `npm-publish.yml` |
| Environment name | *(leer lassen)* |
| Allowed actions | `npm publish` (und `npm dist-tag`, falls angeboten) |

Pakete: `table`, `demo-table-models`, `react-table`, `preact-table`, `solid-table`, `svelte-table`, `vue3-table`,
`webcomponent-table`, `angular-table`.

Hinweise:
- npm prüft die Angaben beim Speichern nicht – Fehler zeigen sich erst beim Publish. Groß-/Kleinschreibung zählt.
- Laut npm muss eine **neue** Konfiguration innerhalb von **2 Tagen** einmal erfolgreich veröffentlichen, sonst
  verfällt sie. Also kurz vor dem ersten Release eintragen.
- Nach dem ersten erfolgreichen Release empfiehlt npm je Paket unter *Settings → Publishing access*:
  „Require two-factor authentication and disallow tokens“. Danach geht Publish nur noch über den Workflow
  (oder interaktiv mit 2FA).

## Pro Release

```bash
git checkout main && git pull
pnpm version:patch            # 1.1.85 → 1.1.86 (Wrapper behalten ihre Framework-Major), oder version:minor
pnpm version:check            # "All versions consistent."
pnpm build:all                # Kontrolle
git commit -am "chore: release 1.1.86"
git push
```

Dann auf GitHub: **Releases → Draft a new release** → Tag `v1.1.86` (neu, auf `main`) → **Publish release**.
Das startet *Publish to npm* und veröffentlicht alle Pakete. Fortschritt unter **Actions**.

Wichtig: Der Workflow läuft mit dem Stand des Release-Tags. Der Tag muss also auf einen Commit zeigen, der die
neue Version **und** `npm-publish.yml` enthält.

### Vorher testen / nur einzelne Pakete

**Actions → Publish to npm → Run workflow** (Branch `main`):
- `dry_run` angehakt (Standard): baut alles und zeigt, was veröffentlicht würde.
- `dry_run` aus + `only` z. B. `table,react-table` oder `ng22`: nur diese Pakete.

### Lokal (Notfall)

Mit eigenem `npm login`:
```bash
pnpm build:libs && pnpm build:angular
pnpm pub:all:dry              # zeigt, was passieren würde
pnpm pub:all                  # veröffentlicht (ohne Provenance); --only geht auch: node scripts/publish.mjs --only ng22
```

## Fehlerbilder

| Meldung | Ursache |
|---|---|
| `trusted publishing FAILED @guiexpert/…` (Vorabprüfung) bzw. `E404 Not Found - PUT …` | Trusted Publisher für dieses Paket fehlt oder Angaben falsch (User `guiexperttable`, Repo `mono`, Datei `npm-publish.yml`, Environment leer). npm selbst meldet das nur als irreführendes E404. |
| `E422 … repository.url` | `repository.url` im Manifest passt nicht zu `github.com/guiexperttable/mono` |
| `npm ERR! code EOTP` | lokal: 2FA-Code fehlt (`npm publish --otp …`) – in CI tritt das mit Trusted Publishing nicht auf |
| `Versions must be consistent` schlägt fehl | `pnpm version:sync` bzw. `version:patch` vergessen |
