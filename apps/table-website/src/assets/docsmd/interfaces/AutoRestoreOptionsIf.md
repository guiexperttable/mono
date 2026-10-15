[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AutoRestoreOptionsIf

# Interface: AutoRestoreOptionsIf\<T\>

What a table remembers between page loads, and where. Everything is off by default ([AutoRestoreOptions](../classes/AutoRestoreOptions.md));
nothing is stored without [getStorageKeyFn](AutoRestoreOptionsIf.md#getstoragekeyfn) (the table warns once if a flag is set without it).

The state is stored as one JSON value under `<key>tableState` in [storage](AutoRestoreOptionsIf.md#storage) (default `localStorage`) –
the same format as [TableApi.getState](../classes/TableApi.md#getstate). Columns are stored by property and rows by [getRowId](AutoRestoreOptionsIf.md#getrowid), so a
moved column or new data never hits the wrong column or row. The stored state holds no cell values, but row ids
can be personal data (e.g. an e-mail address as id) – prefer technical ids. The tree, checked rows, the selection
and the first visible row need row ids; tree, checked and selected rows are computed only when their flag is set.

| Flag | Remembers | since |
|---|---|---|
| [autoRestoreSortingState](AutoRestoreOptionsIf.md#autorestoresortingstate) | sorted columns | |
| [autoRestoreScrollPosition](AutoRestoreOptionsIf.md#autorestorescrollposition) | scroll position | |
| [autoRestoreCollapsedExpandedState](AutoRestoreOptionsIf.md#autorestorecollapsedexpandedstate) | expanded tree nodes | |
| [autoRestoreColumnLayout](AutoRestoreOptionsIf.md#autorestorecolumnlayout) | width, order, visibility of the columns | 1.1.92 |
| [autoRestoreHeaderGroupState](AutoRestoreOptionsIf.md#autorestoreheadergroupstate) | collapsed header groups | 1.1.92 |
| [autoRestoreCheckedState](AutoRestoreOptionsIf.md#autorestorecheckedstate) | checked rows | 1.1.92 (declared before, without effect) |
| [autoRestoreSelectedState](AutoRestoreOptionsIf.md#autorestoreselectedstate) | selection | 1.1.92 (declared before, without effect) |
| [autoRestoreCustomState](AutoRestoreOptionsIf.md#autorestorecustomstate) | your data ([TableApi.setCustomState](../classes/TableApi.md#setcustomstate)) | 1.1.92 |

Before 1.1.92 sorting, scroll position and tree were stored under three keys (`<key>sortingState`,
`<key>scrollState`, `<key>collapsedExpandedState`); they are read once and removed with the next save.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",
    getRowId: (order: Order) => order.id,
    autoRestoreColumnLayout: true,
    autoRestoreSortingState: true,
    autoRestoreCheckedState: true
  }
};
```

**`Typeparam`**

T - The type of the rows.

**`See`**

Training: [Remember the state](https://gui.expert/training/persist-state/)

## Type parameters

| Name |
| :------ |
| `T` |

## Implemented by

- [`AutoRestoreOptions`](../classes/AutoRestoreOptions.md)

## Table of contents

### Properties

- [autoRestoreCheckedState](AutoRestoreOptionsIf.md#autorestorecheckedstate)
- [autoRestoreCollapsedExpandedState](AutoRestoreOptionsIf.md#autorestorecollapsedexpandedstate)
- [autoRestoreColumnLayout](AutoRestoreOptionsIf.md#autorestorecolumnlayout)
- [autoRestoreCustomState](AutoRestoreOptionsIf.md#autorestorecustomstate)
- [autoRestoreHeaderGroupState](AutoRestoreOptionsIf.md#autorestoreheadergroupstate)
- [autoRestoreScrollPosition](AutoRestoreOptionsIf.md#autorestorescrollposition)
- [autoRestoreSelectedState](AutoRestoreOptionsIf.md#autorestoreselectedstate)
- [autoRestoreSortingState](AutoRestoreOptionsIf.md#autorestoresortingstate)
- [getRowId](AutoRestoreOptionsIf.md#getrowid)
- [getStorageKeyFn](AutoRestoreOptionsIf.md#getstoragekeyfn)
- [isSame](AutoRestoreOptionsIf.md#issame)
- [storage](AutoRestoreOptionsIf.md#storage)

## Properties

### autoRestoreCheckedState

• `Optional` **autoRestoreCheckedState**: `boolean`

Remember the checked rows (by [getRowId](AutoRestoreOptionsIf.md#getrowid)). Since 1.1.92 (before: declared without effect).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L92)

___

### autoRestoreCollapsedExpandedState

• `Optional` **autoRestoreCollapsedExpandedState**: `boolean`

Remember expanded and collapsed nodes of a tree table (by [getRowId](AutoRestoreOptionsIf.md#getrowid)).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L87)

___

### autoRestoreColumnLayout

• `Optional` **autoRestoreColumnLayout**: `boolean`

Remember width, order and visibility of the columns (by property). Widths are stored only for columns that were
resized, so `%` and weight columns stay responsive.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L104)

___

### autoRestoreCustomState

• `Optional` **autoRestoreCustomState**: `boolean`

Remember the data set with [TableApi.setCustomState](../classes/TableApi.md#setcustomstate) (e.g. a filter text).

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L114)

___

### autoRestoreHeaderGroupState

• `Optional` **autoRestoreHeaderGroupState**: `boolean`

Remember collapsed and expanded header groups ([CellGroupIf.toggle](CellGroupIf.md#toggle)).

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L109)

___

### autoRestoreScrollPosition

• `Optional` **autoRestoreScrollPosition**: `boolean`

Remember the scroll position (and the id of the first visible row).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L89)

___

### autoRestoreSelectedState

• `Optional` **autoRestoreSelectedState**: `boolean`

Remember the selection: rows by [getRowId](AutoRestoreOptionsIf.md#getrowid), columns by property. Restored in the current row order.
Since 1.1.92 (before: declared without effect).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L97)

___

### autoRestoreSortingState

• **autoRestoreSortingState**: `boolean`

Remember the sorted columns (by property).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L85)

___

### getRowId

• `Optional` **getRowId**: [`GetRowIdFn`](../modules.md#getrowidfn)\<`T`\>

A unique, stable id per row (tree: per node). With the default of [AutoRestoreOptions](../classes/AutoRestoreOptions.md) the table uses the
property `id`, then `uuid`; rows without them are not stored (since 1.1.92 – the JSON of the row would write
personal data into the storage; the table warns once).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L121)

___

### getStorageKeyFn

• `Optional` **getStorageKeyFn**: [`GetStorageKeyFn`](../modules.md#getstoragekeyfn)

The storage key of this table, e.g. `() => "orders"`. Without it nothing is stored.

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L123)

___

### isSame

• `Optional` **isSame**: [`IsSameFn`](../modules.md#issamefn)\<`T`\>

**`Deprecated`**

since 1.1.92 – never used; rows are compared by [getRowId](AutoRestoreOptionsIf.md#getrowid).

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L127)

___

### storage

• `Optional` **storage**: [`StateStorageIf`](StateStorageIf.md)

Where the state is stored. Default: `localStorage`; `sessionStorage` or an own [StateStorageIf](StateStorageIf.md) also work.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/options/auto-restore-options.if.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.if.ts#L133)
