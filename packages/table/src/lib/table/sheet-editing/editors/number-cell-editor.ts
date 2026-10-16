import type { CellEditorContextIf } from "../cell-editor.if";
import { TextCellEditor } from "./text-cell-editor";

/**
 * Editor for numbers: a text field with the numeric keyboard on touch devices (`inputmode="decimal"`), aligned to
 * the end. Without an `editInputPipe` of the column a typed number is written as number (`"42"` → `42`), other text
 * stays text.
 *
 * @example
 * ColumnDef.create({ property: "price", editable: TrueFn, editor: "number" });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class NumberCellEditor extends TextCellEditor {

  protected override decorate(input: HTMLInputElement, ctx: CellEditorContextIf): void {
    ctx.domService.setAttribute(input, "inputmode", "decimal");
    ctx.domService.addClass(input, "ge-table-cell-editor-number");
  }

  override getValue(): unknown {
    const text = String(super.getValue());
    if (this.ctx?.columnDef?.editInputPipe) {
      return text; // the column converts it
    }
    const trimmed = text.trim();
    return trimmed !== "" && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(trimmed) ? Number(trimmed) : text;
  }
}
