import { describe, it, expect } from 'vitest';
import { GeCellIndices, GeModelChangeEvent } from '@guiexpert/table';

describe('GeModelChangeEvent', () => {
  it('holds the changed cells', () => {
    const cells = [new GeCellIndices(1, 2), new GeCellIndices(3, 4)];
    expect(new GeModelChangeEvent(cells).cells).toBe(cells);
  });

  it('createSingle creates an event for one cell', () => {
    const e = GeModelChangeEvent.createSingle(5, 6);
    expect(e.cells).toEqual([new GeCellIndices(5, 6)]);
    expect(e.cells[0]).toBeInstanceOf(GeCellIndices);
  });
});

describe('GeCellIndices', () => {
  it('defaults to -1 / -1', () => {
    const c = new GeCellIndices();
    expect([c.rowIndex, c.columnIndex]).toEqual([-1, -1]);
  });
});
