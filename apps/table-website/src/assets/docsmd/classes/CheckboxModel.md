[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CheckboxModel

# Class: CheckboxModel\<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`CheckboxModelIf`](../interfaces/CheckboxModelIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](CheckboxModel.md#constructor)

### Properties

- [checkedRows](CheckboxModel.md#checkedrows)

### Methods

- [addCheckedRows](CheckboxModel.md#addcheckedrows)
- [checkAll](CheckboxModel.md#checkall)
- [checkRow](CheckboxModel.md#checkrow)
- [getCheckedRows](CheckboxModel.md#getcheckedrows)
- [isRowChecked](CheckboxModel.md#isrowchecked)
- [setCheckedRows](CheckboxModel.md#setcheckedrows)

## Constructors

### constructor

• **new CheckboxModel**\<`T`\>(): [`CheckboxModel`](CheckboxModel.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Returns

[`CheckboxModel`](CheckboxModel.md)\<`T`\>

## Properties

### checkedRows

• `Protected` **checkedRows**: `T`[] = `[]`

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L7)

## Methods

### addCheckedRows

▸ **addCheckedRows**(`rows`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rows` | `T`[] |

#### Returns

`void`

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[addCheckedRows](../interfaces/CheckboxModelIf.md#addcheckedrows)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L18)

___

### checkAll

▸ **checkAll**(`_rows`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_rows` | `T`[] |

#### Returns

`void`

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[checkAll](../interfaces/CheckboxModelIf.md#checkall)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L50)

___

### checkRow

▸ **checkRow**(`row`, `sel`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |
| `sel` | `boolean` |

#### Returns

`void`

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[checkRow](../interfaces/CheckboxModelIf.md#checkrow)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L29)

___

### getCheckedRows

▸ **getCheckedRows**(): `T`[]

#### Returns

`T`[]

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[getCheckedRows](../interfaces/CheckboxModelIf.md#getcheckedrows)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L9)

___

### isRowChecked

▸ **isRowChecked**(`row`): [`CheckedType`](../modules.md#checkedtype)

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

#### Returns

[`CheckedType`](../modules.md#checkedtype)

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[isRowChecked](../interfaces/CheckboxModelIf.md#isrowchecked)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L43)

___

### setCheckedRows

▸ **setCheckedRows**(`rows`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rows` | `T`[] |

#### Returns

`void`

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[setCheckedRows](../interfaces/CheckboxModelIf.md#setcheckedrows)

#### Defined in

[src/lib/table/checkbox/checkbox-model.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/checkbox-model.ts#L13)
