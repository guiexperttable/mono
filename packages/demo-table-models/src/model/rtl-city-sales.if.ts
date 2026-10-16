/** One row of the right-to-left demo (since 1.1.98): sales of a branch in an Arabic city per month. */
export interface RtlCitySalesIf {
  id: number;
  /** city in Arabic, e.g. "الرياض" */
  city: string;
  /** country in Arabic */
  country: string;
  /** branch code – mixed Arabic and Latin text with digits, e.g. "فرع RUH-01" */
  branch: string;
  /** sales per month, January (m1) … December (m12) */
  m1: number; m2: number; m3: number; m4: number; m5: number; m6: number;
  m7: number; m8: number; m9: number; m10: number; m11: number; m12: number;
}
