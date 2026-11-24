import { describe, expect, it } from 'vitest';
import { formatFilterCondition, parseFilterInput } from '@guiexpert/table';

describe('parseFilterInput', () => {
  it('returns undefined for empty or whitespace input', () => {
    expect(parseFilterInput('', 'text')).toBeUndefined();
    expect(parseFilterInput('   ', 'number')).toBeUndefined();
  });

  it('parses text as contains', () => {
    expect(parseFilterInput('emea', 'text')).toEqual({ operator: 'contains', value: 'emea' });
  });

  it('parses number operators, ranges and locale numbers', () => {
    expect(parseFilterInput('>100', 'number', 'en-US')).toEqual({ operator: 'greaterThan', value: 100 });
    expect(parseFilterInput('<= 5.5', 'number', 'en-US')).toEqual({ operator: 'lessOrEqual', value: 5.5 });
    expect(parseFilterInput('>=0', 'number', 'en-US')).toEqual({ operator: 'greaterOrEqual', value: 0 });
    expect(parseFilterInput('< -10', 'number', 'en-US')).toEqual({ operator: 'lessThan', value: -10 });
    expect(parseFilterInput('=7', 'number', 'en-US')).toEqual({ operator: 'equals', value: 7 });
    expect(parseFilterInput('!= 3', 'number', 'en-US')).toEqual({ operator: 'notEquals', value: 3 });
    expect(parseFilterInput('<> 3', 'number', 'en-US')).toEqual({ operator: 'notEquals', value: 3 });
    expect(parseFilterInput('42', 'number', 'en-US')).toEqual({ operator: 'equals', value: 42 });
    expect(parseFilterInput('10..20', 'number', 'en-US')).toEqual({ operator: 'between', value: 10, valueTo: 20 });
    expect(parseFilterInput('1.234,50', 'number', 'de-DE')).toEqual({ operator: 'equals', value: 1234.5 });
    expect(parseFilterInput('1,5..10,5', 'number', 'de-DE')).toEqual({ operator: 'between', value: 1.5, valueTo: 10.5 });
    // incomplete / invalid input yields null (distinct from undefined = clear)
    expect(parseFilterInput('>', 'number', 'en-US')).toBeNull();
    expect(parseFilterInput('10..', 'number', 'en-US')).toBeNull();
    expect(parseFilterInput('abc', 'number', 'en-US')).toBeNull();
  });

  it('parses ISO and locale dates and date ranges', () => {
    expect(parseFilterInput('2026-05-10', 'date')).toEqual({ operator: 'equals', value: '2026-05-10' });
    expect(parseFilterInput('>2026-01-01', 'date')).toEqual({ operator: 'greaterThan', value: '2026-01-01' });
    expect(parseFilterInput('<= 2026-12-31', 'date')).toEqual({ operator: 'lessOrEqual', value: '2026-12-31' });
    expect(parseFilterInput('2026-01-01..2026-06-30', 'date')).toEqual({
      operator: 'between',
      value: '2026-01-01',
      valueTo: '2026-06-30',
    });
    expect(parseFilterInput('16.10.2026', 'date', 'de-DE')).toEqual({ operator: 'equals', value: '2026-10-16' });
    expect(parseFilterInput('> not-a-date', 'date')).toBeNull();
  });

  it('parses booleans', () => {
    expect(parseFilterInput('true', 'boolean')).toEqual({ operator: 'equals', value: true });
    expect(parseFilterInput('false', 'boolean')).toEqual({ operator: 'equals', value: false });
    expect(parseFilterInput('ja', 'boolean')).toEqual({ operator: 'equals', value: true });
    expect(parseFilterInput('nein', 'boolean')).toEqual({ operator: 'equals', value: false });
    expect(parseFilterInput('maybe', 'boolean')).toBeNull();
  });
});

describe('formatFilterCondition', () => {
  it('formats conditions back to concise filter-row text and shows count for value lists', () => {
    expect(formatFilterCondition({ condition: { operator: 'contains', value: 'emea' } })).toBe('emea');
    expect(formatFilterCondition({ condition: { operator: 'greaterThan', value: 40 } })).toBe('> 40');
    expect(formatFilterCondition({ condition: { operator: 'between', value: 10, valueTo: 20 } })).toBe('10..20');
    expect(formatFilterCondition({ condition: { operator: 'equals', value: 7 } })).toBe('= 7');
    expect(formatFilterCondition({ condition: { operator: 'blank' } })).toBe('""');
    expect(formatFilterCondition({ values: ['EMEA', 'APAC', 'AMER'] })).toBe('(3 values)');
    expect(formatFilterCondition(undefined)).toBe('');
  });
});

describe('filter-row text is what the parser understands (round trip)', () => {
  it('text shorthand: =x, !=x, <>x, ^start, end$, "" and !=""', () => {
    expect(parseFilterInput('=EMEA', 'text')).toEqual({ operator: 'equals', value: 'EMEA' });
    expect(parseFilterInput('!=EMEA', 'text')).toEqual({ operator: 'notEquals', value: 'EMEA' });
    expect(parseFilterInput('<> EMEA', 'text')).toEqual({ operator: 'notEquals', value: 'EMEA' });
    expect(parseFilterInput('^Ac', 'text')).toEqual({ operator: 'startsWith', value: 'Ac' });
    expect(parseFilterInput('GmbH$', 'text')).toEqual({ operator: 'endsWith', value: 'GmbH' });
    expect(parseFilterInput('""', 'text')).toEqual({ operator: 'blank' });
    expect(parseFilterInput('!=""', 'text')).toEqual({ operator: 'notBlank' });
    expect(parseFilterInput('""', 'number')).toEqual({ operator: 'blank' });
    expect(parseFilterInput('!=""', 'date')).toEqual({ operator: 'notBlank' });
    // a lone operator is incomplete, not a search for "="
    expect(parseFilterInput('=', 'text')).toBeNull();
    expect(parseFilterInput('^', 'text')).toBeNull();
    expect(parseFilterInput('$', 'text')).toBeNull();
  });

  it.each([
    ['text', { operator: 'contains', value: 'emea' }],
    ['text', { operator: 'equals', value: 'EMEA' }],
    ['text', { operator: 'notEquals', value: 'EMEA' }],
    ['text', { operator: 'startsWith', value: 'EM' }],
    ['text', { operator: 'endsWith', value: 'EA' }],
    ['text', { operator: 'blank' }],
    ['text', { operator: 'notBlank' }],
    ['number', { operator: 'blank' }],
    ['number', { operator: 'greaterThan', value: 1.5 }],
    ['number', { operator: 'between', value: -2.25, valueTo: 1234567.5 }],
    ['date', { operator: 'greaterOrEqual', value: '2026-01-01' }],
  ] as const)('%s %j: parse(format(condition)) is the condition again (en and de)', (type, condition) => {
    for (const locale of ['en-US', 'de-DE']) {
      const text = formatFilterCondition({ condition: { ...condition } }, undefined, locale);
      expect(parseFilterInput(text, type, locale), `${locale}: "${text}"`).toEqual(condition);
    }
  });

  it('formats numbers with the decimal separator of the locale', () => {
    expect(formatFilterCondition({ condition: { operator: 'greaterThan', value: 1.5 } }, undefined, 'de-DE')).toBe('> 1,5');
    expect(formatFilterCondition({ condition: { operator: 'greaterThan', value: 1.5 } }, undefined, 'en-US')).toBe('> 1.5');
  });
});

describe('date columns: months', () => {
  it('"2026-03" is the whole month, a range of months runs to the last day', () => {
    expect(parseFilterInput('2026-03', 'date')).toEqual({ operator: 'between', value: '2026-03-01', valueTo: '2026-03-31' });
    expect(parseFilterInput('2026-01..2026-02', 'date')).toEqual({ operator: 'between', value: '2026-01-01', valueTo: '2026-02-28' });
    expect(parseFilterInput('>2026-03', 'date')).toEqual({ operator: 'greaterThan', value: '2026-03-31' });
    expect(parseFilterInput('>=2026-03', 'date')).toEqual({ operator: 'greaterOrEqual', value: '2026-03-01' });
    expect(parseFilterInput('<2026-03', 'date')).toEqual({ operator: 'lessThan', value: '2026-03-01' });
    expect(parseFilterInput('<=2026-03', 'date')).toEqual({ operator: 'lessOrEqual', value: '2026-03-31' });
    expect(parseFilterInput('2026-13', 'date')).toBeNull();
  });
});
