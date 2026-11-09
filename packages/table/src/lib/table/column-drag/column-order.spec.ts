// Prompt 022: DOM-free order rules of a column drag – locked columns are fixed places, a column stays in its area.
import { describe, expect, it } from 'vitest';
import { clampToColumnArea, orderKeepingLocked, planColumnMove } from './column-order';

/** Applies the moves like TableModel.changeColumnOrder (remove at from, insert at to). */
function apply<T>(items: T[], moves: [number, number][]): T[] {
  const ret = [...items];
  for (const [from, to] of moves) {
    const [item] = ret.splice(from, 1);
    ret.splice(to, 0, item);
  }
  return ret;
}

const ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'];

function move(locked: string[], from: number, to: number): string[] | undefined {
  const moves = planColumnMove(ITEMS.map(p => !locked.includes(p)), from, to);
  return moves && apply(ITEMS, moves);
}

describe('planColumnMove', () => {

  it('without locked columns: one move, like changeColumnOrder', () => {
    expect(planColumnMove([true, true, true, true], 0, 3)).toEqual([[0, 3]]);
    expect(move([], 0, 3)).toEqual(['b', 'c', 'd', 'a', 'e', 'f']);
    expect(move([], 4, 1)).toEqual(['a', 'e', 'b', 'c', 'd', 'f']);
  });

  it('same index: no moves', () => {
    expect(planColumnMove([true, true], 1, 1)).toEqual([]);
  });

  it('a locked target or a locked source: undefined (no move)', () => {
    expect(planColumnMove([true, false, true], 0, 1)).toBeUndefined();
    expect(planColumnMove([true, false, true], 1, 2)).toBeUndefined();
  });

  it('out of range: undefined', () => {
    expect(planColumnMove([true, true], -1, 1)).toBeUndefined();
    expect(planColumnMove([true, true], 0, 2)).toBeUndefined();
  });

  it('moving to the right past locked columns keeps them in their place', () => {
    expect(move(['c'], 0, 4)).toEqual(['b', 'd', 'c', 'e', 'a', 'f']);
    expect(move(['c', 'd'], 0, 5)).toEqual(['b', 'e', 'c', 'd', 'f', 'a']);
    expect(move(['b', 'd'], 0, 4)).toEqual(['c', 'b', 'e', 'd', 'a', 'f']);
  });

  it('moving to the left past locked columns keeps them in their place', () => {
    expect(move(['c'], 4, 0)).toEqual(['e', 'a', 'c', 'b', 'd', 'f']);
    expect(move(['c', 'd'], 5, 1)).toEqual(['a', 'f', 'c', 'd', 'b', 'e']);
    expect(move(['b', 'd'], 5, 0)).toEqual(['f', 'b', 'a', 'd', 'c', 'e']);
  });

  it('locked columns outside the moved range: one move', () => {
    expect(planColumnMove([false, true, true, true, false], 1, 3)).toEqual([[1, 3]]);
  });

  it('every locked column stays and the movable ones keep their relative order (all pairs)', () => {
    const lockedSets = [[], ['a'], ['c'], ['f'], ['b', 'c'], ['a', 'c', 'e'], ['b', 'e']];
    for (const locked of lockedSets) {
      for (let from = 0; from < ITEMS.length; from++) {
        for (let to = 0; to < ITEMS.length; to++) {
          const result = move(locked, from, to);
          if (locked.includes(ITEMS[from]) || locked.includes(ITEMS[to])) {
            expect(result).toBeUndefined();
            continue;
          }
          locked.forEach(p => expect(result!.indexOf(p)).toBe(ITEMS.indexOf(p)));
          expect(result!.indexOf(ITEMS[from])).toBe(to);
          const movable = (list: string[]) => list.filter(p => !locked.includes(p) && p !== ITEMS[from]);
          expect(movable(result!)).toEqual(movable(ITEMS));
        }
      }
    }
  });
});

describe('clampToColumnArea', () => {
  // 7 columns: 0, 1 west | 2, 3, 4 center | 5, 6 east
  const clamp = (from: number, to: number) => clampToColumnArea(from, to, 7, 2, 2);

  it('within the area: unchanged', () => {
    expect(clamp(2, 4)).toBe(4);
    expect(clamp(0, 1)).toBe(1);
    expect(clamp(6, 5)).toBe(5);
  });

  it('a center column stays in the center', () => {
    expect(clamp(3, 0)).toBe(2);
    expect(clamp(3, 6)).toBe(4);
  });

  it('a west column stays west, an east column east', () => {
    expect(clamp(1, 4)).toBe(1);
    expect(clamp(5, 0)).toBe(5);
  });

  it('without fixed columns: the whole range', () => {
    expect(clampToColumnArea(0, 6, 7, 0, 0)).toBe(6);
    expect(clampToColumnArea(0, 9, 7, 0, 0)).toBe(6);
    expect(clampToColumnArea(3, -2, 7, 0, 0)).toBe(0);
  });
});

describe('orderKeepingLocked', () => {

  it('locked properties keep their current index, the others follow the target order', () => {
    expect(orderKeepingLocked(['e', 'c', 'd', 'a', 'b'], ['a', 'b', 'c', 'd', 'e'], new Set(['a', 'c'])))
      .toEqual(['a', 'e', 'c', 'd', 'b']);
  });

  it('without locked properties: the target order', () => {
    expect(orderKeepingLocked(['b', 'a'], ['a', 'b'], new Set())).toEqual(['b', 'a']);
  });

  it('a locked property beyond the end of the target is appended', () => {
    expect(orderKeepingLocked(['b'], ['b', 'x', 'y'], new Set(['y']))).toEqual(['b', 'y']);
  });
});
