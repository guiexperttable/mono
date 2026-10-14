[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudObjectView

# Class: CrudObjectView\<T\>

Read-only dialog (`<dialog>`) that lists all properties of an object (nested objects flattened). Labels and values
are escaped – data is shown as text, never as markup.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> |

## Table of contents

### Constructors

- [constructor](CrudObjectView.md#constructor)

### Methods

- [getCombinedKey](CrudObjectView.md#getcombinedkey)
- [getLabel](CrudObjectView.md#getlabel)
- [openDialog](CrudObjectView.md#opendialog)

## Constructors

### constructor

• **new CrudObjectView**\<`T`\>(`obj`): [`CrudObjectView`](CrudObjectView.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obj` | `T` |

#### Returns

[`CrudObjectView`](CrudObjectView.md)\<`T`\>

#### Defined in

[src/lib/table/crud/crud-object-view.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L13)

## Methods

### getCombinedKey

▸ **getCombinedKey**(`parentKey`, `property`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `parentKey` | `string` |
| `property` | `string` |

#### Returns

`string`

#### Defined in

[src/lib/table/crud/crud-object-view.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L38)

___

### getLabel

▸ **getLabel**(`combinedKey`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `combinedKey` | `string` |

#### Returns

`string`

#### Defined in

[src/lib/table/crud/crud-object-view.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L42)

___

### openDialog

▸ **openDialog**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-object-view.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L17)
