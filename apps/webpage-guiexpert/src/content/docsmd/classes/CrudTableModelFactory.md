[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudTableModelFactory

# Class: CrudTableModelFactory

Builds a table for a REST resource: loads the list (`crudOptions.fetchList`), derives the columns from the first item
(nested objects flattened, e.g. `address.city`) and adds an "Actions" column (View / Edit / Clone / Delete) whose
links open the CRUD dialogs ([CrudTableModelFactory.onActionEvent](CrudTableModelFactory.md#onactionevent)). The table shows the result of a save or
delete without reloading the list.

**`Example`**

```ts
const factory = new CrudTableModelFactory();
factory.createTableModel(
  {
    ...new CrudOptions(),
    urls: {
      list: new UrlInfo('GET', '/api/customers'),
      read: new UrlInfo('GET', '/api/customers/{id}'),
      update: new UrlInfo('PUT', '/api/customers/{id}'),
      create: new UrlInfo('POST', '/api/customers'),
      delete: new UrlInfo('DELETE', '/api/customers/{id}'),
    },
    getEmptyItem: () => ({ name: '', vip: false }),
  },
  {},
  ({ tableModel, tableOptions }) => {
    const tableScope = new TableScope(hostDiv, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
    tableScope.firstInit();
  }
);
document.querySelector('#create')!.addEventListener('click', () => factory.openDialogForCreate());
```

## Implements

- [`ActionEventListenerIf`](../interfaces/ActionEventListenerIf.md)

## Table of contents

### Constructors

- [constructor](CrudTableModelFactory.md#constructor)

### Properties

- [bodyModel](CrudTableModelFactory.md#bodymodel)
- [crudOptions](CrudTableModelFactory.md#crudoptions)
- [listenActionEvent](CrudTableModelFactory.md#listenactionevent)
- [tableModel](CrudTableModelFactory.md#tablemodel)
- [tableOptions](CrudTableModelFactory.md#tableoptions)

### Methods

- [createTableModel](CrudTableModelFactory.md#createtablemodel)
- [onActionEvent](CrudTableModelFactory.md#onactionevent)
- [openDialogForCreate](CrudTableModelFactory.md#opendialogforcreate)

## Constructors

### constructor

• **new CrudTableModelFactory**(): [`CrudTableModelFactory`](CrudTableModelFactory.md)

#### Returns

[`CrudTableModelFactory`](CrudTableModelFactory.md)

## Properties

### bodyModel

• **bodyModel**: `undefined` \| [`AreaModelObjectArrayWithColumndefs`](AreaModelObjectArrayWithColumndefs.md)\<`any`\>

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L59)

___

### crudOptions

• **crudOptions**: [`CrudOptions`](CrudOptions.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L61)

___

### listenActionEvent

• **listenActionEvent**: (`actionEvent`: [`ActionEventIf`](../interfaces/ActionEventIf.md)) => `void`

#### Type declaration

▸ (`actionEvent`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `actionEvent` | [`ActionEventIf`](../interfaces/ActionEventIf.md) |

##### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L63)

___

### tableModel

• **tableModel**: `undefined` \| [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L58)

___

### tableOptions

• **tableOptions**: `undefined` \| [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L60)

## Methods

### createTableModel

▸ **createTableModel**\<`T`\>(`crudOptions`, `p`, `callback?`, `listenActionEvent?`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `crudOptions` | [`CrudOptions`](CrudOptions.md) |
| `p` | `Partial`\<[`CreateTableModelPara`](../interfaces/CreateTableModelPara.md)\> |
| `callback` | (`tableModelAndOptions`: [`TableModelAndOptionsIf`](../interfaces/TableModelAndOptionsIf.md)) => `void` |
| `listenActionEvent` | (`actionEvent`: [`ActionEventIf`](../interfaces/ActionEventIf.md)) => `void` |

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L67)

___

### onActionEvent

▸ **onActionEvent**(`actionEvent`): `void`

Handles the actions of the action column (and `CREATE`): the listener of [createTableModel](CrudTableModelFactory.md#createtablemodel) is called first,
then
- `VIEW`: `fetchItem` → [CrudObjectView](CrudObjectView.md);
- `EDIT`: `fetchItem` → [CrudObjectEdit](CrudObjectEdit.md) → Save: `updateItem(id, item)`, the row shows the saved values
  (the response, if it is an item with id – otherwise the edited item);
- `CLONE` / `CREATE`: `fetchItem` resp. `getEmptyItem()` → [CrudObjectEdit](CrudObjectEdit.md) → Save: `createItem(item)` – without
  the id property, the server assigns it. If the response is an item with id, it is added as last row, otherwise the
  list is loaded again (`fetchList`);
- `DELETE`: `deleteItem(id)` → the row is removed.

A failed request is logged with `console.error`; the table stays unchanged.

#### Parameters

| Name | Type |
| :------ | :------ |
| `actionEvent` | [`ActionEventIf`](../interfaces/ActionEventIf.md) |

#### Returns

`void`

#### Implementation of

[ActionEventListenerIf](../interfaces/ActionEventListenerIf.md).[onActionEvent](../interfaces/ActionEventListenerIf.md#onactionevent)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L165)

___

### openDialogForCreate

▸ **openDialogForCreate**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L145)
