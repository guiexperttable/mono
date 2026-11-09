import type { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";

/**
 * Measures the width a cell needs for its text (prompt 022, before part of `TableScope.calcAutoColumnWidths`).
 *
 * The text is measured with the font and padding of a rendered cell label (canvas `measureText`). Without a canvas
 * (e.g. in a test environment without one) it falls back to 8 px per character.
 *
 * Not exported from the package: an internal of {@link TableScope}.
 */
export class ColumnWidthMeasurer {

  /** Texts (per column) whose character length is close to the longest – only they are measured. */
  static readonly maxCandidates = 30;

  private readonly ctx: CanvasRenderingContext2D | null = null;
  private readonly padding: number;

  constructor(hostElement: HTMLElement) {
    const label = hostElement.querySelector('.ge-table-label') as HTMLElement | null;
    const style = getComputedStyle(label ?? hostElement);
    this.padding = label ? (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0) : 20;
    try {
      this.ctx = document.createElement('canvas').getContext('2d');
    } catch (_e) {
      this.ctx = null;
    }
    if (this.ctx) this.ctx.font = style.font || `${style.fontSize} ${style.fontFamily}`;
  }

  /** Width in px of a cell with this text: text width + cell padding + 2 px (rounded up). */
  measureText(text: string): number {
    const px = this.ctx ? this.ctx.measureText(text).width : text.length * 8;
    return Math.ceil(px + this.padding + 2);
  }

  /** The widest of the texts (at least 50 px, like the column widths before 1.1.110). */
  measureWidest(texts: Set<string>): number {
    let px = this.measureText('');
    texts.forEach(t => { px = Math.max(px, this.measureText(t)); });
    return Math.max(px, 50);
  }
}

/**
 * Collects per column the texts with (almost) the greatest character length of the rows `fromRow … toRow`.
 * One pass over the rows and the given columns; `candidates[k]` / `maxLength[k]` belong to `columns[k]`.
 */
export function collectColumnTextCandidates(
  model: AreaModelIf | undefined,
  fromRow: number,
  toRow: number,
  columns: number[],
  candidates: Set<string>[],
  maxLength: number[]
): void {
  if (!model) return;
  const maxCandidates = ColumnWidthMeasurer.maxCandidates;
  for (let r = fromRow; r <= toRow; r++) {
    for (let k = 0; k < columns.length; k++) {
      const c = columns[k];
      const text = model.getTextValueAt?.(r, c) || (model.getValueAt(r, c)?.toString() ?? '');
      const length = text.length;
      if (length > maxLength[k]) {
        maxLength[k] = length;
        candidates[k].forEach(t => { if (t.length < length - 2) candidates[k].delete(t); });
      }
      if (length >= maxLength[k] - 2 && candidates[k].size < maxCandidates) candidates[k].add(text);
    }
  }
}
