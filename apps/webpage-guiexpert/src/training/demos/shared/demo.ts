/**
 * Tiny runtime for the live demos of the training pages (see components/training/LiveDemo.astro).
 *
 * Every demo module in ../ exports `default (ctx: DemoContext) => void | (() => void)`.
 * The code between `// #region <name>` and `// #endregion` is what the chapter shows (Snippet.astro),
 * so the code on the page is exactly the code that runs.
 */
export interface DemoContext {
  /** the element the table is rendered into – it already has a fixed height */
  host: HTMLDivElement;
  /** the whole demo box (toolbar + table) */
  root: HTMLElement;
  /** status text in the toolbar */
  info(text: string): void;
  /** a button in the toolbar */
  button(label: string, onClick: (button: HTMLButtonElement) => void): HTMLButtonElement;
  /** a search field in the toolbar */
  search(placeholder: string, onInput: (value: string) => void): HTMLInputElement;
  /** a range slider in the toolbar */
  range(label: string, min: number, max: number, step: number, onInput: (value: number) => void): HTMLInputElement;
  /** a checkbox in the toolbar */
  toggle(label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLInputElement;
}

export type DemoFn = (ctx: DemoContext) => void | (() => void);

/** Formats numbers the same way in every demo: 100,000 */
export const fmt = (n: number) => n.toLocaleString("en");

/** Milliseconds since t0, rounded. */
export const since = (t0: number) => Math.round(performance.now() - t0);

/** Number of DOM elements below an element – the number every chapter of part 1 is about. */
export const domCount = (el: Element) => el.getElementsByTagName("*").length;
