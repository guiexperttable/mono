import type { CellEditMode, CellEditorContextIf, CellEditorIf } from "../cell-editor.if";

/**
 * The default editor of Excel-style editing: a text field (`input type="text"`). Built with DOM APIs only (no
 * inline handlers, no `innerHTML`) – it works under a strict Content Security Policy.
 *
 * @example
 * ColumnDef.create({ property: "name", editable: TrueFn, editor: () => new TextCellEditor() });
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class TextCellEditor implements CellEditorIf {

  protected input?: HTMLInputElement;
  protected ctx?: CellEditorContextIf;
  protected composing = false;
  private readonly abort = new AbortController();

  open(container: HTMLDivElement, ctx: CellEditorContextIf): void {
    this.ctx = ctx;
    const dom = ctx.domService;
    const input = dom.createElement<HTMLInputElement>("input");
    this.input = input;
    dom.setAttribute(input, "type", this.inputType());
    dom.setAttribute(input, "autocomplete", "off");
    dom.setAttribute(input, "spellcheck", "false");
    dom.setAttribute(input, "aria-label", ctx.ariaLabel);
    dom.addClass(input, "ge-table-cell-editor-field");
    this.decorate(input, ctx);
    input.value = ctx.typedText !== undefined ? ctx.typedText : this.toText(ctx);
    const signal = this.abort.signal;
    input.addEventListener("compositionstart", () => this.composing = true, { signal });
    input.addEventListener("compositionend", () => this.composing = false, { signal });
    input.addEventListener("input", () => ctx.inputChanged(), { signal });
    dom.appendChild(container, input);
  }

  /** The `type` attribute of the input. */
  protected inputType(): string {
    return "text";
  }

  /** Extra attributes and classes (subclasses). */
  protected decorate(_input: HTMLInputElement, _ctx: CellEditorContextIf): void {
    // nothing for text
  }

  /** The start text from the cell value. */
  protected toText(ctx: CellEditorContextIf): string {
    return ctx.input;
  }

  getValue(): unknown {
    return this.input?.value ?? "";
  }

  getText(): string {
    return this.input?.value ?? "";
  }

  setText(text: string): void {
    if (this.input) {
      this.input.value = text;
      this.input.setSelectionRange(text.length, text.length);
    }
  }

  focus(): void {
    const input = this.input;
    if (!input) {
      return;
    }
    if (input.ownerDocument.activeElement !== input) {
      input.focus({ preventScroll: true });
    }
    const ctx = this.ctx;
    if (ctx && !this.focusedOnce) {
      this.focusedOnce = true;
      const len = input.value.length;
      try {
        if (ctx.typedText === undefined && ctx.textSelection === "all" && ctx.mode === "edit") {
          input.setSelectionRange(0, len);
        } else {
          input.setSelectionRange(len, len);
        }
      } catch {
        // number/date inputs do not support selection ranges
      }
    }
  }

  private focusedOnce = false;

  getFocusElement(): HTMLElement | undefined {
    return this.input;
  }

  setMode(_mode: CellEditMode): void {
    // the caret stays where it is
  }

  isComposing(): boolean {
    return this.composing;
  }

  wantsKey(_evt: KeyboardEvent, _mode: CellEditMode): boolean {
    return false;
  }

  close(): void {
    this.abort.abort();
    this.input?.remove();
    this.input = undefined;
  }
}
