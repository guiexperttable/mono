
import type { ExcelExportOptionsIf } from "./excel-export-options.if";
import { ExcelServiceIf, isExcelFormattedValue, isExcelFormulaCell } from './excel-service.if';
import { isFormulaError } from '../formula/formula-error';
import { dateToSerial } from '../sheet/sheet-values';

/** The number format of date results of formulas. */
const DATE_FORMAT = 'yyyy-mm-dd';

let crcTable: Uint32Array | undefined;

/**
 * CRC-32 (IEEE 802.3) of the given bytes – required in every ZIP entry header.
 */
function crc32(bytes: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Raw DEFLATE (ZIP method 8) with the browser's built-in CompressionStream – no library.
 * Returns undefined if the browser can't do it (very old browsers): the file is then stored uncompressed.
 */
async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array | undefined> {
  const CS = (globalThis as any).CompressionStream;
  if (!CS || typeof Response === 'undefined' || typeof Blob === 'undefined') return undefined;
  try {
    const stream = new Blob([bytes as any]).stream().pipeThrough(new CS('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (_e) {
    return undefined; // 'deflate-raw' not supported
  }
}

interface ZipEntry {
  path: Uint8Array;
  data: Uint8Array;       // bytes written into the file (compressed or not)
  size: number;           // uncompressed size
  crc: number;
  method: 0 | 8;          // 0 = stored, 8 = deflate
}

/**
 * Writes real `.xlsx` files (Office Open XML) without any library – compressed with the browser's
 * built-in `CompressionStream`. Numbers stay numbers, everything else becomes text.
 *
 * {@link TableApi.downloadExcel} exports what the table shows; use the ExcelService directly for any other data.
 *
 * @example
 * // all rows, own columns – independent of filter and sorting
 * const body = tableApi.getBodyModel() as AreaModelObjectArray<Order>;
 * const matrix = [
 *   ["ID", "Customer", "Total"],
 *   ...body.getAllRows().map(o => [o.id, o.customer, o.total])
 * ];
 * await new ExcelService().downloadExcel(matrix, "orders.xlsx", "GuiExpert");
 *
 * @example
 * // a Blob instead of a download, e.g. for an upload
 * const blob = await new ExcelService().createExcelBlob(matrix);
 *
 * @see Training: [Excel export without a library](https://gui.expert/training/excel-export/)
 *
 * @category Export & clipboard
 */
export class ExcelService implements ExcelServiceIf {

  /** Understands cells `{ value, numberFormat }` ({@link ExcelFormattedValueIf}), since 1.1.95. */
  readonly supportsNumberFormats = true;

  /** Understands cells `{ formula, value }` ({@link ExcelFormulaCellIf}), since 1.1.99. */
  readonly supportsFormulas = true;

  /**
   * Downloads a matrix data as an Excel file.
   *
   * @param {Array<Array<any>>} matrix - A 2D array representing the data to be included in the Excel file. Each inner array corresponds to a row in the sheet.
   * @param {string} [filename='file.xlsx'] - The name of the Excel file to be downloaded. Defaults to 'file.xlsx'.
   * @param {string} [author=''] - The author's name to include as metadata in the Excel file. Optional parameter.
   * @param {ExcelExportOptionsIf} [options] - e.g. `{ rightToLeft: true }` for a sheet from right to left (since 1.1.98)
   * @return {void} Does not return a value.
   * @throws {Error} Throws an error if the input matrix is not a valid 2D array or if the filename is an empty string.
   */
  downloadExcel(
    matrix: Array<Array<any>>,
    filename: string = 'file.xlsx',
    author: string='',
    options: ExcelExportOptionsIf = {}): Promise<void> {

    if (!Array.isArray(matrix) || matrix.some(row => !Array.isArray(row))) {
      throw new Error('Invalid matrix format. Expected a 2D array.');
    }

    if (filename?.trim() === '') {
      throw new Error('Invalid filename. Filename must be a non-empty string.');
    }

    return this.createExcelBlob(matrix, author, options)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000); // free the memory of the blob
      })
      .catch(error => {
        console.error('Error generating Excel file:', error);
        throw new Error('Failed to download Excel file.');
      });
  }

  /**
   * Creates the .xlsx file as a Blob (compressed), e.g. to upload it instead of downloading it.
   *
   * @example
   * const blob = await new ExcelService().createExcelBlob([["Name", "City"], ["Ann", "Berlin"]]);
   * await fetch("/api/upload", { method: "POST", body: blob });
   *
   * @example
   * // a sheet from right to left (column A on the right), since 1.1.98
   * const rtlBlob = await new ExcelService().createExcelBlob([["المدينة"], ["الرياض"]], "", { rightToLeft: true });
   */
  async createExcelBlob(matrix: Array<Array<any>>, author: string = '', options: ExcelExportOptionsIf = {}): Promise<Blob> {
    const bytes = await this.createZipCompressed(this.generateMap(matrix, author, options));
    return new Blob([bytes as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }


  private generateMap(data: Array<Array<any>>, author: string='', options: ExcelExportOptionsIf = {}):  Map<string, string> {

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;


    const docPropsAppXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Macintosh Excel</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>16.0300</AppVersion></Properties>`;
    const docPropsCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>${author}</dc:creator><cp:lastModifiedBy>${author}</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2024-12-13T19:45:08Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2024-12-13T19:45:35Z</dcterms:modified></cp:coreProperties>`;

    const x1WorkbookXmlRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;
    const x1ThemeTheme1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0E2841"/></a:dk2><a:lt2><a:srgbClr val="E8E8E8"/></a:lt2><a:accent1><a:srgbClr val="156082"/></a:accent1><a:accent2><a:srgbClr val="E97132"/></a:accent2><a:accent3><a:srgbClr val="196B24"/></a:accent3><a:accent4><a:srgbClr val="0F9ED5"/></a:accent4><a:accent5><a:srgbClr val="A02B93"/></a:accent5><a:accent6><a:srgbClr val="4EA72E"/></a:accent6><a:hlink><a:srgbClr val="467886"/></a:hlink><a:folHlink><a:srgbClr val="96607D"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Aptos Display" panose="02110004020202020204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック Light"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线 Light"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:majorFont><a:minorFont><a:latin typeface="Aptos Narrow" panose="02110004020202020204"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="游ゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="等线"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/><a:font script="Armn" typeface="Arial"/><a:font script="Bugi" typeface="Leelawadee UI"/><a:font script="Bopo" typeface="Microsoft JhengHei"/><a:font script="Java" typeface="Javanese Text"/><a:font script="Lisu" typeface="Segoe UI"/><a:font script="Mymr" typeface="Myanmar Text"/><a:font script="Nkoo" typeface="Ebrima"/><a:font script="Olck" typeface="Nirmala UI"/><a:font script="Osma" typeface="Ebrima"/><a:font script="Phag" typeface="Phagspa"/><a:font script="Syrn" typeface="Estrangelo Edessa"/><a:font script="Syrj" typeface="Estrangelo Edessa"/><a:font script="Syre" typeface="Estrangelo Edessa"/><a:font script="Sora" typeface="Nirmala UI"/><a:font script="Tale" typeface="Microsoft Tai Le"/><a:font script="Talu" typeface="Microsoft New Tai Lue"/><a:font script="Tfng" typeface="Ebrima"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs><a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults><a:lnDef><a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style></a:lnDef></a:objectDefaults><a:extraClrSchemeLst/><a:extLst><a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}"><thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{2E142A2C-CD16-42D6-873A-C26D2A0506FA}" vid="{1BDDFF52-6CD6-40A5-AB3C-68EB2F1E4D0A}"/></a:ext></a:extLst></a:theme>`;

    const x1SharedStringsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3"><si><t>a</t></si><si><t>b</t></si><si><t>c</t></si></sst>`;
    const x1StylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac x16r2 xr" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:x16r2="http://schemas.microsoft.com/office/spreadsheetml/2015/02/main" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision"><fonts count="1" x14ac:knownFonts="1"><font><sz val="12"/><color theme="1"/><name val="Aptos Narrow"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext><ext uri="{9260A510-F301-46a8-8635-F512D64BE5F5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:timelineStyles defaultTimelineStyle="TimeSlicerStyleLight1"/></ext></extLst></styleSheet>`;
    const x1WorksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x15 xr xr6 xr10 xr2" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr6="http://schemas.microsoft.com/office/spreadsheetml/2016/revision6" xmlns:xr10="http://schemas.microsoft.com/office/spreadsheetml/2016/revision10" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2"><fileVersion appName="xl" lastEdited="7" lowestEdited="7" rupBuild="11207"/><workbookPr defaultThemeVersion="202300"/><mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice Requires="x15"><x15ac:absPath url="/" xmlns:x15ac="http://schemas.microsoft.com/office/spreadsheetml/2010/11/ac"/></mc:Choice></mc:AlternateContent><xr:revisionPtr revIDLastSave="0" documentId="8_{292BF245-1F37-B045-B1A5-26C42FB62779}" xr6:coauthVersionLast="47" xr6:coauthVersionMax="47" xr10:uidLastSave="{00000000-0000-0000-0000-000000000000}"/><bookViews><workbookView xWindow="11340" yWindow="5060" windowWidth="28040" windowHeight="17440" xr2:uid="{858B8D3F-6246-774D-8903-6D38687B7BC6}"/></bookViews><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="181029"/><extLst><ext uri="{140A7094-0E35-4892-8432-C4D2E57EDEB5}" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main"><x15:workbookPr chartTrackingRefBase="1"/></ext><ext uri="{B58B0392-4F1F-4190-BB64-5DF3571DCE5F}" xmlns:xcalcf="http://schemas.microsoft.com/office/spreadsheetml/2018/calcfeatures"><xcalcf:calcFeatures><xcalcf:feature name="microsoft.com:RD"/><xcalcf:feature name="microsoft.com:Single"/><xcalcf:feature name="microsoft.com:FV"/><xcalcf:feature name="microsoft.com:CNMTM"/><xcalcf:feature name="microsoft.com:LET_WF"/><xcalcf:feature name="microsoft.com:LAMBDA_WF"/><xcalcf:feature name="microsoft.com:ARRAYTEXT_WF"/></xcalcf:calcFeatures></ext></extLst></workbook>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;

    const zip = new Map<string, string>();
    zip.set('_rels/.rels', relsXml);
    zip.set('docProps/app.xml', docPropsAppXml);
    zip.set('docProps/core.xml', docPropsCoreXml);

    zip.set('xl/_rels/workbook.xml.rels', x1WorkbookXmlRels);
    zip.set('xl/theme/theme1.xml', x1ThemeTheme1Xml);
    const stylesXml = this.withNumberFormats(x1StylesXml, data); // before the sheet: it needs the style indices
    zip.set('xl/worksheets/sheet1.xml', this.getX1WorksheetsSheet1Xml(data, options));

    zip.set('xl/sharedStrings.xml', x1SharedStringsXml);
    zip.set('xl/styles.xml', stylesXml);
    // formulas: Excel and LibreOffice recalculate when opening (the cached values are the table's)
    const hasFormulas = data.some(row => row.some(cell => isExcelFormulaCell(cell)));
    zip.set('xl/workbook.xml', hasFormulas ? x1WorksheetXml.replace('<calcPr calcId="181029"/>',
      '<calcPr calcId="181029" fullCalcOnLoad="1"/>') : x1WorksheetXml);

    zip.set('[Content_Types].xml', contentTypesXml);

    return zip;
  }

  private getX1WorksheetsSheet1Xml(data: Array<Array<any>>, options: ExcelExportOptionsIf = {}): string {
    const columnCount = data.reduce((max, row) => Math.max(max, row.length), 1); // no spread: data may have millions of rows
    const dimension = data.length
      ? `A1:${this.getCellAddress(data.length - 1, columnCount - 1)}`
      : 'A1';
    const sb: string[] = [

    ];
    sb.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac xr xr2 xr3" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" xmlns:xr2="http://schemas.microsoft.com/office/spreadsheetml/2015/revision2" xmlns:xr3="http://schemas.microsoft.com/office/spreadsheetml/2016/revision3" xr:uid="{E15F8FC4-4D40-434C-921A-3D9CFAAA2865}">
  <dimension ref="${dimension}"/>
  <sheetViews>
  <sheetView${options.rightToLeft ? ' rightToLeft="1"' : ''} tabSelected="1" workbookViewId="0"/></sheetViews>
  <sheetFormatPr baseColWidth="10" defaultRowHeight="16" x14ac:dyDescent="0.2"/>
  <sheetData>`);

    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      sb.push(`<row r="${r + 1}" spans="1:${columnCount}" x14ac:dyDescent="0.2">`);
      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        const cellAddress = this.getCellAddress(r, c);
        if (typeof cell === 'number') {
          sb.push(`<c r="${cellAddress}"><v>${cell}</v></c>`);

        } else if (isExcelFormulaCell(cell)) {
          sb.push(this.formulaCellXml(cellAddress, cell.formula, cell.value));

        } else if (isExcelFormattedValue(cell) && Number.isFinite(cell.value)) {
          // a number with format: style index 1… (see withNumberFormats)
          sb.push(`<c r="${cellAddress}" s="${this.numberFormatStyles.get(cell.numberFormat) ?? 0}"><v>${cell.value}</v></c>`);

        } else if (cell instanceof Date) {
          const d: Date = cell;
          sb.push(`<c r="${cellAddress}" t="inlineStr"><is><t>${d.toISOString()}</t></is></c>`);
        } else {
          const cellValue = cell != null ? this.escapeXml(String(cell)) : '';
          sb.push(`<c r="${cellAddress}" t="inlineStr"><is><t>${cellValue}</t></is></c>`);
        }
      }
      sb.push('</row>');
    }
    sb.push('');
    sb.push('');
    sb.push('</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>');
    sb.push('</worksheet>');
    return sb.join('\n');
  }

  /** A formula cell: `<f>` plus the cached value with its type (`str`, `b`, `e`; numbers and dates without). */
  private formulaCellXml(address: string, formula: string, value: unknown): string {
    const f = `<f>${this.escapeXml(formula)}</f>`;
    if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${address}">${f}<v>${value}</v></c>`;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return `<c r="${address}" s="${this.numberFormatStyles.get(DATE_FORMAT) ?? 0}">${f}<v>${dateToSerial(value)}</v></c>`;
    }
    if (typeof value === 'boolean') return `<c r="${address}" t="b">${f}<v>${value ? 1 : 0}</v></c>`;
    if (isFormulaError(value)) {
      // own codes without an Excel counterpart (#CIRC!, #ERROR!) as #VALUE!
      const code = ['#DIV/0!', '#NAME?', '#VALUE!', '#REF!', '#N/A', '#NUM!', '#NULL!'].includes(value.code) ? value.code : '#VALUE!';
      return `<c r="${address}" t="e">${f}<v>${code}</v></c>`;
    }
    const text = value === null || value === undefined ? '' : this.escapeXml(String(value));
    return `<c r="${address}" t="str">${f}<v>${text}</v></c>`;
  }

  /** Number format → cell style index (1-based; 0 = default), filled by withNumberFormats() before the sheet is written. */
  private numberFormatStyles = new Map<string, number>();

  /** Adds one cell style per number format used in the matrix (`<numFmts>` + `<cellXfs>`); unchanged without formats. */
  private withNumberFormats(stylesXml: string, data: Array<Array<any>>): string {
    const formats: string[] = [];
    for (const row of data) {
      for (const cell of row) {
        if (isExcelFormattedValue(cell) && !formats.includes(cell.numberFormat)) formats.push(cell.numberFormat);
        // a formula with a date result (since 1.1.99): a date format, otherwise Excel shows the serial number
        if (isExcelFormulaCell(cell) && cell.value instanceof Date && !formats.includes(DATE_FORMAT)) formats.push(DATE_FORMAT);
      }
    }
    this.numberFormatStyles = new Map(formats.map((format, i) => [format, i + 1]));
    if (!formats.length) {
      return stylesXml;
    }
    const numFmts = `<numFmts count="${formats.length}">`
      + formats.map((format, i) => `<numFmt numFmtId="${164 + i}" formatCode="${this.escapeXml(format)}"/>`).join('')
      + '</numFmts>';
    const xfs = `<cellXfs count="${formats.length + 1}"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>`
      + formats.map((_, i) => `<xf numFmtId="${164 + i}" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>`).join('')
      + '</cellXfs>';
    return stylesXml
      .replace('<fonts ', `${numFmts}<fonts `)
      .replace('<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>', xfs);
  }

  private escapeXml(value: any): string {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private getCellAddress(row: number, col: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let columnName = '';

    while (col >= 0) {
      columnName = letters[col % 26] + columnName;
      col = Math.floor(col / 26) - 1; // Adjust for 0-indexed logic
    }

    return `${columnName}${row + 1}`;
  }

  /**
   * ZIP without compression (method 0, synchronous). Kept for compatibility –
   * downloads use {@link createZipCompressed}.
   */
  createZip(files: Map<string, string>): Uint8Array {
    const entries: ZipEntry[] = [];
    files.forEach((content, path) => {
      const data = new TextEncoder().encode(content);
      entries.push({ path: new TextEncoder().encode(path), data, size: data.length, crc: crc32(data), method: 0 });
    });
    return this.assembleZip(entries);
  }

  /**
   * ZIP with DEFLATE (method 8) via the browser's CompressionStream; falls back to stored entries
   * where that is not available. 100,000 rows × 7 columns: ~40 MB stored → a few MB compressed.
   */
  async createZipCompressed(files: Map<string, string>): Promise<Uint8Array> {
    const entries: ZipEntry[] = [];
    for (const [path, content] of Array.from(files.entries())) {
      const raw = new TextEncoder().encode(content);
      const deflated = await deflateRaw(raw);
      const useDeflate = !!deflated && deflated.length < raw.length;
      entries.push({
        path: new TextEncoder().encode(path),
        data: useDeflate ? deflated! : raw,
        size: raw.length,
        crc: crc32(raw),             // CRC of the UNcompressed data
        method: useDeflate ? 8 : 0
      });
    }
    return this.assembleZip(entries);
  }

  private assembleZip(entries: ZipEntry[]): Uint8Array {
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let offset = 0;

    for (const e of entries) {
      const localHeader = new Uint8Array(30 + e.path.length);
      const view = new DataView(localHeader.buffer);
      localHeader.set([0x50, 0x4b, 0x03, 0x04], 0); // PK\x03\x04
      view.setUint16(4, 20, true);        // Version needed to extract (2.0: deflate)
      view.setUint16(6, 0, true);         // General purpose bit flag
      view.setUint16(8, e.method, true);  // Compression method: 0 stored, 8 deflate
      view.setUint16(10, 0, true);        // File last modification time
      view.setUint16(12, 0x21, true);     // File last modification date (1980-01-01)
      view.setUint32(14, e.crc, true);    // CRC-32 of the uncompressed data
      view.setUint32(18, e.data.length, true); // Compressed size
      view.setUint32(22, e.size, true);   // Uncompressed size
      view.setUint16(26, e.path.length, true);
      view.setUint16(28, 0, true);        // Extra field length
      localHeader.set(e.path, 30);

      chunks.push(localHeader, e.data);
      offsets.push(offset);
      offset += localHeader.length + e.data.length;
    }

    const centralDirStart = offset;
    entries.forEach((e, i) => {
      const centralHeader = new Uint8Array(46 + e.path.length);
      const view = new DataView(centralHeader.buffer);
      centralHeader.set([0x50, 0x4b, 0x01, 0x02], 0); // PK\x01\x02
      view.setUint16(4, 20, true);        // Version made by
      view.setUint16(6, 20, true);        // Version needed to extract
      view.setUint16(8, 0, true);         // General purpose bit flag
      view.setUint16(10, e.method, true); // Compression method
      view.setUint16(12, 0, true);        // File last modification time
      view.setUint16(14, 0x21, true);     // File last modification date
      view.setUint32(16, e.crc, true);    // CRC-32
      view.setUint32(20, e.data.length, true); // Compressed size
      view.setUint32(24, e.size, true);   // Uncompressed size
      view.setUint16(28, e.path.length, true);
      view.setUint16(30, 0, true);        // Extra field length
      view.setUint16(32, 0, true);        // File comment length
      view.setUint16(34, 0, true);        // Disk number where file starts
      view.setUint16(36, 0, true);        // Internal file attributes
      view.setUint32(38, 0, true);        // External file attributes
      view.setUint32(42, offsets[i], true); // Relative offset of local file header
      centralHeader.set(e.path, 46);
      chunks.push(centralHeader);
      offset += centralHeader.length;
    });

    const centralDirEnd = new Uint8Array(22);
    const view = new DataView(centralDirEnd.buffer);
    centralDirEnd.set([0x50, 0x4b, 0x05, 0x06], 0); // PK\x05\x06
    view.setUint16(8, entries.length, true);  // records on this disk
    view.setUint16(10, entries.length, true); // total records
    view.setUint32(12, offset - centralDirStart, true); // size of central directory
    view.setUint32(16, centralDirStart, true);          // offset of central directory
    chunks.push(centralDirEnd);

    const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    let off = 0;
    for (const chunk of chunks) {
      result.set(chunk, off);
      off += chunk.length;
    }
    return result;
  }





}
