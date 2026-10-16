import { TableStatePart } from "./table-state.if";

/**
 * All parts of a {@link TableStateIf}, in the order the table applies them.
 *
 * @example
 * const withoutScroll = ALL_TABLE_STATE_PARTS.filter(part => part !== "scroll");
 * const state = tableApi.getState(withoutScroll);
 *
 * @category State
 * @since 1.1.92
 */
export const ALL_TABLE_STATE_PARTS: readonly TableStatePart[] = Object.freeze(
  ["headerGroups", "columns", "tree", "sort", "checked", "selection", "details", "scroll", "custom"] as TableStatePart[]);
