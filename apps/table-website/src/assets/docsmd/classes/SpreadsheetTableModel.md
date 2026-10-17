[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SpreadsheetTableModel

# Class: SpreadsheetTableModel

The table model of a spreadsheet ([SpreadsheetFactory](SpreadsheetFactory.md)): its data columns can be inserted and deleted
(`TableApi.insertColumns`).

**`Since`**

1.1.99

## Hierarchy

- [`TableModel`](TableModel.md)

  ↳ **`SpreadsheetTableModel`**

## Table of contents

### Constructors

- [constructor](SpreadsheetTableModel.md#constructor)

### Properties

- [bodyAreaModel](SpreadsheetTableModel.md#bodyareamodel)
- [columnCount](SpreadsheetTableModel.md#columncount)
- [columnDefs](SpreadsheetTableModel.md#columndefs)
- [columnSizes](SpreadsheetTableModel.md#columnsizes)
- [contentHeightInPx](SpreadsheetTableModel.md#contentheightinpx)
- [contentWidthInPx](SpreadsheetTableModel.md#contentwidthinpx)
- [defaultRowHeights](SpreadsheetTableModel.md#defaultrowheights)
- [fixedLeftColumnCount](SpreadsheetTableModel.md#fixedleftcolumncount)
- [fixedRightColumnCount](SpreadsheetTableModel.md#fixedrightcolumncount)
- [footerAreaModel](SpreadsheetTableModel.md#footerareamodel)
- [footerVisible](SpreadsheetTableModel.md#footervisible)
- [getSelectionModel](SpreadsheetTableModel.md#getselectionmodel)
- [headerAreaModel](SpreadsheetTableModel.md#headerareamodel)
- [headerVisible](SpreadsheetTableModel.md#headervisible)
- [overridingColumnWidth](SpreadsheetTableModel.md#overridingcolumnwidth)
- [padding](SpreadsheetTableModel.md#padding)
- [parentSize](SpreadsheetTableModel.md#parentsize)
- [rowCheckboxVisible](SpreadsheetTableModel.md#rowcheckboxvisible)
- [rowCount](SpreadsheetTableModel.md#rowcount)
- [sheetBody](SpreadsheetTableModel.md#sheetbody)
- [xPositions](SpreadsheetTableModel.md#xpositions)

### Methods

- [changeColumnOrder](SpreadsheetTableModel.md#changecolumnorder)
- [doSort](SpreadsheetTableModel.md#dosort)
- [externalFilterChanged](SpreadsheetTableModel.md#externalfilterchanged)
- [getAreaHeight](SpreadsheetTableModel.md#getareaheight)
- [getAreaModel](SpreadsheetTableModel.md#getareamodel)
- [getBodyModel](SpreadsheetTableModel.md#getbodymodel)
- [getBodyRowByIndex](SpreadsheetTableModel.md#getbodyrowbyindex)
- [getColumnCount](SpreadsheetTableModel.md#getcolumncount)
- [getColumnDef](SpreadsheetTableModel.md#getcolumndef)
- [getColumnDefs](SpreadsheetTableModel.md#getcolumndefs)
- [getColumnProperty](SpreadsheetTableModel.md#getcolumnproperty)
- [getColumnWidth](SpreadsheetTableModel.md#getcolumnwidth)
- [getContentHeightInPixel](SpreadsheetTableModel.md#getcontentheightinpixel)
- [getContentWidthInPixel](SpreadsheetTableModel.md#getcontentwidthinpixel)
- [getDataColumnWidths](SpreadsheetTableModel.md#getdatacolumnwidths)
- [getFixedLeftColumnCount](SpreadsheetTableModel.md#getfixedleftcolumncount)
- [getFixedRightColumnCount](SpreadsheetTableModel.md#getfixedrightcolumncount)
- [getModel](SpreadsheetTableModel.md#getmodel)
- [getPadding](SpreadsheetTableModel.md#getpadding)
- [getRowHeight](SpreadsheetTableModel.md#getrowheight)
- [getSideAreaWidth](SpreadsheetTableModel.md#getsideareawidth)
- [getSideStartAndEndColumnIndex](SpreadsheetTableModel.md#getsidestartandendcolumnindex)
- [getTableScope](SpreadsheetTableModel.md#gettablescope)
- [getXPosByColumnIndex](SpreadsheetTableModel.md#getxposbycolumnindex)
- [init](SpreadsheetTableModel.md#init)
- [isColumnVisible](SpreadsheetTableModel.md#iscolumnvisible)
- [isFooterVisibe](SpreadsheetTableModel.md#isfootervisibe)
- [isHeaderVisibe](SpreadsheetTableModel.md#isheadervisibe)
- [isRowCheckboxVisible](SpreadsheetTableModel.md#isrowcheckboxvisible)
- [isSortable](SpreadsheetTableModel.md#issortable)
- [recalcHeightAndPadding](SpreadsheetTableModel.md#recalcheightandpadding)
- [recalcPadding](SpreadsheetTableModel.md#recalcpadding)
- [recalcSize](SpreadsheetTableModel.md#recalcsize)
- [setColumnVisible](SpreadsheetTableModel.md#setcolumnvisible)
- [setColumnWidth](SpreadsheetTableModel.md#setcolumnwidth)
- [setDataColumns](SpreadsheetTableModel.md#setdatacolumns)
- [setFooterVisible](SpreadsheetTableModel.md#setfootervisible)
- [setHeaderVisible](SpreadsheetTableModel.md#setheadervisible)
- [setParentWidth](SpreadsheetTableModel.md#setparentwidth)
- [setTableScope](SpreadsheetTableModel.md#settablescope)
- [sort](SpreadsheetTableModel.md#sort)

## Constructors

### constructor

• **new SpreadsheetTableModel**(`header`, `sheetBody`, `rowNumberColumn`, `columnDefs`, `rowHeight`, `columnWidth`, `inputPipe?`): [`SpreadsheetTableModel`](SpreadsheetTableModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `header` | [`AreaModelSheetHeader`](AreaModelSheetHeader.md) |
| `sheetBody` | [`AreaModelSheet`](AreaModelSheet.md) |
| `rowNumberColumn` | `undefined` \| [`RowNumberColumnDef`](RowNumberColumnDef.md) |
| `columnDefs` | [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] |
| `rowHeight` | `number` |
| `columnWidth` | `number` |
| `inputPipe` | [`editInputPipe`](../interfaces/editInputPipe.md) |

#### Returns

[`SpreadsheetTableModel`](SpreadsheetTableModel.md)

#### Overrides

[TableModel](TableModel.md).[constructor](TableModel.md#constructor)

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L93)

## Properties

### bodyAreaModel

• `Readonly` **bodyAreaModel**: [`AreaModelIf`](../interfaces/AreaModelIf.md)

#### Inherited from

[TableModel](TableModel.md).[bodyAreaModel](TableModel.md#bodyareamodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L62)

___

### columnCount

• `Protected` **columnCount**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[columnCount](TableModel.md#columncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L71)

___

### columnDefs

• **columnDefs**: [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[] = `[]`

#### Inherited from

[TableModel](TableModel.md).[columnDefs](TableModel.md#columndefs)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L68)

___

### columnSizes

• **columnSizes**: `number`[] = `[]`

#### Inherited from

[TableModel](TableModel.md).[columnSizes](TableModel.md#columnsizes)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L69)

___

### contentHeightInPx

• `Protected` **contentHeightInPx**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[contentHeightInPx](TableModel.md#contentheightinpx)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L49)

___

### contentWidthInPx

• `Protected` **contentWidthInPx**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[contentWidthInPx](TableModel.md#contentwidthinpx)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L50)

___

### defaultRowHeights

• `Readonly` **defaultRowHeights**: [`DefaultRowHeightsIf`](../interfaces/DefaultRowHeightsIf.md)

#### Inherited from

[TableModel](TableModel.md).[defaultRowHeights](TableModel.md#defaultrowheights)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L67)

___

### fixedLeftColumnCount

• `Readonly` **fixedLeftColumnCount**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[fixedLeftColumnCount](TableModel.md#fixedleftcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L64)

___

### fixedRightColumnCount

• `Readonly` **fixedRightColumnCount**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[fixedRightColumnCount](TableModel.md#fixedrightcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L65)

___

### footerAreaModel

• `Readonly` **footerAreaModel**: [`AreaModelIf`](../interfaces/AreaModelIf.md)

#### Inherited from

[TableModel](TableModel.md).[footerAreaModel](TableModel.md#footerareamodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L63)

___

### footerVisible

• `Protected` **footerVisible**: `boolean` = `true`

false: the footer is hidden (height 0), see [setFooterVisible](TableModel.md#setfootervisible).

#### Inherited from

[TableModel](TableModel.md).[footerVisible](TableModel.md#footervisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L58)

___

### getSelectionModel

• **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Inherited from

[TableModel](TableModel.md).[getSelectionModel](TableModel.md#getselectionmodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L73)

___

### headerAreaModel

• `Readonly` **headerAreaModel**: [`AreaModelIf`](../interfaces/AreaModelIf.md)

#### Inherited from

[TableModel](TableModel.md).[headerAreaModel](TableModel.md#headerareamodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L61)

___

### headerVisible

• `Protected` **headerVisible**: `boolean` = `true`

false: the header is hidden (height 0), see [setHeaderVisible](TableModel.md#setheadervisible).

#### Inherited from

[TableModel](TableModel.md).[headerVisible](TableModel.md#headervisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L56)

___

### overridingColumnWidth

• `Protected` **overridingColumnWidth**: `number` = `-1`

#### Inherited from

[TableModel](TableModel.md).[overridingColumnWidth](TableModel.md#overridingcolumnwidth)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L70)

___

### padding

• `Protected` **padding**: [`Padding`](Padding.md)

#### Inherited from

[TableModel](TableModel.md).[padding](TableModel.md#padding)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L53)

___

### parentSize

• `Protected` **parentSize**: `number` = `400`

#### Inherited from

[TableModel](TableModel.md).[parentSize](TableModel.md#parentsize)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L72)

___

### rowCheckboxVisible

• `Readonly` **rowCheckboxVisible**: `boolean` = `false`

#### Inherited from

[TableModel](TableModel.md).[rowCheckboxVisible](TableModel.md#rowcheckboxvisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L66)

___

### rowCount

• `Protected` **rowCount**: `number` = `0`

#### Inherited from

[TableModel](TableModel.md).[rowCount](TableModel.md#rowcount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L48)

___

### sheetBody

• `Readonly` **sheetBody**: [`AreaModelSheet`](AreaModelSheet.md)

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L95)

___

### xPositions

• `Protected` **xPositions**: `number`[] = `[]`

#### Inherited from

[TableModel](TableModel.md).[xPositions](TableModel.md#xpositions)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L54)

## Methods

### changeColumnOrder

▸ **changeColumnOrder**(`sourceColumnIndex`, `targetColumnIndex`): `void`

Moves a column in the column order.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sourceColumnIndex` | `number` | The index of the column to be moved. |
| `targetColumnIndex` | `number` | The index where the column should be moved to. |

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[changeColumnOrder](TableModel.md#changecolumnorder)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:616](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L616)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts the items using the given sortItems array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | An array of sort items to sort the items. |

#### Returns

`boolean`

- Returns true if the sorting is successful, otherwise false.

#### Inherited from

[TableModel](TableModel.md).[doSort](TableModel.md#dosort)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L546)

___

### externalFilterChanged

▸ **externalFilterChanged**\<`T`\>(`predictFn`): `void`

This method is called when an external filter is changed.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predictFn` | [`FilterFunction`](../modules.md#filterfunction)\<`T`\> | The function used to predict whether an element should be filtered or not. |

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[externalFilterChanged](TableModel.md#externalfilterchanged)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:536](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L536)

___

### getAreaHeight

▸ **getAreaHeight**(`areaIdent`): `number`

Calculates the height of the area identified by the given area identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the area. |

#### Returns

`number`

- The height of the area.

#### Inherited from

[TableModel](TableModel.md).[getAreaHeight](TableModel.md#getareaheight)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:306](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L306)

___

### getAreaModel

▸ **getAreaModel**(`area`): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the area model (header, body or footer) based on the area identification.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) | The identifier of the area. |

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The area model corresponding to the given area identification.

**`Throws`**

If the area identification is invalid.

#### Inherited from

[TableModel](TableModel.md).[getAreaModel](TableModel.md#getareamodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:397](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L397)

___

### getBodyModel

▸ **getBodyModel**(): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Returns the body area model.

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

The body area model.

#### Inherited from

[TableModel](TableModel.md).[getBodyModel](TableModel.md#getbodymodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:415](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L415)

___

### getBodyRowByIndex

▸ **getBodyRowByIndex**(`rowIndex`): `any`

Retrieves the row object from the body model at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to retrieve. |

#### Returns

`any`

The row object at the specified index.

#### Inherited from

[TableModel](TableModel.md).[getBodyRowByIndex](TableModel.md#getbodyrowbyindex)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:586](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L586)

___

### getColumnCount

▸ **getColumnCount**(): `number`

Retrieves the count of columns in the current instance.

#### Returns

`number`

The count of columns.

#### Inherited from

[TableModel](TableModel.md).[getColumnCount](TableModel.md#getcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L123)

___

### getColumnDef

▸ **getColumnDef**(`index`): `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

Returns the column definition at the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The index of the column definition to retrieve. |

#### Returns

`undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

- The column definition at the specified index, or undefined if no ColumnDef is specified for the given column

#### Inherited from

[TableModel](TableModel.md).[getColumnDef](TableModel.md#getcolumndef)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L365)

___

### getColumnDefs

▸ **getColumnDefs**(): `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[]

Returns an array of ColumnDefIf objects or undefined.

#### Returns

`undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md)[]

An array of ColumnDefIf objects or undefined.

#### Inherited from

[TableModel](TableModel.md).[getColumnDefs](TableModel.md#getcolumndefs)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:561](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L561)

___

### getColumnProperty

▸ **getColumnProperty**(`columnIndex`): `string`

Retrieves the property key of the table row business object associated with the specified column index.
It's only available when columnDefs are specified.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column to retrieve the property from. |

#### Returns

`string`

The property associated with the specified column index.

#### Inherited from

[TableModel](TableModel.md).[getColumnProperty](TableModel.md#getcolumnproperty)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:572](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L572)

___

### getColumnWidth

▸ **getColumnWidth**(`columnIndex`): `number`

Retrieves the width of a column specified by its index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the desired column. |

#### Returns

`number`

- The width of the specified column.

#### Inherited from

[TableModel](TableModel.md).[getColumnWidth](TableModel.md#getcolumnwidth)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:163](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L163)

___

### getContentHeightInPixel

▸ **getContentHeightInPixel**(): `number`

Returns the height of the content in pixels.

#### Returns

`number`

The height of the content in pixels.

#### Inherited from

[TableModel](TableModel.md).[getContentHeightInPixel](TableModel.md#getcontentheightinpixel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:266](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L266)

___

### getContentWidthInPixel

▸ **getContentWidthInPixel**(): `number`

Returns the width of the content in pixels.

#### Returns

`number`

The width of the content in pixels.

#### Inherited from

[TableModel](TableModel.md).[getContentWidthInPixel](TableModel.md#getcontentwidthinpixel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:275](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L275)

___

### getDataColumnWidths

▸ **getDataColumnWidths**(): `number`[]

#### Returns

`number`[]

the widths of the data columns in px

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L123)

___

### getFixedLeftColumnCount

▸ **getFixedLeftColumnCount**(): `number`

Retrieves the count of fixed left columns.

#### Returns

`number`

The count of fixed left columns.

#### Inherited from

[TableModel](TableModel.md).[getFixedLeftColumnCount](TableModel.md#getfixedleftcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:377](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L377)

___

### getFixedRightColumnCount

▸ **getFixedRightColumnCount**(): `number`

Returns the number of fixed right columns.

#### Returns

`number`

The number of fixed right columns.

#### Inherited from

[TableModel](TableModel.md).[getFixedRightColumnCount](TableModel.md#getfixedrightcolumncount)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:386](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L386)

___

### getModel

▸ **getModel**(`rowAreaIdent`): [`AreaModelIf`](../interfaces/AreaModelIf.md)

Retrieves the model for the given row area identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the row area. |

#### Returns

[`AreaModelIf`](../interfaces/AreaModelIf.md)

- The model of the specified row area.

#### Inherited from

[TableModel](TableModel.md).[getModel](TableModel.md#getmodel)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:296](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L296)

___

### getPadding

▸ **getPadding**(): [`Padding`](Padding.md)

Retrieves the padding value.

#### Returns

[`Padding`](Padding.md)

The padding value.

#### Inherited from

[TableModel](TableModel.md).[getPadding](TableModel.md#getpadding)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:257](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L257)

___

### getRowHeight

▸ **getRowHeight**(`rowAreaIdent`, `rowIndex`): `number`

Returns the height of the specified row in the given row area identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The row area identifier. |
| `rowIndex` | `number` | The index of the row. |

#### Returns

`number`

- The height of the specified row.

#### Inherited from

[TableModel](TableModel.md).[getRowHeight](TableModel.md#getrowheight)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:286](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L286)

___

### getSideAreaWidth

▸ **getSideAreaWidth**(`sideIdent`): `number`

Returns the total width of the side area identified by sideIdent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) | The identifier of the side area ("west" \| "center" \| "east"). |

#### Returns

`number`

- The total width in pixels of the side area.

#### Inherited from

[TableModel](TableModel.md).[getSideAreaWidth](TableModel.md#getsideareawidth)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:326](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L326)

___

### getSideStartAndEndColumnIndex

▸ **getSideStartAndEndColumnIndex**(`sideIdent`): [`number`, `number`]

Retrieves the start and end column indices based on the given side identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) | The side identifier, which can be "west", "east", or "center". |

#### Returns

[`number`, `number`]

- An array containing the start and end column indices.

#### Inherited from

[TableModel](TableModel.md).[getSideStartAndEndColumnIndex](TableModel.md#getsidestartandendcolumnindex)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:341](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L341)

___

### getTableScope

▸ **getTableScope**(): `undefined` \| [`TableScope`](TableScope.md)

#### Returns

`undefined` \| [`TableScope`](TableScope.md)

#### Inherited from

[TableModel](TableModel.md).[getTableScope](TableModel.md#gettablescope)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:725](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L725)

___

### getXPosByColumnIndex

▸ **getXPosByColumnIndex**(`columnIndex`): `number`

Retrieves the x position for a given column index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column. |

#### Returns

`number`

- The x position of the column.

#### Inherited from

[TableModel](TableModel.md).[getXPosByColumnIndex](TableModel.md#getxposbycolumnindex)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L183)

___

### init

▸ **init**(): `void`

Triggered by TableScope.firstInit() after the table tag is attached to the dom.

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[init](TableModel.md#init)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L98)

___

### isColumnVisible

▸ **isColumnVisible**(`column`): `boolean`

Whether a column is shown ([ColumnDefIf.isVisible](../interfaces/ColumnDefIf.md#isvisible)). Columns without a column definition are always shown.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | column index, property or column definition |

#### Returns

`boolean`

false for hidden and for unknown columns

**`Example`**

```ts
const hidden = tableModel.isColumnVisible?.("category") === false;
```

#### Inherited from

[TableModel](TableModel.md).[isColumnVisible](TableModel.md#iscolumnvisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:513](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L513)

___

### isFooterVisibe

▸ **isFooterVisibe**(): `boolean`

Checks if the footer is visible: it has rows and is not hidden with [setFooterVisible](TableModel.md#setfootervisible).

#### Returns

`boolean`

True if the footer is visible, false otherwise.

#### Inherited from

[TableModel](TableModel.md).[isFooterVisibe](TableModel.md#isfootervisibe)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:424](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L424)

___

### isHeaderVisibe

▸ **isHeaderVisibe**(): `boolean`

Checks if the header area is visible: it has rows and is not hidden with [setHeaderVisible](TableModel.md#setheadervisible).

#### Returns

`boolean`

Returns true if the header area is visible, otherwise false.

#### Inherited from

[TableModel](TableModel.md).[isHeaderVisibe](TableModel.md#isheadervisibe)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:432](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L432)

___

### isRowCheckboxVisible

▸ **isRowCheckboxVisible**(): `boolean`

Checks whether the row checkbox is visible.

#### Returns

`boolean`

True if the row checkbox is visible, otherwise false.

#### Inherited from

[TableModel](TableModel.md).[isRowCheckboxVisible](TableModel.md#isrowcheckboxvisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:526](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L526)

___

### isSortable

▸ **isSortable**(`columnIndex`): `boolean`

Checks if a column at the given index is sortable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column to check. |

#### Returns

`boolean`

- `true` if the column is sortable, `false` otherwise.

#### Inherited from

[TableModel](TableModel.md).[isSortable](TableModel.md#issortable)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L597)

___

### recalcHeightAndPadding

▸ **recalcHeightAndPadding**(): `void`

Recalculates the height and padding for the body area.

This method retrieves the area model for the "body" area,
and updates the rowCount property with the row count of the model.

The contentHeightInPx property is then updated with the height of the "body" area.

The method calls the recalcContentWidthInPx() method to recalculate the content width.

Finally, the method calls the recalcPadding() method to recalculate the padding.

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[recalcHeightAndPadding](TableModel.md#recalcheightandpadding)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L222)

___

### recalcPadding

▸ **recalcPadding**(): `void`

Recalculates the padding of an element based on the width and height of its surrounding areas.

#### Returns

`void`

**`Method`**

recalcPadding

#### Inherited from

[TableModel](TableModel.md).[recalcPadding](TableModel.md#recalcpadding)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:238](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L238)

___

### recalcSize

▸ **recalcSize**(`clientWidth`): `void`

Recalculates the size (width, height, padding)  of the elements based on the client width.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientWidth` | `number` | The width of the client area. |

#### Returns

`void`

- This method does not return a value.

#### Inherited from

[TableModel](TableModel.md).[recalcSize](TableModel.md#recalcsize)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L200)

___

### setColumnVisible

▸ **setColumnVisible**(`column`, `visible`): `boolean`

Shows or hides a column. The column keeps its definition, position and width – a hidden column has the width 0
([getColumnWidth](TableModel.md#getcolumnwidth)), is not rendered, copied or exported; showing it again restores its width.

Works through [ColumnDefIf.isVisible](../interfaces/ColumnDefIf.md#isvisible): it is replaced by [TrueFn](../modules.md#truefn) / [FalseFn](../modules.md#falsefn) (an own
`isVisible` function of the column is replaced, too). Columns without a column definition can't be hidden.
With header groups ([AreaModelCellGroups](AreaModelCellGroups.md)) the column is shown only if neither this method nor a collapsed
group hides it – expanding the group does not bring back a column hidden here, and vice versa.
Weight widths (`new Size(1, "weight")`) are shared among the shown columns.
Recalculates the content width, the padding (fixed columns) and the x positions. Only changes the model –
[TableApi.setColumnVisible](TableApi.md#setcolumnvisible) also repaints the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | column index (fixed columns included), property or column definition |
| `visible` | `boolean` | false hides the column |

#### Returns

`boolean`

false if there is no such column definition

**`Example`**

```ts
tableModel.setColumnVisible?.("category", false);
```

#### Inherited from

[TableModel](TableModel.md).[setColumnVisible](TableModel.md#setcolumnvisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:484](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L484)

___

### setColumnWidth

▸ **setColumnWidth**(`columnIndex`, `width`): `void`

Sets the width in pixel of a column (by columnIndex) in a table.
The width is also stored in the column's ColumnDef (`width` = the new px size), so it survives a host resize
(the widths are recalculated from the ColumnDefs then).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column. |
| `width` | `number` | The desired width of the column. |

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[setColumnWidth](TableModel.md#setcolumnwidth)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L136)

___

### setDataColumns

▸ **setDataColumns**(`count`, `widths?`): `void`

Sets the data columns: `A…` with the given widths (insert/delete columns keep the widths of the moved columns).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `count` | `number` | `undefined` | data columns |
| `widths?` | `number`[] | `[]` | width per data column in px (missing: the default width) |

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L112)

___

### setFooterVisible

▸ **setFooterVisible**(`visible`): `void`

Shows or hides the footer. A hidden footer takes no space; its area model and rows stay unchanged.
Only changes the model – [TableApi.setFooterVisible](TableApi.md#setfootervisible) also repaints the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | false hides the footer |

#### Returns

`void`

**`Example`**

```ts
tableModel.setFooterVisible?.(false);
```

#### Inherited from

[TableModel](TableModel.md).[setFooterVisible](TableModel.md#setfootervisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:460](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L460)

___

### setHeaderVisible

▸ **setHeaderVisible**(`visible`): `void`

Shows or hides the header. A hidden header takes no space (the body moves up); its area model and rows stay
unchanged, so showing it again restores it. Only changes the model – [TableApi.setHeaderVisible](TableApi.md#setheadervisible) also
repaints the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | false hides the header |

#### Returns

`void`

**`Example`**

```ts
tableModel.setHeaderVisible?.(false);
```

#### Inherited from

[TableModel](TableModel.md).[setHeaderVisible](TableModel.md#setheadervisible)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:446](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L446)

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

#### Inherited from

[TableModel](TableModel.md).[setParentWidth](TableModel.md#setparentwidth)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L114)

___

### setTableScope

▸ **setTableScope**(`tableScope`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[setTableScope](TableModel.md#settablescope)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:722](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L722)

___

### sort

▸ **sort**(`compareFn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `compareFn` | (`a`: `any`, `b`: `any`) => `number` |

#### Returns

`void`

#### Inherited from

[TableModel](TableModel.md).[sort](TableModel.md#sort)

#### Defined in

[src/lib/table/data/tablemodel/table-model.ts:551](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.ts#L551)
