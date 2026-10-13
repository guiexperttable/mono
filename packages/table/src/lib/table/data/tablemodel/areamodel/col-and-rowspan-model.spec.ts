import { describe, it, expect } from 'vitest';
import { AreaModel, AreaModelHidden, CellRange, ColAndRowspanModel, DefaultRowHeights, TableModel } from '@guiexpert/table';

/** 4 x 4 body: cell (0,0) spans 2 columns, cell (1,2) spans 3 rows, cell (2,0) spans 2 x 2. */
class SpanModel extends AreaModel {
  constructor(private readonly maxSpan = 3) {
    super();
  }

  override getRowCount(): number {
    return 4;
  }

  override getRowHeight(): number {
    return 20;
  }

  override getMaxColspan(): number {
    return this.maxSpan;
  }

  override getMaxRowspan(): number {
    return this.maxSpan;
  }

  override getColspanAt(r: number, c: number): number {
    if (r === 0 && c === 0) return 2;
    if (r === 2 && c === 0) return 2;
    return 0;
  }

  override getRowspanAt(r: number, c: number): number {
    if (r === 1 && c === 2) return 3;
    if (r === 2 && c === 0) return 2;
    return 1;
  }
}

class GammaSpanModel extends SpanModel {
  gammaCells = true;
}

const tableModelFor = (body: AreaModel) =>
  new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), [], [10, 10, 10, 10]);

describe('ColAndRowspanModel', () => {

  it('has no ranges before init()', () => {
    const body = new SpanModel();
    const model = new ColAndRowspanModel(tableModelFor(body), body);
    expect(model.getRanges()).toEqual([]);
    expect(model.isInRange(0, 1)).toBe(false);
  });

  it('collects one range per spanning cell (colspan/rowspan 0 counts as 1)', () => {
    const body = new SpanModel();
    const model = new ColAndRowspanModel(tableModelFor(body), body);
    model.init();
    expect(model.getRanges()).toEqual([
      new CellRange(0, 0, 0, 1),
      new CellRange(1, 2, 3, 2),
      new CellRange(2, 0, 3, 1),
    ]);
  });

  it('isInRange is true for every cell covered by a span', () => {
    const body = new SpanModel();
    const model = new ColAndRowspanModel(tableModelFor(body), body);
    model.init();
    expect(model.isInRange(0, 1)).toBe(true);
    expect(model.isInRange(3, 2)).toBe(true);
    expect(model.isInRange(3, 1)).toBe(true);
    expect(model.isInRange(0, 3)).toBe(false);
    expect(model.isInRange(1, 0)).toBe(false);
  });

  it('skips the scan if the area model allows no spans (max col- and rowspan < 2)', () => {
    const body = new SpanModel(1);
    const model = new ColAndRowspanModel(tableModelFor(body), body);
    model.init();
    expect(model.getRanges()).toEqual([]);
    expect(model.isInRange(0, 1)).toBe(false);
  });

  it('only scans the columns of the table model', () => {
    const body = new SpanModel();
    const tm = new TableModel(new AreaModelHidden(), body, new AreaModelHidden(), 0, 0, false, new DefaultRowHeights(), [], [10, 10]);
    const model = new ColAndRowspanModel(tm, body);
    model.init();
    expect(model.getRanges()).toEqual([new CellRange(0, 0, 0, 1), new CellRange(2, 0, 3, 1)]);
  });

  it('marks the ranges as gamma ranges for area models with a "gammaCells" field', () => {
    const body = new GammaSpanModel();
    const model = new ColAndRowspanModel(tableModelFor(body), body);
    model.init();
    expect(model.getRanges().every(r => r.gammaRange)).toBe(true);
  });
});
