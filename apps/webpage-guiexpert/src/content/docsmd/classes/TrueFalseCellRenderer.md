[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TrueFalseCellRenderer

# Class: TrueFalseCellRenderer

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](TrueFalseCellRenderer.md#constructor)

### Properties

- [ariaLabels](TrueFalseCellRenderer.md#arialabels)

### Methods

- [render](TrueFalseCellRenderer.md#render)

## Constructors

### constructor

• **new TrueFalseCellRenderer**(`ariaLabels?`): [`TrueFalseCellRenderer`](TrueFalseCellRenderer.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ariaLabels` | `Object` | texts for screen readers (the icons ✅ / ❌ are images). Default: "Yes" / "No". |
| `ariaLabels.false` | `string` | - |
| `ariaLabels.true` | `string` | - |

#### Returns

[`TrueFalseCellRenderer`](TrueFalseCellRenderer.md)

**`Since`**

1.1.91

#### Defined in

[src/lib/table/renderer/true-false-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/true-false-cell-renderer.ts#L15)

## Properties

### ariaLabels

• **ariaLabels**: `Object`

texts for screen readers (the icons ✅ / ❌ are images). Default: "Yes" / "No".

#### Type declaration

| Name | Type |
| :------ | :------ |
| `false` | `string` |
| `true` | `string` |

#### Defined in

[src/lib/table/renderer/true-false-cell-renderer.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/true-false-cell-renderer.ts#L16)

## Methods

### render

▸ **render**(`cellDiv`, `_rowIndex`, `_columnIndex`, `_areaIdent`, `_areaModel`, `cellValue`, `_domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `_rowIndex` | `number` | row in the area (as displayed) |
| `_columnIndex` | `number` | column index (west + center + east) |
| `_areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `_areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `_domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/true-false-cell-renderer.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/true-false-cell-renderer.ts#L20)
