[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudOptions

# Class: CrudOptions

Settings and REST calls of a CRUD table ([CrudTableModelFactory](CrudTableModelFactory.md)).

The default REST calls use `fetch`:
- `{id}` in a URL is replaced by the URL-encoded id (`/api/items/{id}` → `/api/items/a%2Fb`);
- requests with a body (`updateItem`, `createItem`) send JSON with `Content-Type: application/json`
  (unless `getHeadersInit()` already sets a `Content-Type`);
- the promise is rejected for an HTTP error status (4xx/5xx) and when no URL is configured;
  an empty response body (e.g. `204 No Content`) resolves with `undefined`.

Every call can be replaced, e.g. to use your own HTTP client.

**`Example`**

```ts
const crudOptions: CrudOptions = {
  ...new CrudOptions(),
  urls: {
    list: new UrlInfo('GET', '/api/customers'),
    read: new UrlInfo('GET', '/api/customers/{id}'),
    update: new UrlInfo('PUT', '/api/customers/{id}'),
    create: new UrlInfo('POST', '/api/customers'),
    delete: new UrlInfo('DELETE', '/api/customers/{id}'),
  },
  getHeadersInit: () => ({ Authorization: 'Bearer my-token' }),
  getIdKey: () => 'customerId',
  getEmptyItem: () => ({ name: '', vip: false, credit: 0 }),
};
```

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

[src/lib/table/crud/crud-options.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L57)

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

[src/lib/table/crud/crud-options.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L60)

___

### columnWidths

• **columnWidths**: [`ColumnWidthsIf`](../interfaces/ColumnWidthsIf.md)

#### Defined in

[src/lib/table/crud/crud-options.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L58)

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

[src/lib/table/crud/crud-options.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L90)

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

[src/lib/table/crud/crud-options.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L62)

___

### getIdKey

• **getIdKey**: () => `string`

#### Type declaration

▸ (): `string`

The property that holds the id of an item (default `'id'`).

##### Returns

`string`

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[getIdKey](../interfaces/CrudOptionsIf.md#getidkey)

#### Defined in

[src/lib/table/crud/crud-options.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L67)

___

### singleRowActions

• **singleRowActions**: [`CrudAction`](CrudAction.md)[]

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[singleRowActions](../interfaces/CrudOptionsIf.md#singlerowactions)

#### Defined in

[src/lib/table/crud/crud-options.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L46)

___

### tableActions

• **tableActions**: [`CrudAction`](CrudAction.md)[]

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[tableActions](../interfaces/CrudOptionsIf.md#tableactions)

#### Defined in

[src/lib/table/crud/crud-options.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L53)

___

### urls

• **urls**: [`UrlsIf`](../interfaces/UrlsIf.md)

#### Implementation of

[CrudOptionsIf](../interfaces/CrudOptionsIf.md).[urls](../interfaces/CrudOptionsIf.md#urls)

#### Defined in

[src/lib/table/crud/crud-options.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L40)

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

[src/lib/table/crud/crud-options.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L84)

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

[src/lib/table/crud/crud-options.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L87)

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

[src/lib/table/crud/crud-options.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L78)

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

[src/lib/table/crud/crud-options.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L75)

___

### getIdByObject

▸ **getIdByObject**\<`T`\>(`o`): `any`

The id of an item: the value of its `getIdKey()` property (`undefined` if it has none).

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

[src/lib/table/crud/crud-options.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L70)

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

[src/lib/table/crud/crud-options.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-options.ts#L81)
