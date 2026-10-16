[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DetailTableParamsIf

# Interface: DetailTableParamsIf

What [DetailRenderContextIf.createTable](DetailRenderContextIf.md#createtable) needs for a nested table in a detail row.

**`Since`**

1.1.97

## Table of contents

### Properties

- [eventListener](DetailTableParamsIf.md#eventlistener)
- [height](DetailTableParamsIf.md#height)
- [tableModel](DetailTableParamsIf.md#tablemodel)
- [tableOptions](DetailTableParamsIf.md#tableoptions)

## Properties

### eventListener

• `Optional` **eventListener**: [`EventListenerIf`](EventListenerIf.md)

Its event listener (default: none).

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L18)

___

### height

• `Optional` **height**: `string` \| `number`

The height of the nested table: px or a CSS length. Default: `"100%"` with a fixed
[MasterDetailOptionsIf.detailHeight](MasterDetailOptionsIf.md#detailheight), otherwise [MasterDetailOptionsIf.estimatedDetailHeight](MasterDetailOptionsIf.md#estimateddetailheight) px.

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L23)

___

### tableModel

• **tableModel**: [`TableModelIf`](TableModelIf.md)

The model of the nested table, e.g. `TableFactory.createTableModel({ rows: order.items, properties: [...] })`.

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L14)

___

### tableOptions

• `Optional` **tableOptions**: [`TableOptionsIf`](TableOptionsIf.md)

Its options (default: `new TableOptions()`).

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L16)
