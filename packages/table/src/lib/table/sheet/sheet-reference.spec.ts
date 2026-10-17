// Cell formulas against LibreOffice (prompt 013 stage 4): the expected values come from
// test-utils/sheet-reference-values.json (scripts/sheet-reference-values.mjs, LibreOffice headless).
import { describe, expect, it } from 'vitest';
import { SheetEngine, dateToSerial, isFormulaError } from '@guiexpert/table';
import reference from '../../../../test-utils/sheet-reference-values.json';

/**
 * Where LibreOffice differs from Excel, the engine follows Excel (the value here). LibreOffice's own error codes
 * (`Err:502` …) are accepted as any error.
 */
const EXCEL_DIFFERS: Record<string, string> = {
  '=SUM("3",2)': '5',                  // Excel converts numeric text in direct arguments
  '=COUNT(A1:F8)': '20',               // booleans in ranges are no numbers in Excel
  '=TRUE&"x"': 'TRUEx',                // Excel concatenates the text of a boolean
  '="z"<TRUE': '1',                    // Excel: text < boolean
  '="a"="A"': '1',                     // Excel compares text case-insensitively
  '=FLOOR(-2.5,-2)': '-2',             // Excel's FLOOR/CEILING with negative significance (LibreOffice swaps them)
  '=CEILING(-2.5,-2)': '-4',
  '=1E15&""': '1E+15',                 // Excel: more than 15 digits as exponent
  '=MATCH(5,E2:E7,1)': '#N/A',         // Excel skips booleans when looking up a number
};

const data: unknown[][] = (reference.data as unknown[][]).map(row => row.map((v, c) => {
  if (v === '') return null;
  if (c === 3 && typeof v === 'string' && /^\d{4}-/.test(v)) {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  if (v === 'TRUE') return true;
  if (v === 'FALSE') return false;
  return v;
}));

function actualText(v: unknown): string {
  if (isFormulaError(v)) return v.code;
  if (v instanceof Date) return String(dateToSerial(v));
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (v === null || v === undefined) return '';
  return String(v);
}

describe('cell formulas = LibreOffice / Excel', () => {
  const rows = data.map(r => [...r, null]);
  const cases = reference.cases as Array<{ formula: string; expected: string }>;
  cases.forEach((c, i) => {
    while (rows.length <= i) rows.push([null, null, null, null, null, null, null]);
    rows[i][7] = c.formula;
  });
  const engine = SheetEngine.fromArrays(rows);

  it.each(cases.map((c, i) => [c.formula, c.expected, i] as const))('%s → %s', (formula, expected, i) => {
    const actual = actualText(engine.getValue(i, 7));
    const want = EXCEL_DIFFERS[formula] ?? expected;
    if (want.startsWith('Err:')) {
      expect(actual.startsWith('#')).toBe(true);
    } else if (Number.isFinite(Number(want)) && want !== '' && Number.isFinite(Number(actual))) {
      expect(Number(actual)).toBeCloseTo(Number(want), 9);
    } else {
      expect(actual).toBe(want);
    }
  });
});
