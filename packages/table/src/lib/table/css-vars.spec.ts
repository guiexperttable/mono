import { describe, expect, it } from 'vitest';
import { CssVars } from '@guiexpert/table';

type ThemeName = keyof typeof CssVars.vars;

function declarations(css: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of css.matchAll(/(--ge-table-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

describe('CssVars', () => {

  it('lists the themes light, combat, paper, blackboard', () => {
    expect(CssVars.themes).toEqual(['light', 'combat', 'paper', 'blackboard']);
  });

  it('has CSS for every listed theme and no other', () => {
    expect(Object.keys(CssVars.vars).sort()).toEqual([...CssVars.themes].sort());
  });

  it.each(['light', 'combat', 'paper'] as const)('theme "%s" is scoped to html[data-theme="%s"]', (theme) => {
    expect(CssVars.vars[theme].startsWith(`html[data-theme="${theme}"] {`)).toBe(true);
    expect(CssVars.vars[theme].trim().endsWith('}')).toBe(true);
  });

  it('theme "blackboard" is scoped to html[data-theme="dark"]', () => {
    // NOTE: the only theme whose selector differs from its name.
    expect(CssVars.vars.blackboard.startsWith('html[data-theme="dark"] {')).toBe(true);
  });

  it('every theme colours the overlays "Loading…" / "No rows" (since 1.1.92)', () => {
    for (const theme of CssVars.themes as ThemeName[]) {
      const vars = declarations(CssVars.vars[theme]);
      for (const name of ['--ge-table-overlay-bg', '--ge-table-overlay-content-bg', '--ge-table-overlay-color',
        '--ge-table-spinner-color', '--ge-table-spinner-track-color', '--ge-table-spinner-size']) {
        expect(vars.has(name), `${theme} ${name}`).toBe(true);
      }
    }
  });

  it('all themes declare the same set of --ge-table-* variables', () => {
    const names = (theme: ThemeName) => [...declarations(CssVars.vars[theme]).keys()].sort();
    const light = names('light');
    expect(light.length).toBeGreaterThan(50);
    for (const theme of CssVars.themes as ThemeName[]) {
      expect(names(theme), theme).toEqual(light);
    }
  });

  it('declares every variable only once per theme', () => {
    for (const theme of CssVars.themes as ThemeName[]) {
      const all = [...CssVars.vars[theme].matchAll(/(--ge-table-[a-z0-9-]+)\s*:/g)].map(m => m[1]);
      expect(new Set(all).size, theme).toBe(all.length);
    }
  });

  it('light theme: a few well-known values', () => {
    const light = declarations(CssVars.vars.light);
    expect(light.get('--ge-table-border')).toBe('#ccc');
    expect(light.get('--ge-table-hover-row-bg')).toBe('rgba(0, 224, 255, 0.27)');
    expect(light.get('--ge-table-focus-border')).toBe('rgb(0, 255, 255)');
  });

  // Regression (fixed in 1.1.103): typo "otransparent" in the blackboard theme.
  it('blackboard: --ge-table-footer-center-vertical-border is "transparent"', () => {
    expect(declarations(CssVars.vars.blackboard).get('--ge-table-footer-center-vertical-border')).toBe('transparent');
  });
});
