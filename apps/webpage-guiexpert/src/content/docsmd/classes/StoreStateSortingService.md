[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StoreStateSortingService

# Class: StoreStateSortingService

## Hierarchy

- `AbstractStoreStateService`

  ↳ **`StoreStateSortingService`**

## Table of contents

### Constructors

- [constructor](StoreStateSortingService.md#constructor)

### Properties

- [getStorageKeyFn](StoreStateSortingService.md#getstoragekeyfn)

### Methods

- [autoConvertMapToObject](StoreStateSortingService.md#autoconvertmaptoobject)
- [checkAndPersistItem](StoreStateSortingService.md#checkandpersistitem)
- [getSortItems](StoreStateSortingService.md#getsortitems)
- [load](StoreStateSortingService.md#load)
- [loadFromLocalStorage](StoreStateSortingService.md#loadfromlocalstorage)
- [persistItem](StoreStateSortingService.md#persistitem)
- [setSortItems](StoreStateSortingService.md#setsortitems)

## Constructors

### constructor

• **new StoreStateSortingService**(`fn`): [`StoreStateSortingService`](StoreStateSortingService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | `undefined` \| [`GetStorageKeyFn`](../modules.md#getstoragekeyfn) |

#### Returns

[`StoreStateSortingService`](StoreStateSortingService.md)

#### Overrides

AbstractStoreStateService.constructor

#### Defined in

[src/lib/table/service/store-state-sorting.service.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-sorting.service.ts#L13)

## Properties

### getStorageKeyFn

• `Protected` `Optional` **getStorageKeyFn**: [`GetStorageKeyFn`](../modules.md#getstoragekeyfn)

#### Inherited from

AbstractStoreStateService.getStorageKeyFn

#### Defined in

[src/lib/table/service/abstract-store-state.service.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/abstract-store-state.service.ts#L7)

## Methods

### autoConvertMapToObject

▸ **autoConvertMapToObject**(`item`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

`Object`

#### Inherited from

AbstractStoreStateService.autoConvertMapToObject

#### Defined in

[src/lib/table/service/abstract-store-state.service.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/abstract-store-state.service.ts#L14)

___

### checkAndPersistItem

▸ **checkAndPersistItem**(`keySuffix`, `item`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keySuffix` | `string` |
| `item` | `any` |

#### Returns

`void`

#### Inherited from

AbstractStoreStateService.checkAndPersistItem

#### Defined in

[src/lib/table/service/abstract-store-state.service.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/abstract-store-state.service.ts#L30)

___

### getSortItems

▸ **getSortItems**(): [`SortItem`](SortItem.md)[]

#### Returns

[`SortItem`](SortItem.md)[]

#### Defined in

[src/lib/table/service/store-state-sorting.service.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-sorting.service.ts#L18)

___

### load

▸ **load**(): `void`

#### Returns

`void`

#### Overrides

AbstractStoreStateService.load

#### Defined in

[src/lib/table/service/store-state-sorting.service.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-sorting.service.ts#L28)

___

### loadFromLocalStorage

▸ **loadFromLocalStorage**\<`U`\>(`subKey`): ``null`` \| `U`

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `subKey` | `string` |

#### Returns

``null`` \| `U`

#### Inherited from

AbstractStoreStateService.loadFromLocalStorage

#### Defined in

[src/lib/table/service/abstract-store-state.service.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/abstract-store-state.service.ts#L59)

___

### persistItem

▸ **persistItem**(`subKey`, `item`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `subKey` | `string` |
| `item` | `string` \| `object` |

#### Returns

`void`

#### Inherited from

AbstractStoreStateService.persistItem

#### Defined in

[src/lib/table/service/abstract-store-state.service.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/abstract-store-state.service.ts#L47)

___

### setSortItems

▸ **setSortItems**(`sortItems`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-sorting.service.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-sorting.service.ts#L22)
