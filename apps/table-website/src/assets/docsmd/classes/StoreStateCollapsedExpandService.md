[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StoreStateCollapsedExpandService

# Class: StoreStateCollapsedExpandService

## Hierarchy

- `AbstractStoreStateService`

  ↳ **`StoreStateCollapsedExpandService`**

## Table of contents

### Constructors

- [constructor](StoreStateCollapsedExpandService.md#constructor)

### Properties

- [getStorageKeyFn](StoreStateCollapsedExpandService.md#getstoragekeyfn)

### Methods

- [autoConvertMapToObject](StoreStateCollapsedExpandService.md#autoconvertmaptoobject)
- [checkAndPersistItem](StoreStateCollapsedExpandService.md#checkandpersistitem)
- [collapsedExpandedStateGet](StoreStateCollapsedExpandService.md#collapsedexpandedstateget)
- [collapsedExpandedStateIncludes](StoreStateCollapsedExpandService.md#collapsedexpandedstateincludes)
- [collapsedStateAll](StoreStateCollapsedExpandService.md#collapsedstateall)
- [collapsedStateIdsPush](StoreStateCollapsedExpandService.md#collapsedstateidspush)
- [collapsedStateIdsRemove](StoreStateCollapsedExpandService.md#collapsedstateidsremove)
- [hasStoredState](StoreStateCollapsedExpandService.md#hasstoredstate)
- [initModeIfEmpty](StoreStateCollapsedExpandService.md#initmodeifempty)
- [load](StoreStateCollapsedExpandService.md#load)
- [loadFromLocalStorage](StoreStateCollapsedExpandService.md#loadfromlocalstorage)
- [persistItem](StoreStateCollapsedExpandService.md#persistitem)

## Constructors

### constructor

• **new StoreStateCollapsedExpandService**(`fn`): [`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | `undefined` \| [`GetStorageKeyFn`](../modules.md#getstoragekeyfn) |

#### Returns

[`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

#### Overrides

AbstractStoreStateService.constructor

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L13)

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

### collapsedExpandedStateGet

▸ **collapsedExpandedStateGet**(): [`CollapsedExpandedData`](CollapsedExpandedData.md)

#### Returns

[`CollapsedExpandedData`](CollapsedExpandedData.md)

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L37)

___

### collapsedExpandedStateIncludes

▸ **collapsedExpandedStateIncludes**(`rowId`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowId` | `string` \| `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L41)

___

### collapsedStateAll

▸ **collapsedStateAll**(`expand`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `expand` | `boolean` |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L66)

___

### collapsedStateIdsPush

▸ **collapsedStateIdsPush**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L46)

___

### collapsedStateIdsRemove

▸ **collapsedStateIdsRemove**(`id`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L55)

___

### hasStoredState

▸ **hasStoredState**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L23)

___

### initModeIfEmpty

▸ **initModeIfEmpty**(`mode`): `void`

The first toggle defines what the stored ids mean: a table that starts collapsed stores the expanded rows,
a table that starts expanded stores the collapsed ones.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mode` | ``"expanded"`` \| ``"collapsed"`` |

#### Returns

`void`

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L31)

___

### load

▸ **load**(): `void`

#### Returns

`void`

#### Overrides

AbstractStoreStateService.load

#### Defined in

[src/lib/table/service/store-state-collapsed-expand.service.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/store-state-collapsed-expand.service.ts#L75)

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
