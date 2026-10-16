[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableStateIf

# Interface: TableStateIf

The state of a table as plain JSON: column layout, sorting, scroll position, tree, checked and selected rows,
header groups and data of your own. Get it with [TableApi.getState](../classes/TableApi.md#getstate), apply it with
[TableApi.applyState](../classes/TableApi.md#applystate) or pass it at the start as [TableOptionsIf.initialState](TableOptionsIf.md#initialstate) – e.g. to store it on
your server per user. [TableOptionsIf.autoRestoreOptions](TableOptionsIf.md#autorestoreoptions) stores it in `localStorage` for you.

Every part is optional: a missing part is not applied (the table keeps its current state of that part).
Columns are identified by their property, rows by their id ([AutoRestoreOptionsIf.getRowId](AutoRestoreOptionsIf.md#getrowid)) – never by an
index, so the state survives moved columns and rows that arrive in another order. Unknown columns and rows are
ignored. The state holds no cell values – but row ids can be personal data (e.g. an e-mail address as id).

**`Example`**

```ts
const state: TableStateIf = tableApi.getState();
localStorage.setItem("orders-layout", JSON.stringify(state));
// later, e.g. in another table:
tableApi.applyState(JSON.parse(localStorage.getItem("orders-layout")!) as TableStateIf);
```

**`Example`**

```ts
// hand-written: "total" first and 240 px wide, "city" hidden, sorted by total descending
const state: TableStateIf = {
  version: 1,
  columns: [{ property: "total", width: 240 }, { property: "id" }, { property: "city", visible: false }],
  sort: [{ property: "total", sortState: "desc" }]
};
```

**`See`**

Training: [Remember the state](https://gui.expert/training/persist-state/)

**`Since`**

1.1.92

## Table of contents

### Properties

- [checkedRowIds](TableStateIf.md#checkedrowids)
- [columns](TableStateIf.md#columns)
- [custom](TableStateIf.md#custom)
- [detailRowIds](TableStateIf.md#detailrowids)
- [headerGroups](TableStateIf.md#headergroups)
- [scroll](TableStateIf.md#scroll)
- [selection](TableStateIf.md#selection)
- [sort](TableStateIf.md#sort)
- [tree](TableStateIf.md#tree)
- [version](TableStateIf.md#version)

## Properties

### checkedRowIds

• `Optional` **checkedRowIds**: [`TableStateRowId`](../modules.md#tablestaterowid)[]

The ids of the checked rows.

#### Defined in

[src/lib/table/state/table-state.if.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L78)

___

### columns

• `Optional` **columns**: [`TableColumnStateIf`](TableColumnStateIf.md)[]

The columns in their order (fixed columns included). Columns of the table that are missing here keep their
place; unknown properties are ignored.

#### Defined in

[src/lib/table/state/table-state.if.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L70)

___

### custom

• `Optional` **custom**: `unknown`

Data of your application, e.g. the text of a filter field (must be JSON).

#### Defined in

[src/lib/table/state/table-state.if.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L86)

___

### detailRowIds

• `Optional` **detailRowIds**: [`TableStateRowId`](../modules.md#tablestaterowid)[]

The ids of the master rows with an expanded detail row (master/detail).

**`Since`**

1.1.97

#### Defined in

[src/lib/table/state/table-state.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L80)

___

### headerGroups

• `Optional` **headerGroups**: [`TableHeaderGroupStateIf`](TableHeaderGroupStateIf.md)[]

The state of the header groups with a toggle.

#### Defined in

[src/lib/table/state/table-state.if.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L84)

___

### scroll

• `Optional` **scroll**: [`TableScrollStateIf`](TableScrollStateIf.md)

The scroll position.

#### Defined in

[src/lib/table/state/table-state.if.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L74)

___

### selection

• `Optional` **selection**: [`TableSelectionStateIf`](TableSelectionStateIf.md)

The selection.

#### Defined in

[src/lib/table/state/table-state.if.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L82)

___

### sort

• `Optional` **sort**: [`TableSortStateIf`](TableSortStateIf.md)[]

The sorted columns, the first one is the primary sort key. `[]` = unsorted.

#### Defined in

[src/lib/table/state/table-state.if.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L72)

___

### tree

• `Optional` **tree**: [`TableTreeStateIf`](TableTreeStateIf.md)

Expanded / collapsed nodes of a tree table.

#### Defined in

[src/lib/table/state/table-state.if.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L76)

___

### version

• **version**: ``1``

Format version, always `1`.

#### Defined in

[src/lib/table/state/table-state.if.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L65)
