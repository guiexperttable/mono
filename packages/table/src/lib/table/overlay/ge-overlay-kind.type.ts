/**
 * The overlay the table shows over its body:
 * - `"none"` – no overlay;
 * - `"loading"` – spinner + "Loading…" ({@link TableApi.showLoadingOverlay});
 * - `"noRows"` – "No rows to show": the body is empty ({@link OverlayOptionsIf.autoNoRows}) or
 *   {@link TableApi.showNoRowsOverlay} was called;
 * - `"noMatches"` – "No matching rows": the body has rows, but the external filter hides all of them.
 *
 * @example
 * if (tableApi.getOverlayState() === "noMatches") {
 *   console.log("Reset the filter to see rows again");
 * }
 *
 * @since 1.1.92
 * @category Overlays
 */
export type GeOverlayKind = "none" | "loading" | "noRows" | "noMatches";
