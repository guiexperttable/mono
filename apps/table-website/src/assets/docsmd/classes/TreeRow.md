[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeRow

# Class: TreeRow\<T\>

Represents a (table) row in a tree structure. It's a container object for T with additional tree node information.

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of data stored in the row. |

## Implements

- [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](TreeRow.md#constructor)

### Properties

- [checked](TreeRow.md#checked)
- [children](TreeRow.md#children)
- [data](TreeRow.md#data)
- [deep](TreeRow.md#deep)
- [expanded](TreeRow.md#expanded)
- [keep](TreeRow.md#keep)
- [parent](TreeRow.md#parent)
- [type](TreeRow.md#type)

## Constructors

### constructor

• **new TreeRow**\<`T`\>(`data`, `expanded?`, `children`, `parent`, `deep?`, `checked?`, `keep?`): [`TreeRow`](TreeRow.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `data` | `T` | `undefined` |
| `expanded` | `boolean` | `true` |
| `children` | `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[] | `undefined` |
| `parent` | `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\> | `undefined` |
| `deep` | `number` | `0` |
| `checked` | `boolean` | `false` |
| `keep` | `boolean` | `false` |

#### Returns

[`TreeRow`](TreeRow.md)\<`T`\>

#### Defined in

[src/lib/table/data/common/tree-row.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L13)

## Properties

### checked

• **checked**: `boolean` = `false`

Checkbox state (with `showCheckboxWihoutExtraColumn` or a checkbox column).

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[checked](../interfaces/TreeRowIf.md#checked)

#### Defined in

[src/lib/table/data/common/tree-row.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L19)

___

### children

• **children**: `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[]

The child rows, undefined for leaves.

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[children](../interfaces/TreeRowIf.md#children)

#### Defined in

[src/lib/table/data/common/tree-row.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L16)

___

### data

• **data**: `T`

Your object. Column values are read from it (`columnDef.property`).

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[data](../interfaces/TreeRowIf.md#data)

#### Defined in

[src/lib/table/data/common/tree-row.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L14)

___

### deep

• **deep**: `number` = `0`

Depth in the tree: 0 = top level.

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[deep](../interfaces/TreeRowIf.md#deep)

#### Defined in

[src/lib/table/data/common/tree-row.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L18)

___

### expanded

• **expanded**: `boolean` = `true`

Are the children visible?

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[expanded](../interfaces/TreeRowIf.md#expanded)

#### Defined in

[src/lib/table/data/common/tree-row.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L15)

___

### keep

• **keep**: `boolean` = `false`

Internal: kept by the filter because a descendant matches.

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[keep](../interfaces/TreeRowIf.md#keep)

#### Defined in

[src/lib/table/data/common/tree-row.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L20)

___

### parent

• **parent**: `undefined` \| [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>

The parent row, undefined on the top level.

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[parent](../interfaces/TreeRowIf.md#parent)

#### Defined in

[src/lib/table/data/common/tree-row.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L17)

___

### type

• **type**: ``""`` \| ``"TreeRow"`` = `'TreeRow'`

Marker to recognise tree rows across package boundaries (see `isTreeRow()`).

#### Implementation of

[TreeRowIf](../interfaces/TreeRowIf.md).[type](../interfaces/TreeRowIf.md#type)

#### Defined in

[src/lib/table/data/common/tree-row.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row.ts#L11)
