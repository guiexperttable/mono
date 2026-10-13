import { join } from "path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import {viteStaticCopy} from "vite-plugin-static-copy";
import dts from "vite-plugin-dts";
import { fixDtsImports } from "../../scripts/fix-dts-imports.mjs";

export default  defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,

  resolve: {
    alias: [
      {
        find: /@guiexpert\/table/,
        replacement: join(__dirname, '..', 'table', 'src'),
      },
    ],
  },

  plugins: [
    dts({
      entryRoot: "src",
      // keep "@guiexpert/table" in the .d.ts files (the alias below would turn it into ../../table/src)
      aliasesExclude: [/^@guiexpert\/table$/],
      tsconfigPath: join(__dirname, "tsconfig.lib.json"),
      // explicit ".js" in relative imports – needed by "moduleResolution": "node16"/"nodenext"
      afterBuild: () => { fixDtsImports(join(__dirname, "dist")); },
    }),
    Vue(),
    Components({
      dirs: ["src/lib"]
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'README.md',
          dest: './'
        },
        {
          src: 'LICENSE',
          dest: './'
        },
        {
          src: 'package.json',
          dest: './'
        }
      ]
    })
  ],
  build: {
    lib: {
      entry: join(__dirname, "./src/index.ts"),
      name: "vue3-table",
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled
      external: ["@guiexpert/table", /^vue($|\/)/],
      output: {
        // globals to use in the UMD build for externalized deps
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
