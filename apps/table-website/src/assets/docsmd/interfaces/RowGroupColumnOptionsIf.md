[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupColumnOptionsIf

# Interface: RowGroupColumnOptionsIf\<T\>

Options of the group column ([RowGroupColumnDef](../classes/RowGroupColumnDef.md)) – the column with the arrows and the group labels.

**`Example`**

```ts
RowGroupFactory.createTableModel<Sale>({
  rows: sales, columnDefs, groupBy: ["region"],
  groupColumn: { headerLabel: "Region", width: px160, label: g => `${g.label} – ${g.count} sales` }
});
```

**`Since`**

1.1.94

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [fixed](RowGroupColumnOptionsIf.md#fixed)
- [headerLabel](RowGroupColumnOptionsIf.md#headerlabel)
- [label](RowGroupColumnOptionsIf.md#label)
- [showCount](RowGroupColumnOptionsIf.md#showcount)
- [width](RowGroupColumnOptionsIf.md#width)

## Properties

### fixed

• **fixed**: `boolean`

Fix the column on the left (it comes behind row numbers and the checkbox column). Default true.

#### Defined in

[src/lib/table/rowgroup/row-group-column-options.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-options.if.ts#L26)

___

### headerLabel

• `Optional` **headerLabel**: `string`

The header text. Default: the names of the levels, e.g. `"Region › Produkt"` (follows [TableApi.setRowGroupBy](../classes/TableApi.md#setrowgroupby)).

#### Defined in

[src/lib/table/rowgroup/row-group-column-options.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-options.if.ts#L18)

___

### label

• `Optional` **label**: (`group`: [`RowGroupIf`](RowGroupIf.md)\<`T`\>) => `string`

#### Type declaration

▸ (`group`): `string`

An own label of a group row (text, never HTML). Default: `"<key> (<count>)"`.

##### Parameters

| Name | Type |
| :------ | :------ |
| `group` | [`RowGroupIf`](RowGroupIf.md)\<`T`\> |

##### Returns

`string`

#### Defined in

[src/lib/table/rowgroup/row-group-column-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-options.if.ts#L24)

___

### showCount

• **showCount**: `boolean`

Show the number of rows behind the key: `"Nord (3)"`. Default true.

#### Defined in

[src/lib/table/rowgroup/row-group-column-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-options.if.ts#L22)

___

### width

• **width**: [`SizeIf`](SizeIf.md)

The width. Default 220 px.

#### Defined in

[src/lib/table/rowgroup/row-group-column-options.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-options.if.ts#L20)
