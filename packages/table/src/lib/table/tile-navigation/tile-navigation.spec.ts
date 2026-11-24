import { describe, it, expect } from 'vitest';
import { cellToTileIndex, navigateTiles, tileIndexToCell } from '@guiexpert/table';
import type { TileNavigationAction } from '@guiexpert/table';

/** 5 items, 2 per row: [0 1] [2 3] [4 ·] */
const five = { count: 5, perRow: 2, pageRows: 1 };
const go = (index: number, action: TileNavigationAction, layout = five) => navigateTiles(index, action, layout);

describe('navigateTiles', () => {

  describe('previous / next (one sequence, wraps over the end of a row)', () => {
    it('next at the end of a row goes to the first tile of the next row', () => {
      expect(go(1, 'next')).toBe(2);
      expect(go(3, 'next')).toBe(4);
    });

    it('previous at the start of a row goes to the last tile of the row above', () => {
      expect(go(2, 'previous')).toBe(1);
      expect(go(4, 'previous')).toBe(3);
    });

    it('stays on the first and the last item (no wrap around the grid)', () => {
      expect(go(0, 'previous')).toBe(0);
      expect(go(4, 'next')).toBe(4);
    });
  });

  describe('up / down', () => {
    it('moves one row, same column', () => {
      expect(go(0, 'down')).toBe(2);
      expect(go(1, 'down')).toBe(3);
      expect(go(3, 'up')).toBe(1);
      expect(go(4, 'up')).toBe(2);
    });

    it('up in the first row stays', () => {
      expect(go(0, 'up')).toBe(0);
      expect(go(1, 'up')).toBe(1);
    });

    it('down without an item below goes to the last item of an incomplete last row', () => {
      expect(go(3, 'down')).toBe(4);
    });

    it('down in the last row stays', () => {
      expect(go(4, 'down')).toBe(4);
      expect(go(2, 'down', { count: 4, perRow: 2, pageRows: 1 })).toBe(2);
      expect(go(3, 'down', { count: 4, perRow: 2, pageRows: 1 })).toBe(3);
    });
  });

  describe('first / last', () => {
    it('go to the first and the last item', () => {
      expect(go(3, 'first')).toBe(0);
      expect(go(1, 'last')).toBe(4);
      expect(go(4, 'last')).toBe(4);
    });
  });

  describe('pageUp / pageDown', () => {
    /** 23 items, 5 per row: 5 rows, the last one with 3 items (20, 21, 22) */
    const grid = { count: 23, perRow: 5, pageRows: 2 };

    it('move pageRows rows, same column', () => {
      expect(go(1, 'pageDown', grid)).toBe(11);
      expect(go(13, 'pageUp', grid)).toBe(3);
    });

    it('pageUp beyond the start goes to the same column of the first row', () => {
      expect(go(8, 'pageUp', grid)).toBe(3);
      expect(go(3, 'pageUp', grid)).toBe(3);
    });

    it('pageDown beyond the end goes to the same column of the last row', () => {
      expect(go(11, 'pageDown', grid)).toBe(21);
      expect(go(16, 'pageDown', grid)).toBe(21);
      expect(go(21, 'pageDown', grid)).toBe(21);
    });

    it('pageDown beyond the end without an item in that column goes to the last item', () => {
      expect(go(14, 'pageDown', grid)).toBe(22);
      expect(go(19, 'pageDown', grid)).toBe(22);
    });

    it('a page has at least one row', () => {
      expect(go(0, 'pageDown', { count: 5, perRow: 2, pageRows: 0 })).toBe(2);
      expect(go(4, 'pageUp', { count: 5, perRow: 2, pageRows: -3 })).toBe(2);
    });
  });

  describe('edge cases', () => {
    const actions: TileNavigationAction[] = ['previous', 'next', 'up', 'down', 'first', 'last', 'pageUp', 'pageDown'];

    it('returns -1 without items', () => {
      for (const action of actions) {
        expect(navigateTiles(0, action, { count: 0, perRow: 3, pageRows: 2 })).toBe(-1);
        expect(navigateTiles(-1, action, { count: 0, perRow: 3, pageRows: 2 })).toBe(-1);
      }
    });

    it('without a focus (index -1) every move starts at the first visible item', () => {
      for (const action of ['previous', 'next', 'up', 'down', 'pageUp', 'pageDown'] as TileNavigationAction[]) {
        expect(navigateTiles(-1, action, { ...five, firstVisible: 2 })).toBe(2);
        expect(navigateTiles(-1, action, five)).toBe(0);
      }
      expect(navigateTiles(-1, 'first', { ...five, firstVisible: 2 })).toBe(0);
      expect(navigateTiles(-1, 'last', { ...five, firstVisible: 2 })).toBe(4);
    });

    it('an index behind the last item (an empty tile) is treated like no focus', () => {
      expect(navigateTiles(5, 'next', five)).toBe(0);
      expect(navigateTiles(99, 'down', { ...five, firstVisible: 9 })).toBe(4);
    });

    it('one tile per row behaves like a list', () => {
      const list = { count: 4, perRow: 1, pageRows: 2 };
      expect(go(1, 'next', list)).toBe(2);
      expect(go(1, 'down', list)).toBe(2);
      expect(go(3, 'down', list)).toBe(3);
      expect(go(0, 'pageDown', list)).toBe(2);
      expect(go(2, 'pageDown', list)).toBe(3);
    });

    it('treats perRow < 1 as 1', () => {
      expect(go(1, 'down', { count: 4, perRow: 0, pageRows: 1 })).toBe(2);
    });

    it('never returns an index outside the items', () => {
      for (const count of [1, 2, 5, 6, 7]) {
        for (const perRow of [1, 2, 3, 4]) {
          for (let index = -1; index <= count; index++) {
            for (const action of actions) {
              const target = navigateTiles(index, action, { count, perRow, pageRows: 2 });
              expect(target).toBeGreaterThanOrEqual(0);
              expect(target).toBeLessThan(count);
            }
          }
        }
      }
    });

    it('works with a million items', () => {
      const big = { count: 1_000_003, perRow: 7, pageRows: 4 };
      expect(go(500_000, 'next', big)).toBe(500_001);
      expect(go(500_000, 'down', big)).toBe(500_007);
      expect(go(500_000, 'pageDown', big)).toBe(500_028);
      expect(go(0, 'last', big)).toBe(1_000_002);
    });
  });
});

describe('tileIndexToCell / cellToTileIndex', () => {
  it('map an index to row and column and back', () => {
    expect(tileIndexToCell(0, 3)).toEqual([0, 0]);
    expect(tileIndexToCell(4, 3)).toEqual([1, 1]);
    expect(tileIndexToCell(5, 3)).toEqual([1, 2]);
    expect(cellToTileIndex(1, 1, 3)).toBe(4);
    expect(cellToTileIndex(2, 0, 3)).toBe(6);
  });

  it('a column outside the row or a negative cell is no tile', () => {
    expect(cellToTileIndex(1, 3, 3)).toBe(-1);
    expect(cellToTileIndex(-1, 0, 3)).toBe(-1);
    expect(cellToTileIndex(0, -1, 3)).toBe(-1);
  });

  it('treat perRow < 1 as 1', () => {
    expect(tileIndexToCell(2, 0)).toEqual([2, 0]);
    expect(cellToTileIndex(2, 0, 0)).toBe(2);
  });

  it('a negative index is no cell', () => {
    expect(tileIndexToCell(-1, 3)).toEqual([-1, -1]);
  });
});
