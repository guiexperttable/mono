[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AppendRowsResultIf

# Interface: AppendRowsResultIf

Result of `tableApi.appendRows()` / `rowsAppended()`.

**`Since`**

1.1.108

## Table of contents

### Properties

- [added](AppendRowsResultIf.md#added)
- [following](AppendRowsResultIf.md#following)
- [removed](AppendRowsResultIf.md#removed)
- [shown](AppendRowsResultIf.md#shown)

## Properties

### added

• **added**: `number`

rows added to the data

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L66)

___

### following

• **following**: `boolean`

true if the view follows the end after this update

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L72)

___

### removed

• **removed**: `number`

rows removed at the start (`maxRows` / `removedAtStart`)

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L70)

___

### shown

• **shown**: `number`

of them shown (an active filter hides the others)

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L68)
