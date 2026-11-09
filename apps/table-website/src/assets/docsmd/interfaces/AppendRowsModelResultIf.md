[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AppendRowsModelResultIf

# Interface: AppendRowsModelResultIf

What [AreaModelIf.appendRows](AreaModelIf.md#appendrows) did – the table moves selection, focus and position along.

**`Since`**

1.1.108

## Table of contents

### Properties

- [added](AppendRowsModelResultIf.md#added)
- [insertedPositions](AppendRowsModelResultIf.md#insertedpositions)
- [removed](AppendRowsModelResultIf.md#removed)
- [removedPositions](AppendRowsModelResultIf.md#removedpositions)
- [shown](AppendRowsModelResultIf.md#shown)

## Properties

### added

• **added**: `number`

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L98)

___

### insertedPositions

• **insertedPositions**: `Int32Array`

display indices **after** the step of the new shown rows, ascending

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L105)

___

### removed

• **removed**: `number`

rows removed from the data

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L101)

___

### removedPositions

• **removedPositions**: `Int32Array`

display indices **before** the step of the removed rows that were shown, ascending

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L103)

___

### shown

• **shown**: `number`

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L99)
