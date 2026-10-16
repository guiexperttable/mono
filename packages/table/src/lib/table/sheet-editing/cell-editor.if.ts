import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { DomServiceIf } from "../service/dom-service.if";

/**
 * How the cell editor was opened: `"enter"` by typing (arrow keys commit and move, like Excel's "Enter" mode) or
 * `"edit"` by F2, Enter or a double click (arrow keys move the caret). F2 switches between the two.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type CellEditMode = "enter" | "edit";

/**
 * Where the focus goes after the editor committed: one cell down, up, right, left – or nowhere.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type EditMove = "down" | "up" | "right" | "left" | "none";

/**
 * What a {@link CellEditorIf} gets when it opens (Excel-style editing, {@link TableOptionsIf.editing}).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface CellEditorContextIf {
  /** Display row index of the edited body cell. */
  readonly rowIndex: number;
  /** Model column index. */
  readonly columnIndex: number;
  /** The row object (the data of a tree row), `undefined` for models without objects. */
  readonly row: unknown;
  /** The column definition, if the model has one. */
  readonly columnDef?: ColumnDefIf;
  /** The current value of the cell (a pending value in a batch edit). */
  readonly value: unknown;
  /** The value as editor text, e.g. `"42"` – the editor starts with it unless {@link typedText} is set. */
  readonly input: string;
  /** The character typed to open the editor ("enter" mode); it replaces the content. */
  readonly typedText?: string;
  /** "enter" (typed) or "edit" (F2, Enter, double click). */
  readonly mode: CellEditMode;
  /** "all": select the text, "end": caret at the end (F2 is always "end"). */
  readonly textSelection: "all" | "end";
  /** Writing direction of the table. */
  readonly direction: "ltr" | "rtl";
  /** Accessible name of the editor (the column label). */
  readonly ariaLabel: string;
  /** DOM access of the table. */
  readonly domService: DomServiceIf;
  /** The editor is done (e.g. a value was chosen in a list): commit and move. */
  commit(move?: EditMove): void;
  /** Close without writing. */
  cancel(): void;
  /** The text changed (the table reports it as `GeEditEvent` of the type `"input"`). */
  inputChanged(): void;
}

/**
 * A cell editor of Excel-style editing: lives in one element above the cell (it survives scrolling) until it is
 * committed or cancelled. Built-in: {@link TextCellEditor}, {@link NumberCellEditor}, {@link SelectCellEditor},
 * {@link DateCellEditor}. The table handles Enter, Tab, Escape and the arrow keys; an editor that needs a key
 * itself (a list, a date field) says so in {@link wantsKey}.
 *
 * @example
 * class UpperCaseEditor extends TextCellEditor {
 *   override getValue(): unknown {
 *     return String(super.getValue()).toUpperCase();
 *   }
 * }
 * ColumnDef.create({ property: "code", editable: TrueFn, editor: ctx => new UpperCaseEditor() });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface CellEditorIf {
  /** Builds the editor into `container` (the table positions the container over the cell). */
  open(container: HTMLDivElement, ctx: CellEditorContextIf): void;
  /** The value to write (it runs through `editInputPipe` and `validate` of the column). */
  getValue(): unknown;
  /** Gives the input element the keyboard focus. */
  focus(): void;
  /** Removes listeners and elements. */
  close(): void;
  /** The element that has the focus (the table names it and lets the active cell own it for screen readers). */
  getFocusElement(): HTMLElement | undefined;
  /** F2 switched the mode. */
  setMode?(mode: CellEditMode): void;
  /** `true` while an IME composition is running – the table ignores Enter, Tab and arrows then. */
  isComposing?(): boolean;
  /** `true` if the editor needs this key itself (e.g. ↑/↓ in a list) – the table does not commit then. */
  wantsKey?(evt: KeyboardEvent, mode: CellEditMode): boolean;
  /** The text of the editor, e.g. `"=B2*C2"` (formula input, later stages). */
  getText?(): string;
  /** Replaces the text and puts the caret at the end. */
  setText?(text: string): void;
}

/**
 * Creates the editor of a column for one edit (see {@link ColumnDefIf.editor}).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type CellEditorFactory = (ctx: CellEditorContextIf) => CellEditorIf;

/**
 * The editor of a column in Excel-style editing: a factory or the name of a built-in editor. Without it the
 * table chooses by the value: numbers → `"number"`, dates → `"date"`, otherwise `"text"`.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type ColumnEditorOption = CellEditorFactory | "text" | "number" | "date";
