[GuiExpert Table API](../README.md) / [Exports](../modules.md) / BatchEditOptions

# Class: BatchEditOptions

The defaults of [BatchEditOptionsIf](../interfaces/BatchEditOptionsIf.md).

**`Example`**

```ts
BatchEditOptions.create(true).blockCommitOnInvalid;   // true
```

**`Since`**

1.1.96

## Implements

- [`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)

## Table of contents

### Constructors

- [constructor](BatchEditOptions.md#constructor)

### Properties

- [blockCommitOnInvalid](BatchEditOptions.md#blockcommitoninvalid)

### Methods

- [create](BatchEditOptions.md#create)

## Constructors

### constructor

• **new BatchEditOptions**(): [`BatchEditOptions`](BatchEditOptions.md)

#### Returns

[`BatchEditOptions`](BatchEditOptions.md)

## Properties

### blockCommitOnInvalid

• **blockCommitOnInvalid**: `boolean` = `true`

`true` (default): [TableApi.commitBatchEdit](TableApi.md#commitbatchedit) writes nothing while a pending value is invalid
([ColumnDefIf.validate](../interfaces/ColumnDefIf.md#validate)) and returns `false`.

#### Implementation of

[BatchEditOptionsIf](../interfaces/BatchEditOptionsIf.md).[blockCommitOnInvalid](../interfaces/BatchEditOptionsIf.md#blockcommitoninvalid)

#### Defined in

[src/lib/table/batch-edit/batch-edit-options.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-options.ts#L13)

## Methods

### create

▸ **create**(`option?`): [`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)

The options of [TableOptionsIf.batchEdit](../interfaces/TableOptionsIf.md#batchedit) (`true`, `false` or an object) with defaults.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)\> | `tableOptions.batchEdit` |

#### Returns

[`BatchEditOptionsIf`](../interfaces/BatchEditOptionsIf.md)

complete options

#### Defined in

[src/lib/table/batch-edit/batch-edit-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/batch-edit-options.ts#L21)
