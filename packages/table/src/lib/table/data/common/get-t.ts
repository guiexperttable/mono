/**
 * Represents a function that retrieves a value of type T.
 * Returns the value of type T if it exists, otherwise undefined.
 *
 * @template T - The type of the value to be retrieved.
 *
 * @category Utilities
 */
export type GetT<T> = () => T | undefined;
