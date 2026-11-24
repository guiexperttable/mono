[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FilterRowService

# Class: FilterRowService

Persistent filter row below the column titles ([TableOptionsIf.filterRow](../interfaces/TableOptionsIf.md#filterrow)).

Lives in its own `ge-table-filter-row-layer` inside the table host so virtual header re-renders (live data,
sorting, scrolling) never rebuild the `<input>` elements or lose focus, caret position or IME composition.
Only visible columns are kept in the DOM; a focused input that scrolls out of view is parked with
`clip-path: inset(100%)` instead of detached.

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](FilterRowService.md#constructor)

### Properties

- [options](FilterRowService.md#options)

### Methods

- [destroy](FilterRowService.md#destroy)
- [focusActiveOrFirstColumn](FilterRowService.md#focusactiveorfirstcolumn)
- [focusColumn](FilterRowService.md#focuscolumn)
- [getReservedHeight](FilterRowService.md#getreservedheight)
- [getVisibleOption](FilterRowService.md#getvisibleoption)
- [isInLayer](FilterRowService.md#isinlayer)
- [isVisible](FilterRowService.md#isvisible)
- [setVisible](FilterRowService.md#setvisible)
- [syncFromFilters](FilterRowService.md#syncfromfilters)
- [update](FilterRowService.md#update)

## Constructors

### constructor

• **new FilterRowService**(`scope`, `options`): [`FilterRowService`](FilterRowService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |
| `options` | [`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md) |

#### Returns

[`FilterRowService`](FilterRowService.md)

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L90)

## Properties

### options

• `Readonly` **options**: [`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L92)

## Methods

### destroy

▸ **destroy**(): `void`

Releases all timers, event listeners and DOM nodes.

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L336)

___

### focusActiveOrFirstColumn

▸ **focusActiveOrFirstColumn**(`preferredColumnIndex?`): `boolean`

Focuses the filter input of `columnIndex`, or falls back to the first shown filterable column.

#### Parameters

| Name | Type |
| :------ | :------ |
| `preferredColumnIndex?` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:319](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L319)

___

### focusColumn

▸ **focusColumn**(`columnIndex`): `boolean`

Focuses the filter input of the given column index (scrolling it into view first if needed).
Returns `false` if the filter row is hidden or the column is not filterable/visible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:295](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L295)

___

### getReservedHeight

▸ **getReservedHeight**(): `number`

Extra height (px) reserved in `TableModel.recalcPadding()` below the header rows.

#### Returns

`number`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L128)

___

### getVisibleOption

▸ **getVisibleOption**(): `boolean`

Configured visibility flag (independent of `setHeaderVisible(false)`).

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L123)

___

### isInLayer

▸ **isInLayer**(`evt`): `boolean`

True if a DOM event originated inside the filter row layer (used for event isolation without `stopPropagation`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `Event` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L146)

___

### isVisible

▸ **isVisible**(): `boolean`

Whether the filter row is currently shown (configured, supported, visible and header is visible).

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L118)

___

### setVisible

▸ **setVisible**(`visible`): `boolean`

Shows or hides the filter row without clearing active filters; returns `true` if visibility changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `visible` | `boolean` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L133)

___

### syncFromFilters

▸ **syncFromFilters**(`source`): `void`

Synchronizes mounted filter inputs after a filter state change.
Changes from `"row"` leave the currently focused input untouched so caret and live typing never jump.

#### Parameters

| Name | Type |
| :------ | :------ |
| `source` | [`GeFilterEventSource`](../modules.md#gefiltereventsource) |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:266](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L266)

___

### update

▸ **update**(): `void`

Positions the filter row layer and virtualizes visible column cells in the same frame as `RenderScope`.
Called from `TableScope.afterRenderPass()`.

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-row-service.ts:161](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-row-service.ts#L161)
