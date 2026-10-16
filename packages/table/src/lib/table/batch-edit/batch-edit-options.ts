import type { BatchEditOptionsIf } from "./batch-edit-options.if";

/**
 * The defaults of {@link BatchEditOptionsIf}.
 *
 * @example
 * BatchEditOptions.create(true).blockCommitOnInvalid;   // true
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export class BatchEditOptions implements BatchEditOptionsIf {
  blockCommitOnInvalid = true;

  /**
   * The options of {@link TableOptionsIf.batchEdit} (`true`, `false` or an object) with defaults.
   *
   * @param {boolean | Partial<BatchEditOptionsIf>} [option] - `tableOptions.batchEdit`
   * @returns {BatchEditOptionsIf} complete options
   */
  static create(option?: boolean | Partial<BatchEditOptionsIf>): BatchEditOptionsIf {
    const ret = new BatchEditOptions();
    if (option && typeof option === "object" && option.blockCommitOnInvalid !== undefined) {
      ret.blockCommitOnInvalid = option.blockCommitOnInvalid;
    }
    return ret;
  }
}
