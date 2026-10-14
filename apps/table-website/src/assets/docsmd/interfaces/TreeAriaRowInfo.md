[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeAriaRowInfo

# Interface: TreeAriaRowInfo

The screen reader attributes of one tree row (`role="treegrid"`), see [TreeAriaInfo](../classes/TreeAriaInfo.md).

**`Since`**

1.1.91

## Table of contents

### Properties

- [expanded](TreeAriaRowInfo.md#expanded)
- [level](TreeAriaRowInfo.md#level)
- [posInSet](TreeAriaRowInfo.md#posinset)
- [setSize](TreeAriaRowInfo.md#setsize)

## Properties

### expanded

• `Optional` **expanded**: `boolean`

`aria-expanded`: `true`/`false` for rows with displayed children, `undefined` for leaves.

#### Defined in

[src/lib/table/aria/tree-aria-info.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/tree-aria-info.ts#L31)

___

### level

• **level**: `number`

`aria-level`: 1 for top-level rows.

#### Defined in

[src/lib/table/aria/tree-aria-info.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/tree-aria-info.ts#L25)

___

### posInSet

• **posInSet**: `number`

`aria-posinset`: 1-based position among the displayed siblings.

#### Defined in

[src/lib/table/aria/tree-aria-info.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/tree-aria-info.ts#L29)

___

### setSize

• **setSize**: `number`

`aria-setsize`: number of displayed siblings (including the row).

#### Defined in

[src/lib/table/aria/tree-aria-info.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/tree-aria-info.ts#L27)
