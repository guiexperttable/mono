[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AutoRestoreOptions

# Class: AutoRestoreOptions\<T\>

Defaults for [TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions): everything off. Spread it and switch on what the table
should remember in `localStorage` (one key per table) – see [AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md) for all flags.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders-table",          // unique per table
    autoRestoreSortingState: true,
    autoRestoreScrollPosition: true,
    autoRestoreColumnLayout: true                     // widths, order, visibility (since 1.1.92)
  }
};
```

**`Example`**

```ts
// trees: remember expanded nodes – needs a stable id per node
const treeOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<OrderNode>(),
    getStorageKeyFn: () => "order-tree",
    getRowId: (node: OrderNode) => node.id,
    autoRestoreCollapsedExpandedState: true
  }
};
```

**`See`**

Training: [Remember the state](https://gui.expert/training/persist-state/)

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`AutoRestoreOptionsIf`](../interfaces/AutoRestoreOptionsIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](AutoRestoreOptions.md#constructor)

### Properties

- [autoRestoreCheckedState](AutoRestoreOptions.md#autorestorecheckedstate)
- [autoRestoreCollapsedExpandedState](AutoRestoreOptions.md#autorestorecollapsedexpandedstate)
- [autoRestoreColumnLayout](AutoRestoreOptions.md#autorestorecolumnlayout)
- [autoRestoreCustomState](AutoRestoreOptions.md#autorestorecustomstate)
- [autoRestoreHeaderGroupState](AutoRestoreOptions.md#autorestoreheadergroupstate)
- [autoRestoreScrollPosition](AutoRestoreOptions.md#autorestorescrollposition)
- [autoRestoreSelectedState](AutoRestoreOptions.md#autorestoreselectedstate)
- [autoRestoreSortingState](AutoRestoreOptions.md#autorestoresortingstate)
- [getRowId](AutoRestoreOptions.md#getrowid)
- [getStorageKeyFn](AutoRestoreOptions.md#getstoragekeyfn)

### Methods

- [isSame](AutoRestoreOptions.md#issame)

## Constructors

### constructor

• **new AutoRestoreOptions**\<`T`\>(): [`AutoRestoreOptions`](AutoRestoreOptions.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`AutoRestoreOptions`](AutoRestoreOptions.md)\<`T`\>

## Properties

### autoRestoreCheckedState

• **autoRestoreCheckedState**: `boolean` = `false`

Remember the checked rows (by [getRowId](../interfaces/AutoRestoreOptionsIf.md#getrowid)). Since 1.1.92 (before: declared without effect).

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreCheckedState](../interfaces/AutoRestoreOptionsIf.md#autorestorecheckedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L43)

___

### autoRestoreCollapsedExpandedState

• **autoRestoreCollapsedExpandedState**: `boolean` = `false`

Remember expanded and collapsed nodes of a tree table (by [getRowId](../interfaces/AutoRestoreOptionsIf.md#getrowid)).

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreCollapsedExpandedState](../interfaces/AutoRestoreOptionsIf.md#autorestorecollapsedexpandedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L40)

___

### autoRestoreColumnLayout

• **autoRestoreColumnLayout**: `boolean` = `false`

**`Since`**

1.1.92

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreColumnLayout](../interfaces/AutoRestoreOptionsIf.md#autorestorecolumnlayout)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L47)

___

### autoRestoreCustomState

• **autoRestoreCustomState**: `boolean` = `false`

**`Since`**

1.1.92

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreCustomState](../interfaces/AutoRestoreOptionsIf.md#autorestorecustomstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L51)

___

### autoRestoreHeaderGroupState

• **autoRestoreHeaderGroupState**: `boolean` = `false`

**`Since`**

1.1.92

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreHeaderGroupState](../interfaces/AutoRestoreOptionsIf.md#autorestoreheadergroupstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L49)

___

### autoRestoreScrollPosition

• **autoRestoreScrollPosition**: `boolean` = `false`

Remember the scroll position (and the id of the first visible row).

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreScrollPosition](../interfaces/AutoRestoreOptionsIf.md#autorestorescrollposition)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L41)

___

### autoRestoreSelectedState

• **autoRestoreSelectedState**: `boolean` = `false`

Remember the selection: rows by [getRowId](../interfaces/AutoRestoreOptionsIf.md#getrowid), columns by property. Restored in the current row order.
Since 1.1.92 (before: declared without effect).

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreSelectedState](../interfaces/AutoRestoreOptionsIf.md#autorestoreselectedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L44)

___

### autoRestoreSortingState

• **autoRestoreSortingState**: `boolean` = `false`

Remember the sorted columns (by property).

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreSortingState](../interfaces/AutoRestoreOptionsIf.md#autorestoresortingstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L39)

___

### getRowId

• **getRowId**: (`row`: `T`) => `string` \| `number`

A unique, stable id per row (tree: per node). With the default of [AutoRestoreOptions](AutoRestoreOptions.md) the table uses the
property `id`, then `uuid`; rows without them are not stored (since 1.1.92 – the JSON of the row would write
personal data into the storage; the table warns once).

#### Type declaration

▸ (`row`): `string` \| `number`

Default: the property `id`, then `uuid`, then the JSON of the row. The table itself uses only `id` / `uuid` of
this default (since 1.1.92): rows without them are not stored – the JSON would write whole rows into the storage.

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`string` \| `number`

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[getRowId](../interfaces/AutoRestoreOptionsIf.md#getrowid)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L73)

___

### getStorageKeyFn

• **getStorageKeyFn**: `undefined` = `undefined`

The storage key of this table, e.g. `() => "orders"`. Without it nothing is stored.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[getStorageKeyFn](../interfaces/AutoRestoreOptionsIf.md#getstoragekeyfn)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L54)

## Methods

### isSame

▸ **isSame**(`r1`, `r2`, `options`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `r1` | `T` |
| `r2` | `T` |
| `options` | [`AutoRestoreOptionsIf`](../interfaces/AutoRestoreOptionsIf.md)\<`T`\> |

#### Returns

`boolean`

**`Deprecated`**

since 1.1.92 – never used by the table.

#### Implementation of

AutoRestoreOptionsIf.isSame

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L58)
