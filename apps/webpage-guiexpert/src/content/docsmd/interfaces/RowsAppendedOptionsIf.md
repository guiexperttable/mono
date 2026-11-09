[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowsAppendedOptionsIf

# Interface: RowsAppendedOptionsIf

Options of `tableApi.rowsAppended(count, options)` – an own area model that appended (and maybe removed) rows
itself.

**`Example`**

```ts
const logLines: string[] = [];             // the data of an own area model
for (const line of newLines) logLines.push(line);
const dropped = Math.max(0, logLines.length - 100_000);
logLines.splice(0, dropped);               // the app keeps its own ring buffer
tableApi.rowsAppended(newLines.length, { follow: "auto", removedAtStart: dropped });
```

**`Since`**

1.1.108

## Table of contents

### Properties

- [follow](RowsAppendedOptionsIf.md#follow)
- [removedAtStart](RowsAppendedOptionsIf.md#removedatstart)

## Properties

### follow

• `Optional` **follow**: [`AppendFollowMode`](../modules.md#appendfollowmode)

Where the view goes – see [AppendFollowMode](../modules.md#appendfollowmode). Default `"auto"`.

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L53)

___

### removedAtStart

• `Optional` **removedAtStart**: `number`

Number of rows the app removed at the start (display indices 0 … n-1 before the step). Default 0.

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L55)
