[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StateStorageIf

# Interface: StateStorageIf

Where [AutoRestoreOptionsIf](AutoRestoreOptionsIf.md) stores the state of a table ([AutoRestoreOptionsIf.storage](AutoRestoreOptionsIf.md#storage)). A synchronous
key-value store with the method names of the Web Storage API – `localStorage` (default) and `sessionStorage`
fit directly.

The table reads the state while it is built, so the storage must answer synchronously. To keep the state on a
server, load it before you create the table and pass it as [TableOptionsIf.initialState](TableOptionsIf.md#initialstate); save it in
[EventListenerIf.onStateChanged](EventListenerIf.md#onstatechanged).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",
    storage: sessionStorage,            // forget the layout when the tab is closed
    autoRestoreColumnLayout: true
  }
};
```

**`Example`**

```ts
// an own storage, e.g. a prefix for all keys
const prefixed: StateStorageIf = {
  getItem: key => localStorage.getItem("my-app/" + key),
  setItem: (key, value) => localStorage.setItem("my-app/" + key, value),
  removeItem: key => localStorage.removeItem("my-app/" + key)
};
```

**`Since`**

1.1.92

## Table of contents

### Methods

- [getItem](StateStorageIf.md#getitem)
- [removeItem](StateStorageIf.md#removeitem)
- [setItem](StateStorageIf.md#setitem)

## Methods

### getItem

▸ **getItem**(`key`): ``null`` \| `string`

The stored string or `null`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

``null`` \| `string`

#### Defined in

[src/lib/table/state/state-storage.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/state-storage.if.ts#L34)

___

### removeItem

▸ **removeItem**(`key`): `void`

Removes a key.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/state/state-storage.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/state-storage.if.ts#L38)

___

### setItem

▸ **setItem**(`key`, `value`): `void`

Stores a string. May throw (quota) – the table catches it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/state/state-storage.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/state-storage.if.ts#L36)
