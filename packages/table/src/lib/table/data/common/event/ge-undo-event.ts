/**
 * The undo history changed ({@link EventListenerIf.onUndoStackChanged}, wrapper event `undoStackChanged`): enough to
 * enable and label own buttons ("Undo Paste").
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onUndoStackChanged = (evt: GeUndoEvent) => {
 *   undoButton.disabled = !evt.canUndo;
 *   undoButton.title = evt.undoLabel ? `Undo ${evt.undoLabel}` : "Undo";
 * };
 *
 * @category Events
 * @since 1.1.99
 */
export class GeUndoEvent {
  /**
   * @param {boolean} canUndo - a step can be undone
   * @param {boolean} canRedo - a step can be redone
   * @param {string | undefined} undoLabel - the label of the step undo takes (`"Edit"`, `"Paste"` …)
   * @param {string | undefined} redoLabel - the label of the step redo takes
   * @param {number} size - steps on the undo stack
   */
  constructor(
    public readonly canUndo: boolean,
    public readonly canRedo: boolean,
    public readonly undoLabel: string | undefined,
    public readonly redoLabel: string | undefined,
    public readonly size: number,
  ) {
  }
}
