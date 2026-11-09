// Prompt 022: the text measurement of the auto width – also its fallbacks (no rendered cell label, no canvas).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AreaModelArrayOfArrays } from '@guiexpert/table';
import type { AreaModelIf } from '@guiexpert/table';
import { collectColumnTextCandidates, ColumnWidthMeasurer } from './column-width-measurer';

afterEach(() => {
  vi.restoreAllMocks();
  document.querySelectorAll('.measure-host').forEach(e => e.remove());
});

function createHost(withLabel: boolean): HTMLDivElement {
  const host = document.createElement('div');
  host.className = 'measure-host';
  host.style.font = '14px sans-serif';
  if (withLabel) {
    const label = document.createElement('div');
    label.className = 'ge-table-label';
    label.style.cssText = 'padding-left: 6px; padding-right: 4px;';
    host.appendChild(label);
  }
  document.body.appendChild(host);
  return host;
}

describe('ColumnWidthMeasurer', () => {

  it('uses the padding of a rendered cell label', () => {
    const m = new ColumnWidthMeasurer(createHost(true));
    expect(m.measureText('')).toBe(6 + 4 + 2);
    expect(m.measureText('WWWW')).toBeGreaterThan(m.measureText('iiii'));
  });

  it('without a cell label: 20 px padding', () => {
    expect(new ColumnWidthMeasurer(createHost(false)).measureText('')).toBe(22);
  });

  it('without a canvas context: 8 px per character', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(new ColumnWidthMeasurer(createHost(false)).measureText('abc')).toBe(3 * 8 + 22);
  });

  it('a canvas that throws: 8 px per character', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => { throw new Error('blocked'); });
    expect(new ColumnWidthMeasurer(createHost(false)).measureText('ab')).toBe(2 * 8 + 22);
  });

  it('measureWidest: at least 50 px, otherwise the widest text', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const m = new ColumnWidthMeasurer(createHost(false));
    expect(m.measureWidest(new Set())).toBe(50);
    expect(m.measureWidest(new Set(['a', 'x'.repeat(10)]))).toBe(10 * 8 + 22);
  });
});

describe('collectColumnTextCandidates', () => {

  it('keeps per column the texts close to the longest, reads getValueAt without getTextValueAt', () => {
    const model = new AreaModelArrayOfArrays('body', [['a', 1], ['abcdef', null], ['abcde', 123456789]], 34);
    const plain: AreaModelIf = { ...model, getTextValueAt: undefined, getValueAt: (r: number, c: number) => model.getValueAt(r, c) } as unknown as AreaModelIf;
    const candidates = [new Set<string>(), new Set<string>()];
    const maxLength = [0, 0];
    collectColumnTextCandidates(plain, 0, 2, [0, 1], candidates, maxLength);
    expect(Array.from(candidates[0])).toEqual(['abcdef', 'abcde']);  // 'a' dropped (more than 2 shorter)
    expect(maxLength).toEqual([6, 9]);
    expect(Array.from(candidates[1])).toContain('123456789');
  });

  it('an undefined model collects nothing', () => {
    const candidates = [new Set<string>()];
    collectColumnTextCandidates(undefined, 0, 5, [0], candidates, [0]);
    expect(candidates[0].size).toBe(0);
  });
});
