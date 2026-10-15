// Excel cells with a number format (prompt 008: shares of „Show values as“ as numbers with "0.0%").
import { describe, expect, it } from 'vitest';
import { ExcelService, isExcelFormattedValue } from '@guiexpert/table';
import { readZipBlob } from '../../../../test-utils/zip';
import { excelFormatOfShowValuesAs } from '../calc/show-values-as-internals';

async function files(matrix: unknown[][]): Promise<{ sheet: string; styles: string }> {
  const zip = await readZipBlob(await new ExcelService().createExcelBlob(matrix as any[][]));
  return { sheet: zip.get('xl/worksheets/sheet1.xml')!.text, styles: zip.get('xl/styles.xml')!.text };
}

describe('ExcelFormattedValueIf', () => {
  it('a number with format gets its own cell style (numFmt 164…), other cells stay unchanged', async () => {
    const { sheet, styles } = await files([
      ['Share', 'Other'],
      [{ value: 0.667, numberFormat: '0.0%' }, 5],
      [{ value: 0.333, numberFormat: '0.0%' }, { value: 1234.5, numberFormat: '#,##0.00' }],
    ]);
    expect(sheet).toContain('<c r="A2" s="1"><v>0.667</v></c>');
    expect(sheet).toContain('<c r="B2"><v>5</v></c>');
    expect(sheet).toContain('<c r="B3" s="2"><v>1234.5</v></c>');
    expect(styles).toContain('<numFmts count="2"><numFmt numFmtId="164" formatCode="0.0%"/><numFmt numFmtId="165" formatCode="#,##0.00"/></numFmts>');
    expect(styles).toContain('<cellXfs count="3">');
    expect(styles).toContain('<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>');
  });

  it('without formats the styles are the same as before', async () => {
    const { styles } = await files([['a', 1]]);
    expect(styles).not.toContain('numFmts');
    expect(styles).toContain('<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>');
  });

  it('a format code is escaped; a non-finite value is written as text', async () => {
    const { sheet, styles } = await files([[{ value: 1, numberFormat: '0"<x>"' }, { value: Infinity, numberFormat: '0%' }]]);
    expect(styles).toContain('formatCode="0&quot;&lt;x&gt;&quot;"');
    expect(sheet).toContain('<c r="B1" t="inlineStr"><is><t>[object Object]</t></is></c>');
  });

  it('isExcelFormattedValue()', () => {
    expect(isExcelFormattedValue({ value: 1, numberFormat: '0%' })).toBe(true);
    expect(isExcelFormattedValue({ value: '1', numberFormat: '0%' })).toBe(false);
    expect(isExcelFormattedValue(1)).toBe(false);
    expect(isExcelFormattedValue(null)).toBe(false);
    expect(new ExcelService().supportsNumberFormats).toBe(true);
  });
});

describe('excelFormatOfShowValuesAs (internal)', () => {
  it('percent formats by fraction digits, none for other modes', () => {
    expect(excelFormatOfShowValuesAs('percentOfColumnTotal')).toBe('0.0%');
    expect(excelFormatOfShowValuesAs({ mode: 'percentOfRowTotal', fractionDigits: 0 })).toBe('0%');
    expect(excelFormatOfShowValuesAs({ mode: 'percentOfGrandTotal', fractionDigits: 3 })).toBe('0.000%');
    expect(excelFormatOfShowValuesAs('rank')).toBeUndefined();
    expect(excelFormatOfShowValuesAs(undefined)).toBeUndefined();
  });
});
