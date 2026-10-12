[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellRendererIf

# Interface: CellRendererIf

Decides how a cell **looks** – the value stays the same for sorting, filtering, copy and Excel export.
Assign it per column and area (`columnDef.rendererMap.body = …`, or `bodyRenderer` in [ColumnDef.create](../classes/ColumnDef.md#create))
or return it from [AreaModelIf.getCellRenderer](AreaModelIf.md#getcellrenderer).

Renderers are called only for visible cells, on every repaint – keep them cheap.

**`Example`**

```ts
class StatusBadgeRenderer implements CellRendererIf {
  render(cellDiv: HTMLDivElement, rowIndex: number, columnIndex: number, areaIdent: AreaIdent,
         areaModel: AreaModelIf, cellValue: string, dom: DomServiceIf): RendererCleanupFnType | undefined {
    const badge = dom.createElement<HTMLSpanElement>("span");
    dom.addClass(badge, `status-${cellValue}`);
    badge.textContent = cellValue;
    dom.appendChild(cellDiv, badge);
    return undefined;                       // or a cleanup function (listeners, timers …)
  }
}
columnDefs[9].rendererMap.body = new StatusBadgeRenderer();
```

**`See`**

Training: [Cell renderers](https://gui.expert/training/cell-renderers/),
  [Framework components as cells](https://gui.expert/training/framework-components/)

## Implemented by

- [`ActionsCellRenderer`](../classes/ActionsCellRenderer.md)
- [`CellGroupExtCellRenderer`](../classes/CellGroupExtCellRenderer.md)
- [`CheckboxBooleanPropertyCellRenderer`](../classes/CheckboxBooleanPropertyCellRenderer.md)
- [`CheckboxCellRenderer`](../classes/CheckboxCellRenderer.md)
- [`DateToIntlDDMMYYYYCellRenderer`](../classes/DateToIntlDDMMYYYYCellRenderer.md)
- [`DateToIsoCellRenderer`](../classes/DateToIsoCellRenderer.md)
- [`DateToLocaleDateCellRenderer`](../classes/DateToLocaleDateCellRenderer.md)
- [`DateToTecCellRenderer`](../classes/DateToTecCellRenderer.md)
- [`InputCellRenderer`](../classes/InputCellRenderer.md)
- [`MaleFemaleToIconCellRenderer`](../classes/MaleFemaleToIconCellRenderer.md)
- [`NumberCellProgressBarCellRenderer`](../classes/NumberCellProgressBarCellRenderer.md)
- [`NumberCellRenderer`](../classes/NumberCellRenderer.md)
- [`PositiveAndNegativeNumberRenderer`](../classes/PositiveAndNegativeNumberRenderer.md)
- [`ProgressBarCellRenderer`](../classes/ProgressBarCellRenderer.md)
- [`SelectCellRenderer`](../classes/SelectCellRenderer.md)
- [`SimpleArrayCellRenderer`](../classes/SimpleArrayCellRenderer.md)
- [`StarRatingCellRenderer`](../classes/StarRatingCellRenderer.md)
- [`TrueFalseCellRenderer`](../classes/TrueFalseCellRenderer.md)

## Table of contents

### Methods

- [render](CellRendererIf.md#render)

## Methods

### render

▸ **render**(`cellDiv`, `rowIndex`, `columnIndex`, `areaIdent`, `areaModel`, `cellValue`, `domService`): `undefined` \| `Function`

Fills the (empty) cell element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellDiv` | `HTMLDivElement` | the cell element, already positioned and sized |
| `rowIndex` | `number` | row in the area (as displayed) |
| `columnIndex` | `number` | column index (west + center + east) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"header"`, `"body"` or `"footer"` |
| `areaModel` | [`AreaModelIf`](AreaModelIf.md) | the model of this area (e.g. for `getRowByIndex(rowIndex)`) |
| `cellValue` | `any` | the value of the cell (`areaModel.getValueAt(rowIndex, columnIndex)`) |
| `domService` | [`DomServiceIf`](DomServiceIf.md) | create and change elements through it (works with Angular's Renderer2, too) |

#### Returns

`undefined` \| `Function`

optionally a cleanup function, called before the cell is drawn again

#### Defined in

[src/lib/table/renderer/cell-render.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/renderer/cell-render.if.ts#L45)
