[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AutoRestoreOptions

# Class: AutoRestoreOptions\<T\>

Defaults for [TableOptionsIf.autoRestoreOptions](../interfaces/TableOptionsIf.md#autorestoreoptions): everything off. Spread it and switch on what the table
should remember in `localStorage` (one key per table).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders-table",          // unique per table
    autoRestoreSortingState: true,
    autoRestoreScrollPosition: true
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
- [autoRestoreScrollPosition](AutoRestoreOptions.md#autorestorescrollposition)
- [autoRestoreSelectedState](AutoRestoreOptions.md#autorestoreselectedstate)
- [autoRestoreSortingState](AutoRestoreOptions.md#autorestoresortingstate)
- [getStorageKeyFn](AutoRestoreOptions.md#getstoragekeyfn)

### Methods

- [getRowId](AutoRestoreOptions.md#getrowid)
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

Optional. If true, the checked state of
T elements will be preserved after changes in the application state.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreCheckedState](../interfaces/AutoRestoreOptionsIf.md#autorestorecheckedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L41)

___

### autoRestoreCollapsedExpandedState

• **autoRestoreCollapsedExpandedState**: `boolean` = `false`

Optional. If true,
the expanded/collapsed state of T elements will be preserved after changes in the application state.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreCollapsedExpandedState](../interfaces/AutoRestoreOptionsIf.md#autorestorecollapsedexpandedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L38)

___

### autoRestoreScrollPosition

• **autoRestoreScrollPosition**: `boolean` = `false`

Optional. If true, the scroll position
in the list of T elements will be preserved after changes in the application state.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreScrollPosition](../interfaces/AutoRestoreOptionsIf.md#autorestorescrollposition)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L39)

___

### autoRestoreSelectedState

• **autoRestoreSelectedState**: `boolean` = `false`

Optional. If true, the selected state of
T elements will be preserved after changes in the application state.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreSelectedState](../interfaces/AutoRestoreOptionsIf.md#autorestoreselectedstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L42)

___

### autoRestoreSortingState

• **autoRestoreSortingState**: `boolean` = `false`

If true, the sorting state of
T elements will be preserved after changes in the application state.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[autoRestoreSortingState](../interfaces/AutoRestoreOptionsIf.md#autorestoresortingstate)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L37)

___

### getStorageKeyFn

• **getStorageKeyFn**: `undefined` = `undefined`

Function for generating a unique key used for storage.
If not provided, a constant key 'autorestoreoptionsif' will be used.

#### Implementation of

[AutoRestoreOptionsIf](../interfaces/AutoRestoreOptionsIf.md).[getStorageKeyFn](../interfaces/AutoRestoreOptionsIf.md#getstoragekeyfn)

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L45)

## Methods

### getRowId

▸ **getRowId**(`row`): `string` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

#### Returns

`string` \| `number`

#### Implementation of

AutoRestoreOptionsIf.getRowId

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L59)

___

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

#### Implementation of

AutoRestoreOptionsIf.isSame

#### Defined in

[src/lib/table/data/options/auto-restore-options.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/auto-restore-options.ts#L48)
