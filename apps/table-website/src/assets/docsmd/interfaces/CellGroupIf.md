[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellGroupIf

# Interface: CellGroupIf

One node of a grouped header ([AreaModelCellGroups](../classes/AreaModelCellGroups.md)): a group with `children`, or a leaf with a `property`
(a leaf becomes a column).

**`Example`**

```ts
const groups: CellGroupIf[] = [
  { data: "Order", children: [{ data: "ID", property: "id" }, { data: "Date", property: "date" }] },
  { data: "Customer", toggle: true, children: [
    { data: "Customer", property: "customer", visibility: "always" },   // stays visible when collapsed
    { data: "City", property: "city" }] }
];
const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(groups));
const header = new AreaModelCellGroups("header", groups, columnDefs, 34);
```

**`See`**

Training: [Header models: multi-row and grouped](https://gui.expert/training/header-groups/)

## Implemented by

- [`CellGroup`](../classes/CellGroup.md)

## Table of contents

### Properties

- [children](CellGroupIf.md#children)
- [closed](CellGroupIf.md#closed)
- [data](CellGroupIf.md#data)
- [id](CellGroupIf.md#id)
- [impl](CellGroupIf.md#impl)
- [property](CellGroupIf.md#property)
- [toggle](CellGroupIf.md#toggle)
- [visibility](CellGroupIf.md#visibility)

## Properties

### children

• `Optional` **children**: [`CellGroupIf`](CellGroupIf.md)[]

Sub-groups or columns.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L42)

___

### closed

• `Optional` **closed**: `boolean`

Current state: collapsed.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L35)

___

### data

• **data**: `any`

The label of the group or column.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L29)

___

### id

• `Optional` **id**: `string`

A stable id of the group, used to remember whether it is collapsed ([TableHeaderGroupStateIf](TableHeaderGroupStateIf.md),
[TableApi.setHeaderGroupCollapsed](../classes/TableApi.md#setheadergroupcollapsed)). Default: the path of the labels, e.g. `"Customer"` or `"2026/Q1"`.

**`Since`**

1.1.92

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L26)

___

### impl

• `Optional` **impl**: `string`

Internal: the implementation type of the node.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L45)

___

### property

• `Optional` **property**: `string`

Set on leaves only: the property shown in this column.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L31)

___

### toggle

• `Optional` **toggle**: `boolean`

Show a ❯ toggle so that the user can collapse / expand the group.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L33)

___

### visibility

• `Optional` **visibility**: ``"normal"`` \| ``"always"`` \| ``"inverted"``

When is this child visible? `"always"` – also when the group is collapsed; `"inverted"` – only when collapsed
(e.g. a summary column); `"normal"` / undefined – only when expanded.

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.if.ts#L40)
