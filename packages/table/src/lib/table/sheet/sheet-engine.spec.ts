import { describe, expect, it } from 'vitest';
import { FormulaError, SheetEngine, isFormulaError } from '@guiexpert/table';

/** The sheet of the reference cases (row 1 = header as data, like Excel). */
function sheet(): unknown[][] {
  return [
    ['Product', 'Price', 'Qty', 'Total'],
    ['Laptop', 1299, 2, '=B2*C2'],
    ['Monitor', 349, 3, '=B3*C3'],
    ['Mouse', 25, 10, '=B4*C4'],
    [null, null, null, '=SUM(D2:D4)'],
  ];
}

const code = (v: unknown) => (isFormulaError(v) ? v.code : v);

describe('SheetEngine – reference cases', () => {

  it('S1, S2: products and the sum', () => {
    const e = SheetEngine.fromArrays(sheet());
    expect([e.getValue(1, 3), e.getValue(2, 3), e.getValue(3, 3), e.getValue(4, 3)]).toEqual([2598, 1047, 250, 3895]);
    expect(e.isFormula(1, 3)).toBe(true);
    expect(e.isFormula(1, 1)).toBe(false);
    expect(e.getFormulaCount()).toBe(4);
  });

  it('S3: B4 → 30: only D4 and D5 are recalculated', () => {
    const data = sheet();
    const e = SheetEngine.fromArrays(data);
    data[3][2] = 30;
    const r = e.inputsChanged([[3, 2]]);
    expect([e.getValue(3, 3), e.getValue(4, 3)]).toEqual([750, 4395]);
    expect(r.evaluated).toBe(2);
    expect(r.changedCells).toEqual([[3, 3], [4, 3]]);
  });

  it('S4: #DIV/0!, #NAME?, #VALUE!, #ERROR!', () => {
    const e = SheetEngine.fromArrays([[10, '=A1/0', '=FOO(1)', '=A1+"x"', '=SUM(']]);
    expect([code(e.getValue(0, 1)), code(e.getValue(0, 2)), code(e.getValue(0, 3)), code(e.getValue(0, 4))])
      .toEqual(['#DIV/0!', '#NAME?', '#VALUE!', '#ERROR!']);
  });

  it('S5: a cycle is #CIRC!; resolving it calculates again; cells behind a cycle inherit the error', () => {
    const data: unknown[][] = [['=B1', '=A1', '=A1+1', '=C1*2', '=E1']];
    const e = SheetEngine.fromArrays(data);
    expect([0, 1, 2, 3, 4].map(c => code(e.getValue(0, c)))).toEqual(['#CIRC!', '#CIRC!', '#CIRC!', '#CIRC!', '#CIRC!']);
    data[0][1] = 5;
    e.inputsChanged([[0, 1]]);
    expect([0, 1, 2, 3].map(c => e.getValue(0, c))).toEqual([5, 5, 6, 12]);
    expect(code(e.getValue(0, 4))).toBe('#CIRC!'); // self reference
  });

  it('S17: VLOOKUP and SUMIF with wildcard', () => {
    const data = sheet();
    data.push([null, null, null, '=VLOOKUP("Mouse",A2:C4,2,FALSE)', '=SUMIF(A2:A4,"M*",D2:D4)']);
    const e = SheetEngine.fromArrays(data);
    expect([e.getValue(5, 3), e.getValue(5, 4)]).toEqual([25, 1297]);
  });

  it('S19: volatile functions are recomputed on recalculate()', () => {
    let t = new Date(2026, 9, 16, 12, 0);
    let rnd = 0.25;
    const e = new SheetEngine({ getRowCount: () => 1, getColumnCount: () => 4, getInput: (_r, c) => ['=TODAY()', '=NOW()', '=RAND()', '=A1+1'][c] },
      { now: () => t, random: () => rnd });
    e.rebuild();
    expect(e.getValue(0, 0)).toEqual(new Date(2026, 9, 16));
    expect(e.getValue(0, 2)).toBe(0.25);
    t = new Date(2026, 9, 17, 8, 30);
    rnd = 0.5;
    const r = e.recalculate();
    expect(e.getValue(0, 1)).toEqual(new Date(2026, 9, 17, 8, 30));
    expect(e.getValue(0, 3)).toEqual(new Date(2026, 9, 18));
    expect(e.getValue(0, 2)).toBe(0.5);
    expect(r.evaluated).toBe(4);
  });

  it('S21: no code from formulas; a huge range is capped', () => {
    const e = SheetEngine.fromArrays([['=constructor', '=__proto__', '=A1.constructor', '=SUM(A2:XFD1048576)', '=toString()'], [1]], { maxRangeCells: 10_000 });
    expect([0, 1, 2, 3, 4].map(c => code(e.getValue(0, c)))).toEqual(['#NAME?', '#NAME?', '#NAME?', '#ERROR!', '#NAME?']);
  });

  it('S25: text with HTML stays text', () => {
    const e = SheetEngine.fromArrays([['="<img src=x onerror=alert(1)>"']]);
    expect(e.getValue(0, 0)).toBe('<img src=x onerror=alert(1)>');
  });

  it("'= is text; a cleared cell is blank; =1+1 needs a formula column", () => {
    const e = new SheetEngine({
      getRowCount: () => 1, getColumnCount: () => 4,
      getInput: (_r, c) => ["'=1+1", '', '=ISBLANK(B1)', '=1+1'][c],
      isFormulaColumn: c => c !== 3,
    });
    e.rebuild();
    expect([e.getValue(0, 0), e.getValue(0, 2), e.getValue(0, 3)]).toEqual(['=1+1', true, '=1+1']);
  });

  it('precedents, dependents, evaluate', () => {
    const e = SheetEngine.fromArrays(sheet());
    expect(e.getPrecedents(4, 3).map(r => [r.r1, r.c1, r.r2, r.c2])).toEqual([[1, 3, 3, 3]]);
    expect(e.getPrecedents(1, 3).length).toBe(2);
    expect(e.getPrecedents(0, 0)).toEqual([]);
    expect(e.getDependents(2, 3)).toEqual([[4, 3]]);
    expect(e.evaluate('SUM(D2:D4)*2')).toBe(7790);
    expect(e.evaluate('=B2', [1, 0])).toBe(1299);
  });

  it('own functions get ranges and values', () => {
    const e = SheetEngine.fromArrays([[1, 2, '=TOTAL(A1:B1)', '=TWICE(A1)', '=BAD()', '=THROWS()']], {
      functions: {
        total: (r: unknown) => (r as { values(): number[] }).values().reduce((s, x) => s + x, 0),
        twice: (x: unknown) => Number(x) * 2,
        bad: () => ({}),
        throws: () => { throw new Error('nope'); },
      },
    });
    expect([e.getValue(0, 2), e.getValue(0, 3), code(e.getValue(0, 4)), code(e.getValue(0, 5))]).toEqual([3, 2, '#VALUE!', '#VALUE!']);
  });

  it('a chain of 100 000 cells does not overflow the stack', () => {
    const data: unknown[][] = [[1]];
    for (let i = 1; i < 100_000; i++) data.push([`=A${i}+1`]);
    const e = SheetEngine.fromArrays(data);
    expect(e.getValue(99_999, 0)).toBe(100_000);
    data[0][0] = 2;
    e.inputsChanged([[0, 0]]);
    expect(e.getValue(99_999, 0)).toBe(100_001);
  });

  it('SUM(A:A) is one range node: a change in A recalculates it', () => {
    const data: unknown[][] = Array.from({ length: 1000 }, (_, i) => [i + 1, null]);
    data[0][1] = '=SUM(A:A)';
    const e = SheetEngine.fromArrays(data);
    expect(e.getValue(0, 1)).toBe(500_500);
    data[999][0] = 0;
    expect(e.inputsChanged([[999, 0]]).evaluated).toBe(1);
    expect(e.getValue(0, 1)).toBe(499_500);
  });

  it('formula changes: added, changed, removed', () => {
    const data: unknown[][] = [[1, 2, null, '=C1*10']];
    const e = SheetEngine.fromArrays(data);
    data[0][2] = '=A1+B1';
    e.inputsChanged([[0, 2]]);
    expect(e.getValue(0, 3)).toBe(30);
    data[0][2] = '=A1*B1';
    e.inputsChanged([[0, 2]]);
    expect(e.getValue(0, 3)).toBe(20);
    data[0][2] = 7;
    e.inputsChanged([[0, 2]]);
    expect([e.isFormula(0, 2), e.getValue(0, 3)]).toEqual([false, 70]);
    e.inputsChanged([[0, 3]]); // unchanged text: evaluated again
    expect(e.getValue(0, 3)).toBe(70);
  });

  it('errors are FormulaError values with messages', () => {
    const v = SheetEngine.fromArrays([['=1/0']]).getValue(0, 0);
    expect(v).toBeInstanceOf(FormulaError);
  });
});
