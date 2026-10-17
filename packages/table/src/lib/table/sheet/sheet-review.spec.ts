// Fixes from the review of prompt 013 stage 4 (numbers = findings of the review).
import { describe, expect, it } from 'vitest';
import {
  FormulaRange, SheetDate, SheetEngine, adjustFormula, isFormulaError, isSheetDate, formatFormula,
} from '@guiexpert/table';
import { parseFormula } from '../formula/parser'; // internal

const code = (v: unknown) => (isFormulaError(v) ? v.code : v);

function value(formula: string, data: unknown[][] = [[]]): unknown {
  return code(SheetEngine.fromArrays(data).evaluate(formula, [0, 0]));
}

describe('stage 4 review', () => {
  it('#1: wildcards do not backtrack catastrophically', () => {
    const long = 'a'.repeat(5000);
    const start = performance.now();
    expect(value(`COUNTIF(A1:A1,"${'*a'.repeat(30)}b")`, [[long]])).toBe(0);
    expect(value(`SEARCH("${'*a'.repeat(30)}b",A1)`, [[long]])).toBe('#VALUE!');
    expect(performance.now() - start).toBeLessThan(2000);
    expect(value('COUNTIF(A1:A3,"*")', [['x'], [null], ['']])).toBe(1); // blanks never match a wildcard
    expect(value('COUNTIF(A1:A3,"<>x")', [['x'], [null], ['y']])).toBe(2); // … but count for "<>x"
  });

  it('#1b: SEARCH with wildcards is not quadratic in the text (every start position, leading star or not)', () => {
    const long = 'a'.repeat(20_000);
    const start = performance.now();
    expect(value(`SEARCH("${'a*'.repeat(30)}b",A1)`, [[long]])).toBe('#VALUE!'); // matches at every start – but no "b"
    expect(value(`SEARCH("${'*a'.repeat(30)}b",A1)`, [[long]])).toBe('#VALUE!');
    expect(value(`SEARCH("a?a*b",A1)`, [[long + 'b']])).toBe(1);
    expect(performance.now() - start).toBeLessThan(2000);
  });

  it('#1c: SEARCH with wildcards gives the same position as a regular expression (random texts and patterns)', () => {
    let seed = 7;
    const rnd = (n: number) => { seed = (seed * 16807) % 2147483647; return seed % n; };
    const pick = (alphabet: string, max: number) => Array.from({ length: rnd(max + 1) }, () => alphabet[rnd(alphabet.length)]).join('');
    for (let n = 0; n < 3000; n++) {
      const text = pick('abcAB', 9);
      const pattern = pick('ab*?', 6) || 'a';
      const from = 1 + rnd(text.length + 1);
      const re = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'is');
      let expected: unknown = '#VALUE!';
      for (let i = from - 1; i <= text.length; i++) {
        if (re.test(text.slice(i))) { expected = i + 1; break; }
      }
      expect(value(`SEARCH("${pattern}",A1,${from})`, [[text]]), `SEARCH("${pattern}","${text}",${from})`).toBe(expected);
    }
  });

  it('#2: a range is never read outside its rectangle; SUMIF resizes the sum range (and depends on it)', () => {
    const read: Array<[number, number]> = [];
    const range = new FormulaRange(1, 1, 2, 2, (r, c) => { read.push([r, c]); return 1; });
    expect([range.get(-1, 0), range.get(0, -1), range.get(2, 0), range.get(0, 2)]).toEqual([null, null, null, null]);
    expect(read).toEqual([]);
    expect(range.get(1, 1)).toBe(1);

    const data: unknown[][] = [[1, 10, '=SUMIF(A1:A3,">0",B1)'], [2, 20, '=AVERAGEIF(A1:A3,">0",B1:B1)'], [3, 30]];
    const e = SheetEngine.fromArrays(data);
    expect([e.getValue(0, 2), e.getValue(1, 2)]).toEqual([60, 20]);
    data[2][1] = 90;
    const r = e.inputsChanged([[2, 1]]); // B3 is outside the written sum range B1, but inside the resized one
    expect([e.getValue(0, 2), e.getValue(1, 2)]).toEqual([120, 40]);
    expect(r.changedCells).toHaveLength(2);
    expect(value('SUMIF(A1:B2,">0",C1)', [[1, 1, 5, 6], [1, 1, 7, 8]])).toBe(26); // 2-D: resized to C1:D2
    expect(value('SUMIF(A:A,">0",B1)', [[1, 2], [3, 4]])).toBe(6); // whole column
    expect(value('SUMIF(1:1,">0",A2)', [[1, 2], [3, 4]])).toBe(7); // whole row
  });

  it('#3/#4: unknown names keep their text; ^ is left-associative in cell formulas only', () => {
    expect(adjustFormula('foo(1)+bar+B2', { kind: 'insertRows', at: 0, count: 1 })).toBe('FOO(1)+bar+B3') // function names in capitals;
    expect(value('2^3^2')).toBe(64);
    expect(value('2^(3^2)')).toBe(512);
    expect(formatFormula(parseFormula('2^3^2', true))).toBe('2^3^2');
    expect(formatFormula(parseFormula('2^(3^2)', true))).toBe('2^(3^2)');
    expect(formatFormula(parseFormula('1-(2-3)', true))).toBe('1-(2-3)');
    expect(formatFormula(parseFormula('VLOOKUP(1,A1:B2,2,)', true))).toBe('VLOOKUP(1,A1:B2,2,)');
    // column formulas (008) stay right-associative
    expect(parseFormula('2^3^2')).toMatchObject({ kind: 'binary', right: { kind: 'binary', op: '^' } });
  });

  it('#5: range lists sorted by end row – dependents of overlapping ranges in one column', () => {
    const data: unknown[][] = [[1, '=SUM(A1:A3)'], [2, '=SUM(A2:A2)'], [3, '=SUM(A1:A5)'], [4, '=SUM(A3:A4)'], [5, '=SUM(A5:A5)']];
    const e = SheetEngine.fromArrays(data);
    expect([0, 1, 2, 3, 4].map(r => e.getValue(r, 1))).toEqual([6, 2, 15, 7, 5]);
    for (const [row, expected] of [[0, [0, 2]], [1, [0, 1, 2]], [2, [0, 2, 3]], [3, [2, 3]], [4, [2, 4]]] as const) {
      data[row][0] = (data[row][0] as number) + 10;
      const r = e.inputsChanged([[row, 0]]);
      expect(r.changedCells.map(([rr]) => rr).sort()).toEqual(expected);
    }
    expect([0, 1, 2, 3, 4].map(r => e.getValue(r, 1))).toEqual([36, 12, 65, 27, 15]);
  });

  it('#5: a cycle behind ranges is found with the cached dependents', () => {
    const e = SheetEngine.fromArrays([['=SUM(B1:B2)', '=A1+1'], [1, '=A2']]);
    expect([code(e.getValue(0, 0)), code(e.getValue(0, 1)), e.getValue(1, 1)]).toEqual(['#CIRC!', '#CIRC!', 1]);
  });

  it('#6/#8: lookups – types are ranked, a blank 4th argument is an exact match', () => {
    const data = [[1, 'a'], [3, 'b'], [true, 'c'], [5, 'd']];
    expect(value('VLOOKUP(4,A1:B4,2)', data)).toBe('b'); // the boolean is skipped
    expect(value('VLOOKUP(TRUE,A1:B4,2)', data)).toBe('c');
    expect(value('MATCH(TRUE,A1:A4,1)', data)).toBe(3);
    expect(value('VLOOKUP(4,A1:B4,2,)', data)).toBe('#N/A');
    expect(value('VLOOKUP(4,A1:B4,2,C1)', data)).toBe('#N/A'); // a blank cell = FALSE
    expect(value('VLOOKUP(3,A1:B4,2,)', data)).toBe('b');
    expect(value('HLOOKUP(3,A1:D2,2,)', [[1, 3, 5], ['x', 'y', 'z']])).toBe('y');
  });

  it('#10/#12/#13: COUNTA counts "" from formulas; 16 digits as exponent; TEXT of text', () => {
    expect(value('COUNTA(B1:B3)', [[null, '=""'], [null, null], [null, 0]])).toBe(2);
    expect(value('COUNTA(B1)', [[null, '=""']])).toBe(1);
    expect(value('1E15&""')).toBe('1E+15');
    expect(value('999999999999999&""')).toBe('999999999999999');
    expect(value('TEXT(A1,"0.0")', [['n/a']])).toBe('n/a');
  });

  it('#18: DATE over Excel 1900-02-29, WEEKDAY 11–17, DATEDIF ym/md/yd', () => {
    expect(value('DATE(1900,2,29)*1')).toBe(60);
    expect(value('DATE(1900,3,0)*1')).toBe(60);
    expect(value('DATE(1900,2,30)*1')).toBe(61);
    expect(value('DATE(1900,1,60)*1')).toBe(60);
    expect(value('DATE(1900,3,1)*1')).toBe(61);
    expect(value('DATE(2026,2,0)*1')).toBe(value('DATE(2026,1,31)*1'));
    // 2026-01-15 is a Thursday
    expect([11, 12, 13, 14, 15, 16, 17].map(t => value(`WEEKDAY(DATE(2026,1,15),${t})`))).toEqual([4, 3, 2, 1, 7, 6, 5]);
    expect(value('WEEKDAY(DATE(2026,1,15),1.9)')).toBe(5);
    expect(value('WEEKDAY(DATE(2026,1,15),18)')).toBe('#NUM!');
    expect(value('DATEDIF(DATE(2023,11,15),DATE(2025,2,10),"ym")')).toBe(2);
    expect(value('DATEDIF(DATE(2023,11,15),DATE(2025,2,10),"YD")')).toBe(87);
    expect(value('DATEDIF(DATE(2024,1,15),DATE(2024,3,10),"md")')).toBe(24);
    expect(value('DATEDIF(DATE(2024,1,15),DATE(2024,3,20),"md")')).toBe(5);
    expect(value('DATEDIF(DATE(2024,3,1),DATE(2025,3,1),"yd")')).toBe(0);
  });

  it('#15: inserting at the sheet end – references pushed off become #REF!, ranges to the end stay', () => {
    expect(adjustFormula('A1048576', { kind: 'insertRows', at: 10, count: 1 })).toBe('#REF!');
    expect(adjustFormula('SUM(A2:A1048576)', { kind: 'insertRows', at: 0, count: 1 })).toBe('SUM(A3:A1048576)');
    expect(adjustFormula('SUM(A1048575:A1048576)', { kind: 'insertRows', at: 0, count: 5 })).toBe('SUM(#REF!)');
    expect(adjustFormula('XFD1+SUM(A1:XFD1)', { kind: 'insertColumns', at: 0, count: 1 })).toBe('#REF!+SUM(B1:XFD1)');
  });

  it('#16: adjustForStructureChange reports only formulas whose references change (spelling kept)', () => {
    const e = SheetEngine.fromArrays([['=sum( b1:b1 )', 1], ['=a1 + 1', 2], ['=C5', null]]);
    expect(adjustFormula('sum( b1:b1 )', { kind: 'insertRows', at: 4, count: 1 })).toBe('sum( b1:b1 )');
    expect(e.adjustForStructureChange({ kind: 'insertRows', at: 2, count: 1 })).toEqual([{ row: 3, col: 0, input: '=C6' }]);
    expect(e.adjustForStructureChange({ kind: 'moveCells', from: { r1: 0, c1: 1, r2: 0, c2: 1 }, to: [0, 3] }))
      .toEqual([{ row: 0, col: 0, input: '=SUM(D1:D1)' }]);
  });

  it('#19: isSheetDate needs a numeric serial', () => {
    expect(isSheetDate(new SheetDate(5))).toBe(true);
    expect(isSheetDate({ type: 'SheetDate' })).toBe(false);
    expect(isSheetDate({ type: 'SheetDate', serial: '5' })).toBe(false);
  });

  it('#7: the range cap counts the rows with data, at evaluation time', () => {
    const data: unknown[][] = [[1, '=SUM(A1:A100000)']];
    const e = SheetEngine.fromArrays(data, { maxRangeCells: 3 });
    expect(e.getValue(0, 1)).toBe(1);
    expect(() => SheetEngine.fromArrays([[1], [2], [3], [4], ['=SUM(A1:A4)']], { maxRangeCells: 3 })).not.toThrow();
    expect(code(SheetEngine.fromArrays([[1], [2], [3], [4], ['=SUM(A1:A4)']], { maxRangeCells: 3 }).getValue(4, 0))).toBe('#ERROR!');
  });
});
