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

[src/lib/table/checkbox/tree-checkbox-model.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L89)

___

### checkAll

▸ **checkAll**(`arr?`): `void`

Unchecks the given rows and all their descendants – despite its name, like [CheckboxModel.checkAll](CheckboxModel.md#checkall)
(which clears all checked rows). The parents of the given rows are updated ("semi" or "none").

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arr` | `T`[] | the rows to uncheck together with their descendants; default: the root nodes (whole tree) |

#### Returns

`void`

**`Example`**

```ts
const checkboxModel = new TreeCheckboxModel(TreeFactory.buildTreeRows<OrderNode>(nodes));
checkboxModel.checkAll(); // uncheck every row of the tree
```

#### Implementation of

[CheckboxModelIf](../interfaces/CheckboxModelIf.md).[checkAll](../interfaces/CheckboxModelIf.md#checkall)

#### Defined in

[src/lib/table/checkbox/tree-checkbox-model.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L31)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L45)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L51)

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

[src/lib/table/checkbox/tree-checkbox-model.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/checkbox/tree-checkbox-model.ts#L84)
