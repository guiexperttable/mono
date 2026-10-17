import type { TableApi } from "../table-api";
import type { EventListenerIf } from "../event-listener.if";
import type { GeEditEvent } from "../data/common/event/ge-edit-event";

/**
 * Options of the {@link FormulaBar}.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface FormulaBarOptionsIf {
  /** Show the address box (`B3`; typing `D10` or `B2:C5` + Enter goes there). Default `true`. */
  addressBox: boolean;
  /** The name of the input of the formula bar. Default `"Formula"`. */
  ariaLabel: string;
  /** The name of the address box. Default `"Cell address"`. */
  addressAriaLabel: string;
}

/**
 * The formula bar of a spreadsheet: an address box (`B3`) and the input of the active cell (the formula text, not
 * its result). Typing there and Enter/Tab writes the cell (`TableApi.setCellInput`) and moves like the table, Escape
 * restores it; while the cell editor is open the bar shows its text live. Plain DOM, no dependency – works with every
 * wrapper (pass the `TableApi` of `tableReady`). Colors: `--ge-table-formula-bar-*`.
 *
 * @example
 * const bar = new FormulaBar(document.querySelector<HTMLElement>(".formula-bar")!, tableApi);
 * // later: bar.destroy();
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class FormulaBar {

  readonly element: HTMLDivElement;
  readonly addressInput: HTMLInputElement;
  readonly input: HTMLInputElement;
  private readonly options: FormulaBarOptionsIf;
  private readonly unsubscribe: () => void;
  private readonly abort = new AbortController();
  /** The cell the input belongs to (fixed while typing in the bar). */
  private cell?: [number, number];
  private original = "";

  constructor(container: HTMLElement, private readonly api: TableApi, options: Partial<FormulaBarOptionsIf> = {}) {
    this.options = { addressBox: true, ariaLabel: "Formula", addressAriaLabel: "Cell address", ...options };
    const doc = container.ownerDocument;
    this.element = doc.createElement("div");
    this.element.className = "ge-table-formula-bar";
    this.addressInput = doc.createElement("input");
    this.addressInput.className = "ge-table-formula-bar-address";
    this.addressInput.type = "text";
    this.addressInput.autocomplete = "off";
    this.addressInput.spellcheck = false;
    this.addressInput.setAttribute("aria-label", this.options.addressAriaLabel);
    if (!this.options.addressBox) this.addressInput.hidden = true;
    const fx = doc.createElement("span");
    fx.className = "ge-table-formula-bar-fx";
    fx.setAttribute("aria-hidden", "true");
    fx.textContent = "fx";
    this.input = doc.createElement("input");
    this.input.className = "ge-table-formula-bar-input";
    this.input.type = "text";
    this.input.autocomplete = "off";
    this.input.spellcheck = false;
    this.input.setAttribute("aria-label", this.options.ariaLabel);
    this.element.append(this.addressInput, fx, this.input);
    container.appendChild(this.element);

    const signal = this.abort.signal;
    this.input.addEventListener("focus", () => this.beginInput(), { signal });
    this.input.addEventListener("keydown", (evt: KeyboardEvent) => this.onInputKey(evt), { signal });
    this.input.addEventListener("blur", () => this.endInput(true), { signal });
    this.addressInput.addEventListener("keydown", (evt: KeyboardEvent) => this.onAddressKey(evt), { signal });
    this.addressInput.addEventListener("input", () => this.addressInput.removeAttribute("aria-invalid"), { signal });

    const listener: Partial<EventListenerIf> = {
      onFocusChanged: () => this.show(),
      onSelectionChanged: () => this.show(),
      onModelChanged: () => this.show(),
      onEditingChanged: (evt: GeEditEvent) => this.onEditing(evt),
    };
    this.unsubscribe = api.subscribe(listener);
    this.show();
  }

  /** Removes the bar and its listeners. */
  destroy(): void {
    this.unsubscribe();
    this.abort.abort();
    this.element.remove();
  }

  /** Shows the active cell: its address and input (not while typing in the bar). */
  show(): void {
    const doc = this.element.ownerDocument;
    if (doc.activeElement === this.input && this.cell) {
      return;
    }
    const cell = this.api.getActiveCell();
    const address = cell ? this.api.getCellAddress(cell[0], cell[1]) : undefined;
    if (doc.activeElement !== this.addressInput) {
      this.addressInput.value = address ?? "";
    }
    this.input.value = cell ? toText(this.api.getCellInput(cell[0], cell[1])) : "";
    this.input.disabled = !cell;
  }

  // ------------------------------------------------------------------------------------------------ internals

  private onEditing(evt: GeEditEvent): void {
    if (this.element.ownerDocument.activeElement === this.input) {
      return;
    }
    if (evt.type === "start" || evt.type === "input") {
      this.input.value = evt.input ?? this.input.value; // the editor's text, live
    } else {
      this.show();
    }
  }

  private beginInput(): void {
    this.cell = this.api.getActiveCell();
    this.original = this.input.value;
  }

  /** Writes the input (if changed); `false` keeps the bar's text otherwise. */
  private endInput(write: boolean): void {
    const cell = this.cell;
    this.cell = undefined;
    if (cell && write && this.input.value !== this.original) {
      // like the cell editor: one undo step (source "edit")
      this.api.applyCellChanges([{ rowIndex: cell[0], column: cell[1], value: this.input.value }], "edit");
    }
  }

  private onInputKey(evt: KeyboardEvent): void {
    if (evt.isComposing) return;
    const cell = this.cell;
    if (evt.key === "Escape") {
      evt.preventDefault();
      this.input.value = this.original;
      this.cell = undefined;
      this.focusTable();
      return;
    }
    if (evt.key !== "Enter" && evt.key !== "Tab") return;
    evt.preventDefault();
    this.endInput(true);
    if (cell) {
      const scope = this.api.getTableScope();
      if (evt.key === "Enter") scope.moveActiveCell(cell[0], cell[1], evt.shiftKey ? -1 : 1, 0);
      else scope.moveActiveCell(cell[0], cell[1], 0, evt.shiftKey ? -1 : 1);
    }
    this.focusTable();
  }

  private onAddressKey(evt: KeyboardEvent): void {
    if (evt.key === "Escape") {
      evt.preventDefault();
      this.addressInput.removeAttribute("aria-invalid");
      this.focusTable();
      return;
    }
    if (evt.key !== "Enter") return;
    evt.preventDefault();
    if (this.api.goToAddress(this.addressInput.value)) {
      this.addressInput.removeAttribute("aria-invalid");
      this.focusTable();
    } else {
      this.addressInput.setAttribute("aria-invalid", "true");
    }
  }

  private focusTable(): void {
    this.api.getTableScope().hostElement.focus({ preventScroll: true });
    this.show();
  }
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  return String(value);
}
