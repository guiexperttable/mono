import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { SideIdent } from "../data/side-ident.type";

/**
 * Builds the element IDs the table needs for ARIA references (`aria-activedescendant`, `aria-owns`).
 *
 * All IDs of one table start with the same prefix: `ge-` + the `id` of the host element, or `ge-t<n>`
 * (a running number) if the host has no id. Several tables on one page therefore never clash, and with a host id
 * the IDs stay the same when the table is rebuilt.
 *
 * Only the focused cell carries an ID (see {@link cell}); the other cells have none (performance).
 *
 * @example
 * const ids = new AriaIds(AriaIds.createPrefix("orders"));
 * ids.cell("body", 5, 2);           // "ge-orders-body-r5-c2"
 * ids.rowGroup("header", "center"); // "ge-orders-rg-header-center"
 * ids.liveRegion();                 // "ge-orders-live"
 *
 * @since 1.1.91
 * @category Accessibility
 */
export class AriaIds {

  private static counter = 0;

  constructor(
    readonly prefix: string
  ) {
  }

  /**
   * The ID prefix of a table.
   *
   * @param {string} [hostId] - the `id` of the host element (may be empty)
   * @returns {string} `"ge-" + hostId`, or `"ge-t" + n` with a number that is unique on the page
   */
  static createPrefix(hostId?: string): string {
    const id = (hostId ?? "").trim();
    if (id) {
      return `ge-${id.replace(/\s+/g, "_")}`;
    }
    AriaIds.counter++;
    return `ge-t${AriaIds.counter}`;
  }

  /**
   * The ID of a cell (set on the focused cell, referenced by `aria-activedescendant`).
   *
   * @param {AreaIdent} area - header, body or footer
   * @param {number} rowIndex - row index in the area
   * @param {number} columnIndex - model column index (west + center + east)
   * @returns {string} e.g. `"ge-t1-body-r5-c2"`
   */
  cell(area: AreaIdent, rowIndex: number, columnIndex: number): string {
    return `${this.prefix}-${area}-r${rowIndex}-c${columnIndex}`;
  }

  /**
   * The ID of one of the nine row groups (`role="rowgroup"`), referenced by `aria-owns` of the host.
   *
   * @param {AreaIdent} area - header, body or footer
   * @param {SideIdent} side - west, center or east
   * @returns {string} e.g. `"ge-t1-rg-body-center"`
   */
  rowGroup(area: AreaIdent, side: SideIdent): string {
    return `${this.prefix}-rg-${area}-${side}`;
  }

  /**
   * The ID of the row group of the detail rows (master/detail), referenced by `aria-owns` of the host.
   *
   * @returns {string} e.g. `"ge-t1-rg-detail"`
   * @since 1.1.97
   */
  detailRowGroup(): string {
    return `${this.prefix}-rg-detail`;
  }

  /**
   * The ID of the live region (the element that speaks announcements, see {@link LiveAnnouncer}).
   *
   * @returns {string} e.g. `"ge-t1-live"`
   */
  liveRegion(): string {
    return `${this.prefix}-live`;
  }
}
