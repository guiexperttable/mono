// Batch edit without DOM (prompt 010, B1, B5, B8): pending values per row object, back to the old value, options,
// events and texts.
import { describe, expect, it } from 'vitest';
import {
  AriaTexts,
  BatchEditOptions,
  FillHandleOptions,
  GeBatchEditEvent,
  GeModelChangeEvent,
  PendingCellChanges,
  isSameCellValue,
} from '@guiexpert/table';
import type { CellChangeIf } from '@guiexpert/table';

describe('PendingCellChanges', () => {

  it('B1: keeps a value per row object and property', () => {
    const pending = new PendingCellChanges();
    const a = { price: 10 };
    const b = { price: 20 };
    expect(pending.set(a, 'price', 10, 12, '12')).toBe('added');
    expect(pending.set(b, 'price', 20, 25, '25')).toBe('added');
    expect(pending.size()).toBe(2);
    expect(pending.get(a, 'price')).toEqual({ rowKey: a, property: 'price', oldValue: 10, newValue: 12, rawValue: '12', error: undefined });
    expect(pending.get(a, 'name')).toBeUndefined();
    expect(pending.hasRow(b)).toBe(true);
    expect(pending.entries().map(e => e.newValue)).toEqual([12, 25]);
  });

  it('B5: the key is the object – equal-looking rows are different rows', () => {
    const pending = new PendingCellChanges();
    pending.set({ id: 1 }, 'x', 1, 2, 2);
    expect(pending.get({ id: 1 }, 'x')).toBeUndefined();
  });

  it('B8: the old value of the first change stays; back to it removes the entry', () => {
    const pending = new PendingCellChanges();
    const row = { price: 10 };
    pending.set(row, 'price', 10, 20, '20');
    expect(pending.set(row, 'price', 20, 30, '30')).toBe('changed');
    expect(pending.get(row, 'price')!.oldValue).toBe(10);
    expect(pending.set(row, 'price', 30, 10, '10')).toBe('removed');
    expect(pending.isEmpty()).toBe(true);
    expect(pending.hasRow(row)).toBe(false);
    expect(pending.set(row, 'price', 10, 10, '10')).toBe('unchanged');
  });

  it('counts invalid values and clears', () => {
    const pending = new PendingCellChanges();
    pending.set(1, 'a', 0, 1, 1, 'bad');
    pending.set(1, 'b', 0, 2, 2);
    pending.set(2, 'a', 0, 3, 3, '');
    expect(pending.invalidCount()).toBe(1);
    expect(pending.get(2, 'a')!.error).toBeUndefined();
    pending.clear();
    expect(pending.size()).toBe(0);
    expect(pending.get(1, 'a')).toBeUndefined();
  });
});

describe('isSameCellValue', () => {

  it('compares like a cell editor', () => {
    expect(isSameCellValue(5, 5)).toBe(true);
    expect(isSameCellValue(NaN, NaN)).toBe(true);
    expect(isSameCellValue(5, '5')).toBe(true);
    expect(isSameCellValue('5', 5)).toBe(true);
    expect(isSameCellValue(5, '5.0')).toBe(false);
    expect(isSameCellValue(undefined, '')).toBe(true);
    expect(isSameCellValue(null, undefined)).toBe(true);
    expect(isSameCellValue('', 0)).toBe(false);
    expect(isSameCellValue(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(true);
    expect(isSameCellValue(new Date(NaN), new Date(NaN))).toBe(true);
    expect(isSameCellValue(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
    expect(isSameCellValue('a', 'b')).toBe(false);
    expect(isSameCellValue({}, {})).toBe(false);
  });
});

describe('options, events, texts', () => {

  it('FillHandleOptions.create', () => {
    expect(FillHandleOptions.create(undefined)).toBeUndefined();
    expect(FillHandleOptions.create(false)).toBeUndefined();
    expect(FillHandleOptions.create(true)).toMatchObject({ direction: 'both', maxCells: 100_000, dragThresholdInPx: 3 });
    expect(FillHandleOptions.create({ direction: 'vertical', maxCells: undefined })).toMatchObject({ direction: 'vertical', maxCells: 100_000 });
  });

  it('BatchEditOptions.create', () => {
    expect(BatchEditOptions.create(true).blockCommitOnInvalid).toBe(true);
    expect(BatchEditOptions.create(undefined).blockCommitOnInvalid).toBe(true);
    expect(BatchEditOptions.create({ blockCommitOnInvalid: false }).blockCommitOnInvalid).toBe(false);
  });

  it('GeBatchEditEvent computes the pending changes when read', () => {
    let calls = 0;
    const evt = new GeBatchEditEvent('change', [], 2, 1, () => { calls++; return []; });
    expect(calls).toBe(0);
    expect(evt.pendingChanges).toEqual([]);
    expect(calls).toBe(1);
    expect(new GeBatchEditEvent('start', [], 0, 0).pendingChanges).toEqual([]);
  });

  it('GeModelChangeEvent.createForChanges: cells from the changes', () => {
    const changes: CellChangeIf[] = [
      { row: {}, rowIndex: 3, columnIndex: 1, property: 'a', oldValue: 1, newValue: 2 },
      { row: {}, rowIndex: 4, columnIndex: 1, property: 'a', oldValue: 1, newValue: 3 },
    ];
    const evt = GeModelChangeEvent.createForChanges(changes, 'fill');
    expect(evt.cells.map(c => [c.rowIndex, c.columnIndex])).toEqual([[3, 1], [4, 1]]);
    expect(evt.changes).toBe(changes);
    expect(evt.source).toBe('fill');
    expect(GeModelChangeEvent.createSingle(1, 2).changes).toBeUndefined();
  });

  it('English default texts with singular and plural', () => {
    const t = new AriaTexts();
    expect([t.cellsFilled(1), t.cellsFilled(3)]).toEqual(['1 cell filled', '3 cells filled']);
    expect(t.fillTooLarge(10)).toBe('Too many cells to fill (at most 10)');
    expect([t.pendingChanges(0), t.pendingChanges(1), t.pendingChanges(2)])
      .toEqual(['No unsaved changes', '1 change not saved', '2 changes not saved']);
    expect([t.changesCommitted(1), t.changesCommitted(2)]).toEqual(['1 change saved', '2 changes saved']);
    expect(t.changesDiscarded()).toBe('Changes discarded');
    expect([t.commitBlocked(1), t.commitBlocked(2)]).toEqual(['1 invalid value – nothing saved', '2 invalid values – nothing saved']);
    expect([t.invalidValue('x'), t.invalidValue('')]).toEqual(['Invalid value: x', 'Invalid value']);
  });
});
