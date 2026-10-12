/**
 * Represents a DivScope object.
 *
 * @typedef {{
 *   parent: HTMLDivElement,
 *   child: HTMLDivElement,
 *   cache: { [key: number]: HTMLDivElement }
 * }} DivScope
 *
 * @category Area models
 */
export type DivScope = {
  parent: HTMLDivElement,
  child: HTMLDivElement,
  cache: { [key: number]: HTMLDivElement }
};
