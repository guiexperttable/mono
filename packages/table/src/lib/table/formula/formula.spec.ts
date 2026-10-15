// Formulas (prompt 008 part C, design prompts/008-formeln-berechnete-spalten-show-values-as.design.md § 4):
// tokenizer/parser (precedence, parentheses, texts, numbers), evaluation, error values (F14/F15), security (F16),
// fuzzing with a fixed seed (never throws), own functions.
import { describe, expect, it } from 'vitest';
import { FORMULA_FUNCTION_NAMES, FormulaError, compileFormula, createFormulaValueGetter, isFormulaError } from '@guiexpert/table';
import type { FormulaValue, ValueGetterContextIf } from '@guiexpert/table';
import { seededRandom } from '../../../../test-utils/grouping-fixtures';

const laptop = { product: 'Laptop', price: 1299, quantity: 2 };

function ev(source: string, row: unknown = laptop, context?: ValueGetterContextIf): FormulaValue {
  return compileFormula(source).evaluate(row, context);
}

function code(v: unknown): string | undefined {
  return isFormulaError(v) ? v.code : undefined;
}

describe('F13 – arithmetic on fields', () => {
  it('[price] * [quantity] * 1.19', () => {
    expect(ev('[price] * [quantity] * 1.19')).toBeCloseTo(3091.62, 10);
    expect(ev('ROUND([price] * [quantity] * 1.19, 2)')).toBe(3091.62);
  });

  it('a leading = is ignored (like a spreadsheet)', () => {
    expect(ev('=[price] * 2')).toBe(2598);
    expect(ev('  = [quantity]')).toBe(2);
  });

  it('reports the referenced fields once, in order', () => {
    const f = compileFormula('[price] * [quantity] + [price] / SUM([total])');
    expect(f.fields).toEqual(['price', 'quantity', 'total']);
    expect(f.usesAggregates).toBe(true);
    expect(compileFormula('[a] + 1').usesAggregates).toBe(false);
    expect(compileFormula('SUM([a], 1)').usesAggregates).toBe(false);
  });
});

describe('parser – precedence and associativity', () => {
  it.each([
    ['1 + 2 * 3', 7],
    ['(1 + 2) * 3', 9],
    ['10 - 4 - 3', 3],
    ['100 / 10 / 5', 2],
    ['2 ^ 3 ^ 2', 512],          // right-associative
    ['-2 ^ 2', -4],              // math convention (Excel: 4)
    ['(-2) ^ 2', 4],
    ['-2 * 3', -6],
    ['2 * -3', -6],
    ['2 ^ -1', 0.5],
    ['--3', 3],
    ['+3', 3],
    ['1 + 2 = 3', true],
    ['1 + 2 > 2 * 2', false],
    ['"a" & 1 + 2', 'a3'],       // + binds tighter than &
    ['1 & 2 = "12"', true],      // & binds tighter than =
    ['((((1))))', 1],
  ] as const)('%s = %s', (source, expected) => {
    expect(ev(source)).toBe(expected);
  });

  it.each([
    ['12', 12], ['1.5', 1.5], ['.5', 0.5], ['1e3', 1000], ['2.5E-1', 0.25], ['1e+2', 100],
  ] as const)('number %s', (source, expected) => {
    expect(ev(source)).toBe(expected);
  });

  it('texts with both quotes and escapes', () => {
    expect(ev('"a\\"b"')).toBe('a"b');
    expect(ev("'it\\'s'")).toBe("it's");
    expect(ev('"x\\ny\\tz\\\\"')).toBe('x\ny\tz\\');
    expect(ev("'say \"hi\"'")).toBe('say "hi"');
    expect(ev('""')).toBe('');
  });

  it('TRUE / FALSE, case-insensitive functions and booleans', () => {
    expect(ev('true')).toBe(true);
    expect(ev('False')).toBe(false);
    expect(ev('round(1.25, 1)')).toBe(1.3);
    expect(ev('If([quantity] > 1, "many", "one")')).toBe('many');
  });

  it('comparison operators incl. aliases', () => {
    expect(ev('1 == 1')).toBe(true);
    expect(ev('1 <> 2')).toBe(true);
    expect(ev('1 != 1')).toBe(false);
    expect(ev('2 >= 2')).toBe(true);
    expect(ev('2 <= 1')).toBe(false);
    expect(ev('"abc" = "ABC"')).toBe(true);        // case-insensitive like a spreadsheet
    expect(ev('"b" > "a"')).toBe(true);
    expect(ev('"10" = 10')).toBe(true);
    expect(ev('"x" < 1')).toBe(false);              // text vs. number: compared as text "x" vs "1"
  });

  it('field names with blanks, paths and escaped brackets', () => {
    const row = { 'Unit price': 3, address: { city: 'Kiel' }, 'a]b': 7 };
    expect(ev('[Unit price] * 2', row)).toBe(6);
    expect(ev('[address.city]', row)).toBe('Kiel');
    expect(ev('[a\\]b]', row)).toBe(7);
    expect(ev('[ Unit price ] * 2', row)).toBe(6);   // trimmed
  });
});

describe('functions', () => {
  it.each([
    ['ABS(-3)', 3], ['FLOOR(2.7)', 2], ['CEILING(2.1)', 3], ['MOD(7, 3)', 1], ['MOD(-7, 3)', 2],
    ['SQRT(16)', 4], ['POWER(2, 10)', 1024], ['ROUND(2.5)', 3], ['ROUND(-2.5)', -3], ['ROUND(1.005, 2)', 1.01],
    ['ROUND(1234.5, -2)', 1200], ['SUM(1, 2, 3)', 6], ['AVG(1, 2, 3)', 2], ['AVERAGE(2, 4)', 3],
    ['MIN(3, 1, 2)', 1], ['MAX(3, 1, 2)', 3], ['COUNT(1, "a", 2, TRUE)', 2],
    ['IF(1 > 2, "a", "b")', 'b'], ['IF(FALSE, 1)', false], ['IFERROR(1 / 0, -1)', -1], ['IFERROR(5, -1)', 5],
    ['AND(TRUE, 1, "TRUE")', true], ['AND(TRUE, 0)', false], ['OR(FALSE, 0, 1)', true], ['OR(FALSE)', false],
    ['NOT(TRUE)', false], ['CONCAT("a", 1, TRUE)', 'a1TRUE'], ['LEN("abc")', 3], ['UPPER("ab")', 'AB'],
    ['LOWER("AB")', 'ab'], ['TRIM("  a   b ")', 'a b'], ['ISBLANK("")', true], ['ISBLANK(0)', false],
  ] as const)('%s = %s', (source, expected) => {
    expect(ev(source)).toBe(expected);
  });

  it.each([
    'ABS("x")', 'FLOOR("x")', 'SQRT("x")', 'ROUND("x")', 'ROUND(1, "x")', 'MOD("x", 1)', 'MOD(1, "x")', 'POWER("x", 1)',
    'POWER(1, "x")', 'SUM(1, "x")', 'AVG("x")', 'MIN("x")', 'MAX("x")', 'NOT("x")', 'AND("x")', 'OR("x")', 'IF("x", 1, 2)',
    '-"x"', '"x" - 1', '1 - "x"',
  ])('%s → #VALUE!', (source) => {
    expect(code(ev(source))).toBe('#VALUE!');
  });

  it.each([
    ['CONCAT(1/0)', '#DIV/0!'], ['LEN(1/0)', '#DIV/0!'], ['UPPER(1/0)', '#DIV/0!'], ['LOWER(1/0)', '#DIV/0!'],
    ['TRIM(1/0)', '#DIV/0!'], ['MIN()', '#ERROR!'], ['POWER(10, 400)', '#NUM!'],
  ] as const)('%s → %s', (source, expected) => {
    expect(code(ev(source))).toBe(expected);
  });

  it('edge cases: empty aggregates of arguments, blank arguments, boolean texts', () => {
    expect(ev('MIN("")')).toBe(0);
    expect(ev('MAX("", "")')).toBe(0);
    expect(code(ev('AVG("")'))).toBe('#DIV/0!');
    expect(ev('SUM("", 2)')).toBe(2);
    expect(ev('NOT(" true ")')).toBe(false);
    expect(ev('IF("FALSE", 1, 2)')).toBe(2);
    expect(ev('LEN(TRUE)')).toBe(4);
    expect(ev('CONCAT(1.5, FALSE)')).toBe('1.5FALSE');
    expect(ev('"" = 0')).toBe(true);           // blank = 0 = ""
    expect(ev('"" < "a"')).toBe(true);
    expect(ev('TRUE = 1')).toBe(true);
    expect(ev('"b" > "a"')).toBe(true);
    expect(ev('"a" < "b"')).toBe(true);
  });

  it('IF, AND and OR evaluate lazily (no error from the branch not taken)', () => {
    expect(ev('IF(TRUE, 1, 1 / 0)')).toBe(1);
    expect(ev('AND(FALSE, 1 / 0)')).toBe(false);
    expect(ev('OR(TRUE, [missing])')).toBe(true);
  });

  it('FORMULA_FUNCTION_NAMES lists the built-in functions', () => {
    expect(FORMULA_FUNCTION_NAMES).toContain('ROUND');
    expect(FORMULA_FUNCTION_NAMES).toContain('IF');
    expect([...FORMULA_FUNCTION_NAMES]).toEqual([...FORMULA_FUNCTION_NAMES].sort());
  });

  it('own functions get evaluated arguments, may replace built-in ones, never throw', () => {
    const f = compileFormula('VAT([price]) + round(1)', {
      functions: { vat: (net) => Number(net) * 0.19, ROUND: () => 100 },
    });
    expect(f.evaluate({ price: 100 })).toBe(119);
    expect(code(compileFormula('BOOM()', { functions: { BOOM: () => { throw new Error('x'); } } }).evaluate({}))).toBe('#VALUE!');
    expect(code(compileFormula('OBJ()', { functions: { OBJ: () => ({}) } }).evaluate({}))).toBe('#VALUE!');
    expect(code(compileFormula('NAN()', { functions: { NAN: () => NaN } }).evaluate({}))).toBe('#NUM!');
    expect(compileFormula('NUL()', { functions: { NUL: () => undefined } }).evaluate({})).toBeNull();
    expect(compileFormula('D()', { functions: { D: () => new Date(5) } }).evaluate({})).toBe(5);
    // an error argument is returned without calling the function
    let called = false;
    expect(code(compileFormula('F(1/0)', { functions: { F: () => { called = true; return 1; } } }).evaluate({}))).toBe('#DIV/0!');
    expect(called).toBe(false);
  });
});

describe('types', () => {
  it('blank is 0 resp. "", numeric texts are numbers, booleans 1/0, dates ms', () => {
    const row = { a: null, b: undefined, c: '', d: ' 3 ', e: true, f: new Date(1000), g: 'x' };
    expect(ev('[a] + 1', row)).toBe(1);
    expect(ev('[b] + 1', row)).toBe(1);
    expect(ev('[c] & "!"', row)).toBe('!');
    expect(ev('[d] * 2', row)).toBe(6);
    expect(ev('[e] + 1', row)).toBe(2);
    expect(ev('[f] + 1', row)).toBe(1001);
    expect(code(ev('[g] * 2', row))).toBe('#VALUE!');
    expect(ev('[g] & 2', row)).toBe('x2');
  });

  it('a missing parent of a path is blank, NaN in the data is blank, bigint a number', () => {
    expect(ev('[address.city] & ""', { address: null })).toBe('');
    expect(ev('[n] + 1', { n: NaN })).toBe(1);
    expect(ev('[n] + 1', { n: BigInt(2) })).toBe(3);
  });

  it('objects, arrays and functions in the data are #VALUE!', () => {
    expect(code(ev('[o] + 1', { o: {} }))).toBe('#VALUE!');
    expect(code(ev('[o]', { o: [1] }))).toBe('#VALUE!');
    expect(code(ev('[o]', { o: () => 1 }))).toBe('#VALUE!');
  });

  it('-0 becomes 0', () => {
    expect(Object.is(ev('-0'), 0)).toBe(true);
  });
});

describe('F14 – error values instead of exceptions', () => {
  it.each([
    ['[price] / 0', '#DIV/0!'],
    ['MOD(1, 0)', '#DIV/0!'],
    ['AVG()', '#ERROR!'],
    ['[unknown] + 1', '#NAME?'],
    ['FOO(1)', '#NAME?'],
    ['[price] *', '#ERROR!'],
    ['(1 + 2', '#ERROR!'],
    ['1 + 2)', '#ERROR!'],
    ['', '#ERROR!'],
    ['price * 2', '#ERROR!'],     // fields need brackets
    ['"abc', '#ERROR!'],
    ['[abc', '#ERROR!'],
    ['[]', '#ERROR!'],
    ['1 # 2', '#ERROR!'],
    ['12abc', '#ERROR!'],
    ['1..2', '#ERROR!'],
    ['ROUND(1, 2, 3)', '#ERROR!'],
    ['IF(1)', '#ERROR!'],
    ['SQRT(-1)', '#NUM!'],
    ['10 ^ 400', '#NUM!'],
    ['1e308 * 10', '#NUM!'],
    ['"a" * 2', '#VALUE!'],
    ['NOT("maybe")', '#VALUE!'],
    ['SUM([price])', '#VALUE!'],  // an aggregate needs the rows of a table (a context)
  ] as const)('%s → %s', (source, expected) => {
    expect(code(ev(source))).toBe(expected);
  });

  it('a compile error is on the compiled formula and returned for every row', () => {
    const f = compileFormula('[a] + ');
    expect(f.error?.code).toBe('#ERROR!');
    expect(f.error?.position).toBe(6);
    expect(f.error?.message).toMatch(/end of formula/);
    expect(f.ast).toBeUndefined();
    expect(f.fields).toEqual([]);
    expect(f.evaluate({ a: 1 })).toBe(f.error);
    expect(compileFormula('NOPE()').error?.code).toBe('#NAME?');
  });

  it('errors propagate through operators and functions; IFERROR catches them', () => {
    expect(code(ev('1 + [price] / 0'))).toBe('#DIV/0!');
    expect(code(ev('ROUND([price] / 0, 2)'))).toBe('#DIV/0!');
    expect(code(ev('-(1/0)'))).toBe('#DIV/0!');
    expect(code(ev('(1/0) & "x"'))).toBe('#DIV/0!');
    expect(code(ev('"x" & (1/0)'))).toBe('#DIV/0!');
    expect(code(ev('(1/0) = 1'))).toBe('#DIV/0!');
    expect(code(ev('IF(1/0, 1, 2)'))).toBe('#DIV/0!');
    expect(ev('IFERROR([price] / 0, 0)')).toBe(0);
  });

  it('FormulaError: code as text, marker, message', () => {
    const e = ev('1/0') as FormulaError;
    expect(`${e}`).toBe('#DIV/0!');
    expect(e.message).toBe('Division by zero');
    expect(isFormulaError(e)).toBe(true);
    expect(isFormulaError({ type: 'FormulaError' })).toBe(true); // across copies of the core
    expect(isFormulaError('#DIV/0!')).toBe(false);
    expect(isFormulaError(null)).toBe(false);
  });

  it('limits: length and nesting depth', () => {
    expect(code(ev('1+'.repeat(6000) + '1'))).toBe('#ERROR!');                // > 10,000 characters
    expect(code(ev('('.repeat(70) + '1' + ')'.repeat(70)))).toBe('#ERROR!');  // > 64 levels
    expect(code(ev('-'.repeat(70) + '1'))).toBe('#ERROR!');
    expect(ev('('.repeat(30) + '1' + ')'.repeat(30))).toBe(1);
  });
});

describe('review fixes', () => {
  it.each([
    ['ROUND(10000000000000.0033, 2)', 10000000000000],
    ['ROUND(100000000000000, 2)', 100000000000000],
    ['ROUND(9007199254740991)', 9007199254740991],
    ['ROUND(0.49999999999999994)', 1],   // 15 significant digits like a spreadsheet: 0.5
    ['ROUND(1e308, -400)', 0],
    ['ROUND(5, -400)', 0],
    ['ROUND(2.675, 2)', 2.68],
    ['ROUND(-1.005, 2)', -1.01],
  ] as const)('%s = %s', (source, expected) => {
    expect(ev(source)).toBe(expected);
  });

  it('an overflow inside the formula is #NUM! (IFERROR catches it)', () => {
    expect(ev('IFERROR(1e308 * 10, 0)')).toBe(0);
    expect(code(ev('1e308 * 10 > 5'))).toBe('#NUM!');
    expect(code(ev('1e308 + 1e308'))).toBe('#NUM!');
  });

  it('numeric texts: decimals only (no hex, no Infinity)', () => {
    expect(code(ev('"0x1A" + 1'))).toBe('#VALUE!');
    expect(code(ev('"Infinity" + 1'))).toBe('#VALUE!');
    expect(ev('"-1.5e1" + 1')).toBe(-14);
  });

  it('a value of the data that only looks like an error is no error', () => {
    expect(code(ev('[x]', { x: { type: 'FormulaError', code: '#FAKE', message: 'm' } }))).toBe('#VALUE!');
  });

  it('long operator chains: a clean #ERROR!, never an exception', () => {
    expect(compileFormula('1' + '+1'.repeat(999)).evaluate({})).toBe(1000);
    expect(compileFormula('1' + '+1'.repeat(4999)).error?.message).toMatch(/Too many operators/);
    expect(() => compileFormula(Symbol('x') as unknown as string)).not.toThrow();
  });
});

describe('F16 – security: no code execution, no prototype access', () => {
  let alerted = false;
  (globalThis as Record<string, unknown>)['alert'] = () => { alerted = true; };

  it.each([
    "constructor.constructor('alert(1)')()",
    "[constructor].constructor('alert(1)')()",
    "[constructor]",
    "[__proto__]",
    "[__proto__.polluted]",
    "[prototype]",
    "[toString]",
    "[hasOwnProperty]",
    "[valueOf]",
    "eval('1')",
    "Function('return 1')()",
    "this",
    "globalThis",
    "window.alert(1)",
    "alert(1)",
    "[a](1)",
    "IF(1, alert(1), 2)",
    "__proto__",
    "`1`",
    "${1}",
    "x => 1",
    "new Date()",
    "[price]; alert(1)",
    "1 + /**/ 2",
    "'\\u0061'",
    "import('x')",
  ])('%s', (source) => {
    const result = compileFormula(source).evaluate({ price: 1, a: 1 });
    expect(alerted).toBe(false);
    // never a function / object from the prototype chain
    expect(typeof result === 'function').toBe(false);
    if (result !== null && typeof result === 'object') {
      expect(isFormulaError(result)).toBe(true);
    }
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('an own property called constructor / __proto__ is not readable either', () => {
    const row = JSON.parse('{"__proto__": {"x": 1}, "constructor": 5}');
    expect(code(ev('[__proto__.x]', row))).toBe('#NAME?');
    expect(code(ev('[constructor]', row))).toBe('#NAME?');
  });

  it('inherited properties are unknown fields (#NAME?)', () => {
    class Item { get price(): number { return 3; } }
    expect(code(ev('[price]', new Item()))).toBe('#NAME?');
    const proto = { price: 3 };
    expect(code(ev('[price]', Object.create(proto)))).toBe('#NAME?');
  });

  it('the compiler uses neither eval nor new Function', () => {
    const evalSpy = globalThis.eval;
    const fn = globalThis.Function;
    let used = false;
    globalThis.eval = (() => { used = true; }) as typeof eval;
    globalThis.Function = function () { used = true; } as unknown as FunctionConstructor;
    try {
      compileFormula('ROUND([price] * [quantity] * 1.19, 2) & IF([a] > 1, "x", "y")').evaluate({ price: 1, quantity: 2, a: 3 });
    } finally {
      globalThis.eval = evalSpy;
      globalThis.Function = fn;
    }
    expect(used).toBe(false);
  });
});

describe('fuzzing with a fixed seed: never throws, always a value', () => {
  const PIECES = ['[price]', '[quantity]', '[x]', '1', '0', '2.5', '"a"', "'b'", '+', '-', '*', '/', '^', '&', '=', '<>',
    '<', '>=', '(', ')', ',', 'SUM(', 'IF(', 'ROUND(', 'IFERROR(', 'AND(', 'NOT(', 'FOO(', 'TRUE', ' ', '[', ']', '"',
    '\\', '#', '.', 'e', '1e', '[__proto__]', '[constructor]'];

  it('20,000 random formulas', () => {
    const random = seededRandom(8);
    const row = { price: 3, quantity: 4, x: 'x' };
    const context: ValueGetterContextIf = {
      property: 'f',
      getValue: (r: any, p: string) => r[p],
      hasColumn: () => true,
      isCalculated: () => false,
      aggregate: () => 10,
    };
    for (let i = 0; i < 20_000; i++) {
      let source = '';
      const n = 1 + Math.floor(random() * 12);
      for (let k = 0; k < n; k++) source += PIECES[Math.floor(random() * PIECES.length)];
      let result: unknown;
      expect(() => {
        result = compileFormula(source).evaluate(row, context);
      }, source).not.toThrow();
      const ok = result === null || ['number', 'string', 'boolean'].includes(typeof result) || isFormulaError(result);
      expect(ok, source).toBe(true);
      if (typeof result === 'number') expect(Number.isFinite(result), source).toBe(true);
    }
  });

  it('random bytes', () => {
    const random = seededRandom(42);
    for (let i = 0; i < 2_000; i++) {
      const source = Array.from({ length: Math.floor(random() * 30) }, () => String.fromCharCode(Math.floor(random() * 128))).join('');
      expect(() => compileFormula(source).evaluate({}), JSON.stringify(source)).not.toThrow();
    }
  });
});

describe('context: calculated fields and column aggregates', () => {
  const rows = [{ v: 1 }, { v: 3 }];
  const context: ValueGetterContextIf = {
    property: 'share',
    getValue: (row: any, p: string) => p === 'double' ? row.v * 2 : row[p],
    hasColumn: (p: string) => ['v', 'double', 'empty'].includes(p),
    isCalculated: (p: string) => p === 'double',
    aggregate: (p: string, agg) => agg === 'sum' && p === 'v' ? 4 : agg === 'avg' && p === 'empty' ? undefined : 2,
  };

  it('[double] uses the context, SUM([v]) its aggregate', () => {
    expect(compileFormula('[double] + 1').evaluate(rows[1], context)).toBe(7);
    expect(compileFormula('[v] / SUM([v])').evaluate(rows[1], context)).toBe(0.75);
    expect(compileFormula('MAX([v])').evaluate(rows[0], context)).toBe(2);
  });

  it('a column of the table that the row lacks is blank, an unknown column in an aggregate #NAME?', () => {
    expect(compileFormula('[empty] + 1').evaluate({}, context)).toBe(1);
    expect(code(compileFormula('SUM([nope])').evaluate({}, context))).toBe('#NAME?');
    expect(code(compileFormula('AVG([empty])').evaluate({}, context))).toBe('#DIV/0!');
  });

  it('createFormulaValueGetter() from a text or a compiled formula', () => {
    expect(createFormulaValueGetter('[v] * 10')(rows[0], context)).toBe(10);
    expect(createFormulaValueGetter(compileFormula('[v] * 10'))(rows[1], context)).toBe(30);
    expect(createFormulaValueGetter('F([v])', { functions: { F: v => Number(v) + 1 } })(rows[0], context)).toBe(2);
  });
});
