// Cell formulas in the Excel file (prompt 013 stage 5, S20): <f> with cached <v>, _xlfn., fullCalcOnLoad.
import { describe, expect, it } from 'vitest';
import { ExcelService, FormulaError, isExcelFormulaCell } from '@guiexpert/table';
import { readZipBlob } from '../../../../test-utils/zip';
import { toExcelFormula } from './excel-formula';

async function files(matrix: unknown[][]): Promise<{ sheet: string; workbook: string }> {
  const zip = await readZipBlob(await new ExcelService().createExcelBlob(matrix as any[][]));
  return { sheet: zip.get('xl/worksheets/sheet1.xml')!.text, workbook: zip.get('xl/workbook.xml')!.text };
}

describe('Excel formulas', () => {
  it('toExcelFormula: all references move, _xlfn. for newer functions, texts stay', () => {
    const at = { dRow: 1, dCol: 1, rows: 5, cols: 3 };
    expect(toExcelFormula('=$B$2*C2', { ...at, dCol: 0 })).toBe('$B$3*C3');
    expect(toExcelFormula('=SUM(A:A)+B2', at)).toBe('SUM(B$2:B$6)+C3'); // whole columns: only the data rows
    expect(toExcelFormula('=SUM(2:2)', at)).toBe('SUM($B3:$D3)');
    expect(toExcelFormula('=IFS(A1>1,"XLOOKUP(",TRUE,XLOOKUP(1,A1:A2,B1:B2))', { ...at, dRow: 0, dCol: 0 }))
      .toBe('_xlfn.IFS(A1>1,"XLOOKUP(",TRUE,_xlfn.XLOOKUP(1,A1:A2,B1:B2))');
    expect(toExcelFormula('=sum(a1)', at)).toBe('SUM(B2)');
    expect(toExcelFormula('=SUM(', at)).toBeUndefined();          // a syntax error: the value
    expect(toExcelFormula('=[price]*2', at)).toBeUndefined();     // a field: the value
    expect(toExcelFormula('=-A1%', at)).toBe('-B2%');
  });

  it('cells: <f> + typed <v>; own error codes as #VALUE!; the workbook recalculates on load', async () => {
    const { sheet, workbook } = await files([[
      1, { formula: 'A1*2', value: 2 }, { formula: 'A1&"<"', value: '1<' }, { formula: 'A1>0', value: true },
      { formula: '1/0', value: new FormulaError('#DIV/0!', 'x') }, { formula: 'A1', value: new FormulaError('#CIRC!', 'x') },
      { formula: 'DATE(2026,1,1)', value: new Date(2026, 0, 1) }, { formula: 'B1', value: null },
    ]]);
    expect(sheet).toContain('<c r="B1"><f>A1*2</f><v>2</v></c>');
    expect(sheet).toContain('<c r="C1" t="str"><f>A1&amp;&quot;&lt;&quot;</f><v>1&lt;</v></c>');
    expect(sheet).toContain('<c r="D1" t="b"><f>A1&gt;0</f><v>1</v></c>');
    expect(sheet).toContain('<c r="E1" t="e"><f>1/0</f><v>#DIV/0!</v></c>');
    expect(sheet).toContain('<c r="F1" t="e"><f>A1</f><v>#VALUE!</v></c>');
    expect(sheet).toContain('<c r="G1" s="1"><f>DATE(2026,1,1)</f><v>46023</v></c>'); // a date format
    expect(sheet).toContain('<c r="H1" t="str"><f>B1</f><v></v></c>');
    expect(workbook).toContain('<calcPr calcId="181029" fullCalcOnLoad="1"/>');
    expect((await files([[1]])).workbook).toContain('<calcPr calcId="181029"/>');
    expect(isExcelFormulaCell({ formula: 'A1' })).toBe(false);
    expect(new ExcelService().supportsFormulas).toBe(true);
  });
});
