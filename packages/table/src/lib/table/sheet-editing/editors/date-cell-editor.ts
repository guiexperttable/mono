import type { CellEditMode, CellEditorContextIf } from "../cell-editor.if";
import { TextCellEditor } from "./text-cell-editor";

/**
 * Editor for dates: `input type="date"`. A `Date` value comes back as `Date` (its time of day stays), an ISO text
 * (`"2026-10-16"`, also with a time part) as ISO text; an empty field as `""`. The arrow keys belong to the date
 * field.
 *
 * @example
 * ColumnDef.create({ property: "due", editable: TrueFn, editor: "date" });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class DateCellEditor extends TextCellEditor {

  private original: unknown;
  private originalText = "";

  protected override inputType(): string {
    return "date";
  }

  protected override toText(ctx: CellEditorContextIf): string {
    const v = ctx.value;
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
    }
    const text = ctx.input;
    return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
  }

  override open(container: HTMLDivElement, ctx: CellEditorContextIf): void {
    this.original = ctx.value;
    this.originalText = this.toText(ctx);
    // Backspace (typed text "") opens empty; a typed character cannot be shown in a date field – it keeps the date
    super.open(container, { ...ctx, typedText: ctx.typedText === "" ? "" : undefined });
  }

  override getValue(): unknown {
    const text = String(super.getValue());
    if (!text) {
      return "";
    }
    const original = this.original;
    if (text === this.originalText && (original instanceof Date || typeof original === "string")) {
      return original; // unchanged date: also its time of day stays
    }
    const [y, m, d] = text.split("-").map(Number);
    if (original instanceof Date && !Number.isNaN(original.getTime())) {
      return new Date(y, m - 1, d, original.getHours(), original.getMinutes(), original.getSeconds(),
        original.getMilliseconds()); // a new day, the same time of day
    }
    const rest = typeof original === "string" && /^\d{4}-\d{2}-\d{2}./.test(original) ? original.slice(10) : "";
    if (original instanceof Date) {
      return new Date(y, m - 1, d); // an invalid Date before: local midnight
    }
    return text + rest; // ISO text stays ISO text (with its time part)
  }

  override wantsKey(evt: KeyboardEvent, _mode: CellEditMode): boolean {
    return evt.key.startsWith("Arrow");
  }
}
