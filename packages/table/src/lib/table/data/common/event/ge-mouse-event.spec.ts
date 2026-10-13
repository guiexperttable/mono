import { describe, it, expect } from 'vitest';
import { GeMouseEvent } from '@guiexpert/table';

describe('GeMouseEvent', () => {
  it('has "nothing hit" defaults', () => {
    const e = new GeMouseEvent();
    expect([e.rowIndex, e.rowTop, e.columnIndex, e.columnLeft]).toEqual([-1, -1, -1, -1]);
    expect(e.areaIdent).toBeUndefined();
    expect(e.sideIdent).toBeUndefined();
    expect(e.originalEvent).toBeUndefined();
    expect([e.clickCount, e.draggingX, e.draggingY]).toEqual([0, 0, 0]);
    expect(e.action).toBe('');
  });

  it('clone() copies every field into a new instance', () => {
    const original = { type: 'click' } as unknown as MouseEvent;
    const e = new GeMouseEvent(3, 102, 2, 300, 'body', 'center', original, 2, 5, -7, 'toggleHeaderGroup');
    const c = e.clone();
    expect(c).not.toBe(e);
    expect(c).toBeInstanceOf(GeMouseEvent);
    expect(c).toEqual(e);
    expect(c.originalEvent).toBe(original);
  });

  it('a clone is independent of the original', () => {
    const e = new GeMouseEvent(1);
    const c = e.clone();
    c.rowIndex = 9;
    expect(e.rowIndex).toBe(1);
  });
});
