[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MasterDetailService

# Class: MasterDetailService

Master/detail of a table ([TableOptionsIf.masterDetail](../interfaces/TableOptionsIf.md#masterdetail)): the expanded master rows, the detail layer and the
life cycle of the detail contents. Created by [TableScope](TableScope.md) (`tableScope.masterDetailService`); use the
[TableApi](TableApi.md) (`setDetailExpanded`, `toggleDetail` …).

- **Layer**: one div `ge-table-detail-layer` in the host, over the body (full width, fixed columns included, without
  the scroll bars). It is never cleared by the virtual rendering and does not scroll horizontally.
- **Positions**: the heights of the detail rows are extras of the body [RowLayout](RowLayout.md) (behind their master row);
  `RenderScope` reports the detail rows in view after every render pass ([layoutVisible](MasterDetailService.md#layoutvisible)).
- **Life cycle**: the content is created when the detail row becomes visible, hidden (not destroyed) when it scrolls
  out of view, destroyed when it is collapsed, beyond `maxRenderedDetails` or when the table is destroyed.
- **Events**: mouse, keyboard and pointer events from a detail row are ignored by the outer table
  ([isInLayer](MasterDetailService.md#isinlayer)); the mouse wheel over a detail row scrolls the outer table when nothing in the detail scrolls.

**`Since`**

1.1.97

## Table of contents

### Constructors

- [constructor](MasterDetailService.md#constructor)

### Properties

- [options](MasterDetailService.md#options)

### Methods

- [collapseAll](MasterDetailService.md#collapseall)
- [computeExtras](MasterDetailService.md#computeextras)
- [decorateCell](MasterDetailService.md#decoratecell)
- [destroy](MasterDetailService.md#destroy)
- [expandAll](MasterDetailService.md#expandall)
- [getDetailElement](MasterDetailService.md#getdetailelement)
- [getExpandedRows](MasterDetailService.md#getexpandedrows)
- [getLayer](MasterDetailService.md#getlayer)
- [getMasterRowIndexOf](MasterDetailService.md#getmasterrowindexof)
- [hasExpanded](MasterDetailService.md#hasexpanded)
- [isActive](MasterDetailService.md#isactive)
- [isExpanded](MasterDetailService.md#isexpanded)
- [isExpandedAt](MasterDetailService.md#isexpandedat)
- [isInLayer](MasterDetailService.md#isinlayer)
- [isMasterAt](MasterDetailService.md#ismasterat)
- [keyOf](MasterDetailService.md#keyof)
- [layoutVisible](MasterDetailService.md#layoutvisible)
- [refresh](MasterDetailService.md#refresh)
- [setBounds](MasterDetailService.md#setbounds)
- [setExpanded](MasterDetailService.md#setexpanded)
- [setExpandedRows](MasterDetailService.md#setexpandedrows)
- [startRenderPass](MasterDetailService.md#startrenderpass)

## Constructors

### constructor

• **new MasterDetailService**(`scope`, `createNestedScope`): [`MasterDetailService`](MasterDetailService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |
| `createNestedScope` | [`NestedTableScopeFactory`](../modules.md#nestedtablescopefactory) |

#### Returns

[`MasterDetailService`](MasterDetailService.md)

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L103)

## Properties

### options

• `Readonly` **options**: [`MasterDetailOptionsIf`](../interfaces/MasterDetailOptionsIf.md)\<`any`\>

The complete options (defaults + `tableOptions.masterDetail`).

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L90)

## Methods

### collapseAll

▸ **collapseAll**(): `number`

Collapses all detail rows (their contents are destroyed). No event per row.

#### Returns

`number`

the number of rows that were collapsed

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L311)

___

### computeExtras

▸ **computeExtras**(): `undefined` \| \{ `heights`: `number`[] ; `rowIndices`: `number`[]  }

The display indices and heights of the expanded master rows that are shown – the extras of the body row layout.
Called by `RenderScope` when the row layout is built (after filtering, sorting, editing, a detail toggle …): one
pass over the shown rows. Removes expanded rows that no longer exist in the model (`getAllRows()`).

#### Returns

`undefined` \| \{ `heights`: `number`[] ; `rowIndices`: `number`[]  }

the extras, `undefined` without expanded rows

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:417](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L417)

___

### decorateCell

▸ **decorateCell**(`cell`, `rowIndex`, `columnIndex`): `void`

Decorates a body cell of the toggle column of a master row with the expand icon (`ge-table-detail-toggle`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cell` | `HTMLDivElement` | the rendered cell |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model column index |

#### Returns

`void`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:530](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L530)

___

### destroy

▸ **destroy**(): `void`

Called when the table is destroyed: destroys all detail contents and removes the layer.

#### Returns

`void`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:554](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L554)

___

### expandAll

▸ **expandAll**(): `number`

Expands all master rows that are shown (their contents are created only when they scroll into view).
No event per row.

#### Returns

`number`

the number of rows that were expanded

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L282)

___

### getDetailElement

▸ **getDetailElement**(`rowOrIndex`): `undefined` \| `HTMLDivElement`

The container of a detail row (the element `detailRenderer` renders into) – only while its content exists.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | display index or row object |

#### Returns

`undefined` \| `HTMLDivElement`

the container

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:385](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L385)

___

### getExpandedRows

▸ **getExpandedRows**(): `unknown`[]

The expanded master rows (row objects; for models without row objects: `undefined`).

#### Returns

`unknown`[]

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:322](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L322)

___

### getLayer

▸ **getLayer**(): `undefined` \| `HTMLDivElement`

The detail layer (`undefined` without master/detail).

#### Returns

`undefined` \| `HTMLDivElement`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L133)

___

### getMasterRowIndexOf

▸ **getMasterRowIndexOf**(`node`): `number`

The display index of the master row a DOM node belongs to (a detail row or something in it).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `node` | ``null`` \| `Node` | a node in the detail layer |

#### Returns

`number`

the display index, -1 if none

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:396](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L396)

___

### hasExpanded

▸ **hasExpanded**(): `boolean`

True if at least one master row is expanded.

#### Returns

`boolean`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L128)

___

### isActive

▸ **isActive**(): `boolean`

True if master/detail is configured (and the body is flat).

#### Returns

`boolean`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L123)

___

### isExpanded

▸ **isExpanded**(`rowOrIndex`): `boolean`

True if a row (display index or row object) is expanded.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | display index or row object |

#### Returns

`boolean`

whether its detail row is open

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:225](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L225)

___

### isExpandedAt

▸ **isExpandedAt**(`rowIndex`): `boolean`

True if the master row at a display index is expanded.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |

#### Returns

`boolean`

whether its detail row is open

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:212](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L212)

___

### isInLayer

▸ **isInLayer**(`evt`): `boolean`

True if an event comes from a detail row (or a nested table in it) – the outer table ignores it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `Event` | a DOM event while it is dispatched |

#### Returns

`boolean`

whether its path contains the detail layer

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L143)

___

### isMasterAt

▸ **isMasterAt**(`rowIndex`): `boolean`

True if the row at a display index can be expanded ([MasterDetailOptionsIf.isMaster](../interfaces/MasterDetailOptionsIf.md#ismaster)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |

#### Returns

`boolean`

whether it is a master row

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L186)

___

### keyOf

▸ **keyOf**(`row`, `rowIndex`): `unknown`

The id of a master row: `options.getRowId`, `autoRestoreOptions.getRowId`, the row object or its index.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `unknown` |
| `rowIndex` | `number` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L158)

___

### layoutVisible

▸ **layoutVisible**(`triples`): `void`

Shows the detail rows in view (called by `RenderScope` after the body rows were rendered): creates missing
contents, sets their positions, hides the ones that left the view and destroys the oldest hidden contents beyond
[MasterDetailOptionsIf.maxRenderedDetails](../interfaces/MasterDetailOptionsIf.md#maxrendereddetails).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `triples` | `number`[] | `rowIndex, top, height` of each detail row in view; `top` relative to the body top |

#### Returns

`void`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:470](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L470)

___

### refresh

▸ **refresh**(`rowOrIndex`): `boolean`

Destroys the content of a detail row and creates it again (e.g. after the row's data changed).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | display index or row object |

#### Returns

`boolean`

false if the row is not expanded

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:368](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L368)

___

### setBounds

▸ **setBounds**(`left`, `top`, `width`, `height`): `void`

Position and size of the layer: the visible body including the fixed columns, without the scroll bars.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `left` | `number` | px in the host |
| `top` | `number` | px in the host (below the header) |
| `width` | `number` | px |
| `height` | `number` | px |

#### Returns

`void`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:511](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L511)

___

### setExpanded

▸ **setExpanded**(`rowOrIndex`, `expanded`, `source?`): `boolean`

Expands or collapses a master row. The table repaints and reports the change ([TableScope](TableScope.md)).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | `undefined` | display index or row object |
| `expanded` | `boolean` | `undefined` | the new state |
| `source?` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | `"api"` | what changed it (for the event) |

#### Returns

`boolean`

false if nothing changed (no master row, already in that state, no master/detail)

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:238](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L238)

___

### setExpandedRows

▸ **setExpandedRows**(`rows`, `source?`): `boolean`

Expands exactly these rows and collapses all others – the restore of the table state. Rows that are no master
rows are skipped. No event per row.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rows` | readonly `unknown`[] | `undefined` | row objects of the body model |
| `source?` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | `"api"` | what changed it |

#### Returns

`boolean`

true if something changed

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:334](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L334)

___

### startRenderPass

▸ **startRenderPass**(): `void`

Called at the start of the body render pass: the column of the expand icon.

#### Returns

`void`

#### Defined in

[src/lib/table/master-detail/master-detail-service.ts:459](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/master-detail/master-detail-service.ts#L459)
