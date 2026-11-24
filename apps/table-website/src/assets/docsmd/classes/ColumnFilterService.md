[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterService

# Class: ColumnFilterService

Manages built-in column filters for one [TableScope](TableScope.md) (`tableScope.columnFilterService`):
holds the active [ColumnFiltersMap](../modules.md#columnfiltersmap), compiles them into a single row predicate combined with
`tableOptions.externalFilterFunction`, caches inferred column types, updates the table state and fires
[EventListenerIf.onFilterChanged](../interfaces/EventListenerIf.md#onfilterchanged).

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](ColumnFilterService.md#constructor)

### Methods

- [applyStateFilters](ColumnFilterService.md#applystatefilters)
- [clearColumnFilters](ColumnFilterService.md#clearcolumnfilters)
- [collectColumnDistinctValues](ColumnFilterService.md#collectcolumndistinctvalues)
- [getColumnFilter](ColumnFilterService.md#getcolumnfilter)
- [getColumnFilterType](ColumnFilterService.md#getcolumnfiltertype)
- [getColumnFilters](ColumnFilterService.md#getcolumnfilters)
- [getEffectiveFilterFunction](ColumnFilterService.md#geteffectivefilterfunction)
- [getOptions](ColumnFilterService.md#getoptions)
- [getOtherFilters](ColumnFilterService.md#getotherfilters)
- [getTexts](ColumnFilterService.md#gettexts)
- [hasActiveFilters](ColumnFilterService.md#hasactivefilters)
- [invalidateTypeCache](ColumnFilterService.md#invalidatetypecache)
- [isBodyFilterable](ColumnFilterService.md#isbodyfilterable)
- [isColumnFilterable](ColumnFilterService.md#iscolumnfilterable)
- [isColumnFiltered](ColumnFilterService.md#iscolumnfiltered)
- [onRowsReplaced](ColumnFilterService.md#onrowsreplaced)
- [resolveColumn](ColumnFilterService.md#resolvecolumn)
- [setColumnFilter](ColumnFilterService.md#setcolumnfilter)
- [setColumnFilters](ColumnFilterService.md#setcolumnfilters)

## Constructors

### constructor

• **new ColumnFilterService**(`scope`): [`ColumnFilterService`](ColumnFilterService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`ColumnFilterService`](ColumnFilterService.md)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L102)

## Methods

### applyStateFilters

▸ **applyStateFilters**(`raw`, `runFilterNow`): `boolean`

Restores filters from [TableStateService](TableStateService.md) (during `firstInit()` or `applyState()`).
Unknown column properties are ignored. Returns `true` if the filter set changed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `raw` | `unknown` |
| `runFilterNow` | `boolean` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:277](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L277)

___

### clearColumnFilters

▸ **clearColumnFilters**(`source?`): `void`

Clears all active column filters.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `source` | [`GeFilterEventSource`](../modules.md#gefiltereventsource) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:266](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L266)

___

### collectColumnDistinctValues

▸ **collectColumnDistinctValues**(`column`, `options?`): [`DistinctValuesResultIf`](../interfaces/DistinctValuesResultIf.md)

Collects distinct values of one column over all source rows filtered by all **other** active filters
(Excel-style cascading values for the filter menu).

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |
| `options` | [`CollectDistinctValuesOptionsIf`](../interfaces/CollectDistinctValuesOptionsIf.md) |

#### Returns

[`DistinctValuesResultIf`](../interfaces/DistinctValuesResultIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:358](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L358)

___

### getColumnFilter

▸ **getColumnFilter**(`column`): `undefined` \| [`ColumnFilterIf`](../interfaces/ColumnFilterIf.md)

Gets the filter of one column (copy), or `undefined` if unfiltered.

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

`undefined` \| [`ColumnFilterIf`](../interfaces/ColumnFilterIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:207](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L207)

___

### getColumnFilterType

▸ **getColumnFilterType**(`columnIndex`, `property`, `columnDef?`): [`ColumnFilterType`](../modules.md#columnfiltertype)

Returns the effective [ColumnFilterType](../modules.md#columnfiltertype) of a column (explicit or inferred and cached).

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |
| `property` | `string` |
| `columnDef?` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

[`ColumnFilterType`](../modules.md#columnfiltertype)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:331](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L331)

___

### getColumnFilters

▸ **getColumnFilters**(): [`ColumnFiltersMap`](../modules.md#columnfiltersmap)

Returns a shallow/serialized copy of all active column filters.

#### Returns

[`ColumnFiltersMap`](../modules.md#columnfiltersmap)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:217](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L217)

___

### getEffectiveFilterFunction

▸ **getEffectiveFilterFunction**(): `undefined` \| [`FilterFunction`](../modules.md#filterfunction)\<`any`\>

Returns the effective [FilterFunction](../modules.md#filterfunction) combining `tableOptions.externalFilterFunction` and all active
column filters with AND. When no column filters are active (or `managed: false`), returns
`tableOptions.externalFilterFunction` directly (bit-identical to before 1.1.114).

#### Returns

`undefined` \| [`FilterFunction`](../modules.md#filterfunction)\<`any`\>

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L298)

___

### getOptions

▸ **getOptions**(): [`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)

#### Returns

[`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L104)

___

### getOtherFilters

▸ **getOtherFilters**(`excludeProperty`): [`ColumnFiltersMap`](../modules.md#columnfiltersmap)

Snapshot of all filters excluding `excludeProperty`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `excludeProperty` | `string` |

#### Returns

[`ColumnFiltersMap`](../modules.md#columnfiltersmap)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:381](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L381)

___

### getTexts

▸ **getTexts**(): [`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)

#### Returns

[`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L108)

___

### hasActiveFilters

▸ **hasActiveFilters**(): `boolean`

True if at least one column filter is active.

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L136)

___

### invalidateTypeCache

▸ **invalidateTypeCache**(): `void`

Clears cached column types (called after `setRows` or model changes).

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:314](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L314)

___

### isBodyFilterable

▸ **isBodyFilterable**(): `boolean`

True if the body model supports client-side filtering.

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L141)

___

### isColumnFilterable

▸ **isColumnFilterable**(`columnIndex`): `boolean`

True if the column at `columnIndex` can be filtered by the user (filter row / filter menu).

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L113)

___

### isColumnFiltered

▸ **isColumnFiltered**(`column`): `boolean`

True if the column has an active filter.

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L222)

___

### onRowsReplaced

▸ **onRowsReplaced**(): `void`

Called by `TableApi.setRows()`: invalidates cached types and re-applies active column filters to the new rows.

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:320](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L320)

___

### resolveColumn

▸ **resolveColumn**(`column`): `undefined` \| \{ `columnDef?`: [`ColumnDefIf`](../interfaces/ColumnDefIf.md) ; `columnIndex`: `number` ; `property`: `string`  }

Resolves a column index, property string, `#<index>` key, or `ColumnDefIf`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |

#### Returns

`undefined` \| \{ `columnDef?`: [`ColumnDefIf`](../interfaces/ColumnDefIf.md) ; `columnIndex`: `number` ; `property`: `string`  }

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L146)

___

### setColumnFilter

▸ **setColumnFilter**(`column`, `filter`, `source?`): `void`

Sets or clears the filter of a single column, runs 1 filter pass + 1 render + 1 `onFilterChanged`.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | `undefined` |
| `filter` | `undefined` \| [`ColumnFilterIf`](../interfaces/ColumnFilterIf.md) | `undefined` |
| `source` | [`GeFilterEventSource`](../modules.md#gefiltereventsource) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L228)

___

### setColumnFilters

▸ **setColumnFilters**(`filters`, `source?`): `void`

Replaces all column filters in one batch (1 filter pass, 1 render, 1 `onFilterChanged`).

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `filters` | [`ColumnFiltersMap`](../modules.md#columnfiltersmap) | `undefined` |
| `source` | [`GeFilterEventSource`](../modules.md#gefiltereventsource) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/column-filter-service.ts:248](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-service.ts#L248)
