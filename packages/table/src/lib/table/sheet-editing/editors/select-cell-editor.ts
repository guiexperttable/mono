import type { CellEditMode, CellEditorContextIf, CellEditorIf } from "../cell-editor.if";
import type { ValueLabelIf } from "../../data/common/value-label.if";

/**
 * Editor with a fixed list of values (`select`). ↑/↓ choose, Alt+↓ opens the list, typing jumps to the first
 * matching entry (browser behaviour), Enter commits.
 *
 * @example
 * ColumnDef.create({
 *   property: "status", editable: TrueFn,
 *   editor: () => SelectCellEditor.create(["open", "paid", "void"]),
 * });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class SelectCellEditor implements CellEditorIf {

  private select?: HTMLSelectElement;
  private readonly abort = new AbortController();

  constructor(protected readonly options: ValueLabelIf[]) {
  }

  /**
   * An editor whose values are their own labels.
   *
   * @param {string[]} values - the entries
   * @returns {SelectCellEditor} the editor
   */
  static create(values: string[]): SelectCellEditor {
    return new SelectCellEditor(values.map(v => ({ value: v, label: v })));
  }

  open(container: HTMLDivElement, ctx: CellEditorContextIf): void {
    const dom = ctx.domService;
    const select = dom.createElement<HTMLSelectElement>("select");
    this.select = select;
    dom.setAttribute(select, "aria-label", ctx.ariaLabel);
    dom.addClass(select, "ge-table-cell-editor-field");
    let selectedIndex = -1;
    const typed = ctx.typedText?.toLowerCase();
    this.options.forEach((option, i) => {
      const el = dom.createElement<HTMLOptionElement>("option");
      el.value = String(option.value);
      el.textContent = String(option.label);
      dom.appendChild(select, el);
      if (typed !== undefined) {
        if (selectedIndex < 0 && String(option.label).toLowerCase().startsWith(typed)) selectedIndex = i;
      } else if (option.value === ctx.value) {
        selectedIndex = i;
      }
    });
    select.selectedIndex = selectedIndex;
    select.addEventListener("change", () => ctx.inputChanged(), { signal: this.abort.signal });
    dom.appendChild(container, select);
  }

  getValue(): unknown {
    const select = this.select;
    if (!select || select.selectedIndex < 0) {
      return "";
    }
    return this.options[select.selectedIndex]?.value;
  }

  getText(): string {
    return String(this.getValue() ?? "");
  }

  focus(): void {
    if (this.select && this.select.ownerDocument.activeElement !== this.select) {
      this.select.focus({ preventScroll: true });
    }
  }

  getFocusElement(): HTMLElement | undefined {
    return this.select;
  }

  wantsKey(evt: KeyboardEvent, _mode: CellEditMode): boolean {
    if (evt.altKey && evt.key === "ArrowDown") {
      (this.select as HTMLSelectElement & { showPicker?: () => void })?.showPicker?.();
      return true;
    }
    return evt.key === "ArrowUp" || evt.key === "ArrowDown";
  }

  close(): void {
    this.abort.abort();
    this.select?.remove();
    this.select = undefined;
  }
}
