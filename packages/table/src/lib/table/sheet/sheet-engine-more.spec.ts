import { describe, expect, it } from 'vitest';
import { SheetEngine, isFormulaError, isFormulaText, FormulaRange, SheetDate } from '@guiexpert/table';
import { compareSheet, round15, scalar, toBool, toExternal, toNum, toStr } from './sheet-values';

const code = (v: unknown) => (isFormulaError(v) ? v.code : v);

describe('SheetEngine – structure and graph', () => {

  it('adjustForStructureChange: rows, columns, moved cells (positions after the edit)', () => {
    const data: unknown[][] = [
      [1, '=A1*2', null],
      [2, '=A2*2', '=SUM(B1:B2)'],
      [3, '=A3', '=A1+A3'],
    ];
    const e = SheetEngine.fromArrays(data);
    expect(e.adjustForStructureChange({ kind: 'deleteRows', at: 1, count: 1 })).toEqual([
      { row: 1, col: 1, input: '=A2' },
      { row: 1, col: 2, input: '=A1+A2' },
    ]);
    const sorted = (x: Array<{ row: number; col: number }>) => [...x].sort((a, b) => a.row - b.row || a.col - b.col);
    expect(sorted(e.adjustForStructureChange({ kind: 'insertRows', at: 0, count: 1 }))).toEqual([
      { row: 1, col: 1, input: '=A2*2' }, { row: 2, col: 1, input: '=A3*2' }, { row: 2, col: 2, input: '=SUM(B2:B3)' },
      { row: 3, col: 1, input: '=A4' }, { row: 3, col: 2, input: '=A2+A4' },
    ]);
    expect(e.adjustForStructureChange({ kind: 'deleteColumns', at: 0, count: 1 }).map(x => x.input))
      .toEqual(['=#REF!*2', '=#REF!*2', '=#REF!', '=SUM(A1:A2)', '=#REF!+#REF!']);
    expect(e.adjustForStructureChange({ kind: 'insertColumns', at: 1, count: 2 })[0]).toEqual({ row: 1, col: 4, input: '=SUM(D1:D2)' });
    expect(e.adjustForStructureChange({ kind: 'moveCells', from: { r1: 0, c1: 0, r2: 2, c2: 0 }, to: [0, 5] })[0])
      .toEqual({ row: 0, col: 1, input: '=F1*2' });
    expect(e.adjustForStructureChange({ kind: 'moveCells', from: { r1: 0, c1: 1, r2: 0, c2: 1 }, to: [5, 5] }))
      .toEqual([{ row: 1, col: 2, input: '=SUM(B1:B2)' }].filter(() => false));
  });

  it('wide ranges (more than 64 columns) are found and removed', () => {
    const row: unknown[] = Array.from({ length: 80 }, (_, i) => i);
    const data: unknown[][] = [row, ['=SUM(A1:CB1)', '=SUM(A1:CB1)']];
    const e = SheetEngine.fromArrays(data);
    expect(e.getValue(1, 0)).toBe(3160);
    row[70] = 0;
    expect(e.inputsChanged([[0, 70]]).evaluated).toBe(2);
    expect(e.getDependents(0, 70)).toHaveLength(2);
    data[1][0] = 1;
    data[1][1] = 2;
    e.inputsChanged([[1, 0], [1, 1]]);
    expect(e.getDependents(0, 70)).toEqual([]);
  });

  it('formula columns: inputsChanged respects isFormulaColumn; own functions must be functions', () => {
    const data: unknown[][] = [['=1+1', null]];
    const e = new SheetEngine({ getRowCount: () => 1, getColumnCount: () => 2, getInput: (r, c) => data[r][c], isFormulaColumn: c => c === 0 },
      { functions: { BAD: 5 as never } });
    e.rebuild();
    data[0][1] = '=1+2';
    e.inputsChanged([[0, 1]]);
    expect([e.getValue(0, 0), e.getValue(0, 1), e.isFormula(0, 1)]).toEqual([2, '=1+2', false]);
    expect(code(e.evaluate('BAD()'))).toBe('#NAME?');
  });

  it('a removed range node: shared ranges stay for the other formulas', () => {
    const data: unknown[][] = [[1, '=SUM(A1:A2)', '=SUM(A1:A2)'], [2, null, null]];
    const e = SheetEngine.fromArrays(data);
    data[0][1] = 0;
    e.inputsChanged([[0, 1]]);
    data[1][0] = 5;
    e.inputsChanged([[1, 0]]);
    expect(e.getValue(0, 2)).toBe(6);
  });

  it('rows beyond the data are blank; isFormulaText', () => {
    const e = SheetEngine.fromArrays([['=A5', '=SUM(A1:A1000)']]);
    expect([e.getValue(0, 0), e.getValue(0, 1)]).toEqual([0, 0]);
    expect([isFormulaText('='), isFormulaText('=1'), isFormulaText(5)]).toEqual([false, true, false]);
  });
});

describe('sheet values', () => {
  it('round15, scalar, toBool, toStr, compare, toExternal', () => {
    expect([round15(0), round15(-0), round15(Infinity), round15(1e-320)]).toEqual([0, 0, Infinity, 1e-320]);
    expect(code(scalar(new FormulaRange(0, 0, 2, 1, () => 1)))).toBe('#VALUE!');
    expect(scalar(new FormulaRange(0, 0, 1, 1, () => 'x'))).toBe('x');
    expect([toBool(new SheetDate(0)), toBool('false'), toBool(''), code(toBool('x'.repeat(50)))]).toEqual([false, false, false, '#VALUE!']);
    expect([toStr(null), toStr(true), toStr(new SheetDate(2))]).toEqual(['', 'TRUE', '2']);
    expect([compareSheet(null, null), compareSheet(null, 'a'), compareSheet(true, null), compareSheet(false, true)]).toEqual([0, -1, 1, -1]);
    expect([compareSheet(new SheetDate(5), 5), compareSheet('b', 'a'), code(compareSheet(1, toNum('x', { isoDatesAsDates: true }) as never))]).toEqual([0, 1, '#VALUE!']);
    expect(toExternal(new FormulaRange(0, 0, 1, 1, () => 3))).toBe(3);
    expect(code(toNum('y'.repeat(50), { isoDatesAsDates: false }))).toBe('#VALUE!');
    expect(toNum(' 25 % ', { isoDatesAsDates: false })).toBe(0.25);
  });
});

describe('SheetEngine – sparse sources', () => {
  it('forEachInput: rebuild reads only the given cells', () => {
    const cells = new Map<string, unknown>([['0:0', 2], ['999999:1', '=A1*3'], ['5:2', '=1+1'], ['7:9', '=1']]);
    let reads = 0;
    const e = new SheetEngine({
      getRowCount: () => 1_000_000,
      getColumnCount: () => 3,
      getInput: (r, c) => { reads++; return cells.get(`${r}:${c}`); },
      isFormulaColumn: c => c !== 2,
      forEachInput: fn => cells.forEach((v, k) => { const [r, c] = k.split(':').map(Number); fn(r, c, v); }),
    });
    e.rebuild();
    expect(e.getValue(999999, 1)).toBe(6);
    expect(e.getValue(5, 2)).toBe('=1+1'); // no formula column
    expect(e.getFormulaCount()).toBe(1);   // column 9 is outside
    expect(reads).toBeLessThan(10);
  });
});
