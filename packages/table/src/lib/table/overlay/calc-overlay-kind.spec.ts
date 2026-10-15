// Which overlay the table shows (design 002 § 2.1 / § 2.5): manual overlays win, then "no matching rows",
// then "no rows to show"; rows in the body → none.
import { describe, expect, it } from 'vitest';
import { calcOverlayKind } from '@guiexpert/table';

describe('calcOverlayKind', () => {

  it('rows in the body and nothing requested → none', () => {
    expect(calcOverlayKind({ rowCount: 3, unfilteredRowCount: 3, autoNoRows: true })).toBe('none');
  });

  it('0 rows, nothing before the filter either → noRows', () => {
    expect(calcOverlayKind({ rowCount: 0, unfilteredRowCount: 0, autoNoRows: true })).toBe('noRows');
  });

  it('0 rows after the filter, rows before it → noMatches', () => {
    expect(calcOverlayKind({ rowCount: 0, unfilteredRowCount: 100, autoNoRows: true })).toBe('noMatches');
  });

  it('a model without getUnfilteredRowCount (undefined) → noRows, never a wrong "no matching rows"', () => {
    expect(calcOverlayKind({ rowCount: 0, autoNoRows: true })).toBe('noRows');
  });

  it('autoNoRows false → no automatic overlay', () => {
    expect(calcOverlayKind({ rowCount: 0, unfilteredRowCount: 0, autoNoRows: false })).toBe('none');
    expect(calcOverlayKind({ rowCount: 0, unfilteredRowCount: 5, autoNoRows: false })).toBe('none');
  });

  it('unknown row count (< 0, e.g. a server model) → none', () => {
    expect(calcOverlayKind({ rowCount: -1, autoNoRows: true })).toBe('none');
  });

  it('manual loading wins over everything (also over 0 rows)', () => {
    expect(calcOverlayKind({ manual: 'loading', rowCount: 0, unfilteredRowCount: 0, autoNoRows: true })).toBe('loading');
    expect(calcOverlayKind({ manual: 'loading', rowCount: 0, unfilteredRowCount: 7, autoNoRows: true })).toBe('loading');
    expect(calcOverlayKind({ manual: 'loading', rowCount: 9, autoNoRows: false })).toBe('loading');
  });

  it('manual noRows is shown even with rows and with autoNoRows false', () => {
    expect(calcOverlayKind({ manual: 'noRows', rowCount: 9, autoNoRows: false })).toBe('noRows');
  });
});
