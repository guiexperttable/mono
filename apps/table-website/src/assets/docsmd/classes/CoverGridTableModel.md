[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridTableModel

# Class: CoverGridTableModel\<T\>

## Type parameters

| Name |
| :------ |
| `T` |

## Implements

- [`TableModelIf`](../interfaces/TableModelIf.md)

## Table of contents

### Constructors

- [constructor](CoverGridTableModel.md#constructor)

### Properties

- [bodyModel](CoverGridTableModel.md#bodymodel)
- [paddingTop](CoverGridTableModel.md#paddingtop)

### Methods

- [changeColumnOrder](CoverGridTableModel.md#changecolumnorder)
- [doSort](CoverGridTableModel.md#dosort)
- [externalFilterChanged](CoverGridTableModel.md#externalfilterchanged)
- [getAreaModel](CoverGridTableModel.md#getareamodel)
- [getBodyModel](CoverGridTableModel.md#getbodymodel)
- [getBodyRowByIndex](CoverGridTableModel.md#getbodyrowbyindex)
- [getColumnCount](CoverGridTableModel.md#getcolumncount)
- [getColumnDef](CoverGridTableModel.md#getcolumndef)
- [getColumnDefs](CoverGridTableModel.md#getcolumndefs)
- [getColumnProperty](CoverGridTableModel.md#getcolumnproperty)
- [getColumnWidth](CoverGridTableModel.md#getcolumnwidth)
- [getContentHeightInPixel](CoverGridTableModel.md#getcontentheightinpixel)
- [getContentWidthInPixel](CoverGridTableModel.md#getcontentwidthinpixel)
- [getFixedLeftColumnCount](CoverGridTableModel.md#getfixedleftcolumncount)
- [getFixedRightColumnCount](CoverGridTableModel.md#getfixedrightcolumncount)
- [getPadding](CoverGridTableModel.md#getpadding)
- [getRowHeight](CoverGridTableModel.md#getrowheight)
- [getSelectionModel](CoverGridTableModel.md#getselectionmodel)
- [getTableScope](CoverGridTableModel.md#gettablescope)
- [getXPosByColumnIndex](CoverGridTableModel.md#getxposbycolumnindex)
- [init](CoverGridTableModel.md#init)
- [isFooterVisibe](CoverGridTableModel.md#isfootervisibe)
- [isHeaderVisibe](CoverGridTableModel.md#isheadervisibe)
- [isRowCheckboxVisible](CoverGridTableModel.md#isrowcheckboxvisible)
- [isSortable](CoverGridTableModel.md#issortable)
- [recalcHeightAndPadding](CoverGridTableModel.md#recalcheightandpadding)
- [recalcPadding](CoverGridTableModel.md#recalcpadding)
- [recalcSize](CoverGridTableModel.md#recalcsize)
- [setColumnWidth](CoverGridTableModel.md#setcolumnwidth)
- [setParentWidth](CoverGridTableModel.md#setparentwidth)
- [setTableScope](CoverGridTableModel.md#settablescope)
- [sort](CoverGridTableModel.md#sort)

## Constructors

### constructor

• **new CoverGridTableModel**\<`T`\>(`bodyModel`, `paddingTop?`): [`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `bodyModel` | [`CoverGridBodyModel`](CoverGridBodyModel.md)\<`T`\> | `undefined` |
| `paddingTop` | `number` | `0` |

#### Returns

[`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L21)

## Properties

### bodyModel

• **bodyModel**: [`CoverGridBodyModel`](CoverGridBodyModel.md)\<`T`\>

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L22)

___

### paddingTop

• **paddingTop**: `number` = `0`

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L23)

## Methods

### changeColumnOrder

▸ **changeColumnOrder**(`_sourceColumnIndex`, `_targetColumnIndex`): `void`

Moves a column from the source column index to the target column index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_sourceColumnIndex` | `number` | The index of the column to be moved. |
| `_targetColumnIndex` | `number` | The index where the column will be moved to. |

#### Returns

`void`

- This method does not return anything.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[changeColumnOrder](../interfaces/TableModelIf.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L27)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts an array of SortItem objects based on a predetermined sorting algorithm.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | An array of SortItem objects to be sorted. |

#### Returns

`boolean`

- Returns true if the sorting was successful, false otherwise.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[doSort](../interfaces/TableModelIf.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L137)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`T`\>(`predictFn`): `void`

This is triggered when an external filter has changed.

#### Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of elements being filtered. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`T`\> | A function that takes an element of type T and returns a boolean indicating whether the element satisfies the filter conditions. |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[externalFilterChanged](../interfaces/TableModelIf.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L133)

___

### getAreaModel

▸ **getAreaModel**(`rowAreaIdent`): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the area model based on the given row area identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the row area. |

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The area model corresponding to the provided row area identifier.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getAreaModel](../interfaces/TableModelIf.md#getareamodel)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L51)

___

### getBodyModel

▸ **getBodyModel**(): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the body model.

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The body model representing an area.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getBodyModel](../interfaces/TableModelIf.md#getbodymodel)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L57)

___

### getBodyRowByIndex

▸ **getBodyRowByIndex**(`rowIndex`): `any`

Retrieves the body row at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the desired body row. |

#### Returns

`any`

- The body row object at the specified index.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getBodyRowByIndex](../interfaces/TableModelIf.md#getbodyrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L97)

___

### getColumnCount

▸ **getColumnCount**(): `number`

Returns the number of columns in a dataset.

#### Returns

`number`

The number of columns in the dataset.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getColumnCount](../interfaces/TableModelIf.md#getcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L43)

___

### getColumnDef

▸ **getColumnDef**(`_index`): `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

Retrieves the column definition for the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_index` | `number` | The index of the column to retrieve the definition for. |

#### Returns

`undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

- The column definition for the specified index, or undefined if not found.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getColumnDef](../interfaces/TableModelIf.md#getcolumndef)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L85)

___

### getColumnDefs

▸ **getColumnDefs**(): `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[]

Retrieves the column definitions for a table.

#### Returns

`undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[]

An array of column definitions or undefined if there are no column definitions.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getColumnDefs](../interfaces/TableModelIf.md#getcolumndefs)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L89)

___

### getColumnProperty

▸ **getColumnProperty**(`_columnIndex`): `string`

Retrieves the property of a specific column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_columnIndex` | `number` | The index of the column. |

#### Returns

`string`

The property of the column.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getColumnProperty](../interfaces/TableModelIf.md#getcolumnproperty)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L93)

___

### getColumnWidth

▸ **getColumnWidth**(`_columnIndex`): `number`

Retrieves the width (in pixels) of a specific column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_columnIndex` | `number` | The index of the column to get the width of. |

#### Returns

`number`

The width of the specified column.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getColumnWidth](../interfaces/TableModelIf.md#getcolumnwidth)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L101)

___

### getContentHeightInPixel

▸ **getContentHeightInPixel**(): `number`

Retrieves the content height in pixels.

#### Returns

`number`

The height of the content in pixels.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getContentHeightInPixel](../interfaces/TableModelIf.md#getcontentheightinpixel)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L125)

___

### getContentWidthInPixel

▸ **getContentWidthInPixel**(): `number`

Returns the content width in pixels.

#### Returns

`number`

The width of the content in pixels.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getContentWidthInPixel](../interfaces/TableModelIf.md#getcontentwidthinpixel)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L129)

___

### getFixedLeftColumnCount

▸ **getFixedLeftColumnCount**(): `number`

Retrieves the number of fixed left columns.

#### Returns

`number`

The count of fixed left columns.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getFixedLeftColumnCount](../interfaces/TableModelIf.md#getfixedleftcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L61)

___

### getFixedRightColumnCount

▸ **getFixedRightColumnCount**(): `number`

Retrieves the count of fixed right columns.

#### Returns

`number`

The count of fixed right columns.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getFixedRightColumnCount](../interfaces/TableModelIf.md#getfixedrightcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L65)

___

### getPadding

▸ **getPadding**(): [`Padding`](Padding.md)

Retrieves the padding value of the element.

#### Returns

[`Padding`](Padding.md)

The padding value of the element.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getPadding](../interfaces/TableModelIf.md#getpadding)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L121)

___

### getRowHeight

▸ **getRowHeight**(`_rowAreaIdent`, `rowIndex`): `number`

Retrieves the height of a specific row in the provided row area.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the row area. |
| `rowIndex` | `number` | The index of the row for which to retrieve the height. |

#### Returns

`number`

The height of the specified row in pixels.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getRowHeight](../interfaces/TableModelIf.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L81)

___

### getSelectionModel

▸ **getSelectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Retrieves the selection model associated with the component.

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The selection model instance if available, or undefined if none is found.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getSelectionModel](../interfaces/TableModelIf.md#getselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L145)

___

### getTableScope

▸ **getTableScope**(): `undefined` \| [`TableScope`](TableScope.md)

#### Returns

`undefined` \| [`TableScope`](TableScope.md)

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getTableScope](../interfaces/TableModelIf.md#gettablescope)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L153)

___

### getXPosByColumnIndex

▸ **getXPosByColumnIndex**(`columnIndex`): `number`

Returns the x position corresponding to the given column index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column. |

#### Returns

`number`

- The x position corresponding to the given column index.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[getXPosByColumnIndex](../interfaces/TableModelIf.md#getxposbycolumnindex)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L47)

___

### init

▸ **init**(): `void`

Triggered by TableScope.firstInit() after the table tag is attached to the dom.

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[init](../interfaces/TableModelIf.md#init)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L35)

___

### isFooterVisibe

▸ **isFooterVisibe**(): `boolean`

Checks if the footer is visible.

#### Returns

`boolean`

Returns true if the footer is visible, otherwise returns false.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[isFooterVisibe](../interfaces/TableModelIf.md#isfootervisibe)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L73)

___

### isHeaderVisibe

▸ **isHeaderVisibe**(): `boolean`

Checks if the header is visible.

#### Returns

`boolean`

- Returns true if the header is visible, false otherwise.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[isHeaderVisibe](../interfaces/TableModelIf.md#isheadervisibe)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L69)

___

### isRowCheckboxVisible

▸ **isRowCheckboxVisible**(): `boolean`

Determines if the row checkbox is visible.

#### Returns

`boolean`

True if the row checkbox is visible, false otherwise.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[isRowCheckboxVisible](../interfaces/TableModelIf.md#isrowcheckboxvisible)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L77)

___

### isSortable

▸ **isSortable**(`_colIdx`): `boolean`

Checks if a column at the specified index is sortable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_colIdx` | `number` | The index of the column to check. |

#### Returns

`boolean`

- true if the column is sortable, false otherwise.

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[isSortable](../interfaces/TableModelIf.md#issortable)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L31)

___

### recalcHeightAndPadding

▸ **recalcHeightAndPadding**(): `void`

Recalculates the height and padding of an element.

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[recalcHeightAndPadding](../interfaces/TableModelIf.md#recalcheightandpadding)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L117)

___

### recalcPadding

▸ **recalcPadding**(): `void`

Recalculates the padding of the element based on its content.
This method updates the padding of the element to ensure that its content
is properly aligned and displayed.

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[recalcPadding](../interfaces/TableModelIf.md#recalcpadding)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L113)

___

### recalcSize

▸ **recalcSize**(`_clientWidth`): `void`

Recalculates the size of the element based on the provided client width.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_clientWidth` | `number` | The current client width of the element. |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[recalcSize](../interfaces/TableModelIf.md#recalcsize)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L109)

___

### setColumnWidth

▸ **setColumnWidth**(`_columnIndex`, `width`): `void`

Sets the width of a column in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_columnIndex` | `number` | The index of the column to set the width for. |
| `width` | `number` | The width to set for the column, in pixels. |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[setColumnWidth](../interfaces/TableModelIf.md#setcolumnwidth)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L105)

___

### setParentWidth

▸ **setParentWidth**(`widthInPixel`): `void`

Recalculates the column widths of the table.

#### Parameters

| Name | Type |
| :------ | :------ |
| `widthInPixel` | `number` |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[setParentWidth](../interfaces/TableModelIf.md#setparentwidth)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L39)

___

### setTableScope

▸ **setTableScope**(`tableScope`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[setTableScope](../interfaces/TableModelIf.md#settablescope)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L149)

___

### sort

▸ **sort**(`compareFn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `compareFn` | (`a`: `any`, `b`: `any`) => `number` |

#### Returns

`void`

#### Implementation of

[TableModelIf](../interfaces/TableModelIf.md).[sort](../interfaces/TableModelIf.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/cover-grid-table-model.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/cover-grid-table-model.ts#L141)
