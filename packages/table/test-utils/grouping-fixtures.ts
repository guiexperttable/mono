// Shared reference data for aggregation (prompt 005), row grouping (006) and pivot (007).
// Lives outside src/ on purpose: it must not end up in the npm package.

export interface SaleRow {
  region: string;
  produkt: string;
  monat: string;
  umsatz: number;
}

/** The six reference rows of prompts 005–007 (G1: sum 450, count 6, avg 75, min 30, max 120). */
export function createSales(): SaleRow[] {
  return [
    { region: 'Nord', produkt: 'A', monat: 'Jan', umsatz: 100 },
    { region: 'Nord', produkt: 'B', monat: 'Jan', umsatz: 50 },
    { region: 'Süd', produkt: 'A', monat: 'Jan', umsatz: 80 },
    { region: 'Nord', produkt: 'A', monat: 'Feb', umsatz: 120 },
    { region: 'Süd', produkt: 'B', monat: 'Feb', umsatz: 70 },
    { region: 'Süd', produkt: 'A', monat: 'Feb', umsatz: 30 },
  ];
}

/** G6: one valid number between values the numeric aggregators ignore. */
export function createSalesWithInvalidValues(): { region: string; umsatz: unknown }[] {
  return [
    { region: 'Nord', umsatz: 100 },
    { region: 'Nord', umsatz: null },
    { region: 'Süd', umsatz: undefined },
    { region: 'Süd', umsatz: '' },
    { region: 'Süd', umsatz: 'abc' },
    { region: 'Ost', umsatz: NaN },
  ];
}

/** A small deterministic random generator (mulberry32) for property tests with a fixed seed. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
