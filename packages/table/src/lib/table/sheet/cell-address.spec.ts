import { describe, expect, it } from 'vitest';
import {
  adjustFormula, columnIndexOfLetter, columnLetter, formatFormula, offsetReferences, parseCellAddress, parseRangeAddress,
  shiftFormula, toCellAddress,
} from '@guiexpert/table';
import { parseFormula } from '../formula/parser';

describe('cell addresses', () => {
  it.each([[0, 'A'], [25, 'Z'], [26, 'AA'], [27, 'AB'], [701, 'ZZ'], [702, 'AAA'], [16383, 'XFD']])('column %i = %s', (i, s) => {
    expect(columnLetter(i)).toBe(s);
    expect(columnIndexOfLetter(s)).toBe(i);
    expect(columnIndexOfLetter(s.toLowerCase())).toBe(i);
  });

  it('limits', () => {
    expect([columnLetter(-1), columnLetter(16384), columnLetter(1.5)]).toEqual(['', '', '']);
    expect([columnIndexOfLetter('XFE'), columnIndexOfLetter('AAAA'), columnIndexOfLetter('A1')]).toEqual([-1, -1, -1]);
    expect(toCellAddress(2, 1)).toBe('B3');
    expect(toCellAddress(0, 5, { absRow: true, absCol: true })).toBe('$F$1');
    expect([toCellAddress(-1, 0), toCellAddress(1048576, 0), toCellAddress(0, 16384)]).toEqual(['#REF!', '#REF!', '#REF!']);
  });

  it('parseCellAddress', () => {
    expect(parseCellAddress('$B3')).toEqual({ row: 2, col: 1, absRow: false, absCol: true });
    expect(parseCellAddress(' ab$12 ')).toEqual({ row: 11, col: 27, absRow: true, absCol: false });
    expect(parseCellAddress('XFD1048576')).toEqual({ row: 1048575, col: 16383, absRow: false, absCol: false });
    expect([parseCellAddress('A0'), parseCellAddress('XFE1'), parseCellAddress('A1048577'), parseCellAddress('1A')])
      .toEqual([undefined, undefined, undefined, undefined]);
  });

  it('parseRangeAddress', () => {
    expect(parseRangeAddress('B5:A1')).toMatchObject({ from: { row: 0, col: 0 }, to: { row: 4, col: 1 } });
    expect(parseRangeAddress('C7')).toMatchObject({ from: { row: 6, col: 2 }, to: { row: 6, col: 2 } });
    expect(parseRangeAddress('A:A')).toMatchObject({ from: { row: 0, col: 0 }, to: { row: 1048575, col: 0 }, wholeColumns: true });
    expect(parseRangeAddress('$D:B')).toMatchObject({ from: { col: 1 }, to: { col: 3 }, wholeColumns: true });
    expect(parseRangeAddress('3:$5')).toMatchObject({ from: { row: 2, col: 0 }, to: { row: 4, col: 16383 }, wholeRows: true });
    expect([parseRangeAddress('A1:B'), parseRangeAddress('A:B:C'), parseRangeAddress('A:XFE'), parseRangeAddress('1:1048577'), parseRangeAddress('')])
      .toEqual([undefined, undefined, undefined, undefined, undefined]);
  });
});

describe('cell formula syntax', () => {
  const canonical = (s: string) => formatFormula(parseFormula(s, true));

  it.each([
    ['b2*c2', 'B2*C2'],
    ['sum( $D$2 : d4 )', 'SUM($D$2:D4)'],
    ['SUM(B5:A1)', 'SUM(A1:B5)'],
    ['SUM(A:A)', 'SUM(A:A)'],
    ['SUM($A:C)', 'SUM($A:C)'],
    ['SUM(3:3)', 'SUM(3:3)'],
    ['SUM($2:$4)', 'SUM($2:$4)'],
    ['-2^2', '-2^2'],
    ['-(2^2)', '-(2^2)'],
    ['50%', '50%'],
    ['-50%', '-50%'],
    ['(1+2)%', '(1+2)%'],
    ['1+2*3', '1+2*3'],
    ['(1+2)*3', '(1+2)*3'],
    ['1-(2-3)', '1-(2-3)'],
    ['1-2-3', '1-2-3'],
    ['2^3^2', '2^3^2'],
    ['(2^3)^2', '2^3^2'], // left-associative like Excel (#4)
    ['2^(3^2)', '2^(3^2)'],
    ['foo+1', 'foo+1'], // an unknown name keeps its text (#3)
    ['"say ""hi"""', '"say ""hi"""'],
    ['IF(A1>1;"x";"y")', 'IF(A1>1,"x","y")'],
    ['#ref!+1', '#REF!+1'],
    ['[price]*2', '[price]*2'],
    ['TRUE<>false', 'TRUE<>FALSE'],
    ['a1&"x"', 'A1&"x"'],
    ['LOG10(1)', 'LOG10(1)'],
  ])('%s → %s', (input, out) => {
    expect(canonical(input)).toBe(out);
    expect(canonical(out)).toBe(out); // stable
  });

  it('syntax errors', () => {
    for (const bad of ["'text'", 'A1:', 'A1:"x"', 'A:1', 'SUM(', '1 2', '$SUM(1)', '#WHAT', 'A1:B', '0:0', '"open', '[x', '[]', '1$', 'A1:2']) {
      expect(() => parseFormula(bad, true), bad).toThrow();
    }
  });

  it('unknown names are #NAME? nodes (no syntax error)', () => {
    expect(parseFormula('foo', true)).toMatchObject({ kind: 'error', code: '#NAME?' });
  });
});

describe('moving formulas', () => {
  it('shiftFormula: relative parts move, $ parts stay, outside → #REF!', () => {
    expect(shiftFormula('B2*C2+$F$1', 1, 0)).toBe('B3*C3+$F$1');
    expect(shiftFormula('B2*C2', 0, 1)).toBe('C2*D2');
    expect(shiftFormula('$B2+B$2', 3, 3)).toBe('$B5+E$2');
    expect(shiftFormula('SUM(D2:D4)', 1, 1)).toBe('SUM(E3:E5)');
    expect(shiftFormula('SUM(A:A)', 5, 1)).toBe('SUM(B:B)');
    expect(shiftFormula('SUM(2:2)', 1, 3)).toBe('SUM(3:3)');
    expect(shiftFormula('A1', -1, 0)).toBe('#REF!');
    expect(shiftFormula('SUM(A1:B2)', 0, -1)).toBe('SUM(#REF!)');
    expect(shiftFormula('XFD1+1', 0, 1)).toBe('#REF!+1');
    expect(shiftFormula('not a (formula', 1, 1)).toBe('not a (formula');
  });

  it('offsetReferences moves absolute parts too', () => {
    expect(offsetReferences('$F$1*B2', 1, 0)).toBe('$F$2*B3');
  });

  it('adjustFormula: rows', () => {
    const del = { kind: 'deleteRows', at: 2, count: 1 } as const;
    expect(adjustFormula('SUM(D2:D4)+B3', del)).toBe('SUM(D2:D3)+#REF!');
    expect(adjustFormula('B5', del)).toBe('B4');
    expect(adjustFormula('B2', del)).toBe('B2');
    expect(adjustFormula('SUM(B3:B3)', del)).toBe('SUM(#REF!)');
    expect(adjustFormula('SUM(B3:B6)', del)).toBe('SUM(B3:B5)');
    expect(adjustFormula('SUM(B1:B3)', { kind: 'deleteRows', at: 1, count: 5 })).toBe('SUM(B1:B1)');
    expect(adjustFormula('SUM(A:A)', del)).toBe('SUM(A:A)');
    const ins = { kind: 'insertRows', at: 2, count: 2 } as const;
    expect(adjustFormula('SUM(D2:D4)+B3+B1', ins)).toBe('SUM(D2:D6)+B5+B1');
    expect(adjustFormula('SUM(D3:D4)', ins)).toBe('SUM(D5:D6)');
    expect(adjustFormula('SUM(3:3)', ins)).toBe('SUM(5:5)');
  });

  it('adjustFormula: columns and moved cells', () => {
    expect(adjustFormula('A1+C1+SUM(B1:D1)', { kind: 'deleteColumns', at: 1, count: 1 })).toBe('A1+B1+SUM(B1:C1)');
    expect(adjustFormula('B1', { kind: 'deleteColumns', at: 1, count: 1 })).toBe('#REF!');
    expect(adjustFormula('A1+B1', { kind: 'insertColumns', at: 1, count: 1 })).toBe('A1+C1');
    const move = { kind: 'moveCells', from: { r1: 1, c1: 1, r2: 3, c2: 1 }, to: [1, 3] } as const;
    expect(adjustFormula('B2+SUM(B2:B4)+SUM(B1:B4)+A1', move)).toBe('D2+SUM(D2:D4)+SUM(B1:B4)+A1');
    expect(adjustFormula('SUM(B:B)', move)).toBe('SUM(B:B)');
  });
});
