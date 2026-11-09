[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnAutoWidthOptionsIf

# Interface: ColumnAutoWidthOptionsIf

Fitting a column width to its content: a double click on the resize handle, [TableApi.autoResizeColumn](../classes/TableApi.md#autoresizecolumn) and
[TableApi.autoResizeColumns](../classes/TableApi.md#autoresizecolumns) (`tableOptions.columnAutoWidth`).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  columnAutoWidth: {
    maxRows: 50_000,
    getWidth: ctx => ctx.property === "message" ? ctx.measureText("x".repeat(80)) : undefined,
  },
};
```

**`Since`**

1.1.110

## Implemented by

- [`ColumnAutoWidthOptions`](../classes/ColumnAutoWidthOptions.md)

## Table of contents

### Properties

- [doubleClick](ColumnAutoWidthOptionsIf.md#doubleclick)
- [getWidth](ColumnAutoWidthOptionsIf.md#getwidth)
- [maxRows](ColumnAutoWidthOptionsIf.md#maxrows)

## Properties

### doubleClick

• **doubleClick**: `boolean`

A double click on the resize handle fits the width of the column to its content. Only where a handle is
(`columnsResizable` and the column is not `resizable: false`). Default `true`.

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.if.ts#L24)

___

### getWidth

• `Optional` **getWidth**: (`ctx`: [`ColumnAutoWidthContextIf`](ColumnAutoWidthContextIf.md)) => `undefined` \| `number`

#### Type declaration

▸ (`ctx`): `undefined` \| `number`

Own measurement: return the width in px, or `undefined` for the default. The result is limited by
`minWidth` / `maxWidth` of the column.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`ColumnAutoWidthContextIf`](ColumnAutoWidthContextIf.md) |

##### Returns

`undefined` \| `number`

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.if.ts#L34)

___

### maxRows

• **maxRows**: `number`

Body rows that are measured: up to this number of rows all of them, above only the rows drawn now (the time stays
the same with millions of rows). Header and footer are always measured. Default `10_000`.

#### Defined in

[src/lib/table/column-drag/column-auto-width-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-options.if.ts#L29)
