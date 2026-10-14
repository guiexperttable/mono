import { GeOverlayKind } from "./ge-overlay-kind.type";

/**
 * Input of {@link calcOverlayKind}.
 *
 * @since 1.1.92
 * @category Internals
 */
export interface OverlayKindInput {
  /** The overlay requested by the API ({@link TableApi.showLoadingOverlay}, {@link TableApi.showNoRowsOverlay}). */
  manual?: "loading" | "noRows";
  /** `getRowCount()` of the body (after the filter); < 0 = unknown. */
  rowCount: number;
  /** `getUnfilteredRowCount()` of the body, `undefined` if the model cannot tell. */
  unfilteredRowCount?: number;
  /** {@link OverlayOptionsIf.autoNoRows} */
  autoNoRows: boolean;
}

/**
 * Decides which overlay the table shows. Order: a manual overlay > "no matching rows" > "no rows to show".
 * A model that cannot tell its unfiltered row count gets "no rows" (never a wrong "no matching rows"),
 * an unknown row count (< 0) no overlay.
 *
 * @example
 * calcOverlayKind({ rowCount: 0, unfilteredRowCount: 100, autoNoRows: true }); // "noMatches"
 * calcOverlayKind({ manual: "loading", rowCount: 0, autoNoRows: true });       // "loading"
 *
 * @since 1.1.92
 * @category Internals
 */
export function calcOverlayKind(input: OverlayKindInput): GeOverlayKind {
  if (input.manual) {
    return input.manual;
  }
  if (!input.autoNoRows || input.rowCount !== 0) {
    return "none";
  }
  return (input.unfilteredRowCount ?? 0) > 0 ? "noMatches" : "noRows";
}
