[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableTreeStateIf

# Interface: TableTreeStateIf

Expanded and collapsed nodes of a tree. Only one of the two lists is set – the shorter one:
`expandedRowIds` = these nodes are expanded, all others collapsed; `collapsedRowIds` = the other way round.
`{ collapsedRowIds: [] }` = all expanded.

**`Since`**

1.1.92

## Table of contents

### Properties

- [collapsedRowIds](TableTreeStateIf.md#collapsedrowids)
- [expandedRowIds](TableTreeStateIf.md#expandedrowids)

## Properties

### collapsedRowIds

• `Optional` **collapsedRowIds**: [`TableStateRowId`](../modules.md#tablestaterowid)[]

These nodes are collapsed, all other nodes are expanded.

#### Defined in

[src/lib/table/state/table-state.if.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L146)

___

### expandedRowIds

• `Optional` **expandedRowIds**: [`TableStateRowId`](../modules.md#tablestaterowid)[]

These nodes are expanded, all other nodes are collapsed.

#### Defined in

[src/lib/table/state/table-state.if.ts:144](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L144)
