[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudOptionsIf

# Interface: CrudOptionsIf

## Implemented by

- [`CrudOptions`](../classes/CrudOptions.md)

## Table of contents

### Properties

- [autoAddActionColumn](CrudOptionsIf.md#autoaddactioncolumn)
- [calcFixedRightColumnCount](CrudOptionsIf.md#calcfixedrightcolumncount)
- [deleteItem](CrudOptionsIf.md#deleteitem)
- [fetchItem](CrudOptionsIf.md#fetchitem)
- [fetchList](CrudOptionsIf.md#fetchlist)
- [getEmptyItem](CrudOptionsIf.md#getemptyitem)
- [getHeadersInit](CrudOptionsIf.md#getheadersinit)
- [getIdByObject](CrudOptionsIf.md#getidbyobject)
- [getIdKey](CrudOptionsIf.md#getidkey)
- [isActionDeleteEnabled](CrudOptionsIf.md#isactiondeleteenabled)
- [isActionDeleteVisible](CrudOptionsIf.md#isactiondeletevisible)
- [singleRowActions](CrudOptionsIf.md#singlerowactions)
- [tableActions](CrudOptionsIf.md#tableactions)
- [updateItem](CrudOptionsIf.md#updateitem)
- [urls](CrudOptionsIf.md#urls)

## Properties

### autoAddActionColumn

• `Optional` **autoAddActionColumn**: `boolean`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L24)

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

#### Defined in

[src/lib/table/crud/crud-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L22)

___

### deleteItem

• **deleteItem**: (`crudOptions`: [`CrudOptionsIf`](CrudOptionsIf.md), `id`: `any`) => `Promise`\<`any`\>

#### Type declaration

▸ (`crudOptions`, `id`): `Promise`\<`any`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](CrudOptionsIf.md) |
| `id` | `any` |

##### Returns

`Promise`\<`any`\>

#### Defined in

[src/lib/table/crud/crud-options.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L17)

___

### fetchItem

• **fetchItem**: \<T\>(`crudOptions`: [`CrudOptionsIf`](CrudOptionsIf.md), `id`: `any`) => `Promise`\<`T`\>

#### Type declaration

▸ \<`T`\>(`crudOptions`, `id`): `Promise`\<`T`\>

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](CrudOptionsIf.md) |
| `id` | `any` |

##### Returns

`Promise`\<`T`\>

#### Defined in

[src/lib/table/crud/crud-options.if.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L15)

___

### fetchList

• **fetchList**: \<T\>(`crudOptions`: [`CrudOptionsIf`](CrudOptionsIf.md)) => `Promise`\<`T`[]\>

#### Type declaration

▸ \<`T`\>(`crudOptions`): `Promise`\<`T`[]\>

##### Type parameters

| Name |
| :------ |
| `T` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](CrudOptionsIf.md) |

##### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/lib/table/crud/crud-options.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L14)

___

### getEmptyItem

• **getEmptyItem**: () => `any`

#### Type declaration

▸ (): `any`

##### Returns

`any`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L21)

___

### getHeadersInit

• `Optional` **getHeadersInit**: () => `HeadersInit`

#### Type declaration

▸ (): `HeadersInit`

##### Returns

`HeadersInit`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L8)

___

### getIdByObject

• **getIdByObject**: \<T\>(`o`: `T`) => `any`

#### Type declaration

▸ \<`T`\>(`o`): `any`

##### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `unknown`\> |

##### Parameters

| Name | Type |
| :------ | :------ |
| `o` | `T` |

##### Returns

`any`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L20)

___

### getIdKey

• **getIdKey**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L19)

___

### isActionDeleteEnabled

• `Optional` **isActionDeleteEnabled**: `boolean`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L26)

___

### isActionDeleteVisible

• `Optional` **isActionDeleteVisible**: `boolean`

#### Defined in

[src/lib/table/crud/crud-options.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L25)

___

### singleRowActions

• **singleRowActions**: [`CrudAction`](../classes/CrudAction.md)[]

#### Defined in

[src/lib/table/crud/crud-options.if.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L11)

___

### tableActions

• **tableActions**: [`CrudAction`](../classes/CrudAction.md)[]

#### Defined in

[src/lib/table/crud/crud-options.if.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L12)

___

### updateItem

• **updateItem**: (`crudOptions`: [`CrudOptionsIf`](CrudOptionsIf.md), `id`: `any`, `item`: `any`) => `Promise`\<`any`\>

#### Type declaration

▸ (`crudOptions`, `id`, `item`): `Promise`\<`any`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptionsIf`](CrudOptionsIf.md) |
| `id` | `any` |
| `item` | `any` |

##### Returns

`Promise`\<`any`\>

#### Defined in

[src/lib/table/crud/crud-options.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L16)

___

### urls

• **urls**: [`UrlsIf`](UrlsIf.md)

#### Defined in

[src/lib/table/crud/crud-options.if.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.if.ts#L10)
