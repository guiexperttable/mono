import type { RowGroupIf } from "./row-group.if";

/**
 * A group of a row grouping (see {@link RowGroupIf}). Created by {@link groupRows} and {@link AreaModelRowGroups} –
 * you don't create groups yourself.
 *
 * @example
 * const groups = groupRows(sales, ["region"]);
 * aggregateRowGroups(groups, { umsatz: "sum" });
 * groups.map(g => `${g.label}: ${g.results.umsatz}`);   // ["Nord: 270", "Süd: 180"]
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export class RowGroup<T = any> implements RowGroupIf<T> {

  /** Marker for {@link isRowGroup}. */
  readonly type = "RowGroup";

  readonly children: RowGroup<T>[] = [];
  count = 0;
  results: Record<string, unknown> = {};

  /** @internal indices into the source rows (last level only), in source order */
  readonly sourceIndices: number[] = [];
  /** @internal aggregation states (one per spec), kept for merging and partial updates */
  states: unknown[] = [];
  /** @internal the filter of the last aggregation (source index → kept) */
  accept?: (sourceIndex: number) => boolean;
  /** @internal parts of the id: level name + typed key per level */
  readonly idParts: [string, string][];

  constructor(
    readonly key: unknown,
    readonly label: string,
    readonly level: number,
    readonly field: string,
    readonly path: readonly unknown[],
    readonly parent: RowGroup<T> | undefined,
    /** @internal the source rows */
    readonly source: ArrayLike<T>,
    typedKey: string
  ) {
    this.idParts = [...(parent?.idParts ?? []), [field, typedKey]];
  }

  /** A stable id from level names and keys, e.g. `rowgroup:[["region","s:Nord"]]`. */
  get id(): string {
    return "rowgroup:" + JSON.stringify(this.idParts);
  }

  /** True for a group of the last level (it holds rows, no sub-groups). */
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  getRows(filtered: boolean = true): T[] {
    return this.collectIndices(filtered, []).map(i => this.source[i]);
  }

  /**
   * The source indices of all rows of the group (and its sub-groups), group by group.
   * @internal
   */
  collectIndices(filtered: boolean, ret: number[]): number[] {
    if (this.isLeaf()) {
      const accept = filtered ? this.accept : undefined;
      for (const i of this.sourceIndices) {
        if (!accept || accept(i)) ret.push(i);
      }
    } else {
      for (const child of this.children) child.collectIndices(filtered, ret);
    }
    return ret;
  }
}
