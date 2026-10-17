// Formula input helpers (prompt 013 stage 6) – DOM-free.
import { describe, expect, it } from 'vitest';
import { callAt, findReferences, functionPrefixAt, isInsertionPoint, signatureArguments, toggleAbsolute } from './formula-text';

describe('formula text', () => {
  it('findReferences: cells, ranges, whole columns/rows; not in strings, fields or function names', () => {
    const refs = findReferences('=SUM(B2:B4)+$c$1*"A1"+[a1]+LOG10(2)+A:A+3:3+XFD1048576+B2');
    expect(refs.map(r => r.text)).toEqual(['B2:B4', '$c$1', 'A:A', '3:3', 'XFD1048576', 'B2']);
    expect(refs[1]).toEqual({ start: 12, end: 16, text: '$c$1', key: 'C1' });
    expect(findReferences('B2')).toEqual([]);
    expect(findReferences('=AB12C+B2_x+1B2+B2.x+"unterminated B2').map(r => r.text)).toEqual([]);
    expect(findReferences('=A1:').map(r => r.text)).toEqual([]);
    expect(findReferences('=[unterminated B2').map(r => r.text)).toEqual([]);
    expect(findReferences('="a""b"+C3').map(r => r.text)).toEqual(['C3']);
  });

  it('isInsertionPoint: after = ( , ; and operators, not in strings or in front of a word', () => {
    expect(isInsertionPoint('=', 1)).toBe(true);
    expect(isInsertionPoint('=SUM(', 5)).toBe(true);
    expect(isInsertionPoint('=SUM(B2, ', 9)).toBe(true);
    expect(isInsertionPoint('=B2*', 4)).toBe(true);
    expect(isInsertionPoint('=B2', 3)).toBe(false);
    expect(isInsertionPoint('=B2:', 4)).toBe(false);
    expect(isInsertionPoint('="a', 3)).toBe(false);
    expect(isInsertionPoint('="a"&', 5)).toBe(true);
    expect(isInsertionPoint('=+B2', 2)).toBe(false);
    expect(isInsertionPoint('B2+', 3)).toBe(false);
    expect(isInsertionPoint('=', 0)).toBe(false);
    expect(isInsertionPoint('="', 2)).toBe(false);
  });

  it('toggleAbsolute: A1 → $A$1 → A$1 → $A1 → A1; ranges; whole columns', () => {
    const seq = ['B2', '$B$2', 'B$2', '$B2', 'B2'];
    for (let i = 0; i < 4; i++) expect(toggleAbsolute(seq[i])).toBe(seq[i + 1]);
    expect(toggleAbsolute('B2:B4')).toBe('$B$2:$B$4');
    expect(toggleAbsolute('$B$2:B4')).toBe('B$2:B$4');
    expect(toggleAbsolute('A:B')).toBe('$A:$B');
    expect(toggleAbsolute('$A:$B')).toBe('A:B');
    expect(toggleAbsolute('3:3')).toBe('$3:$3');
    expect(toggleAbsolute('x-1')).toBe('x-1');
  });

  it('functionPrefixAt and callAt', () => {
    expect(functionPrefixAt('=SU', 3)).toEqual({ start: 1, prefix: 'SU' });
    expect(functionPrefixAt('=1+if', 5)).toEqual({ start: 3, prefix: 'if' });
    expect(functionPrefixAt('=SU', 2)).toBeUndefined(); // in front of a letter
    expect(functionPrefixAt('=SUM(', 5)).toBeUndefined();
    expect(functionPrefixAt('=B2x', 4)).toEqual({ start: 1, prefix: 'B2x' }); // no function matches: no list
    expect(functionPrefixAt('="SU', 4)).toBeUndefined();
    expect(functionPrefixAt('=1', 2)).toBeUndefined();
    expect(callAt('=SUM(1,', 7)).toEqual({ name: 'SUM', argument: 1 });
    expect(callAt('=IF(A1>1,SUM(2;3),', 18)).toEqual({ name: 'IF', argument: 2 });
    expect(callAt('=IF(A1>1,SUM(2;3', 16)).toEqual({ name: 'SUM', argument: 1 });
    expect(callAt('=SUM("a,(b", ', 13)).toEqual({ name: 'SUM', argument: 1 });
    expect(callAt('=SUM("a,', 8)).toEqual({ name: 'SUM', argument: 0 });
    expect(callAt('=(1+2', 5)).toBeUndefined();
    expect(callAt('SUM(', 4)).toBeUndefined();
    expect(signatureArguments('SUM(number1, [number2], …)')).toEqual(['number1', '[number2]', '…']);
    expect(signatureArguments('NA()')).toEqual([]);
  });

  it('review: % is postfix, fields are literals, nested parentheses, invalid references', () => {
    expect(isInsertionPoint('=A1%', 4)).toBe(false);
    expect(isInsertionPoint('=[a+', 4)).toBe(false);
    expect(isInsertionPoint('=[a]+', 5)).toBe(true);
    expect(functionPrefixAt('=[a+SU', 6)).toBeUndefined();
    expect(callAt('=ROUND([a,b],', 13)).toEqual({ name: 'ROUND', argument: 1 });
    expect(callAt('=SUM([a,', 8)).toEqual({ name: 'SUM', argument: 0 });
    expect(callAt('=SUM((A1,', 9)).toEqual({ name: 'SUM', argument: 0 });
    expect(findReferences('=A0+XFE1+XFD1').map(r => r.text)).toEqual(['XFD1']);
  });
});
