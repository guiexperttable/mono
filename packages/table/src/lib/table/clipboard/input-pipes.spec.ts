import { describe, expect, it } from 'vitest';
import { booleanInputPipe, createDateInputPipe, createNumberInputPipe, sheetInputPipe } from './input-pipes';

const p = (pipe: (v: unknown, r: number, c: number) => unknown, v: unknown) => pipe(v, 0, 0);

describe('createNumberInputPipe', () => {
  const de = createNumberInputPipe('de-DE');
  const en = createNumberInputPipe('en-US');
  it.each([
    [de, '1.234,56', 1234.56],
    [de, '1234,5', 1234.5],
    [de, '-1.000', -1000],
    [de, '12 %', 0.12],
    [de, '€ 9,90', 9.9],
    [de, '9,90 €', 9.9],
    [de, '9,90 EUR', 9.9],
    [de, '(5)', -5],
    [de, '-€ 5', -5],
    [de, '1.5', '1.5'],        // no number in de-DE (the dot is the group separator)
    [en, '1,234.56', 1234.56],
    [en, '1e3', 1000],
    [en, '+7', 7],
    [en, '.5', 0.5],
    [en, '1,5', '1,5'],
    [en, '', ''],
    [en, '  ', ''],
    [en, 'Room 101', 'Room 101'],
    [en, 'SKU 123', 'SKU 123'],      // three capitals that are no currency
    [en, 'ISO 9001', 'ISO 9001'],
    [en, 'BMW320', 'BMW320'],
    [en, '+49 123', '+49 123'],      // a space groups only in locales that group with spaces
    [en, '(-5)', '(-5)'],
    [en, 'USD 12', 12],
    [en, '\u22125', -5],             // U+2212 minus (Intl in sv, fi, nb)
    [en, 'abc', 'abc'],
    [en, 42, 42],
    [en, null, null],
  ])('%#: %j', (pipe, input, out) => {
    expect(p(pipe, input)).toBe(out);
  });

  it('French: narrow no-break space as group separator', () => {
    expect(p(createNumberInputPipe('fr-FR'), '1 234,5')).toBe(1234.5);
  });

  it('unknown locale falls back to . and ,', () => {
    expect(p(createNumberInputPipe('xx-invalid-locale-$$'), '1,234.5')).toBe(1234.5);
  });
});

describe('createDateInputPipe', () => {
  it('ISO and the short date of the locale', () => {
    expect(p(createDateInputPipe('de-DE'), '2026-10-16')).toEqual(new Date(2026, 9, 16));
    expect(p(createDateInputPipe('de-DE'), '2026-10-16T08:30')).toEqual(new Date(2026, 9, 16, 8, 30));
    expect(p(createDateInputPipe('de-DE'), '16.10.2026')).toEqual(new Date(2026, 9, 16));
    expect(p(createDateInputPipe('de-DE'), '16.10.26')).toEqual(new Date(2026, 9, 16));
    expect(p(createDateInputPipe('en-US'), '10/16/2026')).toEqual(new Date(2026, 9, 16));
    expect(p(createDateInputPipe('en-US'), '10/16/2026, 14:05')).toEqual(new Date(2026, 9, 16, 14, 5));
  });

  it('no date: unchanged; empty: ""; a Date passes', () => {
    const pipe = createDateInputPipe('en-US');
    expect(p(pipe, '2026-02-30')).toBe('2026-02-30');
    expect(p(pipe, 'soon')).toBe('soon');
    expect(p(pipe, '1.2.3')).toBe('1.2.3');    // a version number
    expect(p(pipe, '1-2-3')).toBe('1-2-3');
    expect(p(pipe, '1/2/2026.5')).toBe('1/2/2026.5');
    expect(p(createDateInputPipe('de-DE'), '1.2/2026')).toBe('1.2/2026'); // mixed separators
    expect(p(pipe, ' ')).toBe('');
    const d = new Date();
    expect(p(pipe, d)).toBe(d);
    expect(p(createDateInputPipe('xx-invalid-locale-$$'), '10/16/2026')).toEqual(new Date(2026, 9, 16));
  });
});

describe('booleanInputPipe', () => {
  it.each([
    ['TRUE', true], ['yes', true], ['1', true], ['x', true], ['WAHR', true], ['ja', true],
    ['false', false], ['No', false], ['0', false], ['FALSCH', false], ['nein', false],
    ['', ''], ['maybe', 'maybe'], [true, true],
  ])('%j', (input, out) => {
    expect(p(booleanInputPipe, input)).toBe(out);
  });
});

describe('sheetInputPipe', () => {
  const pipe = sheetInputPipe('en-US');
  it.each([
    ['42', 42], ['1,234.5', 1234.5], ['50%', 0.5], ['$3', 3], ['TRUE', true], ['false', false],
    ['=A1*2', '=A1*2'], ["'=A1", "'=A1"], ["'42", '42'], ['', ''], ['hello', 'hello'], [7, 7],
  ])('%j', (input, out) => {
    expect(p(pipe, input)).toBe(out);
  });
  it('dates', () => {
    expect(p(pipe, '2026-10-16')).toEqual(new Date(2026, 9, 16));
    expect(p(pipe, '10/16/2026')).toEqual(new Date(2026, 9, 16));
  });
});
