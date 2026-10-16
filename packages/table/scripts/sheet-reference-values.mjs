// Expected values of cell formulas from LibreOffice (headless) – prompt 013 stage 4.
//
//   node scripts/sheet-reference-values.mjs        (needs `soffice` on the PATH, writes test-utils/sheet-reference-values.json)
//
// The sheet below (A1:F8) plus one formula per row in column H is written as tab-separated text, LibreOffice
// computes it and exports the values; the JSON is checked in, so the tests don't need LibreOffice
// (src/lib/table/sheet/sheet-reference.spec.ts). Dates in the data are ISO text here and `Date` objects in the test.
// Formulas use ";" between arguments (LibreOffice reads it in every locale; the engine accepts "," and ";").
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const data = [
  ['Product', 'Price', 'Qty', 'Date', 'Flag', 'Code'],
  ['Laptop', 1299, 2, '2026-01-15', 'TRUE', 'A-100'],
  ['Monitor', 349, 3, '2026-02-28', 'FALSE', 'B-200'],
  ['Mouse', 25, 10, '2026-03-01', 'TRUE', 'C-300'],
  ['Keyboard', 79, 4, '2026-12-31', 'FALSE', 'D-400'],
  ['Dock', 189.5, 1, '2027-06-15', 'TRUE', 'E-500'],
  ['Headset', 99.99, 0, '2024-02-29', 'FALSE', 'F-600'],
  ['', -12.5, 7, '', '', 'mouse pad'],
];

// [formula, note] – Excel and LibreOffice agree on these (LibreOffice-only error codes "Err:5xx" are accepted as any error)
const formulas = [
  // math
  '=SUM(B2:B8)', '=SUM(B2:C3;10)', '=SUM(A2:A8)', '=SUM("3";2)', '=SUM(TRUE;1)', '=PRODUCT(C2:C5)', '=AVERAGE(B2:B8)',
  '=AVERAGE(C2:C8)', '=MIN(B2:B8)', '=MAX(B2:B8)', '=MIN(A2:A3)', '=COUNT(A1:F8)', '=COUNT(B2:B8;"5";TRUE)',
  '=COUNTA(A1:A8)', '=COUNTBLANK(A1:F8)', '=SUMPRODUCT(B2:B5;C2:C5)', '=ROUND(1.005;2)', '=ROUND(-2.5;0)',
  '=ROUND(1234.567;-2)', '=ROUNDUP(3.2;0)', '=ROUNDUP(-3.2;0)', '=ROUNDDOWN(3.789;1)', '=ROUNDDOWN(-3.789;1)',
  '=INT(-3.5)', '=INT(3.999)', '=ABS(-7)', '=MOD(10;3)', '=MOD(-10;3)', '=MOD(10;-3)', '=MOD(5;0)', '=POWER(2;10)',
  '=SQRT(16)', '=SQRT(-1)', '=FLOOR(2.5;2)', '=FLOOR(-2.5;-2)', '=FLOOR(0.3;0.1)', '=CEILING(2.5;2)',
  '=CEILING(-2.5;-2)', '=CEILING(1.01;0.05)', '=2^10', '=-2^2', '=2^-1', '=10/4', '=1/0', '=0.1+0.2', '=0.1+0.2=0.3',
  '=50%', '=B2*10%', '=1E3+1', '="3"+1', '=TRUE+1', '="abc"*2', '=1+2*3-4/2',
  // comparisons
  '="3"=3', '="a"<"B"', '="a"="A"', '=1<"a"', '="z"<TRUE', '=A8=0', '=A8=""', '=B2>=1299', '=B8<0',
  // conditional
  '=SUMIF(A2:A8;"M*";B2:B8)', '=SUMIF(B2:B8;">100")', '=SUMIF(C2:C8;"<>3";B2:B8)', '=SUMIF(A2:A8;"mouse";C2:C8)',
  '=SUMIF(F2:F8;"?-?00";C2:C8)', '=SUMIFS(B2:B8;C2:C8;">1";B2:B8;"<1000")', '=COUNTIF(B2:B8;">=99.99")',
  '=COUNTIF(A2:A8;"*o*")', '=COUNTIF(C2:C8;0)', '=COUNTIF(A2:A8;"")', '=COUNTIF(A2:A8;"<>")', '=COUNTIF(C2:C8;"3")',
  '=COUNTIFS(B2:B8;">50";C2:C8;"<4")', '=AVERAGEIF(C2:C8;">2";B2:B8)', '=AVERAGEIF(C2:C8;">100")',
  '=AVERAGEIFS(B2:B8;C2:C8;">0";B2:B8;">50")', '=COUNTIF(A2:A8;"m~*")',
  // logic
  '=IF(B2>1000;"high";"low")', '=IF(B3>1000;"high")', '=IF(1/0>1;1;2)', '=IFS(B4>100;"a";B4>10;"b";TRUE;"c")',
  '=IFS(FALSE;1)', '=IFERROR(1/0;"x")', '=IFERROR(5;"x")', '=IFNA(NA();"none")', '=IFNA(1/0;"none")',
  '=AND(TRUE;1;B2>0)', '=AND(B2:B5>0)', '=OR(FALSE;0)', '=OR(A2:A3)', '=NOT(0)', '=XOR(TRUE;TRUE;TRUE)',
  '=SWITCH(C3;1;"one";3;"three";"other")', '=SWITCH(C3;1;"one")', '=SWITCH(9;1;"one";"default")',
  // lookup
  '=VLOOKUP("Mouse";A2:C8;2;FALSE)', '=VLOOKUP("mouse";A2:C8;3;0)', '=VLOOKUP("Nope";A2:C8;2;FALSE)',
  '=VLOOKUP("M*";A2:C8;2;FALSE)', '=VLOOKUP(2;C2:C5;1;TRUE)', '=VLOOKUP("Mouse";A2:C8;5;FALSE)',
  '=HLOOKUP("Qty";A1:F8;3;FALSE)', '=HLOOKUP("Price";A1:F2;2;FALSE)', '=INDEX(A1:F8;3;2)', '=INDEX(B2:B8;4)',
  '=INDEX(A2:F2;3)', '=SUM(INDEX(B2:C8;0;2))', '=INDEX(A1:F8;20;1)', '=MATCH("Dock";A1:A8;0)', '=MATCH(100;B2:B6;1)',
  '=MATCH("d*";A1:A8;0)', '=MATCH(5;C2:C3;1)', '=MATCH("x";A1:A8;0)', '=MATCH(1;C2:C2;-1)',
  // text
  '=CONCAT(A2;"-";B2)', '=CONCAT(A2:A4)', '=TEXTJOIN(", ";TRUE;A2:A8)', '=TEXTJOIN("/";FALSE;A7:A8;"x")',
  '=LEFT("Laptop";3)', '=LEFT("Laptop")', '=RIGHT(F2;3)', '=MID("Laptop";2;3)', '=MID("abc";5;2)', '=LEN(A3)',
  '=LEN("")', '=FIND("o";"Monitor")', '=FIND("O";"Monitor")', '=FIND("o";"Monitor";3)', '=SEARCH("O";"Monitor")',
  '=SEARCH("m?n";"Monitor")', '=SEARCH("x";"abc")', '=SUBSTITUTE("a-b-c";"-";"+")', '=SUBSTITUTE("a-b-c";"-";"+";2)',
  '=UPPER("Mouse")', '=LOWER("MoUSE")', '=TRIM("  a   b  ")', '=VALUE("42.5")', '=VALUE("abc")',
  '=TEXT(1234.567;"0.00")', '=TEXT(1234.567;"#,##0")', '=TEXT(0.256;"0%")', '=TEXT(0.256;"0.0%")', '=TEXT(-5.5;"0")',
  '="Total: "&B2', '=B5&""', '=1/3&""', '=TRUE&"x"',
  // date
  '=DATE(2026;10;16)', '=DATE(2026;14;1)', '=DATE(2026;3;0)', '=YEAR(D2)', '=MONTH(D3)', '=DAY(D4)', '=D3+1', '=D4-D3',
  '=WEEKDAY(D2)', '=WEEKDAY(D2;2)', '=WEEKDAY(D2;3)', '=EOMONTH(D2;0)', '=EOMONTH(D2;1)', '=EOMONTH(D3;-2)',
  '=DATEDIF(D2;D5;"d")', '=DATEDIF(D2;D5;"m")', '=DATEDIF(D7;D6;"y")', '=DATEDIF(D5;D2;"d")', '=YEAR(DATE(2024;2;29)+365)',
  '=D2>D3', '=MAX(D2:D7)', '=TEXT(D2;"yyyy-mm-dd")', '=TEXT(D2;"dd.mm.yyyy")',
  // info
  '=ISBLANK(A8)', '=ISBLANK(A9)', '=ISNUMBER(B2)', '=ISNUMBER(D2)', '=ISNUMBER("5")', '=ISTEXT(A2)', '=ISTEXT(B2)',
  '=ISERROR(1/0)', '=ISERROR(1)', '=ISNA(NA())', '=ISNA(1/0)', '=NA()',
  // stage 4 review
  '=2^3^2', '=-2^-2', '=WEEKDAY(D2;11)',
  '=WEEKDAY(D2;13)', '=WEEKDAY(D2;17)', '=WEEKDAY(D2;2.9)', '=WEEKDAY(D2;10)', '=DATEDIF(D7;D6;"ym")',
  '=DATEDIF(D7;D6;"md")', '=DATEDIF(D7;D6;"yd")', '=DATEDIF(D2;D5;"md")', '=DATEDIF(D2;D5;"ym")', '=DATEDIF(D3;D4;"yd")',
  '=VLOOKUP("Mouse";A2:C8;2;)', '=VLOOKUP(2;C2:C5;1;)', '=1E15&""', '=123456789012345&""', '=TEXT("abc";"0.00")',
  '=MATCH(5;E2:E7;1)', '=SUMIF(C2:C8;">2";B2:B3)', '=AVERAGEIF(C2:C8;">2";B2)', '=SUMIF(C2:C8;">2";B2)',
];

const dir = mkdtempSync(join(tmpdir(), 'sheet-ref-'));
const rows = data.map(r => [...r.map(String), '']);
formulas.forEach((f, i) => {
  while (rows.length <= i) rows.push(['', '', '', '', '', '', '']);
  rows[i][7] = f;
});
const input = join(dir, 'cases.tsv');
writeFileSync(input, rows.map(r => r.join('\t')).join('\n'));
execFileSync('soffice', ['--headless', '--infilter=Text - txt - csv (StarCalc):9,34,76,1,,1033,false,true',
  '--convert-to', 'csv:Text - txt - csv (StarCalc):9,34,76,1,,1033,false,true,false,false,false,-1', input, '--outdir', join(dir, 'out')],
  { stdio: 'pipe' });
const out = readdirSync(join(dir, 'out')).find(f => f.endsWith('.csv'));
const lines = readFileSync(join(dir, 'out', out), 'utf8').split(/\r?\n/);
const cases = formulas.map((formula, i) => {
  const cells = lines[i].split('\t');
  let v = cells[7] ?? '';
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/""/g, '"');
  return { formula: formula.replace(/;/g, ','), expected: v };
});
writeFileSync(new URL('../test-utils/sheet-reference-values.json', import.meta.url),
  JSON.stringify({ generator: 'LibreOffice headless (scripts/sheet-reference-values.mjs)', data, cases }, null, 1) + '\n');
console.log(`${cases.length} cases written`);
