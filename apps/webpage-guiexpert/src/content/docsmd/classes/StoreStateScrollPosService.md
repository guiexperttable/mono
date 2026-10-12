[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StoreStateScrollPosService

# Class: StoreStateScrollPosService

## Hierarchy

- `AbstractStoreStateService`

  ↳ **`StoreStateScrollPosService`**

## Table of contents

### Constructors

- [constructor](StoreStateScrollPosService.md#constructor)

### Properties

- [getStorageKeyFn](StoreStateScrollPosService.md#getstoragekeyfn)

### Methods

- [autoConvertMapToObject](StoreStateScrollPosService.md#autoconvertmaptoobject)
- [checkAndPersistItem](StoreStateScrollPosService.md#checkandpersistitem)
- [getScrollOffset](StoreStateScrollPosService.md#getscrolloffset)
- [load](StoreStateScrollPosService.md#load)
- [loadFromLocalStorage](StoreStateScrollPosService.md#loadfromlocalstorage)
- [persistItem](StoreStateScrollPosService.md#persistitem)
- [updateScrollOffset](StoreStateScrollPosService.md#updatescrolloffset)

## Constructors

### constructor

• **new StoreStateScrollPosService**(`fn`): [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | `undefined` \| [`GetStorageKeyFn`](../modules.md#getstoragekeyfn) |

#### Returns

[`StoreStateScrollPosService`](StoreStateScrollPosService.md)

#### Overrides

AbstractStoreStateService.constructor

#### Defined in

[src/lib/table/service/store-state-scroll-pos.service.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-scroll-pos.service.ts#L12)

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

### getScrollOffset

▸ **getScrollOffset**(): [`number`, `number`]

#### Returns

[`number`, `number`]

#### Defined in

[src/lib/table/service/store-state-scroll-pos.service.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-scroll-pos.service.ts#L17)

___

### load

▸ **load**(): `void`

#### Returns

`void`

#### Overrides

AbstractStoreStateService.load

#### Defined in

[src/lib/table/service/store-state-scroll-pos.service.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-scroll-pos.service.ts#L27)

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

### updateScrollOffset

▸ **updateScrollOffset**(`xy`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `xy` | [`number`, `number`] |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-scroll-pos.service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-scroll-pos.service.ts#L21)
