[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CrudObjectEdit

# Class: CrudObjectEdit\<T\>

Edit dialog (`<dialog>` with one form) for an object: one input per property, nested objects flattened
(`address.city`), the id property (`idKey`) is not editable.

- Works on a deep copy – the object passed in is not changed.
- Values keep their type: numbers stay numbers (an empty number field becomes `null`), booleans are checkboxes
  (unchecking saves `false`), `null`/`undefined` stay as they are while their text field is left empty.
- Labels and values are escaped – data is shown as text, never as markup.
- Save calls `onSave(editedCopy)`; Save, Cancel and Escape close and remove the dialog.

**`Example`**

```ts
new CrudObjectEdit('id', { id: 7, name: 'Ada', age: 36, vip: true }, 'Edit customer')
  .openDialog(updated => console.info(updated)); // { id: 7, name: '…', age: 37, vip: false }
```

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

[src/lib/table/crud/crud-object-edit.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L28)

## Properties

### dialogTitle

• **dialogTitle**: `string` = `'Edit Item'`

#### Defined in

[src/lib/table/crud/crud-object-edit.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L31)

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

[src/lib/table/crud/crud-object-edit.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/crud/crud-object-edit.ts#L36)
