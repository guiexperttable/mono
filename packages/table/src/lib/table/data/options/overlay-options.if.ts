import { GeOverlayKind } from "../../overlay/ge-overlay-kind.type";

/**
 * Texts and behaviour of the overlays over the table body: "Loading…" ({@link TableApi.showLoadingOverlay}),
 * "No rows to show" (empty body) and "No matching rows" (the external filter hides all rows).
 *
 * Set it with {@link TableOptionsIf.overlayOptions} – every field is optional there, missing ones keep their
 * default ({@link OverlayOptions}). The overlays are plain HTML and CSS (spinner: `@keyframes`), colours come from
 * the CSS variables `--ge-table-overlay-bg`, `--ge-table-overlay-color`, `--ge-table-spinner-color`,
 * `--ge-table-spinner-track-color` and `--ge-table-spinner-size`.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   overlayOptions: {
 *     loadingText: "Lädt…",
 *     noRowsText: "Keine Daten",
 *     noMatchesText: "Keine Treffer",
 *     loadingDelayInMs: 200, // fast answers show no spinner at all
 *   },
 * };
 *
 * @since 1.1.91
 * @see Training: [Live data](https://gui.expert/training/live-data/)
 * @category Overlays
 */
export interface OverlayOptionsIf {

  /** Text of the loading overlay. Default: `"Loading…"`. */
  loadingText: string;

  /** Text of the overlay of an empty body. Default: `"No rows to show"`. */
  noRowsText: string;

  /** Text when the external filter hides all rows. Default: `"No matching rows"`. */
  noMatchesText: string;

  /**
   * `true` (default): an empty body shows "No rows to show" (or "No matching rows") by itself, after every
   * repaint. `false`: only {@link TableApi.showNoRowsOverlay} shows it.
   */
  autoNoRows: boolean;

  /**
   * `true` (default): while "Loading…" is shown, the table ignores mouse events on the body (click, double click,
   * hover, context menu – the page still sees them) and the keyboard cannot start editing or toggle rows in the body;
   * navigation, copying and the header still work.
   * `false`: the loading overlay is only a picture, the table stays usable.
   * "No rows" / "No matching rows" never block.
   */
  blockInteractionWhileLoading: boolean;

  /**
   * Waits this long (ms) before the loading overlay appears. Answers that come faster show no spinner at all
   * (no flashing); meanwhile an automatic "No rows to show" stays as it is. Default: `0` (right away).
   */
  loadingDelayInMs: number;

  /**
   * Own content of an overlay instead of the built-in one (spinner + text). Called once each time the overlay
   * of a kind appears; return `undefined` to keep the built-in content for that kind. The table removes the
   * element again when the overlay disappears or changes and in {@link TableApi.destroy}.
   *
   * The overlay is hidden from screen readers (`aria-hidden`, the table announces its text instead):
   * put no buttons or links into it.
   *
   * @param {GeOverlayKind} kind - `"loading"`, `"noRows"` or `"noMatches"`
   * @param {string} text - the text the built-in content would show
   * @returns {HTMLElement | undefined} the element to show, or `undefined` for the default
   *
   * @example
   * const tableOptions: TableOptionsIf = {
   *   ...new TableOptions(),
   *   overlayOptions: {
   *     getOverlayElement: (kind: GeOverlayKind, text: string) => {
   *       if (kind !== "noRows") return undefined; // built-in spinner and texts for the others
   *       const div = document.createElement("div");
   *       div.className = "my-empty-state";
   *       div.textContent = `📭 ${text}`;
   *       return div;
   *     },
   *   },
   * };
   */
  getOverlayElement?: (kind: GeOverlayKind, text: string) => HTMLElement | undefined;
}
