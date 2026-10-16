/**
 * Deployt apps/webpage-guiexpert/dist per FTPS (explizites TLS, Port 21) nach /gui.expert.
 * Vorhandene Dateien werden überschrieben; Dateien, die es lokal nicht mehr gibt, bleiben auf dem Server
 * (FTP_DELETE_REMOTE=true leert das Zielverzeichnis vorher – Seite ist dann kurz offline).
 *
 * Konfiguration: apps/webpage-guiexpert/.env (git-ignored) bzw. Umgebungsvariablen:
 *   FTP_HOST, FTP_PORT, FTP_USER, FTP_PASSWORD, FTP_REMOTE_ROOT, FTP_DELETE_REMOTE (true|false)
 * Ohne FTP_PASSWORD fragt das Script das Passwort verdeckt ab; die übrigen Variablen sind Pflicht.
 *
 * Aufruf: pnpm --filter webpage-guiexpert run deploy   (vorher: pnpm build:webpage-guiexpert)
 */
const path = require("node:path");
const fs = require("node:fs");
const FtpDeploy = require("ftp-deploy");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const localRoot = path.join(__dirname, "dist");
if (!fs.existsSync(path.join(localRoot, "index.html"))) {
  console.error(`Kein Build gefunden: ${localRoot}/index.html fehlt. Erst "pnpm build:webpage-guiexpert" ausführen.`);
  process.exit(1);
}

const required = ["FTP_HOST", "FTP_PORT", "FTP_USER", "FTP_REMOTE_ROOT"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Fehlende Variablen in ${envFile}: ${missing.join(", ")}`);
  process.exit(1);
}
const env = process.env;

const config = {
  host: env.FTP_HOST,
  port: Number(env.FTP_PORT),
  user: env.FTP_USER,
  password: env.FTP_PASSWORD || "", // leer → verdeckte Abfrage
  localRoot,
  remoteRoot: env.FTP_REMOTE_ROOT,
  include: ["*", "**/*", ".*", "**/.*"], // inkl. .htaccess
  exclude: ["**/.DS_Store", "**/*.map"],
  deleteRemote: env.FTP_DELETE_REMOTE === "true",
  forcePasv: true,
  secure: true, // SSL/TLS (explizit, AUTH TLS auf Port 21)
  secureOptions: { servername: env.FTP_HOST },
  sftp: false,
};

const ftpDeploy = new FtpDeploy();
let lastPct = -1;
ftpDeploy.on("uploaded", (d) => {
  const pct = Math.floor((d.transferredFileCount / d.totalFilesCount) * 100);
  if (pct !== lastPct && pct % 5 === 0) {
    lastPct = pct;
    console.log(`${String(pct).padStart(3)} %  ${d.transferredFileCount}/${d.totalFilesCount}  ${d.filename}`);
  }
});
ftpDeploy.on("upload-error", (d) => console.error("Fehler bei", d.filename, d.err && d.err.message));
ftpDeploy.on("log", (msg) => console.log(msg));

const started = Date.now();
console.log(`Deploy ${localRoot} → ftps://${config.user}@${config.host}:${config.port}${config.remoteRoot}`);
ftpDeploy
  .deploy(config)
  .then((res) => {
    const files = res.flat(Infinity).length;
    console.log(`Fertig: ${files} Dateien in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
  })
  .catch((err) => {
    console.error("Deploy fehlgeschlagen:", err && err.message ? err.message : err);
    process.exit(1);
  });
