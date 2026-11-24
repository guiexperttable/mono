[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterMenuService

# Class: ColumnFilterMenuService

Per-column filter menu popup ([TableOptionsIf.columnFilterMenu](../interfaces/TableOptionsIf.md#columnfiltermenu)): renders the funnel button in every
filterable header cell and opens a top-layer [FilterPopupShell](FilterPopupShell.md) with comparison operators, condition input(s)
and a searchable, virtualized distinct-values checkbox list.

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](ColumnFilterMenuService.md#constructor)

### Properties

- [options](ColumnFilterMenuService.md#options)

### Methods

- [close](ColumnFilterMenuService.md#close)
- [decorateHeaderCell](ColumnFilterMenuService.md#decorateheadercell)
- [destroy](ColumnFilterMenuService.md#destroy)
- [getOpenColumnIndex](ColumnFilterMenuService.md#getopencolumnindex)
- [hasHeaderButtons](ColumnFilterMenuService.md#hasheaderbuttons)
- [isActive](ColumnFilterMenuService.md#isactive)
- [isInPopup](ColumnFilterMenuService.md#isinpopup)
- [isOpen](ColumnFilterMenuService.md#isopen)
- [open](ColumnFilterMenuService.md#open)
- [toggle](ColumnFilterMenuService.md#toggle)

## Constructors

### constructor

• **new ColumnFilterMenuService**(`scope`, `options`, `showHeaderButtons?`): [`ColumnFilterMenuService`](ColumnFilterMenuService.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) | `undefined` |
| `options` | [`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md) | `undefined` |
| `showHeaderButtons` | `boolean` | `true` |

#### Returns

[`ColumnFilterMenuService`](ColumnFilterMenuService.md)

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L112)

## Properties

### options

• `Readonly` **options**: [`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L114)

## Methods

### close

▸ **close**(`reason?`): `void`

Closes the currently open filter menu popup, if any.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `reason` | [`FilterPopupCloseReason`](../modules.md#filterpopupclosereason) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L263)

___

### decorateHeaderCell

▸ **decorateHeaderCell**(`cell`, `rowIndex`, `columnIndex`): `void`

Appends the funnel button to a lowest-row header cell when the column is filterable.
Called from `RenderScope.renderCell()`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `cell` | `HTMLDivElement` |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L158)

___

### destroy

▸ **destroy**(): `void`

Releases timers, listeners and popup DOM.

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:270](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L270)

___

### getOpenColumnIndex

▸ **getOpenColumnIndex**(): `number`

Column index whose menu is currently open, or `-1`.

#### Returns

`number`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L145)

___

### hasHeaderButtons

▸ **hasHeaderButtons**(): `boolean`

Whether header cells should render the funnel button (true when `tableOptions.columnFilterMenu` is enabled).

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L135)

___

### isActive

▸ **isActive**(): `boolean`

Whether the filter menu feature is active for this table.

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L130)

___

### isInPopup

▸ **isInPopup**(`evt`): `boolean`

True if a DOM event originated inside the open filter menu popup.

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `Event` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L150)

___

### isOpen

▸ **isOpen**(): `boolean`

Whether a column filter menu popup is currently open.

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L140)

___

### open

▸ **open**(`column`): `boolean`

Opens the filter menu popup anchored to the given column's header cell / funnel button.
Returns `false` if the column does not exist, is hidden, or is not filterable.

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L210)

___

### toggle

▸ **toggle**(`column`): `boolean`

Toggles the filter menu for `column` (closes if already open for the same column).

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-menu-service.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-menu-service.ts#L194)
