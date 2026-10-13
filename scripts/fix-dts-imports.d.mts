/** Types for fix-dts-imports.mjs (imported by the vite configs of the library packages). */

/**
 * Adds explicit ".js" extensions to the relative imports of all .d.ts files below `dir` (in place).
 *
 * @returns number of declaration files and of rewritten specifiers
 */
export declare function fixDtsImports(dir: string): { files: number; changed: number };
