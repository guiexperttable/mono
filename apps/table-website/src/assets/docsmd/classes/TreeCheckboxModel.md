[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeCheckboxModel

# Class: TreeCheckboxModel\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |

## Implements

- [`CheckboxModelIf`](../interfaces/CheckboxModelIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](TreeCheckboxModel.md#constructor)

### Properties

- [allRootNodes](TreeCheckboxModel.md#allrootnodes)

### Methods

- [addCheckedRows](TreeCheckboxModel.md#addcheckedrows)
- [checkAll](TreeCheckboxModel.md#checkall)
- [checkRow](TreeCheckboxModel.md#checkrow)
- [getCheckedRows](TreeCheckboxModel.md#getcheckedrows)
- [isRowChecked](TreeCheckboxModel.md#isrowchecked)
- [setCheckedRows](TreeCheckboxModel.md#setcheckedrows)

## Constructors

### constructor

• **new TreeCheckboxModel**\<`T`\>(`allRootNodes?`): [`TreeCheckboxModel`](TreeCheckboxModel.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `allRootNodes` | `T`[] | `[]` |

#### Returns

[`TreeCheckboxModel`](TreeCheckboxModel.md)\<`T`\>

#### Defined in

[src/lib/table/checkbox/tree-checkbox-model.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L10)

## Properties

### allRootNodes

• `Protected` **allRootNodes**: `T`[] = `[]`

#### Defined in

[src/lib/table/checkbox/tree-checkbox-model.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L11)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L57)

___

### checkAll

▸ **checkAll**(`_arr`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_arr` | `T`[] |

#### Returns

`void`

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[checkAll](../interfaces/CheckboxModelIf.md#checkall)

#### Defined in

[src/lib/table/checkbox/tree-checkbox-model.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L25)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L15)

___

### getCheckedRows

▸ **getCheckedRows**(): `T`[]

#### Returns

`T`[]

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[getCheckedRows](../interfaces/CheckboxModelIf.md#getcheckedrows)

#### Defined in

[src/lib/table/checkbox/tree-checkbox-model.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L34)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L40)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L52)
