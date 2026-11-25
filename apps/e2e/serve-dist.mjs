#!/usr/bin/env node
// One static server for all built apps (prompt 026, decision E3): one process, one port per dist, no dependencies.
// Instead of 11 × `vite/astro/ng preview` (five demos want port 4300, `preview` hides 404s behind the SPA fallback).
//
//   node serve-dist.mjs            all apps of apps.mjs
//   GET http://localhost:4800/     health check (Playwright `webServer.url`): 200 once every port listens
//
// Directory → index.html, `/x` → `/x.html` or `/x/index.html`, SPA fallback only for apps with `spa: true`
// (Angular routes), a missing file is a 404 – the E2E request guard turns it into a red test.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { APPS, HEALTH_PORT } from './apps.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.map': 'application/json',
  '.wasm': 'application/wasm', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const isFile = p => existsSync(p) && statSync(p).isFile();

function resolveFile(root, urlPath, spa) {
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const base = join(root, rel);
  if (base !== root && !base.startsWith(root + sep)) return undefined;          // no ../ outside the dist
  for (const candidate of [base, base + '.html', join(base, 'index.html')]) {
    if (isFile(candidate)) return candidate;
  }
  // SPA: a route without a file extension gets index.html; a missing asset stays a 404
  if (spa && !extname(rel)) return join(root, 'index.html');
  return undefined;
}

function serve(app) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const path = new URL(req.url ?? '/', 'http://localhost').pathname;
      const file = resolveFile(app.dir, path, app.spa);
      if (!file) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end(`404 ${path} (${app.name})`);
        return;
      }
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      createReadStream(file).pipe(res);
    });
    server.once('error', reject);
    server.listen(app.port, '127.0.0.1', () => resolve(server));
  });
}

const missing = APPS.filter(a => !existsSync(join(a.dir, 'index.html')));
if (missing.length) {
  console.error(`serve-dist: not built – ${missing.map(a => a.name).join(', ')}. Run: pnpm test:e2e:build`);
  process.exit(1);
}
await Promise.all(APPS.map(serve));
createServer((_req, res) => res.writeHead(200).end('ok')).listen(HEALTH_PORT, '127.0.0.1');
console.log(APPS.map(a => `serve-dist: ${a.name} → http://localhost:${a.port}/`).join('\n'));
