[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CheckboxBooleanPropertyCellRenderer

# Class: CheckboxBooleanPropertyCellRenderer\<T\>

Works with AreaModelObjectArray only

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`CellRendererIf`](../interfaces/CellRendererIf.md)

## Table of contents

### Constructors

- [constructor](CheckboxBooleanPropertyCellRenderer.md#constructor)

### Properties

- [property](CheckboxBooleanPropertyCellRenderer.md#property)
- [readonly](CheckboxBooleanPropertyCellRenderer.md#readonly)
- [skipCheckableCheck](CheckboxBooleanPropertyCellRenderer.md#skipcheckablecheck)

### Methods

- [render](CheckboxBooleanPropertyCellRenderer.md#render)

## Constructors

### constructor

• **new CheckboxBooleanPropertyCellRenderer**\<`T`\>(`property`, `skipCheckableCheck?`, `readonly?`): [`CheckboxBooleanPropertyCellRenderer`](CheckboxBooleanPropertyCellRenderer.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `property` | `string` | `undefined` |
| `skipCheckableCheck` | `boolean` | `true` |
| `readonly` | `boolean` | `false` |

#### Returns

[`CheckboxBooleanPropertyCellRenderer`](CheckboxBooleanPropertyCellRenderer.md)\<`T`\>

#### Defined in

[src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts#L14)

## Properties

### property

• **property**: `string`

#### Defined in

[src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts#L15)

___

### readonly

• **readonly**: `boolean` = `false`

#### Defined in

[src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts#L17)

___

### skipCheckableCheck

• **skipCheckableCheck**: `boolean` = `true`

#### Defined in

[src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts#L16)

## Methods

### render

▸ **render**(`cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `areaModel`, `_cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `rowIndex` | `number` | row in the area (as displayed) |
| `columnIndex` | `number` | column index (west + center + east) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `areaModel` | [`AreaModelObjectArray`](AreaModelObjectArray.md)\<`T`\> | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `_cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Implementation of

[CellRendererIf](../interfaces/CellRendererIf.md).[render](../interfaces/CellRendererIf.md#render)

#### Defined in

[src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/checkbox-boolean-property-cell-renderer.ts#L21)
