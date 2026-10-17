[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PendingCellChanges

# Class: PendingCellChanges

The pending values of a batch edit: per row (the row **object**, not its index – sorting and filtering don't
change the assignment) and property one entry with old and new value. DOM-free; the table keeps one in its
batch edit service.

**`Example`**

```ts
const pending = new PendingCellChanges();
const row = { price: 10 };
pending.set(row, "price", 10, 12, "12");   // "added"
pending.set(row, "price", 12, 10, "10");   // "removed" – the old value again
```

**`Since`**

1.1.96

## Table of contents

### Constructors

- [constructor](PendingCellChanges.md#constructor)

### Methods

- [clear](PendingCellChanges.md#clear)
- [entries](PendingCellChanges.md#entries)
- [get](PendingCellChanges.md#get)
- [hasRow](PendingCellChanges.md#hasrow)
- [invalidCount](PendingCellChanges.md#invalidcount)
- [isEmpty](PendingCellChanges.md#isempty)
- [put](PendingCellChanges.md#put)
- [remove](PendingCellChanges.md#remove)
- [set](PendingCellChanges.md#set)
- [size](PendingCellChanges.md#size)

## Constructors

### constructor

• **new PendingCellChanges**(): [`PendingCellChanges`](PendingCellChanges.md)

#### Returns

[`PendingCellChanges`](PendingCellChanges.md)

## Methods

### clear

▸ **clear**(): `void`

Forgets all entries.

#### Returns

`void`

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L200)

___

### entries

▸ **entries**(): [`PendingCellIf`](../interfaces/PendingCellIf.md)[]

#### Returns

[`PendingCellIf`](../interfaces/PendingCellIf.md)[]

all entries, in the order they were first changed

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:193](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L193)

___

### get

▸ **get**(`rowKey`, `property`): `undefined` \| [`PendingCellIf`](../interfaces/PendingCellIf.md)

The pending entry of a cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowKey` | `unknown` | the row object (or index) |
| `property` | `string` | the property of the column |

#### Returns

`undefined` \| [`PendingCellIf`](../interfaces/PendingCellIf.md)

the entry, `undefined` if the cell is unchanged

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L147)

___

### hasRow

▸ **hasRow**(`rowKey`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowKey` | `unknown` |

#### Returns

`boolean`

true if the row has pending values

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L171)

___

### invalidCount

▸ **invalidCount**(): `number`

#### Returns

`number`

the number of pending cells with a validation message

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L186)

___

### isEmpty

▸ **isEmpty**(): `boolean`

#### Returns

`boolean`

true if nothing is pending

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:181](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L181)

___

### put

▸ **put**(`entry`): `void`

Puts an entry back as it was (undo/redo of a batch edit step) – without comparing it with the old value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `entry` | [`PendingCellIf`](../interfaces/PendingCellIf.md) | the entry |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L128)

___

### remove

▸ **remove**(`rowKey`, `property`): `boolean`

Removes the entry of a cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowKey` | `unknown` | the row object (or index) |
| `property` | `string` | the property of the column |

#### Returns

`boolean`

true if there was an entry

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L158)

___

### set

▸ **set**(`rowKey`, `property`, `oldValue`, `newValue`, `rawValue`, `error?`): [`PendingChangeResult`](../modules.md#pendingchangeresult)

Sets the pending value of a cell. The old value of an existing entry stays (the value before the first change);
a value equal to it removes the entry (B8).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowKey` | `unknown` | the row object (or the row index for models without objects) |
| `property` | `string` | the property of the column |
| `oldValue` | `unknown` | the current value in the model (used for a new entry) |
| `newValue` | `unknown` | the new value (after the pipe) |
| `rawValue` | `unknown` | the value as entered |
| `error?` | `string` | validation message |

#### Returns

[`PendingChangeResult`](../modules.md#pendingchangeresult)

what happened

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L95)

___

### size

▸ **size**(): `number`

#### Returns

`number`

the number of pending cells

#### Defined in

[src/lib/table/batch-edit/pending-cell-changes.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/batch-edit/pending-cell-changes.ts#L176)
