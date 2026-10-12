[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudObjectView

# Class: CrudObjectView\<T\>

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

[src/lib/table/crud/crud-object-view.ts:6](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L6)

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

[src/lib/table/crud/crud-object-view.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L32)

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

[src/lib/table/crud/crud-object-view.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L36)

___

### openDialog

▸ **openDialog**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-object-view.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-view.ts#L10)
