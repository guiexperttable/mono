// Tiny ZIP reader for tests (e.g. to look into the .xlsx files of ExcelService).
//
//   const zip = readZip(new Uint8Array(await blob.arrayBuffer()));
//   expect(zip.get('xl/worksheets/sheet1.xml')?.text).toContain('<dimension ref="A1:B2"/>');
//
// Supports what ExcelService writes: no ZIP64, no encryption, no data descriptors,
// compression method 0 (stored) and 8 (deflate). Everything else throws – a test should fail loudly.
// Reads the central directory (like real unzip tools do) and cross-checks every local header against it.
// Lives outside src/ on purpose: it must not end up in the npm package.
import { crc32, inflateRawSync } from 'node:zlib';

const SIG_LOCAL = 0x04034b50; // PK\x03\x04
const SIG_CENTRAL = 0x02014b50; // PK\x01\x02
const SIG_EOCD = 0x06054b50; // PK\x05\x06

export interface ZipEntryInfo {
  /** Path inside the archive, e.g. `xl/workbook.xml`. */
  name: string;
  /** 0 = stored, 8 = deflate. */
  method: number;
  /** CRC-32 as written in the central directory. */
  crc: number;
  /** CRC-32 as written in the local file header. */
  localCrc: number;
  /** Bytes in the archive (after compression). */
  compressedSize: number;
  /** Size after decompression as written in the central directory. */
  uncompressedSize: number;
  /** Offset of the local file header. */
  localHeaderOffset: number;
  /** Version needed to extract (local header). */
  versionNeeded: number;
  /** General purpose bit flag (local header). */
  flags: number;
  /** The raw (possibly compressed) bytes as stored in the archive. */
  raw: Uint8Array;
  /** The decompressed bytes. */
  data: Uint8Array;
  /** `data` decoded as UTF-8. */
  text: string;
  /** CRC-32 of `data`, computed by node:zlib – compare with `crc`. */
  actualCrc: number;
}

export interface ZipArchive {
  /** Entries in central-directory order. */
  entries: ZipEntryInfo[];
  /** Entry names in central-directory order. */
  names: string[];
  /** Number of entries according to the end-of-central-directory record. */
  totalEntriesInEocd: number;
  get(name: string): ZipEntryInfo | undefined;
}

function findEocd(view: DataView): number {
  // EOCD is 22 bytes + an optional comment of up to 65535 bytes at the very end.
  const min = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === SIG_EOCD) return i;
  }
  throw new Error('ZIP: end of central directory not found');
}

export function readZip(bytes: Uint8Array): ZipArchive {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder('utf-8', { fatal: true });

  const eocd = findEocd(view);
  const totalEntriesInEocd = view.getUint16(eocd + 10, true);
  const cdSize = view.getUint32(eocd + 12, true);
  const cdOffset = view.getUint32(eocd + 16, true);
  if (cdOffset + cdSize !== eocd) {
    throw new Error(`ZIP: central directory (offset ${cdOffset}, size ${cdSize}) does not end at EOCD (${eocd})`);
  }

  const entries: ZipEntryInfo[] = [];
  let p = cdOffset;
  while (p < cdOffset + cdSize) {
    if (view.getUint32(p, true) !== SIG_CENTRAL) throw new Error(`ZIP: bad central header signature at ${p}`);
    const method = view.getUint16(p + 10, true);
    const crc = view.getUint32(p + 16, true);
    const compressedSize = view.getUint32(p + 20, true);
    const uncompressedSize = view.getUint32(p + 24, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const localHeaderOffset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;

    // local header
    const l = localHeaderOffset;
    if (view.getUint32(l, true) !== SIG_LOCAL) throw new Error(`ZIP: bad local header signature for ${name}`);
    const versionNeeded = view.getUint16(l + 4, true);
    const flags = view.getUint16(l + 6, true);
    const localMethod = view.getUint16(l + 8, true);
    const localCrc = view.getUint32(l + 14, true);
    const localCompressed = view.getUint32(l + 18, true);
    const localUncompressed = view.getUint32(l + 22, true);
    const localNameLen = view.getUint16(l + 26, true);
    const localExtraLen = view.getUint16(l + 28, true);
    const localName = decoder.decode(bytes.subarray(l + 30, l + 30 + localNameLen));
    if (localName !== name || localMethod !== method || localCompressed !== compressedSize
      || localUncompressed !== uncompressedSize) {
      throw new Error(`ZIP: local header of ${name} does not match the central directory`);
    }
    const dataStart = l + 30 + localNameLen + localExtraLen;
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);

    let data: Uint8Array;
    if (method === 0) {
      data = raw;
    } else if (method === 8) {
      data = new Uint8Array(inflateRawSync(raw));
    } else {
      throw new Error(`ZIP: unsupported compression method ${method} for ${name}`);
    }

    entries.push({
      name, method, crc, localCrc, compressedSize, uncompressedSize, localHeaderOffset, versionNeeded, flags,
      raw, data,
      text: decoder.decode(data),
      actualCrc: crc32(data) >>> 0,
    });
  }

  return {
    entries,
    names: entries.map(e => e.name),
    totalEntriesInEocd,
    get: (name: string) => entries.find(e => e.name === name),
  };
}

/** Convenience: reads a Blob (e.g. from `ExcelService.createExcelBlob`) as ZIP. */
export async function readZipBlob(blob: Blob): Promise<ZipArchive> {
  return readZip(new Uint8Array(await blob.arrayBuffer()));
}
