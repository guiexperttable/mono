import { describe, expect, it } from 'vitest';
import { AriaTexts } from '@guiexpert/table';
import type { AriaTextsIf, SortState } from '@guiexpert/table';

describe('AriaTexts', () => {

  const texts: AriaTextsIf = new AriaTexts();

  it('announces sorting with the column label and the direction', () => {
    expect(texts.sorted('Total', 'asc')).toBe('Sorted by Total, ascending');
    expect(texts.sorted('Total', 'desc')).toBe('Sorted by Total, descending');
    expect(texts.sorted('Total', '')).toBe('Sorting of Total removed');
  });

  it('announces the filter result with singular and plural', () => {
    expect(texts.filtered(0)).toBe('No rows');
    expect(texts.filtered(1)).toBe('1 row');
    expect(texts.filtered(42)).toBe('42 rows');
  });

  it('announces copied cells with singular and plural', () => {
    expect(texts.copied(1)).toBe('1 cell copied');
    expect(texts.copied(12)).toBe('12 cells copied');
  });

  it('has texts for select all, clear, row checkboxes and header groups', () => {
    expect(texts.allSelected()).toBe('All cells selected');
    expect(texts.selectionCleared()).toBe('Selection cleared');
    expect(texts.selectRow(5)).toBe('Select row 5');
    expect(texts.selectAllRows()).toBe('Select all rows');
    expect(texts.expandGroup('Q1')).toBe('Expand group Q1');
    expect(texts.collapseGroup('Q1')).toBe('Collapse group Q1');
    expect(texts.expandGroup('')).toBe('Expand group');
    expect(texts.collapseGroup('')).toBe('Collapse group');
  });

  it('create() replaces only the given functions', () => {
    const german = AriaTexts.create({
      filtered: (n: number) => `${n} Zeilen`,
      sorted: (column: string, state: SortState) => `${column}: ${state || 'unsortiert'}`,
    });
    expect(german.filtered(3)).toBe('3 Zeilen');
    expect(german.sorted('Summe', '')).toBe('Summe: unsortiert');
    expect(german.copied(2)).toBe('2 cells copied'); // default kept
  });

  it('create() ignores missing or non-function entries', () => {
    expect(AriaTexts.create().filtered(2)).toBe('2 rows');
    expect(AriaTexts.create(undefined).copied(1)).toBe('1 cell copied');
    const texts = AriaTexts.create({ filtered: undefined } as Partial<AriaTextsIf>);
    expect(texts.filtered(2)).toBe('2 rows');
  });

  it('create() returns a new object each time (no shared state between tables)', () => {
    const a = AriaTexts.create({ copied: () => 'a' });
    const b = AriaTexts.create();
    expect(a.copied(1)).toBe('a');
    expect(b.copied(1)).toBe('1 cell copied');
  });
});
