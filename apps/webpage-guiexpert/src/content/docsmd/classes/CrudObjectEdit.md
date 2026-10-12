[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudObjectEdit

# Class: CrudObjectEdit\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> |

## Table of contents

### Constructors

- [constructor](CrudObjectEdit.md#constructor)

### Properties

- [dialogTitle](CrudObjectEdit.md#dialogtitle)

### Methods

- [openDialog](CrudObjectEdit.md#opendialog)

## Constructors

### constructor

• **new CrudObjectEdit**\<`T`\>(`idKey`, `obj`, `dialogTitle?`): [`CrudObjectEdit`](CrudObjectEdit.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `idKey` | keyof `T` | `undefined` |
| `obj` | `T` | `undefined` |
| `dialogTitle` | `string` | `'Edit Item'` |

#### Returns

[`CrudObjectEdit`](CrudObjectEdit.md)\<`T`\>

#### Defined in

[src/lib/table/crud/crud-object-edit.ts:6](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L6)

## Properties

### dialogTitle

• **dialogTitle**: `string` = `'Edit Item'`

#### Defined in

[src/lib/table/crud/crud-object-edit.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L9)

## Methods

### openDialog

▸ **openDialog**(`onSave`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `onSave` | (`updatedObject`: `T`) => `void` |

#### Returns

`void`

#### Defined in

[src/lib/table/crud/crud-object-edit.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L14)
