[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeRowIf

# Interface: TreeRowIf\<T\>

A row of a tree table: your object (`data`) plus the tree state. Created by [TreeFactory.buildTreeRows](../classes/TreeFactory.md#buildtreerows).

**`Example`**

```ts
// expand all first-level rows: change `expanded`, rebuild the displayed rows, repaint
const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
for (const row of treeModel.rows) row.expanded = true;
treeModel.recalcVisibleTreeRows(); // without it the table keeps showing the old rows
tableApi.repaintHard();
```

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | the type of your objects |

## Implemented by

- [`TreeRow`](../classes/TreeRow.md)

## Table of contents

### Properties

- [checked](TreeRowIf.md#checked)
- [children](TreeRowIf.md#children)
- [data](TreeRowIf.md#data)
- [deep](TreeRowIf.md#deep)
- [expanded](TreeRowIf.md#expanded)
- [keep](TreeRowIf.md#keep)
- [parent](TreeRowIf.md#parent)
- [type](TreeRowIf.md#type)

## Properties

### checked

• **checked**: `boolean`

Checkbox state (with `showCheckboxWihoutExtraColumn` or a checkbox column).

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L33)

___

### children

• **children**: `undefined` \| [`TreeRowIf`](TreeRowIf.md)\<`T`\>[]

The child rows, undefined for leaves.

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L27)

___

### data

• **data**: `T`

Your object. Column values are read from it (`columnDef.property`).

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L23)

___

### deep

• **deep**: `number`

Depth in the tree: 0 = top level.

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L31)

___

### expanded

• **expanded**: `boolean`

Are the children visible?

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L25)

___

### keep

• **keep**: `boolean`

Internal, set by the filter: the row or one of its descendants matches (also below collapsed rows).

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L35)

___

### parent

• **parent**: `undefined` \| [`TreeRowIf`](TreeRowIf.md)\<`T`\>

The parent row, undefined on the top level.

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L29)

___

### type

• `Optional` **type**: ``""`` \| ``"TreeRow"``

Marker to recognise tree rows across package boundaries (see `isTreeRow()`).

#### Defined in

[src/lib/table/data/common/tree-row-if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/tree-row-if.ts#L21)
