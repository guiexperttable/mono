[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudOptions

# Class: CrudOptions

## Implements

- [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md)

## Table of contents

### Constructors

- [constructor](CrudOptions.md#constructor)

### Properties

- [autoAddActionColumn](CrudOptions.md#autoaddactioncolumn)
- [calcFixedRightColumnCount](CrudOptions.md#calcfixedrightcolumncount)
- [columnWidths](CrudOptions.md#columnwidths)
- [getEmptyItem](CrudOptions.md#getemptyitem)
- [getHeadersInit](CrudOptions.md#getheadersinit)
- [getIdKey](CrudOptions.md#getidkey)
- [singleRowActions](CrudOptions.md#singlerowactions)
- [tableActions](CrudOptions.md#tableactions)
- [urls](CrudOptions.md#urls)

### Methods

- [createItem](CrudOptions.md#createitem)
- [deleteItem](CrudOptions.md#deleteitem)
- [fetchItem](CrudOptions.md#fetchitem)
- [fetchList](CrudOptions.md#fetchlist)
- [getIdByObject](CrudOptions.md#getidbyobject)
- [updateItem](CrudOptions.md#updateitem)

## Constructors

### constructor

• **new CrudOptions**(): [`CrudOptions`](CrudOptions.md)

#### Returns

[`CrudOptions`](CrudOptions.md)

## Properties

### autoAddActionColumn

• **autoAddActionColumn**: `boolean` = `true`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[autoAddActionColumn](../interfaces/CrudOptionsIf.md#autoaddactioncolumn)

#### Defined in

[src/lib/table/crud/crud-options.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L28)

___

### calcFixedRightColumnCount

• **calcFixedRightColumnCount**: (`columnCount`: `number`) => `number`

#### Type declaration

▸ (`columnCount`): `number`

##### Parameters

| Name | Type |
| :------ | :------ |
| `columnCount` | `number` |

##### Returns

`number`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[calcFixedRightColumnCount](../interfaces/CrudOptionsIf.md#calcfixedrightcolumncount)

#### Defined in

[src/lib/table/crud/crud-options.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L31)

___

### columnWidths

• **columnWidths**: [`ColumnWidthsIf`](../interfaces/ColumnWidthsIf.md)

#### Defined in

[src/lib/table/crud/crud-options.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L29)

___

### getEmptyItem

• **getEmptyItem**: () => `any`

#### Type declaration

▸ (): `any`

##### Returns

`any`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[getEmptyItem](../interfaces/CrudOptionsIf.md#getemptyitem)

#### Defined in

[src/lib/table/crud/crud-options.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L112)

___

### getHeadersInit

• **getHeadersInit**: () => `HeadersInit`

#### Type declaration

▸ (): `HeadersInit`

##### Returns

`HeadersInit`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[getHeadersInit](../interfaces/CrudOptionsIf.md#getheadersinit)

#### Defined in

[src/lib/table/crud/crud-options.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L33)

___

### getIdKey

• **getIdKey**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[getIdKey](../interfaces/CrudOptionsIf.md#getidkey)

#### Defined in

[src/lib/table/crud/crud-options.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L37)

___

### singleRowActions

• **singleRowActions**: [`CrudAction`](CrudAction.md)[]

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[singleRowActions](../interfaces/CrudOptionsIf.md#singlerowactions)

#### Defined in

[src/lib/table/crud/crud-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L17)

___

### tableActions

• **tableActions**: [`CrudAction`](CrudAction.md)[]

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[tableActions](../interfaces/CrudOptionsIf.md#tableactions)

#### Defined in

[src/lib/table/crud/crud-options.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L24)

___

### urls

• **urls**: [`UrlsIf`](../interfaces/UrlsIf.md)

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[urls](../interfaces/CrudOptionsIf.md#urls)

#### Defined in

[src/lib/table/crud/crud-options.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L11)

## Methods

### createItem

▸ **createItem**(`crudOptions`, `item`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md) |
| `item` | `any` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/lib/table/crud/crud-options.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L85)

___

### deleteItem

▸ **deleteItem**(`crudOptions`, `id`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md) |
| `id` | `any` |

#### Returns

`Promise`\<`any`\>

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[deleteItem](../interfaces/CrudOptionsIf.md#deleteitem)

#### Defined in

[src/lib/table/crud/crud-options.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L99)

___

### fetchItem

▸ **fetchItem**\<`T`\>(`crudOptions`, `id`): `Promise`\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md) |
| `id` | `any` |

#### Returns

`Promise`\<`T`\>

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[fetchItem](../interfaces/CrudOptionsIf.md#fetchitem)

#### Defined in

[src/lib/table/crud/crud-options.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L58)

___

### fetchList

▸ **fetchList**\<`T`\>(`crudOptions`): `Promise`\<`T`[]\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md) |

#### Returns

`Promise`\<`T`[]\>

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[fetchList](../interfaces/CrudOptionsIf.md#fetchlist)

#### Defined in

[src/lib/table/crud/crud-options.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L47)

___

### getIdByObject

▸ **getIdByObject**\<`T`\>(`o`): `any`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `unknown`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `o` | `T` |

#### Returns

`any`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[getIdByObject](../interfaces/CrudOptionsIf.md#getidbyobject)

#### Defined in

[src/lib/table/crud/crud-options.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L39)

___

### updateItem

▸ **updateItem**(`crudOptions`, `id`, `item`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](../interfaces/CrudOptionsIf.md) |
| `id` | `any` |
| `item` | `any` |

#### Returns

`Promise`\<`any`\>

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[updateItem](../interfaces/CrudOptionsIf.md#updateitem)

#### Defined in

[src/lib/table/crud/crud-options.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L71)
