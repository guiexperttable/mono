import { FormulaError, isFormulaError } from "./formula-error";
import type { FormulaValue } from "./formula-options.if";
import { isBlank, numberResult, toBoolean, toNumber, toText } from "./formula-values";

// Not exported from index.ts: FORMULA_FUNCTION_NAMES (formula-function-names.ts) is the public list.

/** A built-in function with eagerly evaluated arguments (errors are returned before the call). */
export interface BuiltInFunction {
  readonly min: number;
  readonly max: number;
  readonly fn: (args: FormulaValue[]) => FormulaValue;
}

/** Functions with lazily evaluated arguments – handled by the evaluator itself. */
export const LAZY_FUNCTIONS: Record<string, { min: number; max: number }> = {
  IF: { min: 2, max: 3 },
  IFERROR: { min: 2, max: 2 },
  AND: { min: 1, max: 255 },
  OR: { min: 1, max: 255 },
};

/** SUM, AVG … with exactly one field reference: an aggregate over the (filtered) rows of the table. */
export const AGGREGATE_FUNCTIONS: Record<string, "sum" | "avg" | "min" | "max" | "count"> = {
  SUM: "sum", AVG: "avg", AVERAGE: "avg", MIN: "min", MAX: "max", COUNT: "count",
};

function numbers(args: FormulaValue[]): number[] | FormulaError {
  const ret: number[] = [];
  for (const a of args) {
    if (isBlank(a)) continue;
    const n = toNumber(a);
    if (isFormulaError(n)) return n;
    ret.push(n);
  }
  return ret;
}

function unaryMath(f: (x: number) => number): BuiltInFunction {
  return {
    min: 1, max: 1, fn: args => {
      const x = toNumber(args[0]);
      return isFormulaError(x) ? x : numberResult(f(x));
    }
  };
}

/** Rounds half away from zero (like Excel) without binary artefacts: ROUND(1.005, 2) = 1.01. */
export function roundHalfAwayFromZero(x: number, digits: number): number {
  const d = Math.trunc(digits);
  const f = Math.pow(10, d);
  if (f === 0) return 0;                       // ROUND(5, -400)
  const shifted = Math.abs(x) * f;
  if (!Number.isFinite(shifted)) return x;
  // 1.005 * 100 = 100.49999999999999: 15 significant digits (like a spreadsheet) before rounding; from 1e15 on there
  // are no decimals to correct
  const r = Math.round(shifted >= 1e15 ? shifted : Number(shifted.toPrecision(15))) / f;
  return x < 0 ? -r : r;
}

export const BUILT_IN_FUNCTIONS: Record<string, BuiltInFunction> = {
  ABS: unaryMath(Math.abs),
  FLOOR: unaryMath(Math.floor),
  CEILING: unaryMath(Math.ceil),
  SQRT: {
    min: 1, max: 1, fn: args => {
      const x = toNumber(args[0]);
      if (isFormulaError(x)) return x;
      return x < 0 ? new FormulaError("#NUM!", "SQRT of a negative number") : Math.sqrt(x);
    }
  },
  ROUND: {
    min: 1, max: 2, fn: args => {
      const x = toNumber(args[0]);
      if (isFormulaError(x)) return x;
      const d = args.length > 1 ? toNumber(args[1]) : 0;
      if (isFormulaError(d)) return d;
      return numberResult(roundHalfAwayFromZero(x, d));
    }
  },
  MOD: {
    min: 2, max: 2, fn: args => {
      const a = toNumber(args[0]);
      if (isFormulaError(a)) return a;
      const b = toNumber(args[1]);
      if (isFormulaError(b)) return b;
      if (b === 0) return new FormulaError("#DIV/0!", "MOD by zero");
      return numberResult(a - b * Math.floor(a / b)); // the sign of the divisor, like Excel
    }
  },
  POWER: {
    min: 2, max: 2, fn: args => {
      const a = toNumber(args[0]);
      if (isFormulaError(a)) return a;
      const b = toNumber(args[1]);
      if (isFormulaError(b)) return b;
      return numberResult(Math.pow(a, b));
    }
  },
  SUM: {
    min: 1, max: 255, fn: args => {
      const ns = numbers(args);
      return isFormulaError(ns) ? ns : numberResult(ns.reduce((s, n) => s + n, 0));
    }
  },
  AVG: {
    min: 1, max: 255, fn: args => {
      const ns = numbers(args);
      if (isFormulaError(ns)) return ns;
      return ns.length ? numberResult(ns.reduce((s, n) => s + n, 0) / ns.length) : new FormulaError("#DIV/0!", "AVG of no numbers");
    }
  },
  MIN: {
    min: 1, max: 255, fn: args => {
      const ns = numbers(args);
      return isFormulaError(ns) ? ns : ns.length ? Math.min(...ns) : 0;
    }
  },
  MAX: {
    min: 1, max: 255, fn: args => {
      const ns = numbers(args);
      return isFormulaError(ns) ? ns : ns.length ? Math.max(...ns) : 0;
    }
  },
  COUNT: {
    min: 1, max: 255, fn: args => args.filter(a => typeof a === "number").length
  },
  NOT: {
    min: 1, max: 1, fn: args => {
      const b = toBoolean(args[0]);
      return isFormulaError(b) ? b : !b;
    }
  },
  CONCAT: {
    min: 1, max: 255, fn: args => {
      let s = "";
      for (const a of args) {
        const t = toText(a);
        if (isFormulaError(t)) return t;
        s += t;
      }
      return s;
    }
  },
  LEN: {
    min: 1, max: 1, fn: args => {
      const t = toText(args[0]);
      return isFormulaError(t) ? t : t.length;
    }
  },
  UPPER: {
    min: 1, max: 1, fn: args => {
      const t = toText(args[0]);
      return isFormulaError(t) ? t : t.toUpperCase();
    }
  },
  LOWER: {
    min: 1, max: 1, fn: args => {
      const t = toText(args[0]);
      return isFormulaError(t) ? t : t.toLowerCase();
    }
  },
  TRIM: {
    min: 1, max: 1, fn: args => {
      const t = toText(args[0]);
      return isFormulaError(t) ? t : t.trim().replace(/\s+/g, " ");
    }
  },
  ISBLANK: {
    min: 1, max: 1, fn: args => isBlank(args[0])
  },
};
BUILT_IN_FUNCTIONS["AVERAGE"] = BUILT_IN_FUNCTIONS["AVG"];
