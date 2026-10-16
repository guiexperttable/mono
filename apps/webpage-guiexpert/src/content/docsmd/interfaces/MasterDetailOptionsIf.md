[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MasterDetailOptionsIf

# Interface: MasterDetailOptionsIf\<T\>

Master/detail: a master row can be expanded; below it a detail row over the full width of the table (fixed columns
included) shows any content – a nested GuiExpert table, a form, a chart, a framework component. Works with virtual
scrolling and millions of rows: the content is created when the detail row becomes visible and lives until it is
collapsed (scrolling only hides and shows it). Only for flat body models (not for trees, row groups and pivot tables).

Fields you leave out keep their default ([MasterDetailOptions](../classes/MasterDetailOptions.md)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  masterDetail: {
    detailHeight: 180,
    detailRenderer: (_container, order: Order, ctx) => {
      ctx.createTable({
        tableModel: TableFactory.createTableModel({ rows: order.items, properties: ["sku", "name", "qty", "price"] })
      });
    }
  }
};
```

**`See`**

Training: [Master/detail](https://gui.expert/training/master-detail/)

**`Since`**

1.1.97

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Implemented by

- [`MasterDetailOptions`](../classes/MasterDetailOptions.md)

## Table of contents

### Properties

- [detailHeight](MasterDetailOptionsIf.md#detailheight)
- [detailRenderer](MasterDetailOptionsIf.md#detailrenderer)
- [estimatedDetailHeight](MasterDetailOptionsIf.md#estimateddetailheight)
- [getRowId](MasterDetailOptionsIf.md#getrowid)
- [isMaster](MasterDetailOptionsIf.md#ismaster)
- [maxRenderedDetails](MasterDetailOptionsIf.md#maxrendereddetails)
- [toggleColumn](MasterDetailOptionsIf.md#togglecolumn)

## Properties

### detailHeight

• **detailHeight**: [`DetailHeightType`](../modules.md#detailheighttype) \| (`row`: `T`, `rowIndex`: `number`) => [`DetailHeightType`](../modules.md#detailheighttype)

Height of the detail rows: px, `"auto"` (measured) or a function per row. Default `"auto"`.

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L43)

___

### detailRenderer

• **detailRenderer**: [`DetailRendererIf`](DetailRendererIf.md)\<`T`\> \| [`DetailRenderFnType`](../modules.md#detailrenderfntype)\<`T`\>

Renders the content of a detail row (function or object with `render()`).

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L39)

___

### estimatedDetailHeight

• **estimatedDetailHeight**: `number`

Height of an `"auto"` detail row before its content was measured (px). Default 200.

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L45)

___

### getRowId

• `Optional` **getRowId**: (`row`: `T`) => `string` \| `number`

#### Type declaration

▸ (`row`): `string` \| `number`

The id of a master row – keeps detail rows open when the rows are replaced by new objects with the same ids
(`setRows`). Default: `autoRestoreOptions.getRowId`, otherwise the row object itself.

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`string` \| `number`

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L60)

___

### isMaster

• `Optional` **isMaster**: (`row`: `T`, `rowIndex`: `number`) => `boolean`

#### Type declaration

▸ (`row`, `rowIndex`): `boolean`

Which rows can be expanded. Default: every row.

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |
| `rowIndex` | `number` |

##### Returns

`boolean`

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L41)

___

### maxRenderedDetails

• **maxRenderedDetails**: `number`

At most this many detail contents exist at the same time. Beyond it the detail row that was out of view the
longest is destroyed and created again when it scrolls back into view (`context.recreated`). Default 50.

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L55)

___

### toggleColumn

• `Optional` **toggleColumn**: `string` \| `number`

The column with the expand/collapse icon: column index or property. Default: the first data column (behind a row
number and a row checkbox column – where a tree has its arrow).

#### Defined in

[src/lib/table/master-detail/master-detail-options.if.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.if.ts#L50)
