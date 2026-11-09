[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AppendRowsContextIf

# Interface: AppendRowsContextIf\<T\>

What a table passes to [AreaModelIf.appendRows](AreaModelIf.md#appendrows): the active filter and sort order, so the model treats only
the new rows (O(k) unsorted, O(n + k) sorted).

**`Since`**

1.1.108

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

## Table of contents

### Properties

- [compare](AppendRowsContextIf.md#compare)
- [filter](AppendRowsContextIf.md#filter)
- [maxRows](AppendRowsContextIf.md#maxrows)

## Properties

### compare

• `Optional` **compare**: (`a`: `T`, `b`: `T`) => `number`

#### Type declaration

▸ (`a`, `b`): `number`

the active sort order – new rows are inserted at their place (stable: behind equal rows)

##### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `T` |
| `b` | `T` |

##### Returns

`number`

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L86)

___

### filter

• `Optional` **filter**: (`row`: `T`) => `boolean`

#### Type declaration

▸ (`row`): `boolean`

the active filter (`tableOptions.externalFilterFunction`) – new rows it rejects are kept but not shown

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`boolean`

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L84)

___

### maxRows

• `Optional` **maxRows**: `number`

ring buffer size, see [AppendRowsOptionsIf.maxRows](AppendRowsOptionsIf.md#maxrows)

#### Defined in

[src/lib/table/live-append/append-rows-options.if.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/append-rows-options.if.ts#L88)
