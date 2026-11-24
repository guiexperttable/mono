[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnChooserService

# Class: ColumnChooserService

Column visibility chooser popup ([TableApi.showColumnChooser](TableApi.md#showcolumnchooser) / [TableApi.hideColumnChooser](TableApi.md#hidecolumnchooser)).

Reuses [FilterPopupShell](FilterPopupShell.md) (`popover="manual"` with fallback), lists columns in current display order
(excluding [RowNumberColumnDef](RowNumberColumnDef.md) and [CheckboxColumnDef](CheckboxColumnDef.md)), respects [ColumnDefIf.hideable](../interfaces/ColumnDefIf.md#hideable),
prevents hiding the last visible column, and persists changes through `TableScope.setColumnVisible` (`"columns"` state).

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](ColumnChooserService.md#constructor)

### Methods

- [close](ColumnChooserService.md#close)
- [destroy](ColumnChooserService.md#destroy)
- [isInPopup](ColumnChooserService.md#isinpopup)
- [isOpen](ColumnChooserService.md#isopen)
- [open](ColumnChooserService.md#open)

## Constructors

### constructor

• **new ColumnChooserService**(`scope`): [`ColumnChooserService`](ColumnChooserService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`ColumnChooserService`](ColumnChooserService.md)

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L33)

## Methods

### close

▸ **close**(`reason?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `reason` | [`FilterPopupCloseReason`](../modules.md#filterpopupclosereason) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L79)

___

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L83)

___

### isInPopup

▸ **isInPopup**(`evt`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `Event` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L41)

___

### isOpen

▸ **isOpen**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L37)

___

### open

▸ **open**(`anchor?`): `void`

Opens the column chooser popup anchored to `anchor` (or the inline-end header edge of the table if omitted).
Calling `open` with the same anchor while already open toggles it closed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `anchor?` | `HTMLElement` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-chooser-service.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-chooser-service.ts#L49)
