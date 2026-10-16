[GuiExpert Table API](../README.md) / [Exports](../modules.md) / BatchEditOptionsIf

# Interface: BatchEditOptionsIf

Options of the batch edit ([TableOptionsIf.batchEdit](TableOptionsIf.md#batchedit)): changes are collected (marked, not written) and
written with [TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit) or discarded with [TableApi.cancelBatchEdit](../classes/TableApi.md#cancelbatchedit).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  batchEdit: { blockCommitOnInvalid: false },   // always collect; invalid values don't block saving
};
```

**`Since`**

1.1.96

## Implemented by

- [`BatchEditOptions`](../classes/BatchEditOptions.md)

## Table of contents

### Properties

- [blockCommitOnInvalid](BatchEditOptionsIf.md#blockcommitoninvalid)

## Properties

### blockCommitOnInvalid

• **blockCommitOnInvalid**: `boolean`

`true` (default): [TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit) writes nothing while a pending value is invalid
([ColumnDefIf.validate](ColumnDefIf.md#validate)) and returns `false`.

#### Defined in

[src/lib/table/batch-edit/batch-edit-options.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-options.if.ts#L19)
