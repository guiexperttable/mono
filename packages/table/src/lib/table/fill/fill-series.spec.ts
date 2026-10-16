// Series detection of the fill handle (prompt 010, H1–H4): numbers, dates, texts with a number, copy patterns.
import { describe, expect, it } from 'vitest';
import { CellRange, computeFillChanges, computeFillValues, getFillRange, isFillSeries } from '@guiexpert/table';

describe('computeFillValues – numbers', () => {

  it('H1: one number is copied', () => {
    expect(computeFillValues([5], 3)).toEqual([5, 5, 5]);
  });

  it('H1 with ⌥/Alt: one number counts up by 1 (down) or down by 1 (up)', () => {
    expect(computeFillValues([5], 3, false, 'alternate')).toEqual([6, 7, 8]);
    expect(computeFillValues([5], 2, true, 'alternate')).toEqual([4, 3]);
  });

  it('H2: two numbers continue as a linear series', () => {
    expect(computeFillValues([1, 2], 3)).toEqual([3, 4, 5]);
  });

  it('H2 with ⌥/Alt: the numbers are repeated', () => {
    expect(computeFillValues([1, 2], 3, false, 'alternate')).toEqual([1, 2, 1]);
  });

  it('negative steps, decimals without binary noise', () => {
    expect(computeFillValues([10, 7], 3)).toEqual([4, 1, -2]);
    expect(computeFillValues([0.1, 0.2], 2)).toEqual([0.3, 0.4]);
    expect(computeFillValues([1.5, 1.25], 2)).toEqual([1, 0.75]);
  });

  it('backward (up/left): the values in front of the source, nearest first', () => {
    expect(computeFillValues([1, 2], 3, true)).toEqual([0, -1, -2]);
    expect(computeFillValues(['A', 'B'], 3, true)).toEqual(['B', 'A', 'B']);
  });

  it('uneven steps follow the best-fit line (like a spreadsheet)', () => {
    // 1, 2, 4: slope 1.5, intercept 0.8333 → x = 3: 5.3333…
    const [a, b] = computeFillValues([1, 2, 4], 2) as number[];
    expect(a).toBeCloseTo(5.3333333, 6);
    expect(b).toBeCloseTo(6.8333333, 6);
    expect(computeFillValues([1, 2, 4], 1, true)[0]).toBeCloseTo(-0.6666667, 6);
  });

  it('numbers written as text stay texts (decimals kept)', () => {
    expect(computeFillValues(['1', '2'], 2)).toEqual(['3', '4']);
    expect(computeFillValues(['5'], 2)).toEqual(['5', '5']);
    expect(computeFillValues(['1.50', '1.75'], 1)).toEqual(['2.00']);
  });

  it('numbers written as text keep leading zeros; too big integers are repeated, never rounded', () => {
    expect(computeFillValues(['007', '008'], 2)).toEqual(['009', '010']);
    expect(computeFillValues(['099'], 1, false, 'alternate')).toEqual(['100']);
    expect(computeFillValues(['-01', '-02'], 1)).toEqual(['-03']);
    expect(computeFillValues(['01.5', '02.5'], 1)).toEqual(['03.5']);
    expect(computeFillValues(['12345678901234567890', '12345678901234567891'], 1)).toEqual(['12345678901234567890']);
  });

  it('NaN and Infinity are no numbers: copied', () => {
    expect(computeFillValues([NaN, 1], 2)).toEqual([NaN, 1]);
  });

  it('copy mode repeats everything', () => {
    expect(computeFillValues([1, 2], 3, false, 'copy')).toEqual([1, 2, 1]);
    expect(computeFillValues(['Item 1'], 2, false, 'copy')).toEqual(['Item 1', 'Item 1']);
  });

  it('nothing to fill', () => {
    expect(computeFillValues([1], 0)).toEqual([]);
    expect(computeFillValues([], 3)).toEqual([]);
  });
});

describe('computeFillValues – dates', () => {

  it('H3: an ISO date text counts up by one day and stays a text', () => {
    expect(computeFillValues(['2026-10-14'], 3)).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
    expect(computeFillValues(['2026-12-31'], 1)).toEqual(['2027-01-01']);
    expect(computeFillValues(['2026-10-14'], 1, true)).toEqual(['2026-10-13']);
  });

  it('H3 with ⌥/Alt: copied', () => {
    expect(computeFillValues(['2026-10-14'], 2, false, 'alternate')).toEqual(['2026-10-14', '2026-10-14']);
  });

  it('dates a week apart: step of 7 days', () => {
    expect(computeFillValues(['2026-10-01', '2026-10-08'], 2)).toEqual(['2026-10-15', '2026-10-22']);
  });

  it('dates a month apart: step of one month, the day is clamped at the month end', () => {
    expect(computeFillValues(['2026-01-15', '2026-02-15'], 2)).toEqual(['2026-03-15', '2026-04-15']);
    expect(computeFillValues(['2025-11-30', '2025-12-30'], 2)).toEqual(['2026-01-30', '2026-02-28']);
  });

  it('month ends stay month ends', () => {
    expect(computeFillValues(['2026-01-31', '2026-02-28'], 3)).toEqual(['2026-03-31', '2026-04-30', '2026-05-31']);
    expect(computeFillValues(['2026-01-31', '2026-02-28'], 1, true)).toEqual(['2025-12-31']);
  });

  it('years: twelve months', () => {
    expect(computeFillValues(['2024-02-29', '2025-02-28'], 1)).toEqual(['2026-02-28']);
    expect(computeFillValues(['2020-06-01', '2021-06-01'], 1)).toEqual(['2022-06-01']);
  });

  it('years below 100 stay what they are', () => {
    expect(computeFillValues(['0050-01-01'], 1)).toEqual(['0050-01-02']);
    expect(computeFillValues(['0050-01-31', '0050-02-28'], 1)).toEqual(['0050-03-31']);
  });

  it('an invalid ISO date is no date – but a text with a trailing number', () => {
    expect(computeFillValues(['2026-02-30'], 2)).toEqual(['2026-02-31', '2026-02-32']);
  });

  it('Date objects stay Dates: local calendar days, the time of day stays', () => {
    const [a, b] = computeFillValues([new Date(2026, 9, 14, 9, 30)], 2) as Date[];
    expect(a).toBeInstanceOf(Date);
    expect([a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes()]).toEqual([2026, 9, 15, 9, 30]);
    expect(b.getDate()).toBe(16);
    const [m] = computeFillValues([new Date(2026, 0, 31), new Date(2026, 1, 28)], 1) as Date[];
    expect([m.getMonth(), m.getDate()]).toEqual([2, 31]);
    const [back] = computeFillValues([new Date(2026, 0, 1)], 1, true) as Date[];
    expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([2025, 11, 31]);
  });
});

describe('computeFillValues – texts', () => {

  it('H4: a text with a trailing number counts up', () => {
    expect(computeFillValues(['Item 9'], 2)).toEqual(['Item 10', 'Item 11']);
  });

  it('two texts with the same prefix: step from the difference', () => {
    expect(computeFillValues(['Item 1', 'Item 3'], 2)).toEqual(['Item 5', 'Item 7']);
  });

  it('leading zeros keep the width', () => {
    expect(computeFillValues(['A007'], 2)).toEqual(['A008', 'A009']);
    expect(computeFillValues(['A099'], 1)).toEqual(['A100']);
  });

  it('below 0 the number counts up again', () => {
    expect(computeFillValues(['Item 1'], 3, true)).toEqual(['Item 0', 'Item 1', 'Item 2']);
  });

  it('different prefixes, a step that is no whole number: repeated', () => {
    expect(computeFillValues(['A1', 'B2'], 2)).toEqual(['A1', 'B2']);
    expect(computeFillValues(['Item 1', 'Item 2', 'Item 4'], 1)).toEqual(['Item 1']);
  });

  it('plain texts, booleans, empty and mixed values are repeated', () => {
    expect(computeFillValues(['A', 'B'], 4)).toEqual(['A', 'B', 'A', 'B']);
    expect(computeFillValues([true], 2)).toEqual([true, true]);
    expect(computeFillValues([null, ''], 3)).toEqual([null, '', null]);
    expect(computeFillValues([1, 'x'], 2)).toEqual([1, 'x']);
  });

  it('isFillSeries tells series from copies', () => {
    expect(isFillSeries([5])).toBe(false);
    expect(isFillSeries([5], 'alternate')).toBe(true);
    expect(isFillSeries([1, 2])).toBe(true);
    expect(isFillSeries([1, 2], 'copy')).toBe(false);
    expect(isFillSeries(['A'])).toBe(false);
    expect(isFillSeries([])).toBe(false);
  });
});

describe('computeFillChanges', () => {

  const grid: unknown[][] = [
    [1, 'A', '2026-10-14'],
    [2, 'B', '2026-10-15'],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const getValue = (r: number, c: number) => grid[r]?.[c];

  it('down: each column continues on its own', () => {
    const changes = computeFillChanges({ source: new CellRange(0, 0, 1, 2), direction: 'down', count: 2, getValue });
    expect(changes).toEqual([
      { rowIndex: 2, column: 0, value: 3 }, { rowIndex: 3, column: 0, value: 4 },
      { rowIndex: 2, column: 1, value: 'A' }, { rowIndex: 3, column: 1, value: 'B' },
      { rowIndex: 2, column: 2, value: '2026-10-16' }, { rowIndex: 3, column: 2, value: '2026-10-17' },
    ]);
  });

  it('right: each row continues on its own', () => {
    const values: unknown[][] = [[1, 2, 0, 0]];
    const changes = computeFillChanges({ source: new CellRange(0, 0, 0, 1), direction: 'right', count: 2,
      getValue: (r, c) => values[r][c] });
    expect(changes).toEqual([{ rowIndex: 0, column: 2, value: 3 }, { rowIndex: 0, column: 3, value: 4 }]);
  });

  it('up and left: in front of the source', () => {
    const values: unknown[][] = [[0, 0, 5, 6]];
    expect(computeFillChanges({ source: new CellRange(0, 2, 0, 3), direction: 'left', count: 2,
      getValue: (r, c) => values[r][c] })).toEqual([{ rowIndex: 0, column: 1, value: 4 }, { rowIndex: 0, column: 0, value: 3 }]);
    expect(computeFillChanges({ source: new CellRange(2, 0, 2, 0), direction: 'up', count: 1,
      getValue: () => 'Item 3' })).toEqual([{ rowIndex: 1, column: 0, value: 'Item 2' }]);
  });

  it('H5: not fillable cells are skipped, the series keeps counting', () => {
    const changes = computeFillChanges({ source: new CellRange(0, 0, 1, 0), direction: 'down', count: 2, getValue,
      isFillable: r => r !== 2 });
    expect(changes).toEqual([{ rowIndex: 3, column: 0, value: 4 }]);
  });

  it('mode copy (Ctrl/⌘+D)', () => {
    const changes = computeFillChanges({ source: new CellRange(0, 0, 1, 0), direction: 'down', count: 1, getValue, mode: 'copy' });
    expect(changes).toEqual([{ rowIndex: 2, column: 0, value: 1 }]);
  });

  it('an own fill function: undefined keeps the default, the context describes the cell', () => {
    const contexts: unknown[] = [];
    const changes = computeFillChanges({
      source: new CellRange(0, 0, 1, 1), direction: 'down', count: 1, getValue,
      getCellInfo: (r, c) => ({ row: grid[r], property: `p${c}` }),
      fillValue: ctx => {
        contexts.push({ ...ctx, row: undefined });
        return ctx.columnIndex === 1 ? `own ${ctx.step}` : undefined;
      },
    });
    expect(changes).toEqual([{ rowIndex: 2, column: 0, value: 3 }, { rowIndex: 2, column: 1, value: 'own 1' }]);
    expect(contexts[0]).toEqual({ sourceValues: [1, 2], step: 1, direction: 'down', rowIndex: 2, columnIndex: 0,
      property: 'p0', row: undefined, defaultValue: 3, copy: false });
    expect((contexts[1] as { copy: boolean }).copy).toBe(true);
  });

  it('without getCellInfo the context has no row and an empty property', () => {
    let seen: { row: unknown; property: string } | undefined;
    computeFillChanges({ source: new CellRange(0, 0, 0, 0), direction: 'down', count: 1, getValue,
      fillValue: ctx => { seen = { row: ctx.row, property: ctx.property }; return undefined; } });
    expect(seen).toEqual({ row: undefined, property: '' });
  });

  it('count 0: nothing', () => {
    expect(computeFillChanges({ source: new CellRange(0, 0, 0, 0), direction: 'down', count: 0, getValue })).toEqual([]);
  });

  it('getFillRange extends the source', () => {
    const src = new CellRange(2, 1, 3, 2);
    expect(getFillRange(src, 'down', 3)).toEqual(new CellRange(2, 1, 6, 2));
    expect(getFillRange(src, 'up', 2)).toEqual(new CellRange(0, 1, 3, 2));
    expect(getFillRange(src, 'right', 1)).toEqual(new CellRange(2, 1, 3, 3));
    expect(getFillRange(src, 'left', 1)).toEqual(new CellRange(2, 0, 3, 2));
  });
});
