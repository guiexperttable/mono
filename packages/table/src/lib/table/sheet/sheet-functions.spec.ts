// Cell formula functions and values: Excel cases beyond the LibreOffice reference (XLOOKUP is not in LibreOffice 24.2).
import { describe, expect, it } from 'vitest';
import {
  CellFormulaOptions, FormulaRange, SheetDate, SheetEngine, dateToSerial, isFormulaError, isFormulaRange, isSheetDate,
  serialToDate,
} from '@guiexpert/table';

const DATA: unknown[][] = [
  ['Product', 'Price', 'Qty', 'Due'],
  ['Laptop', 1299, 2, new Date(2026, 0, 15)],
  ['Monitor', 349, 3, '2026-02-28'],
  ['Mouse', 25, 10, null],
];

function ev(formula: string, data: unknown[][] = DATA, options = {}): unknown {
  const engine = new SheetEngine({
    getRowCount: () => data.length,
    getColumnCount: () => 8,
    getInput: (r, c) => data[r]?.[c],
    getFieldColumn: f => ['product', 'price', 'qty', 'due'].indexOf(f),
  }, options);
  engine.rebuild();
  return engine.evaluate(formula, [1, 0]);
}

const code = (v: unknown) => (isFormulaError(v) ? v.code : v);
const e = (formula: string, data?: unknown[][]) => code(ev(formula, data));

describe('lookup', () => {
  it('XLOOKUP: vertical, horizontal, a whole row/column as result, not found', () => {
    expect(e('XLOOKUP("Mouse",A2:A4,B2:B4)')).toBe(25);
    expect(e('XLOOKUP("Qty",A1:D1,A2:D2)')).toBe(2);
    expect(e('XLOOKUP("x",A2:A4,B2:B4)')).toBe('#N/A');
    expect(e('XLOOKUP("x",A2:A4,B2:B4,"none")')).toBe('none');
    expect(e('SUM(XLOOKUP("Monitor",A2:A4,B2:C4))')).toBe(352);
    expect(e('SUM(XLOOKUP("Price",A1:D1,A2:D4))')).toBe(1673);
    expect(e('XLOOKUP("Mouse",A2:A4,7)')).toBe('#VALUE!'); // the result has another size (#2)
    expect(e('XLOOKUP("Mouse",A2:A4,B2:B3)')).toBe('#VALUE!');
    expect(e('XLOOKUP("Qty",A1:D1,A2:C2)')).toBe('#VALUE!');
    expect(e('XLOOKUP(1,A1,7)', [[1]])).toBe(7);
    expect(e('XLOOKUP("a",A1:B2,A1:B2)')).toBe('#VALUE!');
  });

  it('INDEX: row 0 / column 0 give ranges, out of range #REF!', () => {
    expect(e('SUM(INDEX(B2:C4,2,0))')).toBe(352);
    expect(e('SUM(INDEX(B2:C4,0,0))')).toBe(1688);
    expect(e('INDEX(B2:C4,-1,1)')).toBe('#REF!');
    expect(e('INDEX(5,1,1)')).toBe(5);
    expect(e('INDEX(B2:B4,"x")')).toBe('#VALUE!');
    expect(e('INDEX(B2:B4,1,"x")')).toBe('#VALUE!');
  });

  it('MATCH: descending (-1), type error, 2-D range', () => {
    expect(e('MATCH(5,{1},0)')).toBe('#ERROR!');
    const d = [[30], [20], [10], ['=MATCH(15,A1:A3,-1)'], ['=MATCH(15,A1:A3,"x")'], ['=MATCH(1,A1:B3,0)'], ['=MATCH(NA(),A1:A3,0)']];
    const engine = SheetEngine.fromArrays(d);
    expect([engine.getValue(3, 0), code(engine.getValue(4, 0)), code(engine.getValue(5, 0)), code(engine.getValue(6, 0))])
      .toEqual([2, '#VALUE!', '#VALUE!', '#N/A']);
  });

  it('VLOOKUP/HLOOKUP: bad index, error lookup value, approximate over mixed types', () => {
    expect(e('VLOOKUP("Mouse",A2:C4,0,FALSE)')).toBe('#VALUE!');
    expect(e('VLOOKUP("Mouse",A2:C4,"x",FALSE)')).toBe('#VALUE!');
    expect(e('VLOOKUP("Mouse",A2:C4,2,"x")')).toBe('#VALUE!');
    expect(e('VLOOKUP(NA(),A2:C4,2,FALSE)')).toBe('#N/A');
    expect(e('VLOOKUP(500,B2:C4,2)')).toBe('#N/A');
    expect(e('VLOOKUP(30,C2:C4,1)')).toBe(10);
    expect(e('HLOOKUP("Qty",A1:D2,3,FALSE)')).toBe('#REF!');
  });
});

describe('conditional', () => {
  it('criteria: text comparison, booleans, dates, escaped wildcards, errors in ranges', () => {
    expect(e('COUNTIF(A1:A4,">M")')).toBe(3);
    expect(e('COUNTIF(A1:A4,"<=Laptop")')).toBe(1);
    expect(e('COUNTIF(A1:A4,"<M")')).toBe(1);
    expect(e('COUNTIF(A1:A4,">=Monitor")')).toBe(3);
    expect(e('COUNTIF(A1:A4,"=Mouse")')).toBe(1);
    expect(e('COUNTIF(A1:A4,"<>Mouse")')).toBe(3);
    expect(e('COUNTIF(D2:D4,D2)')).toBe(1);
    expect(e('COUNTIF(D2:D4,">2026-02-01")')).toBe(1);
    expect(e('COUNTIF(E1:E3,TRUE)', [[0, 0, 0, 0, true], [0, 0, 0, 0, false], [0, 0, 0, 0, true]])).toBe(2);
    expect(e('COUNTIF(A1:A2,"a~?")', [['a?'], ['ab']])).toBe(1);
    expect(e('COUNTIF(A1:A2,"=")', [[null], ['x']])).toBe(1);
    expect(e('COUNTIF(A1:A4,1/0)')).toBe('#DIV/0!');
    expect(e('SUMIF(A1:A2,"x",B1:B2)', [['x', '=1/0'], ['y', 1]])).toBe('#DIV/0!');
    expect(e('SUMIF(B2:B4,">0",D2:D4)')).toBe(dateToSerial(new Date(2026, 0, 15))); // ISO text in a range is text
    expect(e('COUNTIFS(A1:A4,"*",B1:B2,">0")')).toBe('#VALUE!');
  });

  it('argument pairs', () => {
    expect(e('SUMIFS(B2:B4,A2:A4)')).toBe('#ERROR!');
    expect(e('SUMIFS(B2:B4,A2:A4,"x",B2:B4)')).toBe('#VALUE!');
    expect(e('COUNTIFS(A2:A4,"x",B2:B4)')).toBe('#VALUE!');
    expect(e('AVERAGEIFS(B2:B4,A2:A4,"x",B2:B4)')).toBe('#VALUE!');
    expect(e('AVERAGEIFS(B2:B4,A2:A4,"x")')).toBe('#DIV/0!');
    expect(e('AVERAGEIF(B1:B2,">0",A1:A2)', [['a', 1], ['b', 2]])).toBe('#DIV/0!');
    expect(e('AVERAGEIFS(D2:D4,B2:B4,">0")')).toBe(dateToSerial(new Date(2026, 0, 15))); // ISO text in a range is text
    expect(e('AVERAGEIF(A1:A1,"x",B1:B1)', [['x', '=1/0']])).toBe('#DIV/0!');
  });
});

describe('logic and info', () => {
  it('IFS, SWITCH, AND/OR edge cases', () => {
    expect(e('IFS(TRUE,1,FALSE)')).toBe('#VALUE!');
    expect(e('IFS("x",1)')).toBe('#VALUE!');
    expect(e('IF("x",1,2)')).toBe('#VALUE!');
    expect(e('SWITCH(1/0,1,2)')).toBe('#DIV/0!');
    expect(e('SWITCH(1,1/0,2)')).toBe('#DIV/0!');
    expect(e('AND("TRUE",D2)')).toBe(true);
    expect(e('AND("x")')).toBe('#VALUE!');
    expect(e('OR(D2:D3)')).toBe(true);
    expect(e('AND(1/0)')).toBe('#DIV/0!');
    expect(e('AND(A1:A2)')).toBe('#VALUE!');
    expect(e('NOT("x")')).toBe('#VALUE!');
    expect(e('IFERROR(A1:B2,1)')).toBe(1);
  });

  it('IS…, NA', () => {
    expect([e('ISNUMBER(D2)'), e('ISTEXT(D3)'), e('ISBLANK(D4)'), e('ISBLANK("")'), e('ISERROR(A1:B2)')]).toEqual([true, true, true, false, true]);
  });
});

describe('math', () => {
  it('errors and edge cases', () => {
    expect(e('POWER(0,0)')).toBe('#NUM!');
    expect(e('POWER(0,-1)')).toBe('#DIV/0!');
    expect(e('0^0')).toBe('#NUM!');
    expect(e('0^-1')).toBe('#DIV/0!');
    expect(e('POWER("x",2)')).toBe('#VALUE!');
    expect(e('FLOOR(5,0)')).toBe('#DIV/0!');
    expect(e('FLOOR(0,0)')).toBe(0);
    expect(e('FLOOR(5,-1)')).toBe('#NUM!');
    expect(e('CEILING(5,0)')).toBe(0);
    expect(e('CEILING(5,-1)')).toBe('#NUM!');
    expect(e('FLOOR("x",1)')).toBe('#VALUE!');
    expect(e('CEILING("x",1)')).toBe('#VALUE!');
    expect(e('MOD("x",1)')).toBe('#VALUE!');
    expect(e('ROUND("x",1)')).toBe('#VALUE!');
    expect(e('ROUNDUP("x",1)')).toBe('#VALUE!');
    expect(e('ROUNDDOWN("x",1)')).toBe('#VALUE!');
    expect(e('ABS("x")')).toBe('#VALUE!');
    expect(e('SUMPRODUCT(B2:B4,C2:C3)')).toBe('#VALUE!');
    expect(e('SUMPRODUCT(B2:B4,D2:D4)')).toBe(1299 * dateToSerial(new Date(2026, 0, 15)));
    expect(e('SUMPRODUCT(A1:A1)', [['=1/0']])).toBe('#DIV/0!');
    expect(e('SUM(A1:A2)', [['=1/0'], [1]])).toBe('#DIV/0!');
    expect(e('PRODUCT(A1:A2)', [['x'], [null]])).toBe(0);
    expect(e('MAX(D2:D4)')).toBe(dateToSerial(new Date(2026, 0, 15)));
    expect(e('AVERAGE(A1:A2)')).toBe('#DIV/0!');
    expect(e('RANDBETWEEN(5,1)')).toBe('#NUM!');
    expect(e('RANDBETWEEN("x",1)')).toBe('#VALUE!');
    expect(e('SUM(1,"abc")')).toBe('#VALUE!');
    expect(e('COUNTBLANK(A1:A2)', [[null], ['']])).toBe(2);
  });

  it('number text: 15 digits, exponents', () => {
    expect(e('1E25&""')).toBe('1E+25');
    expect(e('0.00000000001&""')).toBe('1E-11');
    expect(e('-A1', [['x']])).toBe('#VALUE!');
    expect(e('+A1', [['x']])).toBe('x');
    expect(e('"50%"*2')).toBe(1);
    expect(e('A1+1', [['2026-01-02']])).toEqual(new Date(2026, 0, 3));
    expect(e('A1+1', [['2026-02-30']])).toBe('#VALUE!');
    expect(ev('A1+1', [['2026-01-02']], { isoDatesAsDates: false })).toMatchObject({ code: '#VALUE!' });
  });
});

describe('text', () => {
  it('errors and edge cases', () => {
    expect(e('LEFT("abc",-1)')).toBe('#VALUE!');
    expect(e('LEFT(1/0)')).toBe('#DIV/0!');
    expect(e('LEFT("abc","x")')).toBe('#VALUE!');
    expect(e('RIGHT("abc",0)')).toBe('');
    expect(e('MID("abc",0,1)')).toBe('#VALUE!');
    expect(e('MID(1/0,1,1)')).toBe('#DIV/0!');
    expect(e('MID("abc","x",1)')).toBe('#VALUE!');
    expect(e('FIND("a","abc",0)')).toBe('#VALUE!');
    expect(e('FIND("a","abc","x")')).toBe('#VALUE!');
    expect(e('FIND(1/0,"abc")')).toBe('#DIV/0!');
    expect(e('FIND("a",1/0)')).toBe('#DIV/0!');
    expect(e('SEARCH("b*","abc",2)')).toBe(2);
    expect(e('SUBSTITUTE("aaa","a","b",5)')).toBe('aaa');
    expect(e('SUBSTITUTE("aaa","","b")')).toBe('aaa');
    expect(e('SUBSTITUTE("aaa","a","b",0)')).toBe('#VALUE!');
    expect(e('SUBSTITUTE("aaa","a","b","x")')).toBe('#VALUE!');
    expect(e('SUBSTITUTE(1/0,"a","b")')).toBe('#DIV/0!');
    expect(e('SUBSTITUTE("a",1/0,"b")')).toBe('#DIV/0!');
    expect(e('SUBSTITUTE("a","a",1/0)')).toBe('#DIV/0!');
    expect(e('LEN(1/0)')).toBe('#DIV/0!');
    expect(e('VALUE(TRUE)')).toBe('#VALUE!');
    expect(e('VALUE("2026-10-16")')).toBe(dateToSerial(new Date(2026, 9, 16)));
    expect(e('VALUE("50%")')).toBe(0.5);
    expect(e('TEXT(5,"0.000 kg")')).toBe('#VALUE!');
    expect(e('TEXT(D2,"mm/dd/yyyy")')).toBe('01/15/2026');
    expect(e('TEXT("x","0")')).toBe('x'); // like Excel (#13)
    expect(e('TEXT("abc","yyyy-mm-dd")')).toBe('abc');
    expect(e('TEXT("12","0.00")')).toBe('12.00');
    expect(e('TEXT("x","yyyy-mm-dd")')).toBe('x');
    expect(e('TEXT(5,1/0)')).toBe('#DIV/0!');
    expect(e('TEXT(1234567.891,"#,##0.00")')).toBe('1,234,567.89');
    expect(e('TEXTJOIN(1/0,TRUE,"a")')).toBe('#DIV/0!');
    expect(e('TEXTJOIN(",","x","a")')).toBe('#VALUE!');
    expect(e('TEXTJOIN(",",TRUE,A1:A1)', [['=1/0']])).toBe('#DIV/0!');
    expect(e('CONCAT(A1:A1)', [['=1/0']])).toBe('#DIV/0!');
    expect(e('A1&1/0', [['x']])).toBe('#DIV/0!');
    expect(e('1/0&"x"')).toBe('#DIV/0!');
    expect(e('D2&""')).toBe(String(dateToSerial(new Date(2026, 0, 15))));
  });
});

describe('dates', () => {
  it('DATE, WEEKDAY, EOMONTH, DATEDIF edge cases', () => {
    expect(ev('DATE(26,1,1)')).toEqual(new Date(1926, 0, 1));
    expect(e('DATE(-1,1,1)')).toBe('#NUM!');
    expect(e('DATE("x",1,1)')).toBe('#VALUE!');
    expect(e('DATE(9999,12,32)')).toBe('#NUM!');
    expect(e('WEEKDAY(D2,4)')).toBe('#NUM!');
    expect(e('WEEKDAY(D2,"x")')).toBe('#VALUE!');
    expect(e('WEEKDAY(-1)')).toBe('#NUM!');
    expect(e('WEEKDAY(0)')).toBe(7);
    expect(e('YEAR("2026-10-16")')).toBe(2026);
    expect(e('YEAR("x")')).toBe('#VALUE!');
    expect(e('MONTH(1/0)')).toBe('#DIV/0!');
    expect(e('DAY(60)')).toBe(29);
    expect(e('EOMONTH(D2,"x")')).toBe('#VALUE!');
    expect(e('EOMONTH("x",1)')).toBe('#VALUE!');
    expect(e('DATEDIF(D2,D3,"q")')).toBe('#NUM!');
    expect(e('DATEDIF(D2,D3,1/0)')).toBe('#DIV/0!');
    expect(e('DATEDIF("x",D3,"d")')).toBe('#VALUE!');
    expect(e('DATEDIF(D2,"x","d")')).toBe('#VALUE!');
    expect(e('DATEDIF(DATE(2024,1,31),DATE(2024,2,29),"m")')).toBe(0);
    expect(e('DATEDIF(DATE(2024,3,1),DATE(2025,2,28),"y")')).toBe(0);
    expect(e('D2-D3')).toBe(-44);
    expect(ev('5+D2')).toEqual(new Date(2026, 0, 20));
    expect(e('D2>D3')).toBe(false);
  });

  it('serial numbers', () => {
    expect(dateToSerial(new Date(1900, 0, 1))).toBe(1);
    expect(dateToSerial(new Date(1900, 1, 28))).toBe(59);
    expect(dateToSerial(new Date(1900, 2, 1))).toBe(61);
    expect(dateToSerial(new Date(NaN))).toBeNaN();
    expect(serialToDate(60)).toEqual(new Date(1900, 2, 1));
    expect(serialToDate(1)).toEqual(new Date(1900, 0, 1));
    expect(serialToDate(46311.5)).toEqual(new Date(2026, 9, 16, 12));
    expect(new SheetDate(46311).toDate()).toEqual(new Date(2026, 9, 16));
    expect(isSheetDate(new SheetDate(1))).toBe(true);
  });
});

describe('cells, fields, ranges, options', () => {
  it('[field] is the cell of the same row; SUM([x]) is a column formula; unknown fields', () => {
    expect(ev('[price]*[qty]')).toBe(2598);
    expect(e('SUM([price])')).toBe('#NAME?');
    expect(e('[nope]')).toBe('#NAME?');
    expect(e('A1:B2')).toBe('#VALUE!');
    expect(e('A2:A2')).toBe('Laptop');
    expect(e('#NULL!')).toBe('#ERROR!');
    expect(e('#N/A')).toBe('#N/A');
    expect(e('SUM(A1:B2000000)')).toBe('#ERROR!'); // beyond the last sheet row
    expect(e('SUM(A1:B1000000)')).toBe(1299 + 349 + 25); // the cap counts the rows with data (#7)
    expect(e('SUM(A1:D1000)', DATA)).toBe(1299 + 349 + 25 + 2 + 3 + 10 + dateToSerial(new Date(2026, 0, 15)));
    expect(code(ev('SUM(A1:J10)', DATA, { maxRangeCells: 30 }))).toBe('#ERROR!'); // 4 rows × 10 columns
    expect(ev('SUM(A1:J10)', DATA, { maxRangeCells: 40 })).toBe(1299 + 349 + 25 + 2 + 3 + 10 + dateToSerial(new Date(2026, 0, 15)));
    expect(e('IF()')).toBe('#ERROR!');
    expect(e('IF(1,2,3,4)')).toBe('#ERROR!');
    expect(e('NOT()')).toBe('#ERROR!');
    expect(e('SUM()')).toBe('#ERROR!');
  });

  it('own functions: Date, ranges, NaN, undefined', () => {
    const engine = SheetEngine.fromArrays([[1, 2]], {
      functions: {
        when: () => new Date(2026, 0, 1),
        range: (r: unknown) => r,
        nan: () => NaN,
        nothing: () => undefined,
        isrange: (r: unknown) => isFormulaRange(r),
      },
    });
    expect(engine.evaluate('WHEN()')).toEqual(new Date(2026, 0, 1));
    expect(engine.evaluate('SUM(RANGE(A1:B1))')).toBe(3);
    expect(code(engine.evaluate('NAN()'))).toBe('#NUM!');
    expect(engine.evaluate('NOTHING()')).toBe(0); // a blank result shows 0
    expect(engine.evaluate('ISRANGE(A1:B1)')).toBe(true);
    expect(code(engine.evaluate('RANGE(1/0)'))).toBe('#DIV/0!');
  });

  it('values of the data: objects, bigint, NaN, invalid dates', () => {
    const engine = SheetEngine.fromArrays([[{}, BigInt(5), NaN, new Date(NaN), '=A1', '=B1+1', '=C1', '=D1']]);
    expect([code(engine.getValue(0, 4)), engine.getValue(0, 5), engine.getValue(0, 6), engine.getValue(0, 7)])
      .toEqual(['#VALUE!', 6, 0, 0]);
  });

  it('options', () => {
    expect(CellFormulaOptions.create()).toBeUndefined();
    expect(CellFormulaOptions.create(true)?.rejectInvalidFormulas).toBe(false);
    expect(CellFormulaOptions.create({ maxRangeCells: 5, columns: undefined, nope: 1 } as never)).toMatchObject({ maxRangeCells: 5, isoDatesAsDates: true });
    expect(new FormulaRange(0, 0, 1, 2, (_r, c) => c).values()).toEqual([0, 1]);
  });
});
