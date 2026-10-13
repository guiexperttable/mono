[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CheckboxModelIf

# Interface: CheckboxModelIf\<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Implemented by

- [`CheckboxModel`](../classes/CheckboxModel.md)
- [`TreeCheckboxModel`](../classes/TreeCheckboxModel.md)

## Table of contents

### Methods

- [addCheckedRows](CheckboxModelIf.md#addcheckedrows)
- [checkAll](CheckboxModelIf.md#checkall)
- [checkRow](CheckboxModelIf.md#checkrow)
- [getCheckedRows](CheckboxModelIf.md#getcheckedrows)
- [isRowChecked](CheckboxModelIf.md#isrowchecked)
- [setCheckedRows](CheckboxModelIf.md#setcheckedrows)

## Methods

### addCheckedRows

▸ **addCheckedRows**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T`[] |

#### Returns

`void`

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L10)

___

### checkAll

▸ **checkAll**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T`[] |

#### Returns

`void`

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L16)

___

### checkRow

▸ **checkRow**(`row`, `check`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |
| `check` | `boolean` |

#### Returns

`void`

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L12)

___

### getCheckedRows

▸ **getCheckedRows**(): `T`[]

#### Returns

`T`[]

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:6](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L6)

___

### isRowChecked

▸ **isRowChecked**(`row`): [`CheckedType`](../modules.md#checkedtype)

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

#### Returns

[`CheckedType`](../modules.md#checkedtype)

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L14)

___

### setCheckedRows

▸ **setCheckedRows**(`value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T`[] |

#### Returns

`void`

#### Defined in

[src/lib/table/checkbox/checkbox-model.if.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.if.ts#L8)
