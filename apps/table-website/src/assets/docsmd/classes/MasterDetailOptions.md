[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MasterDetailOptions

# Class: MasterDetailOptions\<T\>

The defaults of [MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).

**`Example`**

```ts
const options = MasterDetailOptions.create({ detailRenderer: (el, row) => { el.textContent = String(row.id); } });
options.detailHeight;          // "auto"
options.maxRenderedDetails;    // 50
```

**`Since`**

1.1.97

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Implements

- [`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](MasterDetailOptions.md#constructor)

### Properties

- [detailHeight](MasterDetailOptions.md#detailheight)
- [detailRenderer](MasterDetailOptions.md#detailrenderer)
- [estimatedDetailHeight](MasterDetailOptions.md#estimateddetailheight)
- [getRowId](MasterDetailOptions.md#getrowid)
- [isMaster](MasterDetailOptions.md#ismaster)
- [maxRenderedDetails](MasterDetailOptions.md#maxrendereddetails)
- [toggleColumn](MasterDetailOptions.md#togglecolumn)

### Methods

- [create](MasterDetailOptions.md#create)

## Constructors

### constructor

• **new MasterDetailOptions**\<`T`\>(): [`MasterDetailOptions`](MasterDetailOptions.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Returns

[`MasterDetailOptions`](MasterDetailOptions.md)\<`T`\>

## Properties

### detailHeight

• **detailHeight**: [`DetailHeightType`](../modules.md#detailheighttype) \| (`row`: `T`, `rowIndex`: `number`) => [`DetailHeightType`](../modules.md#detailheighttype) = `"auto"`

Height of the detail rows: px, `"auto"` (measured) or a function per row. Default `"auto"`.

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[detailHeight](../interfaces/MasterDetailOptionsIf.md#detailheight)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L18)

___

### detailRenderer

• **detailRenderer**: [`DetailRendererIf`](../interfaces/DetailRendererIf.md)\<`T`\> \| [`DetailRenderFnType`](../modules.md#detailrenderfntype)\<`T`\>

Renders the content of a detail row (function or object with `render()`).

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[detailRenderer](../interfaces/MasterDetailOptionsIf.md#detailrenderer)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L16)

___

### estimatedDetailHeight

• **estimatedDetailHeight**: `number` = `200`

Height of an `"auto"` detail row before its content was measured (px). Default 200.

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[estimatedDetailHeight](../interfaces/MasterDetailOptionsIf.md#estimateddetailheight)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L19)

___

### getRowId

• `Optional` **getRowId**: (`row`: `T`) => `string` \| `number` = `undefined`

#### Type declaration

▸ (`row`): `string` \| `number`

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`string` \| `number`

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[getRowId](../interfaces/MasterDetailOptionsIf.md#getrowid)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L22)

___

### isMaster

• `Optional` **isMaster**: (`row`: `T`, `rowIndex`: `number`) => `boolean` = `undefined`

#### Type declaration

▸ (`row`, `rowIndex`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |
| `rowIndex` | `number` |

##### Returns

`boolean`

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[isMaster](../interfaces/MasterDetailOptionsIf.md#ismaster)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L17)

___

### maxRenderedDetails

• **maxRenderedDetails**: `number` = `50`

At most this many detail contents exist at the same time. Beyond it the detail row that was out of view the
longest is destroyed and created again when it scrolls back into view (`context.recreated`). Default 50.

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[maxRenderedDetails](../interfaces/MasterDetailOptionsIf.md#maxrendereddetails)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L21)

___

### toggleColumn

• `Optional` **toggleColumn**: `string` \| `number` = `undefined`

The column with the expand/collapse icon: column index or property. Default: the first data column (behind a row
number and a row checkbox column – where a tree has its arrow).

#### Implementation of

[MasterDetailOptionsIf](../interfaces/MasterDetailOptionsIf.md).[toggleColumn](../interfaces/MasterDetailOptionsIf.md#togglecolumn)

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L20)

## Methods

### create

▸ **create**\<`T`\>(`options?`): [`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`T`\>

The defaults, overridden by the given values (`undefined` keeps the default).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Partial`\<[`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`T`\>\> | e.g. `tableOptions.masterDetail` |

#### Returns

[`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`T`\>

complete options

#### Defined in

[src/lib/table/master-detail/master-detail-options.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-options.ts#L30)
