[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellGroup

# Class: CellGroup

## Hierarchy

- **`CellGroup`**

  ↳ [`CellGroupExt`](CellGroupExt.md)

## Implements

- [`CellGroupIf`](../interfaces/CellGroupIf.md)

## Table of contents

### Constructors

- [constructor](CellGroup.md#constructor)

### Properties

- [children](CellGroup.md#children)
- [closed](CellGroup.md#closed)
- [data](CellGroup.md#data)
- [id](CellGroup.md#id)
- [impl](CellGroup.md#impl)
- [property](CellGroup.md#property)
- [toggle](CellGroup.md#toggle)
- [visibility](CellGroup.md#visibility)

## Constructors

### constructor

• **new CellGroup**(`data`, `property?`, `toggle?`, `closed?`, `visibility?`, `children?`): [`CellGroup`](CellGroup.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `data` | `any` | `undefined` |
| `property?` | `string` | `undefined` |
| `toggle?` | `boolean` | `undefined` |
| `closed` | `boolean` | `false` |
| `visibility` | `undefined` \| ``"normal"`` \| ``"always"`` \| ``"inverted"`` | `"normal"` |
| `children` | `undefined` \| [`CellGroupIf`](../interfaces/CellGroupIf.md)[] | `undefined` |

#### Returns

[`CellGroup`](CellGroup.md)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L11)

## Properties

### children

• **children**: `undefined` \| [`CellGroupIf`](../interfaces/CellGroupIf.md)[] = `undefined`

Sub-groups or columns.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[children](../interfaces/CellGroupIf.md#children)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L17)

___

### closed

• **closed**: `boolean` = `false`

Current state: collapsed.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[closed](../interfaces/CellGroupIf.md#closed)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L15)

___

### data

• **data**: `any`

The label of the group or column.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[data](../interfaces/CellGroupIf.md#data)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L12)

___

### id

• `Optional` **id**: `string`

See [CellGroupIf.id](../interfaces/CellGroupIf.md#id).

**`Since`**

1.1.92

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[id](../interfaces/CellGroupIf.md#id)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L9)

___

### impl

• **impl**: `string` = `'CellGroup'`

Internal: the implementation type of the node.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[impl](../interfaces/CellGroupIf.md#impl)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:6](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L6)

___

### property

• `Optional` **property**: `string`

Set on leaves only: the property shown in this column.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[property](../interfaces/CellGroupIf.md#property)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L13)

___

### toggle

• `Optional` **toggle**: `boolean`

Show a ❯ toggle so that the user can collapse / expand the group.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[toggle](../interfaces/CellGroupIf.md#toggle)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L14)

___

### visibility

• **visibility**: `undefined` \| ``"normal"`` \| ``"always"`` \| ``"inverted"`` = `"normal"`

When is this child visible? `"always"` – also when the group is collapsed; `"inverted"` – only when collapsed
(e.g. a summary column); `"normal"` / undefined – only when expanded.

#### Implementation of

[CellGroupIf](../interfaces/CellGroupIf.md).[visibility](../interfaces/CellGroupIf.md#visibility)

#### Defined in

[src/lib/table/data/tablemodel/cellgroup/cell-group.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cellgroup/cell-group.ts#L16)
