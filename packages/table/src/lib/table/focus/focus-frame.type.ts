/**
 * When the frame around the focused cell is drawn ({@link TableOptionsIf.focusFrame}):
 *
 * - `"always"` (default): whenever a cell has the focus – after a click and after a key.
 * - `"keyboard"`: only while the table is used with the keyboard (like CSS `:focus-visible`): a key press or Tab
 *   into the table shows it, a mouse press hides it. The default of a cover grid.
 * - `"never"`: no frame. Keyboard users then need another visible focus indicator (WCAG 2.4.7), e.g. drawn by your
 *   cell renderer.
 *
 * @example
 * const tableOptions: TableOptionsIf = { ...new TableOptions(), focusFrame: "keyboard" };
 *
 * @category Selection & focus
 * @since 1.1.115
 */
export type FocusFrameMode = "always" | "keyboard" | "never";
