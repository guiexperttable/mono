/**
 * A flag as function – e.g. {@link ColumnDefIf.sortable}, `editable`, `isVisible`. A function can depend on state:
 * `isVisible: () => showDetails`. Constants: {@link TrueFn}, {@link FalseFn}.
 *
 * @category Columns
 */
export type BooleanFunction = () => boolean;

/**
 * Represents a function that always returns true.
 *
 * @function
 * @returns {boolean} - Always returns true
 *
 * @category Columns
 */
export const TrueFn = () => true;
/**
 * Represents a function that always returns `false`.
 *
 * @function
 * @returns {boolean} Always returns `false`.
 *
 * @category Columns
 */
export const FalseFn = () => false;
