[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PastePlanIf

# Interface: PastePlanIf\<V\>

Result of [computePastePlan](../modules.md#computepasteplan).

**`Since`**

1.1.99

## Type parameters

| Name | Type |
| :------ | :------ |
| `V` | `unknown` |

## Table of contents

### Properties

- [addRows](PastePlanIf.md#addrows)
- [cells](PastePlanIf.md#cells)
- [clipped](PastePlanIf.md#clipped)
- [range](PastePlanIf.md#range)
- [skipped](PastePlanIf.md#skipped)

## Properties

### addRows

• **addRows**: `number`

Rows to add below the last row before writing (`canAddRows`).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L49)

___

### cells

• **cells**: \{ `columnIndex`: `number` ; `rowIndex`: `number` ; `value`: `V`  }[]

The cells to write: display row (may be ≥ `rowCount` for added rows), model column, value.

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L41)

___

### clipped

• **clipped**: `number`

Cells cut off at the last column (or the last row without `canAddRows`).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L47)

___

### range

• **range**: [`CellRange`](../classes/CellRange.md)

The covered target (display rows, model columns from the first to the last shown column).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L43)

___

### skipped

• **skipped**: `number`

Target cells left out because they are not writable.

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L45)
