[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SortItem

# Class: SortItem

One sort instruction: column index + direction. Used by [TableModelIf.doSort](../interfaces/TableModelIf.md#dosort) and
[AreaModelIf.doSort](../interfaces/AreaModelIf.md#dosort).

**`Example`**

```ts
// sort once by column 10 descending (and match the header icon set with sortState: "desc")
tableModel.doSort([new SortItem(10, "desc")]);
```

## Table of contents

### Constructors

- [constructor](SortItem.md#constructor)

### Properties

- [columnIndex](SortItem.md#columnindex)
- [sortState](SortItem.md#sortstate)

## Constructors

### constructor

• **new SortItem**(`columnIndex`, `sortState`): [`SortItem`](SortItem.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | Column index (west + center + east). |
| `sortState` | [`SortState`](../modules.md#sortstate) | `"asc"`, `"desc"` or `""` (unsorted). |

#### Returns

[`SortItem`](SortItem.md)

#### Defined in

[src/lib/table/data/common/sort-item.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/sort-item.ts#L15)

## Properties

### columnIndex

• **columnIndex**: `number`

Column index (west + center + east).

#### Defined in

[src/lib/table/data/common/sort-item.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/sort-item.ts#L17)

___

### sortState

• **sortState**: [`SortState`](../modules.md#sortstate)

`"asc"`, `"desc"` or `""` (unsorted).

#### Defined in

[src/lib/table/data/common/sort-item.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/sort-item.ts#L19)
