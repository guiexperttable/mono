import { describe, expect, it } from 'vitest';
import {
  areColumnFiltersEqual,
  deserializeColumnFilters,
  normalizeColumnFilter,
  serializeColumnFilters,
  type ColumnFiltersMap,
} from '@guiexpert/table';

describe('column-filter-state', () => {
  it('normalizes empty filters to undefined and preserves empty values array', () => {
    expect(normalizeColumnFilter(undefined)).toBeUndefined();
    expect(normalizeColumnFilter({})).toBeUndefined();
    expect(normalizeColumnFilter({ values: [] })).toEqual({ values: [] });
  });

  it('serializes Date values to ISO strings and deserializes cleanly while ignoring unknown properties', () => {
    const input: ColumnFiltersMap = {
      created: { condition: { operator: 'greaterThan', value: new Date(2026, 4, 10) } },
      region: { values: ['EMEA', 'APAC'] },
      empty: {},
    };
    const serialized = serializeColumnFilters(input);
    expect(serialized['empty']).toBeUndefined();
    expect(typeof serialized['created'].condition?.value).toBe('string');
    expect(serialized['created'].condition?.value).toBe('2026-05-10');

    const json = JSON.parse(JSON.stringify(serialized)) as ColumnFiltersMap;
    const restored = deserializeColumnFilters(
      { ...json, unknownCol: { condition: { operator: 'contains', value: 'x' } } },
      new Set(['created', 'region']),
    );
    expect(restored).toEqual({
      created: { condition: { operator: 'greaterThan', value: '2026-05-10' } },
      region: { values: ['EMEA', 'APAC'] },
    });
  });

  it('compares filter maps structurally', () => {
    const a: ColumnFiltersMap = { region: { values: ['EMEA'] } };
    const b: ColumnFiltersMap = { region: { values: ['EMEA'] } };
    const c: ColumnFiltersMap = { region: { values: ['APAC'] } };
    expect(areColumnFiltersEqual(a, b)).toBe(true);
    expect(areColumnFiltersEqual(a, c)).toBe(false);
  });
});
