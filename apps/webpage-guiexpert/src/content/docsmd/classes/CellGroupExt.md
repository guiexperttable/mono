[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellGroupExt

# Class: CellGroupExt

## Hierarchy

- [`CellGroup`](CellGroup.md)

  ↳ **`CellGroupExt`**

## Table of contents

### Constructors

- [constructor](CellGroupExt.md#constructor)

### Properties

- [childIndex](CellGroupExt.md#childindex)
- [children](CellGroupExt.md#children)
- [closed](CellGroupExt.md#closed)
- [data](CellGroupExt.md#data)
- [id](CellGroupExt.md#id)
- [impl](CellGroupExt.md#impl)
- [leftNeighbour](CellGroupExt.md#leftneighbour)
- [parent](CellGroupExt.md#parent)
- [property](CellGroupExt.md#property)
- [rightNeighbour](CellGroupExt.md#rightneighbour)
- [rowIndex](CellGroupExt.md#rowindex)
- [toggle](CellGroupExt.md#toggle)
- [visibility](CellGroupExt.md#visibility)

### Methods

- [claimsSpace](CellGroupExt.md#claimsspace)
- [getColumnCount](CellGroupExt.md#getcolumncount)
- [getColumnIndex](CellGroupExt.md#getcolumnindex)
- [getParentCount](CellGroupExt.md#getparentcount)
- [getRowSpan](CellGroupExt.md#getrowspan)
- [isVisible](CellGroupExt.md#isvisible)
- [log](CellGroupExt.md#log)
- [ownColumn](CellGroupExt.md#owncolumn)
- [toString](CellGroupExt.md#tostring)

## Constructors

### constructor

• **new CellGroupExt**(`cellGroup`, `rowIndex?`, `childIndex?`, `parent?`): [`CellGroupExt`](CellGroupExt.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `cellGroup` | [`CellGroupIf`](../interfaces/CellGroupIf.md) | `undefined` |
| `rowIndex` | `number` | `0` |
| `childIndex` | `number` | `0` |
| `parent?` | [`CellGroupExt`](CellGroupExt.md) | `undefined` |

#### Returns

[`CellGroupExt`](CellGroupExt.md)

#### Overrides

[CellGroup](CellGroup.md).[constructor](CellGroup.md#constructor)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L13)

## Properties

### childIndex

• **childIndex**: `number` = `0`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L16)

___

### children

• **children**: `undefined` \| [`CellGroupExt`](CellGroupExt.md)[] = `undefined`

Sub-groups or columns.

#### Overrides

[CellGroup](CellGroup.md).[children](CellGroup.md#children)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L9)

___

### closed

• **closed**: `boolean` = `false`

Current state: collapsed.

#### Inherited from

[CellGroup](CellGroup.md).[closed](CellGroup.md#closed)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L15)

___

### data

• **data**: `any`

The label of the group or column.

#### Inherited from

[CellGroup](CellGroup.md).[data](CellGroup.md#data)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L12)

___

### id

• `Optional` **id**: `string`

See [CellGroupIf.id](../interfaces/CellGroupIf.md#id).

**`Since`**

1.1.92

#### Inherited from

[CellGroup](CellGroup.md).[id](CellGroup.md#id)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L9)

___

### impl

• **impl**: `string` = `'CellGroupExt'`

Internal: the implementation type of the node.

#### Overrides

[CellGroup](CellGroup.md).[impl](CellGroup.md#impl)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L7)

___

### leftNeighbour

• **leftNeighbour**: `undefined` \| [`CellGroupExt`](CellGroupExt.md) = `undefined`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L10)

___

### parent

• `Optional` **parent**: [`CellGroupExt`](CellGroupExt.md)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L17)

___

### property

• `Optional` **property**: `string`

Set on leaves only: the property shown in this column.

#### Inherited from

[CellGroup](CellGroup.md).[property](CellGroup.md#property)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L13)

___

### rightNeighbour

• **rightNeighbour**: `undefined` \| [`CellGroupExt`](CellGroupExt.md) = `undefined`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L11)

___

### rowIndex

• **rowIndex**: `number` = `0`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L15)

___

### toggle

• `Optional` **toggle**: `boolean`

Show a ❯ toggle so that the user can collapse / expand the group.

#### Inherited from

[CellGroup](CellGroup.md).[toggle](CellGroup.md#toggle)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L14)

___

### visibility

• **visibility**: `undefined` \| ``"normal"`` \| ``"always"`` \| ``"inverted"`` = `"normal"`

When is this child visible? `"always"` – also when the group is collapsed; `"inverted"` – only when collapsed
(e.g. a summary column); `"normal"` / undefined – only when expanded.

#### Inherited from

[CellGroup](CellGroup.md).[visibility](CellGroup.md#visibility)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L16)

## Methods

### claimsSpace

▸ **claimsSpace**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L100)

___

### getColumnCount

▸ **getColumnCount**(`cg?`, `ret?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `cg` | [`CellGroupExt`](CellGroupExt.md) | `undefined` |
| `ret` | `number` | `0` |

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L105)

___

### getColumnIndex

▸ **getColumnIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L39)

___

### getParentCount

▸ **getParentCount**(`cg?`, `ret?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `cg` | [`CellGroupExt`](CellGroupExt.md) | `undefined` |
| `ret` | `number` | `0` |

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L131)

___

### getRowSpan

▸ **getRowSpan**(`cg?`, `maxRowCount`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `cg` | [`CellGroupExt`](CellGroupExt.md) |
| `maxRowCount` | `number` |

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L120)

___

### isVisible

▸ **isVisible**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L83)

___

### log

▸ **log**(`maxRowCount?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `maxRowCount` | `number` | `10` |

#### Returns

`string`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L142)

___

### ownColumn

▸ **ownColumn**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L30)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L34)
