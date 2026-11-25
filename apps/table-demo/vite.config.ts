
import {defineConfig} from 'vite';
import {join} from "path";
import {readdirSync} from "fs";

// Every *.html page is an entry – without this `vite build` only builds index.html and the feature pages
// (row-grouping.html, cover-grid.html …) are missing in dist/ (found by the E2E smoke tests, prompt 026).
const pages = Object.fromEntries(
  readdirSync(__dirname)
    .filter(f => f.endsWith('.html'))
    .map(f => [f.replace(/\.html$/, ''), join(__dirname, f)])
);

export default defineConfig({
  cacheDir: '../../node_modules/.vite/html5-table-demo',

  server: {
    port: 4200,
    host: 'localhost',
  },

  build: {
    rollupOptions: {input: pages},
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  resolve: {
    alias: [
      {
        find: /@guiexpert\/table/,
        replacement: join(__dirname, '../..', 'packages', 'table', 'src'),
      },
      {
        find: /@guiexpert\/demo-table-models/,
        replacement: join(__dirname, '../..', 'packages', 'demo-table-models', 'src'),
      },
    ],
  }
});
