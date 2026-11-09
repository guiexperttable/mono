[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AppendRowsOptionsIf

# Interface: AppendRowsOptionsIf

Options of `tableApi.appendRows(rows, options)`.

**`Example`**

```ts
const result = tableApi.appendRows(lines, { follow: "auto", maxRows: 1_000_000 });
```

**`Since`**

1.1.108

## Table of contents

### Properties

- [follow](AppendRowsOptionsIf.md#follow)
- [maxRows](AppendRowsOptionsIf.md#maxrows)

## Properties

### follow

• `Optional` **follow**: [`AppendFollowMode`](../modules.md#appendfollowmode)

Where the view goes – see [AppendFollowMode](../modules.md#appendfollowmode). Default `"auto"`.

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L27)

___

### maxRows

• `Optional` **maxRows**: `number`

Ring buffer: keep at most this many rows – the oldest (first) rows of the data are removed from the start, in
blocks of at least 1 % of `maxRows` (removing from the start of an array moves all rows: O(n) – the blocks make
that rare), so the row count stays between 99 % and 100 % of `maxRows`.
Selection, focus and the visible row stay at their rows; a selected row that is removed leaves the selection.

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L34)
