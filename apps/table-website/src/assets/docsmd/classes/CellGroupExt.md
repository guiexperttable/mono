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

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L12)

___

### data

• **data**: `any`

The label of the group or column.

#### Inherited from

[CellGroup](CellGroup.md).[data](CellGroup.md#data)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L10)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L11)

___

### visibility

• **visibility**: `undefined` \| ``"normal"`` \| ``"always"`` \| ``"inverted"`` = `"normal"`

When is this child visible? `"always"` – also when the group is collapsed; `"inverted"` – only when collapsed
(e.g. a summary column); `"normal"` / undefined – only when expanded.

#### Inherited from

[CellGroup](CellGroup.md).[visibility](CellGroup.md#visibility)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L13)

## Methods

### claimsSpace

▸ **claimsSpace**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L99)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L104)

___

### getColumnIndex

▸ **getColumnIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L38)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L130)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L119)

___

### isVisible

▸ **isVisible**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L82)

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

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L141)

___

### ownColumn

▸ **ownColumn**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L29)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group-ext.ts#L33)
