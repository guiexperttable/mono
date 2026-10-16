/**
 * What opened or closed a detail row: a click on the icon (`"mouse"`), Enter (`"keyboard"`), the {@link TableApi}
 * (`"api"`) or a restored table state (`"state"`).
 *
 * @category Master/detail
 * @since 1.1.97
 */
export type GeDetailEventSource = "mouse" | "keyboard" | "api" | "state";

/**
 * Reported by {@link EventListenerIf.onDetailExpandedChanged}: a detail row was expanded or collapsed (master/detail,
 * {@link MasterDetailOptionsIf}).
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onDetailExpandedChanged = (evt: GeDetailEvent) => {
 *   console.log(`order ${evt.row.id} ${evt.expanded ? "opened" : "closed"} (${evt.source})`);
 * };
 *
 * @category Master/detail
 * @since 1.1.97
 */
export class GeDetailEvent<T = any> {

  constructor(
    /** The master row. */
    public readonly row: T,
    /** Its display index (`-1` if it is not shown, e.g. filtered out). */
    public readonly rowIndex: number,
    /** `true` = expanded, `false` = collapsed. */
    public readonly expanded: boolean,
    /** What changed it. */
    public readonly source: GeDetailEventSource
  ) {
  }
}
