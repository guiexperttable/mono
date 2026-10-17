// S26: incremental recalculation = calculating from scratch (fixed seed), and fuzzing: the engine never throws.
import { describe, expect, it } from 'vitest';
import { SheetEngine, isFormulaError } from '@guiexpert/table';

/** A small deterministic random generator (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROWS = 12;
const COLS = 6;
const letter = (c: number) => String.fromCharCode(65 + c);

function randomInput(r: () => number): unknown {
  const k = Math.floor(r() * 10);
  const ref = () => `${r() < 0.2 ? '$' : ''}${letter(Math.floor(r() * COLS))}${Math.floor(r() * ROWS) + 1}`;
  const range = () => {
    const c1 = Math.floor(r() * COLS);
    const r1 = Math.floor(r() * ROWS) + 1;
    return `${letter(c1)}${r1}:${letter(Math.min(COLS - 1, c1 + Math.floor(r() * 3)))}${Math.min(ROWS, r1 + Math.floor(r() * 4))}`;
  };
  switch (k) {
    case 0: return null;
    case 1: return Math.round(r() * 100) - 20;
    case 2: return `t${Math.floor(r() * 5)}`;
    case 3: return `=${ref()}+${ref()}`;
    case 4: return `=SUM(${range()})*2`;
    case 5: return `=IF(${ref()}>10,${ref()},-1)`;
    case 6: return `=COUNTIF(${range()},">5")+MAX(${range()})`;
    case 7: return `=${ref()}&"-"&${ref()}`;
    case 8: return `=IFERROR(${ref()}/${ref()},0)`;
    default: return r() < 0.5;
  }
}

const show = (v: unknown) => (isFormulaError(v) ? v.code : v instanceof Date ? v.getTime() : v);

describe('S26 – incremental = from scratch', () => {
  it.each([1, 7, 42, 2026, 99_999])('seed %i: 300 random changes', seed => {
    const r = rng(seed);
    const data: unknown[][] = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randomInput(r)));
    const engine = SheetEngine.fromArrays(data);
    for (let step = 0; step < 300; step++) {
      const changes: Array<[number, number]> = [];
      const n = 1 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const row = Math.floor(r() * ROWS);
        const col = Math.floor(r() * COLS);
        data[row][col] = randomInput(r);
        changes.push([row, col]);
      }
      engine.inputsChanged(changes);
      if (step % 25 === 24) {
        const fresh = SheetEngine.fromArrays(data.map(row => [...row]));
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            expect(show(engine.getValue(row, col)), `seed ${seed} step ${step} ${letter(col)}${row + 1}`)
              .toEqual(show(fresh.getValue(row, col)));
          }
        }
      }
    }
  });
});

describe('fuzzing – never throws', () => {
  it('random formula texts', () => {
    const r = rng(123);
    const parts = ['A1', 'B2', '$C$3', 'A:A', '1:1', 'SUM(', 'IF(', ')', ',', ';', '"x"', '""', '1', '2.5', '+', '-', '*', '/', '^', '&',
      '%', ':', '=', '<>', '<', 'TRUE', '#REF!', '[a]', 'VLOOKUP(', 'INDEX(', 'TEXT(', 'DATE(', '(', ' ', 'XFD1048576', 'ZZZ1', 'A0'];
    const data: unknown[][] = [[1, 2, 3], ['a', 'b', 'c'], [null, null, null]];
    for (let i = 0; i < 3000; i++) {
      let text = '=';
      const len = 1 + Math.floor(r() * 10);
      for (let j = 0; j < len; j++) text += parts[Math.floor(r() * parts.length)];
      data[2][0] = text;
      expect(() => SheetEngine.fromArrays(data).getValue(2, 0), text).not.toThrow();
    }
  });
});
