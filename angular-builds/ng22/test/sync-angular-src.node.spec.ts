// scripts/sync-angular-src.mjs: the version marker `// @since-angular N` (since 1.1.100, prompt 015, S13/S14).
import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { filterSourceForMajor, majorOfTarget, sinceOf, syncTarget } from '../../../scripts/sync-angular-src.mjs';

const PUBLIC_API = [
  "export * from './lib/table.component';",
  "export * from './lib/table-signal.component'; // @since-angular 22",
  '',
].join('\n');

const SIGNAL_FILE = "// @since-angular 22\n// ^ comment\nexport class TableSignalComponent {}\n";

let root: string | undefined;

/** a fake repo: shared source, core css, three build harnesses */
function fakeRepo(): { sharedDir: string; cssDir: string; buildsDir: string } {
  root = mkdtempSync(join(tmpdir(), 'ge-sync-'));
  const sharedDir = join(root, 'packages/angular-table');
  const cssDir = join(root, 'packages/table/css');
  const buildsDir = join(root, 'angular-builds');
  mkdirSync(join(sharedDir, 'src/lib'), { recursive: true });
  mkdirSync(cssDir, { recursive: true });
  writeFileSync(join(sharedDir, 'src/public-api.ts'), PUBLIC_API);
  writeFileSync(join(sharedDir, 'src/lib/table.component.ts'), 'export class TableComponent {}\n');
  writeFileSync(join(sharedDir, 'src/lib/table-signal.component.ts'), SIGNAL_FILE);
  writeFileSync(join(sharedDir, 'README.md'), '# readme');
  writeFileSync(join(sharedDir, 'LICENSE'), 'MIT');
  writeFileSync(join(cssDir, 'table-a.css'), '.a{}');
  for (const ng of ['ng21', 'ng22', 'ng23']) {
    mkdirSync(join(buildsDir, ng, 'lib'), { recursive: true });
    writeFileSync(join(buildsDir, ng, 'package.json'), '{}');
  }
  return { sharedDir, cssDir, buildsDir };
}

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
  root = undefined;
});

describe('sync-angular-src: version marker @since-angular', () => {

  it('reads the major of a target and the marker of a line', () => {
    expect(majorOfTarget('ng22')).toBe(22);
    expect(majorOfTarget('ng100')).toBe(100);
    expect(() => majorOfTarget('lib')).toThrow();
    expect(sinceOf("export * from './x'; // @since-angular 22")).toBe(22);
    expect(sinceOf('//   @since-angular   23  ')).toBe(23);
    expect(sinceOf("export * from './x';")).toBeUndefined();
    expect(sinceOf('// @since-angular 22 and more')).toBeUndefined();
  });

  it('a file marked in its first line is left out for older majors, kept unchanged for newer ones', () => {
    expect(filterSourceForMajor(SIGNAL_FILE, 21)).toBeNull();
    expect(filterSourceForMajor(SIGNAL_FILE, 22)).toBe(SIGNAL_FILE);
    expect(filterSourceForMajor(SIGNAL_FILE, 23)).toBe(SIGNAL_FILE);
  });

  it('marked lines are removed for older majors; unmarked text stays byte-identical', () => {
    expect(filterSourceForMajor(PUBLIC_API, 21)).toBe("export * from './lib/table.component';\n");
    expect(filterSourceForMajor(PUBLIC_API, 22)).toBe(PUBLIC_API);
    const plain = "export * from './lib/table.component';\n";
    expect(filterSourceForMajor(plain, 14)).toBe(plain);
  });

  it('S13/S14: ng21 gets neither file nor export, ng22 and ng23 (a later copy) get both', () => {
    const dirs = { ...fakeRepo(), log: false };
    for (const ng of ['ng21', 'ng22', 'ng23']) {
      syncTarget(ng, dirs);
    }
    const src = (ng: string) => join(dirs.buildsDir, ng, 'lib/src');
    expect(existsSync(join(src('ng21'), 'lib/table-signal.component.ts'))).toBe(false);
    expect(readFileSync(join(src('ng21'), 'public-api.ts'), 'utf8')).not.toContain('table-signal');
    expect(existsSync(join(src('ng21'), 'lib/table.component.ts'))).toBe(true);
    for (const ng of ['ng22', 'ng23']) {
      expect(readFileSync(join(src(ng), 'lib/table-signal.component.ts'), 'utf8')).toBe(SIGNAL_FILE);
      expect(readFileSync(join(src(ng), 'public-api.ts'), 'utf8')).toBe(PUBLIC_API);
    }
    expect(readFileSync(join(src('ng22'), 'lib/table.component.css'), 'utf8')).toContain('.a{}');
  });

  it('an unknown target fails with a message', () => {
    const dirs = { ...fakeRepo(), log: false };
    expect(() => syncTarget('ng99', dirs)).toThrow('Unknown build target: ng99');
    expect(() => syncTarget('lib', dirs)).toThrow('Unknown build target: lib');
  });

  it('the real shared source: TableSignalComponent is marked for Angular 22', () => {
    const shared = new URL('../../../packages/angular-table/src/', import.meta.url);
    const signal = readFileSync(new URL('lib/table-signal.component.ts', shared), 'utf8');
    expect(filterSourceForMajor(signal, 21)).toBeNull();
    expect(filterSourceForMajor(signal, 22)).toBe(signal);
    const api = readFileSync(new URL('public-api.ts', shared), 'utf8');
    expect(filterSourceForMajor(api, 21)).not.toContain('table-signal');
    expect(filterSourceForMajor(api, 22)).toContain('table-signal');
  });
});
