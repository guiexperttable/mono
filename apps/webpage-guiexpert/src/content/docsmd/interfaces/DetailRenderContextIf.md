[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DetailRenderContextIf

# Interface: DetailRenderContextIf\<T\>

The context a [DetailRendererIf](DetailRendererIf.md) gets: the master row, the outer table and helpers whose resources are released
together with the detail row.

**`Example`**

```ts
const renderDetail: DetailRenderFnType<Order> = (container, order, ctx) => {
  const button = document.createElement("button");
  button.textContent = `Open order ${order.id}`;
  button.addEventListener("click", () => ctx.tableApi.announce(`Order ${order.id}`), { signal: ctx.signal });
  container.appendChild(button);
};
```

**`Since`**

1.1.97

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [recreated](DetailRenderContextIf.md#recreated)
- [row](DetailRenderContextIf.md#row)
- [rowIndex](DetailRenderContextIf.md#rowindex)
- [signal](DetailRenderContextIf.md#signal)
- [tableApi](DetailRenderContextIf.md#tableapi)

### Methods

- [createTable](DetailRenderContextIf.md#createtable)

## Properties

### recreated

• `Readonly` **recreated**: `boolean`

`true` if the content of this detail row existed before and was destroyed (too many rendered details, see
[MasterDetailOptionsIf.maxRenderedDetails](MasterDetailOptionsIf.md#maxrendereddetails), or [TableApi.refreshDetail](../classes/TableApi.md#refreshdetail)) – state that lives only in the
DOM (inputs, scroll positions) is gone then.

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L53)

___

### row

• `Readonly` **row**: `T`

The master row (the row object of the body model).

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L43)

___

### rowIndex

• `Readonly` **rowIndex**: `number`

The display index of the master row when the detail was created (it changes with sorting and filtering).

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L45)

___

### signal

• `Readonly` **signal**: `AbortSignal`

Aborted when the detail row is destroyed – pass it to `addEventListener(…, { signal })`.

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L55)

___

### tableApi

• `Readonly` **tableApi**: [`TableApi`](../classes/TableApi.md)

The API of the outer (master) table.

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L47)

## Methods

### createTable

▸ **createTable**(`params`): [`TableApi`](../classes/TableApi.md)

Creates a GuiExpert table inside the detail row; it is destroyed (`TableScope.destroy()`) together with the detail
row. The CSS variables of the page (light/dark theme) apply to it as well.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`DetailTableParamsIf`](DetailTableParamsIf.md) | model, options, listener, height |

#### Returns

[`TableApi`](../classes/TableApi.md)

the API of the nested table

#### Defined in

[src/lib/table/master-detail/detail-renderer.if.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/detail-renderer.if.ts#L64)
