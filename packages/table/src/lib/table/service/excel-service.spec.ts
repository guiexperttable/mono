import { afterEach, describe, expect, it, vi, beforeAll } from 'vitest';
import { ExcelService } from '@guiexpert/table';
import { readZip, readZipBlob, type ZipArchive } from '../../../../test-utils/zip';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const EXPECTED_ENTRIES = [
  '[Content_Types].xml',
  '_rels/.rels',
  'docProps/app.xml',
  'docProps/core.xml',
  'xl/_rels/workbook.xml.rels',
  'xl/sharedStrings.xml',
  'xl/styles.xml',
  'xl/theme/theme1.xml',
  'xl/workbook.xml',
  'xl/worksheets/sheet1.xml',
];

async function xlsx(matrix: Array<Array<any>>, author?: string): Promise<ZipArchive> {
  const blob = await new ExcelService().createExcelBlob(matrix, author);
  return readZipBlob(blob);
}

let xZip: ZipArchive;

// The workbook of [['x']] without author – created once (before any test can stub CompressionStream)
// and shared by the read-only structure tests.
beforeAll(async () => {
  xZip = await xlsx([['x']]);
});

async function xlsxOfX(): Promise<ZipArchive> {
  return xZip;
}

async function sheetXml(matrix: Array<Array<any>>): Promise<string> {
  const zip = await xlsx(matrix);
  const sheet = zip.get('xl/worksheets/sheet1.xml');
  if (!sheet) throw new Error('sheet1.xml missing');
  return sheet.text;
}

/** All `<c …>…</c>` elements of the sheet, in document order. */
function cells(xml: string): string[] {
  return xml.match(/<c r="[A-Z]+\d+"[^>]*>.*?<\/c>/g) ?? [];
}

function cellXml(xml: string, address: string): string | undefined {
  return cells(xml).find(c => c.startsWith(`<c r="${address}"`));
}

function filesMap(files: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(files));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('ExcelService', () => {

  describe('createExcelBlob – archive structure', () => {

    it('returns a Blob with the xlsx MIME type', async () => {
      const blob = await new ExcelService().createExcelBlob([['a']]);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(XLSX_MIME);
    });

    it('starts with a local file header signature (PK\\x03\\x04)', async () => {
      const blob = await new ExcelService().createExcelBlob([['a']]);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect(Array.from(bytes.subarray(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    });

    it('contains exactly the parts of a minimal workbook', async () => {
      const zip = await xlsx([['a', 1]]);
      expect([...zip.names].sort()).toEqual(EXPECTED_ENTRIES);
    });

    it('writes the entry count into the end-of-central-directory record', async () => {
      const zip = await xlsx([['a', 1]]);
      expect(zip.totalEntriesInEocd).toBe(EXPECTED_ENTRIES.length);
    });

    // Regression: the CRC used to be written as 0 → Excel reported the file as corrupt.
    it('writes the correct CRC-32 of the uncompressed data for every entry', async () => {
      const zip = await xlsx([['Name', 'Age'], ['Ann', 42], ['Bob', 7]]);
      for (const e of zip.entries) {
        expect(e.crc, e.name).not.toBe(0);
        expect(e.crc, e.name).toBe(e.actualCrc);
        expect(e.localCrc, e.name).toBe(e.crc);
      }
    });

    it('writes the uncompressed size of every entry', async () => {
      const zip = await xlsxOfX();
      for (const e of zip.entries) {
        expect(e.uncompressedSize, e.name).toBe(e.data.length);
      }
    });

    it('deflates the large XML parts (method 8) and they inflate back to valid XML', async () => {
      const zip = await xlsxOfX();
      const theme = zip.get('xl/theme/theme1.xml');
      expect(theme?.method).toBe(8);
      expect(theme!.compressedSize).toBeLessThan(theme!.uncompressedSize);
      expect(theme!.text).toContain('<a:theme ');
    });

    it('uses version 2.0 and no general purpose flags in the local headers', async () => {
      const zip = await xlsxOfX();
      for (const e of zip.entries) {
        expect(e.versionNeeded, e.name).toBe(20);
        expect(e.flags, e.name).toBe(0);
      }
    });

    it('every entry is an XML document with UTF-8 declaration', async () => {
      const zip = await xlsxOfX();
      for (const e of zip.entries) {
        expect(e.text.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'), e.name).toBe(true);
      }
    });

    it('produces byte-identical files for identical input (no timestamps)', async () => {
      const svc = new ExcelService();
      const a = new Uint8Array(await (await svc.createExcelBlob([['a', 1]], 'me')).arrayBuffer());
      const b = new Uint8Array(await (await svc.createExcelBlob([['a', 1]], 'me')).arrayBuffer());
      expect(a).toEqual(b);
    });

    it('[Content_Types].xml declares an override for every XML part', async () => {
      const zip = await xlsxOfX();
      const ct = zip.get('[Content_Types].xml')!.text;
      for (const part of EXPECTED_ENTRIES.filter(n => n.endsWith('.xml') && !n.startsWith('['))) {
        expect(ct, part).toContain(`PartName="/${part}"`);
      }
    });

    it('the workbook has exactly one sheet "Sheet1" linked to worksheets/sheet1.xml', async () => {
      const zip = await xlsxOfX();
      const wb = zip.get('xl/workbook.xml')!.text;
      expect(wb.match(/<sheet /g)).toHaveLength(1);
      expect(wb).toContain('<sheet name="Sheet1" sheetId="1" r:id="rId1"/>');
      expect(zip.get('xl/_rels/workbook.xml.rels')!.text)
        .toContain('Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"');
    });

    it('writes a placeholder sharedStrings.xml that does not depend on the data', async () => {
      // NOTE: cells are written as inline strings; the shared strings table is a fixed leftover ("a", "b", "c").
      const zip = await xlsx([['Hello', 'World']]);
      expect(zip.get('xl/sharedStrings.xml')!.text)
        .toContain('<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3"><si><t>a</t></si><si><t>b</t></si><si><t>c</t></si></sst>');
    });
  });

  describe('createExcelBlob – docProps', () => {

    it('writes the author as creator and lastModifiedBy into docProps/core.xml', async () => {
      const zip = await xlsx([['x']], 'Jane Doe');
      const core = zip.get('docProps/core.xml')!.text;
      expect(core).toContain('<dc:creator>Jane Doe</dc:creator>');
      expect(core).toContain('<cp:lastModifiedBy>Jane Doe</cp:lastModifiedBy>');
    });

    it('writes an empty creator when no author is given', async () => {
      const zip = await xlsxOfX();
      expect(zip.get('docProps/core.xml')!.text).toContain('<dc:creator></dc:creator>');
    });

    it('writes fixed created/modified timestamps', async () => {
      // NOTE: the document dates are hard-coded (2024-12-13), not the export time.
      const core = (await xlsxOfX()).get('docProps/core.xml')!.text;
      expect(core).toContain('<dcterms:created xsi:type="dcterms:W3CDTF">2024-12-13T19:45:08Z</dcterms:created>');
      expect(core).toContain('<dcterms:modified xsi:type="dcterms:W3CDTF">2024-12-13T19:45:35Z</dcterms:modified>');
    });

    // Regression (fixed in 1.1.103): the author was inserted into core.xml without XML escaping → invalid XML.
    it('escapes XML special characters in the author', async () => {
      const core = (await xlsx([['x']], 'Smith & <Sons>')).get('docProps/core.xml')!.text;
      expect(core).toContain('<dc:creator>Smith &amp; &lt;Sons&gt;</dc:creator>');
      expect(core).toContain('<cp:lastModifiedBy>Smith &amp; &lt;Sons&gt;</cp:lastModifiedBy>');
    });

    it('docProps/app.xml names the single worksheet "Sheet1"', async () => {
      const app = (await xlsxOfX()).get('docProps/app.xml')!.text;
      expect(app).toContain('<vt:lpstr>Sheet1</vt:lpstr>');
    });
  });

  describe('createExcelBlob – sheet dimension and rows', () => {

    // Regression: the dimension used to be hard-coded to A1:B3.
    it.each([
      { matrix: [['a']], ref: 'A1:A1' },
      { matrix: [['a', 'b'], ['c', 'd'], ['e', 'f']], ref: 'A1:B3' },
      { matrix: [[1, 2, 3, 4, 5]], ref: 'A1:E1' },
      { matrix: [[1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11]], ref: 'A1:A11' },
      { matrix: [[1], [1, 2, 3], [1, 2]], ref: 'A1:C3' }, // ragged rows → longest row wins
    ])('writes <dimension ref="$ref"/> for a matrix of that size', async ({ matrix, ref }) => {
      expect(await sheetXml(matrix)).toContain(`<dimension ref="${ref}"/>`);
    });

    it('writes dimension "A1" and no rows for an empty matrix', async () => {
      const xml = await sheetXml([]);
      expect(xml).toContain('<dimension ref="A1"/>');
      expect(xml).not.toContain('<row ');
      expect(xml).toContain('<sheetData>');
      expect(xml).toContain('</sheetData>');
    });

    it('uses AA, AB … after Z in the dimension for 28 columns', async () => {
      const row = Array.from({ length: 28 }, (_, i) => i);
      expect(await sheetXml([row])).toContain('<dimension ref="A1:AB1"/>');
    });

    // Regression: the row number used to be written as the literal text "${r + 1}".
    it('numbers the rows 1..n', async () => {
      const xml = await sheetXml([['a'], ['b'], ['c']]);
      const rowNumbers = [...xml.matchAll(/<row r="([^"]*)"/g)].map(m => m[1]);
      expect(rowNumbers).toEqual(['1', '2', '3']);
      expect(xml).not.toContain('${');
    });

    it('writes spans="1:<column count>" on every row, using the longest row', async () => {
      const xml = await sheetXml([[1], [1, 2, 3]]);
      const spans = [...xml.matchAll(/<row r="\d+" spans="([^"]*)"/g)].map(m => m[1]);
      expect(spans).toEqual(['1:3', '1:3']);
    });

    it('writes one <c> per value, also for the short rows of a ragged matrix (no padding)', async () => {
      const xml = await sheetXml([[1], [1, 2, 3]]);
      expect(cells(xml).map(c => c.match(/r="([A-Z]+\d+)"/)![1])).toEqual(['A1', 'A2', 'B2', 'C2']);
    });

    it('addresses cells column-major letters + 1-based row (A1, B1, A2 …)', async () => {
      const xml = await sheetXml([[1, 2], [3, 4]]);
      expect(cells(xml)).toEqual([
        '<c r="A1"><v>1</v></c>',
        '<c r="B1"><v>2</v></c>',
        '<c r="A2"><v>3</v></c>',
        '<c r="B2"><v>4</v></c>',
      ]);
    });

    it('converts column indices to Excel letters (Z, AA, AZ, BA, ZZ, AAA)', async () => {
      const row = Array.from({ length: 703 }, () => 0);
      const xml = await sheetXml([row]);
      const addresses = cells(xml).map(c => c.match(/r="([A-Z]+)1"/)![1]);
      expect(addresses[0]).toBe('A');
      expect(addresses[25]).toBe('Z');
      expect(addresses[26]).toBe('AA');
      expect(addresses[51]).toBe('AZ');
      expect(addresses[52]).toBe('BA');
      expect(addresses[701]).toBe('ZZ');
      expect(addresses[702]).toBe('AAA');
      expect(xml).toContain('<dimension ref="A1:AAA1"/>');
    });
  });

  describe('createExcelBlob – cell values', () => {

    it('writes numbers as numeric cells (<v>, no type attribute)', async () => {
      const xml = await sheetXml([[42, -1.5, 0, 1e21]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1"><v>42</v></c>');
      expect(cellXml(xml, 'B1')).toBe('<c r="B1"><v>-1.5</v></c>');
      expect(cellXml(xml, 'C1')).toBe('<c r="C1"><v>0</v></c>');
      expect(cellXml(xml, 'D1')).toBe('<c r="D1"><v>1e+21</v></c>');
    });

    it('writes strings as inline strings', async () => {
      const xml = await sheetXml([['Hello']]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>Hello</t></is></c>');
    });

    it('keeps numeric-looking strings as text', async () => {
      const xml = await sheetXml([['007']]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>007</t></is></c>');
    });

    it('escapes the XML special characters < & > " \' in strings', async () => {
      const xml = await sheetXml([[`a<b & c>d "e" 'f'`]]);
      expect(cellXml(xml, 'A1')).toBe(
        '<c r="A1" t="inlineStr"><is><t>a&lt;b &amp; c&gt;d &quot;e&quot; &apos;f&apos;</t></is></c>');
    });

    it('does not double-escape an existing entity', async () => {
      const xml = await sheetXml([['&amp;']]);
      expect(cellXml(xml, 'A1')).toContain('<t>&amp;amp;</t>');
    });

    it('writes non-ASCII text as UTF-8', async () => {
      const xml = await sheetXml([['Grüße – 日本 🙂']]);
      expect(cellXml(xml, 'A1')).toContain('<t>Grüße – 日本 🙂</t>');
    });

    it('writes booleans as the inline strings "true" / "false"', async () => {
      // NOTE: no boolean cell type (t="b") – Excel shows them as text.
      const xml = await sheetXml([[true, false]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>true</t></is></c>');
      expect(cellXml(xml, 'B1')).toBe('<c r="B1" t="inlineStr"><is><t>false</t></is></c>');
    });

    it('writes null and undefined as empty inline strings', async () => {
      const xml = await sheetXml([[null, undefined, 'x']]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t></t></is></c>');
      expect(cellXml(xml, 'B1')).toBe('<c r="B1" t="inlineStr"><is><t></t></is></c>');
      expect(cellXml(xml, 'C1')).toBe('<c r="C1" t="inlineStr"><is><t>x</t></is></c>');
    });

    it('writes dates as ISO-8601 text (UTC)', async () => {
      // NOTE: dates are text, not Excel date serials – Excel can't calculate with them.
      const xml = await sheetXml([[new Date(Date.UTC(2024, 0, 31, 13, 45, 0))]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>2024-01-31T13:45:00.000Z</t></is></c>');
    });

    it('writes other objects via String() (e.g. "[object Object]", arrays comma-joined)', async () => {
      const xml = await sheetXml([[{ a: 1 }, [1, 'b']]]);
      expect(cellXml(xml, 'A1')).toContain('<t>[object Object]</t>');
      expect(cellXml(xml, 'B1')).toContain('<t>1,b</t>');
    });

    // Regression (fixed in 1.1.103): NaN / Infinity were written as <v>NaN</v> / <v>Infinity</v> – not valid numbers in
    // OOXML, Excel reported the file as corrupt. Now text cells, as the table shows them.
    it('does not write NaN and Infinity as (invalid) numeric cells', async () => {
      const xml = await sheetXml([[NaN, Infinity, -Infinity]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>NaN</t></is></c>');
      expect(cellXml(xml, 'B1')).toBe('<c r="B1" t="inlineStr"><is><t>Infinity</t></is></c>');
      expect(cellXml(xml, 'C1')).toBe('<c r="C1" t="inlineStr"><is><t>-Infinity</t></is></c>');
    });

    // fixed in 1.1.103: toISOString() threw a RangeError and aborted the whole export
    it('writes an invalid Date as text instead of throwing', async () => {
      const xml = await sheetXml([[new Date(NaN)]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>Invalid Date</t></is></c>');
    });

    // fixed in 1.1.103: control characters are not allowed in XML 1.0 – Excel reported the file as corrupt
    it('removes XML-illegal control characters, keeps tab, LF and CR', async () => {
      const xml = await sheetXml([['a\u0000b\u0007c\u001Fd', 'x\ty\nz\r']]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>abcd</t></is></c>');
      expect(xml).toContain('<c r="B1" t="inlineStr"><is><t>x\ty\nz\r</t></is></c>'); // cellXml() stops at line breaks
      const core = (await xlsx([['x']], 'Smith\u0001')).get('docProps/core.xml')!.text;
      expect(core).toContain('<dc:creator>Smith</dc:creator>');
    });

    it('writes a formatted value with NaN as its plain text, not "[object Object]"', async () => {
      const xml = await sheetXml([[{ value: NaN, numberFormat: '0.0%' }]]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>NaN</t></is></c>');
    });

    it('does not mark strings with leading/trailing spaces as xml:space="preserve"', async () => {
      // NOTE: without xml:space="preserve" Excel may drop the leading/trailing spaces.
      const xml = await sheetXml([['  padded  ']]);
      expect(cellXml(xml, 'A1')).toBe('<c r="A1" t="inlineStr"><is><t>  padded  </t></is></c>');
    });
  });

  describe('createZip (stored, synchronous)', () => {

    it('stores every file uncompressed (method 0) with its exact content', () => {
      const bytes = new ExcelService().createZip(filesMap({ 'a.txt': 'Hello', 'dir/b.xml': '<x/>' }));
      const zip = readZip(bytes);
      expect(zip.names).toEqual(['a.txt', 'dir/b.xml']);
      expect(zip.entries.map(e => e.method)).toEqual([0, 0]);
      expect(zip.get('a.txt')!.text).toBe('Hello');
      expect(zip.get('dir/b.xml')!.text).toBe('<x/>');
    });

    it('writes the standard CRC-32 check value for "123456789" (0xCBF43926)', () => {
      const zip = readZip(new ExcelService().createZip(filesMap({ 'check.txt': '123456789' })));
      expect(zip.get('check.txt')!.crc).toBe(0xCBF43926);
      expect(zip.get('check.txt')!.localCrc).toBe(0xCBF43926);
    });

    it('writes CRC 0 for an empty file', () => {
      const zip = readZip(new ExcelService().createZip(filesMap({ 'empty.txt': '' })));
      expect(zip.get('empty.txt')!.crc).toBe(0);
      expect(zip.get('empty.txt')!.uncompressedSize).toBe(0);
    });

    it('computes the CRC over the UTF-8 bytes of the content', () => {
      const zip = readZip(new ExcelService().createZip(filesMap({ 'u.txt': 'äöü€' })));
      const e = zip.get('u.txt')!;
      expect(e.uncompressedSize).toBe(new TextEncoder().encode('äöü€').length);
      expect(e.crc).toBe(e.actualCrc);
    });

    it('writes an archive of only the end-of-central-directory record (22 bytes) for no files', () => {
      const bytes = new ExcelService().createZip(new Map());
      expect(bytes.length).toBe(22);
      expect(Array.from(bytes.subarray(0, 4))).toEqual([0x50, 0x4b, 0x05, 0x06]);
      expect(readZip(bytes).entries).toEqual([]);
    });

    it('has the exact byte length: local headers + data + central headers + EOCD', () => {
      const bytes = new ExcelService().createZip(filesMap({ 'ab': 'xyz' }));
      // 30 + 2 (name) + 3 (data) + 46 + 2 (name) + 22
      expect(bytes.length).toBe(105);
    });

    it('sets the DOS modification date 1980-01-01 (0x0021) and time 0', () => {
      const bytes = new ExcelService().createZip(filesMap({ 'a': 'b' }));
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      expect(view.getUint16(10, true)).toBe(0);
      expect(view.getUint16(12, true)).toBe(0x21);
    });

    it('writes non-ASCII file names as UTF-8 bytes without setting the UTF-8 flag (bit 11)', () => {
      // NOTE: the language-encoding flag is never set; harmless for the ASCII names of an xlsx.
      const zip = readZip(new ExcelService().createZip(filesMap({ 'für.txt': 'x' })));
      expect(zip.names).toEqual(['für.txt']);
      expect(zip.entries[0].flags & 0x0800).toBe(0);
    });
  });

  describe('createZipCompressed', () => {

    it('deflates compressible content (method 8) and keeps the CRC of the uncompressed data', async () => {
      const content = 'abc'.repeat(1000);
      const zip = readZip(await new ExcelService().createZipCompressed(filesMap({ 'r.txt': content })));
      const e = zip.get('r.txt')!;
      expect(e.method).toBe(8);
      expect(e.compressedSize).toBeLessThan(content.length);
      expect(e.uncompressedSize).toBe(content.length);
      expect(e.text).toBe(content);
      expect(e.crc).toBe(e.actualCrc);
    });

    it('stores content uncompressed (method 0) when deflate would not make it smaller', async () => {
      const zip = readZip(await new ExcelService().createZipCompressed(filesMap({ 'tiny.txt': 'a' })));
      expect(zip.get('tiny.txt')!.method).toBe(0);
      expect(zip.get('tiny.txt')!.text).toBe('a');
    });

    it('keeps the insertion order of the map', async () => {
      const zip = readZip(await new ExcelService().createZipCompressed(filesMap({ z: '1', a: '2', m: '3' })));
      expect(zip.names).toEqual(['z', 'a', 'm']);
    });

    it('falls back to stored entries when CompressionStream is not available', async () => {
      vi.stubGlobal('CompressionStream', undefined);
      const content = 'abc'.repeat(1000);
      const zip = readZip(await new ExcelService().createZipCompressed(filesMap({ 'r.txt': content })));
      expect(zip.get('r.txt')!.method).toBe(0);
      expect(zip.get('r.txt')!.text).toBe(content);
      expect(zip.get('r.txt')!.crc).toBe(zip.get('r.txt')!.actualCrc);
    });

    it('falls back to stored entries when "deflate-raw" is not supported', async () => {
      vi.stubGlobal('CompressionStream', class {
        constructor(format: string) {
          throw new TypeError(`unsupported: ${format}`);
        }
      });
      const zip = readZip(await new ExcelService().createZipCompressed(filesMap({ 'r.txt': 'abc'.repeat(100) })));
      expect(zip.get('r.txt')!.method).toBe(0);
    });

    it('createExcelBlob still produces a valid workbook without CompressionStream', async () => {
      vi.stubGlobal('CompressionStream', undefined);
      const zip = await xlsx([['a', 1]]);
      expect(zip.entries.every(e => e.method === 0)).toBe(true);
      expect(zip.entries.every(e => e.crc === e.actualCrc)).toBe(true);
      expect(zip.get('xl/worksheets/sheet1.xml')!.text).toContain('<dimension ref="A1:B1"/>');
    });
  });

  describe('downloadExcel', () => {

    it('throws synchronously (no rejected promise) for a matrix that is not a 2D array', () => {
      // NOTE: the method returns a Promise but validation errors are thrown synchronously.
      const svc = new ExcelService();
      expect(() => svc.downloadExcel([1, 2] as any)).toThrow('Invalid matrix format. Expected a 2D array.');
      expect(() => svc.downloadExcel('x' as any)).toThrow('Invalid matrix format. Expected a 2D array.');
    });

    it('throws synchronously for an empty or blank filename', () => {
      const svc = new ExcelService();
      expect(() => svc.downloadExcel([['a']], '')).toThrow('Invalid filename. Filename must be a non-empty string.');
      expect(() => svc.downloadExcel([['a']], '   ')).toThrow('Invalid filename. Filename must be a non-empty string.');
    });

    it('clicks a temporary download link with the blob URL and revokes the URL after 1 s', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout'] });
      const link = { href: '', download: '', click: vi.fn() };
      const doc = {
        createElement: vi.fn(() => link),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      };
      vi.stubGlobal('document', doc);
      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

      await new ExcelService().downloadExcel([['a', 1]], 'report.xlsx', 'Me');

      expect(doc.createElement).toHaveBeenCalledWith('a');
      expect(link.href).toBe('blob:fake-url');
      expect(link.download).toBe('report.xlsx');
      expect(link.click).toHaveBeenCalledTimes(1);
      expect(doc.body.appendChild).toHaveBeenCalledWith(link);
      expect(doc.body.removeChild).toHaveBeenCalledWith(link);
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe(XLSX_MIME);
      expect(readZip(new Uint8Array(await blob.arrayBuffer())).get('docProps/core.xml')!.text)
        .toContain('<dc:creator>Me</dc:creator>');

      expect(revokeObjectURL).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    });

    it('uses "file.xlsx" as default filename', async () => {
      const link = { href: '', download: '', click: vi.fn() };
      vi.stubGlobal('document', { createElement: () => link, body: { appendChild: vi.fn(), removeChild: vi.fn() } });
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      vi.useFakeTimers({ toFake: ['setTimeout'] });

      await new ExcelService().downloadExcel([['a']]);
      expect(link.download).toBe('file.xlsx');
    });

    it('rejects with "Failed to download Excel file." and logs when the download fails (e.g. no DOM)', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      // Node: no `document` → ReferenceError inside the promise chain
      await expect(new ExcelService().downloadExcel([['a']], 'x.xlsx')).rejects.toThrow('Failed to download Excel file.');
      expect(consoleError).toHaveBeenCalledWith('Error generating Excel file:', expect.any(ReferenceError));
    });
  });
});

describe('right-to-left sheet (ExcelExportOptionsIf, since 1.1.98)', () => {

  it('rightToLeft writes <sheetView rightToLeft="1">', async () => {
    const zip = await readZipBlob(await new ExcelService().createExcelBlob([['المدينة'], ['الرياض']], '', { rightToLeft: true }));
    expect(zip.get('xl/worksheets/sheet1.xml')!.text).toContain('<sheetView rightToLeft="1" tabSelected="1" workbookViewId="0"/>');
  });

  it('without options the sheet is unchanged (left-to-right)', async () => {
    const sheet = (await xlsxOfX()).get('xl/worksheets/sheet1.xml')!.text;
    expect(sheet).toContain('<sheetView tabSelected="1" workbookViewId="0"/>');
    expect(sheet).not.toContain('rightToLeft');
  });

  it('downloadExcel passes the options on', async () => {
    const service = new ExcelService();
    const spy = vi.spyOn(service, 'createExcelBlob').mockResolvedValue(new Blob(['x']));
    vi.stubGlobal('document', { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } });
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL() {} });
    await service.downloadExcel([['a']], 'a.xlsx', 'me', { rightToLeft: true });
    expect(spy).toHaveBeenCalledWith([['a']], 'me', { rightToLeft: true });
  });
});

describe('right-to-left sheet (ExcelExportOptionsIf, since 1.1.98)', () => {

  it('rightToLeft writes <sheetView rightToLeft="1">', async () => {
    const zip = await readZipBlob(await new ExcelService().createExcelBlob([['المدينة'], ['الرياض']], '', { rightToLeft: true }));
    expect(zip.get('xl/worksheets/sheet1.xml')!.text).toContain('<sheetView rightToLeft="1" tabSelected="1" workbookViewId="0"/>');
  });

  it('without options the sheet is unchanged (left-to-right)', async () => {
    const sheet = (await xlsxOfX()).get('xl/worksheets/sheet1.xml')!.text;
    expect(sheet).toContain('<sheetView tabSelected="1" workbookViewId="0"/>');
    expect(sheet).not.toContain('rightToLeft');
  });

  it('downloadExcel passes the options on', async () => {
    const service = new ExcelService();
    const spy = vi.spyOn(service, 'createExcelBlob').mockResolvedValue(new Blob(['x']));
    vi.stubGlobal('document', { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } });
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL() {} });
    await service.downloadExcel([['a']], 'a.xlsx', 'me', { rightToLeft: true });
    expect(spy).toHaveBeenCalledWith([['a']], 'me', { rightToLeft: true });
  });
});
