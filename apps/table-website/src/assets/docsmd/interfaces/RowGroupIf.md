[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupIf

# Interface: RowGroupIf\<T\>

A group of a row grouping – the `data` of a group row in an [AreaModelRowGroups](../classes/AreaModelRowGroups.md) and the result of
[groupRows](../modules.md#grouprows). Groups of the last level hold the rows; groups above hold sub-groups.

**`Example`**

```ts
// the group of a clicked row
const group = model.getRowGroup(rowIndex);
if (group) console.log(group.path, group.count, group.results.umsatz);   // ["Nord", "A"], 2, 220
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Implemented by

- [`RowGroup`](../classes/RowGroup.md)

## Table of contents

### Properties

- [children](RowGroupIf.md#children)
- [count](RowGroupIf.md#count)
- [field](RowGroupIf.md#field)
- [id](RowGroupIf.md#id)
- [key](RowGroupIf.md#key)
- [label](RowGroupIf.md#label)
- [level](RowGroupIf.md#level)
- [parent](RowGroupIf.md#parent)
- [path](RowGroupIf.md#path)
- [results](RowGroupIf.md#results)
- [type](RowGroupIf.md#type)

### Methods

- [getRows](RowGroupIf.md#getrows)

## Properties

### children

• `Readonly` **children**: [`RowGroupIf`](RowGroupIf.md)\<`T`\>[]

The sub-groups, empty on the last level.

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L35)

___

### count

• `Readonly` **count**: `number`

The number of rows in the group (after the filter).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L37)

___

### field

• `Readonly` **field**: `string`

The name of the level ([RowGroupFieldIf.name](RowGroupFieldIf.md#name)).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L24)

___

### id

• `Readonly` **id**: `string`

A stable id built from the level names and keys – the same data give the same id (persistence of expanded groups).
Keys that are objects or symbols get an id per page load only (they can't be stored).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L31)

___

### key

• `Readonly` **key**: `unknown`

The key of the group, as the rows have it (`null` for the group of empty keys: `null`, `undefined`, `""`).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L18)

___

### label

• `Readonly` **label**: `string`

The key as text (`format` of the level, otherwise the default text).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L20)

___

### level

• `Readonly` **level**: `number`

The level, 0 = top.

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L22)

___

### parent

• `Readonly` **parent**: `undefined` \| [`RowGroupIf`](RowGroupIf.md)\<`T`\>

The parent group, undefined on the top level.

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L33)

___

### path

• `Readonly` **path**: readonly `unknown`[]

The keys from the top level down to this group.

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L26)

___

### results

• `Readonly` **results**: `Record`\<`string`, `unknown`\>

The aggregates of the group by key (after the filter), e.g. `{ umsatz: 270 }`.

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L39)

___

### type

• `Readonly` **type**: ``"RowGroup"``

Marker for [isRowGroup](../modules.md#isrowgroup) (works across copies of the core).

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L16)

## Methods

### getRows

▸ **getRows**(`filtered?`): `T`[]

The rows of the group and of all sub-groups, in the order of the grouped view: sub-group by sub-group, the rows of a
group in source order – or sorted, after the table sorted them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filtered?` | `boolean` | only the rows the filter keeps |

#### Returns

`T`[]

a new array

#### Defined in

[src/lib/table/rowgroup/row-group.if.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group.if.ts#L48)
