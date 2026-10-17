/**
 * The undo and redo stacks of steps (DOM-free): a new step clears the redo stack; at most `maxSteps` steps and
 * `maxCells` cells (over both stacks) are kept – the oldest go first; a single step with more than `maxCells` cells
 * empties the history and is not kept.
 *
 * @example
 * const stack = new UndoStack<{ cellCount: number; label: string }>(100, 1_000_000);
 * stack.push({ cellCount: 1, label: "Edit" });
 * stack.undo()?.label;   // "Edit" – now on the redo stack
 * stack.canRedo();       // true
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class UndoStack<T extends { readonly cellCount: number }> {

  private readonly undoSteps: T[] = [];
  private readonly redoSteps: T[] = [];
  private cells = 0;

  /**
   * @param {number} maxSteps - steps kept on the undo stack
   * @param {number} maxCells - cells kept over both stacks
   */
  constructor(private readonly maxSteps: number, private readonly maxCells: number) {
  }

  /**
   * Adds a step and clears the redo stack.
   *
   * @param {T} step - the new step
   * @returns {boolean} false if the step was too large (the history is empty now)
   */
  push(step: T): boolean {
    this.clearRedo();
    if (step.cellCount > this.maxCells || this.maxSteps < 1) {
      this.clear();
      return false;
    }
    this.undoSteps.push(step);
    this.cells += step.cellCount;
    while (this.undoSteps.length > this.maxSteps || this.cells > this.maxCells) {
      this.cells -= this.undoSteps.shift()!.cellCount;
    }
    return true;
  }

  /**
   * Takes the last step for undo (it moves to the redo stack).
   *
   * @returns {T | undefined} the step, `undefined` if there is none
   */
  undo(): T | undefined {
    const step = this.undoSteps.pop();
    if (step) this.redoSteps.push(step);
    return step;
  }

  /**
   * Takes the last undone step for redo (it moves back to the undo stack).
   *
   * @returns {T | undefined} the step, `undefined` if there is none
   */
  redo(): T | undefined {
    const step = this.redoSteps.pop();
    if (step) this.undoSteps.push(step);
    return step;
  }

  /** @returns {T | undefined} the step the next undo takes */
  peekUndo(): T | undefined {
    return this.undoSteps[this.undoSteps.length - 1];
  }

  /** @returns {T | undefined} the step the next redo takes */
  peekRedo(): T | undefined {
    return this.redoSteps[this.redoSteps.length - 1];
  }

  /** @returns {boolean} true if there is a step to undo */
  canUndo(): boolean {
    return this.undoSteps.length > 0;
  }

  /** @returns {boolean} true if there is a step to redo */
  canRedo(): boolean {
    return this.redoSteps.length > 0;
  }

  /** @returns {number} steps on the undo stack */
  size(): number {
    return this.undoSteps.length;
  }

  /** @returns {number} cells kept over both stacks */
  cellCount(): number {
    return this.cells;
  }

  /** Empties both stacks. */
  clear(): void {
    this.undoSteps.length = 0;
    this.redoSteps.length = 0;
    this.cells = 0;
  }

  private clearRedo(): void {
    for (const step of this.redoSteps) this.cells -= step.cellCount;
    this.redoSteps.length = 0;
  }
}
