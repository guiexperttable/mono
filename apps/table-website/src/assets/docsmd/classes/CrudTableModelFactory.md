[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudTableModelFactory

# Class: CrudTableModelFactory

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

[src/lib/table/crud/crud-table-model-factory.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L30)

___

### crudOptions

• **crudOptions**: [`CrudOptions`](CrudOptions.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L32)

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

[src/lib/table/crud/crud-table-model-factory.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L34)

___

### tableModel

• **tableModel**: `undefined` \| [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L29)

___

### tableOptions

• **tableOptions**: `undefined` \| [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L31)

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

[src/lib/table/crud/crud-table-model-factory.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L38)

___

### onActionEvent

▸ **onActionEvent**(`actionEvent`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `actionEvent` | [`ActionEventIf`](../interfaces/ActionEventIf.md) |

#### Returns

`void`

#### Implementation of

[ActionEventListenerIf](../interfaces/ActionEventListenerIf.md).[onActionEvent](../interfaces/ActionEventListenerIf.md#onactionevent)

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L122)

___

### openDialogForCreate

▸ **openDialogForCreate**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-table-model-factory.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-table-model-factory.ts#L115)
