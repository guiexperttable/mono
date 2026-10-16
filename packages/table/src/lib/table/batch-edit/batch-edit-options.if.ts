/**
 * Options of the batch edit ({@link TableOptionsIf.batchEdit}): changes are collected (marked, not written) and
 * written with {@link TableApi.commitBatchEdit} or discarded with {@link TableApi.cancelBatchEdit}.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   batchEdit: { blockCommitOnInvalid: false },   // always collect; invalid values don't block saving
 * };
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export interface BatchEditOptionsIf {
  /**
   * `true` (default): {@link TableApi.commitBatchEdit} writes nothing while a pending value is invalid
   * ({@link ColumnDefIf.validate}) and returns `false`.
   */
  blockCommitOnInvalid: boolean;
}
