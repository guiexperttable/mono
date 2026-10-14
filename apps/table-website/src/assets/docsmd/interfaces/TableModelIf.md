[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableModelIf

# Interface: TableModelIf

The TableModelIf is on one hand a container for the header, body, and footer models
(see : #getAreaModel, and #AreaModelIf), and on the other hand the master of
the column information (#getColumnCount(), #getColumnWidth(columnIndex: number)).

If getFixedLeftColumnCount() returns a value greater than 0, a fixed west area will be rendered in the
header, body, and footer. A value greater than 0 for getFixedLeftColumnCount()
will result in the presence of an east area.
<pre>
 +----------------+-------------------+--------------+
 |  header/west   |  header/center    | header/east  |
 +----------------+-------------------+--------------+
 |  body/west     |  body/center      | body/east    |
 +----------------+-------------------+--------------+
 |  footer/west   |  footer/center    | footer/east  |
 +----------------+-------------------+--------------+</pre>

## Implemented by

- [`CoverGridTableModel`](../classes/CoverGridTableModel.md)
- [`TableModel`](../classes/TableModel.md)

## Table of contents

### Methods

- [changeColumnOrder](TableModelIf.md#changecolumnorder)
- [doSort](TableModelIf.md#dosort)
- [externalFilterChanged](TableModelIf.md#externalfilterchanged)
- [getAreaModel](TableModelIf.md#getareamodel)
- [getBodyModel](TableModelIf.md#getbodymodel)
- [getBodyRowByIndex](TableModelIf.md#getbodyrowbyindex)
- [getColumnCount](TableModelIf.md#getcolumncount)
- [getColumnDef](TableModelIf.md#getcolumndef)
- [getColumnDefs](TableModelIf.md#getcolumndefs)
- [getColumnProperty](TableModelIf.md#getcolumnproperty)
- [getColumnWidth](TableModelIf.md#getcolumnwidth)
- [getContentHeightInPixel](TableModelIf.md#getcontentheightinpixel)
- [getContentWidthInPixel](TableModelIf.md#getcontentwidthinpixel)
- [getFixedLeftColumnCount](TableModelIf.md#getfixedleftcolumncount)
- [getFixedRightColumnCount](TableModelIf.md#getfixedrightcolumncount)
- [getPadding](TableModelIf.md#getpadding)
- [getRowHeight](TableModelIf.md#getrowheight)
- [getSelectionModel](TableModelIf.md#getselectionmodel)
- [getTableScope](TableModelIf.md#gettablescope)
- [getXPosByColumnIndex](TableModelIf.md#getxposbycolumnindex)
- [init](TableModelIf.md#init)
- [isColumnVisible](TableModelIf.md#iscolumnvisible)
- [isFooterVisibe](TableModelIf.md#isfootervisibe)
- [isHeaderVisibe](TableModelIf.md#isheadervisibe)
- [isRowCheckboxVisible](TableModelIf.md#isrowcheckboxvisible)
- [isSortable](TableModelIf.md#issortable)
- [recalcHeightAndPadding](TableModelIf.md#recalcheightandpadding)
- [recalcPadding](TableModelIf.md#recalcpadding)
- [recalcSize](TableModelIf.md#recalcsize)
- [setColumnVisible](TableModelIf.md#setcolumnvisible)
- [setColumnWidth](TableModelIf.md#setcolumnwidth)
- [setFooterVisible](TableModelIf.md#setfootervisible)
- [setHeaderVisible](TableModelIf.md#setheadervisible)
- [setParentWidth](TableModelIf.md#setparentwidth)
- [setTableScope](TableModelIf.md#settablescope)
- [sort](TableModelIf.md#sort)

## Methods

### changeColumnOrder

▸ **changeColumnOrder**(`sourceColumnIndex`, `targetColumnIndex`): `void`

Moves a column from the source column index to the target column index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sourceColumnIndex` | `number` | The index of the column to be moved. |
| `targetColumnIndex` | `number` | The index where the column will be moved to. |

#### Returns

`void`

- This method does not return anything.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L40)

___

### doSort

▸ **doSort**(`sortItems`): `boolean`

Sorts an array of SortItem objects based on a predetermined sorting algorithm.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](../classes/SortItem.md)[] | An array of SortItem objects to be sorted. |

#### Returns

`boolean`

- Returns true if the sorting was successful, false otherwise.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:307](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L307)

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L299)

___

### getAreaModel

▸ **getAreaModel**(`rowAreaIdent`): [`AreaModelIf`](AreaModelIf.md)

Retrieves the area model based on the given row area identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the row area. |

#### Returns

[`AreaModelIf`](AreaModelIf.md)

The area model corresponding to the provided row area identifier.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L95)

___

### getBodyModel

▸ **getBodyModel**(): [`AreaModelIf`](AreaModelIf.md)

Retrieves the body model.

#### Returns

[`AreaModelIf`](AreaModelIf.md)

The body model representing an area.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L102)

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:223](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L223)

___

### getColumnCount

▸ **getColumnCount**(): `number`

Returns the number of columns in a dataset.

#### Returns

`number`

The number of columns in the dataset.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L71)

___

### getColumnDef

▸ **getColumnDef**(`index`): `undefined` \| [`ColumnDefIf`](ColumnDefIf.md)

Retrieves the column definition for the specified index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | The index of the column to retrieve the definition for. |

#### Returns

`undefined` \| [`ColumnDefIf`](ColumnDefIf.md)

- The column definition for the specified index, or undefined if not found.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L200)

___

### getColumnDefs

▸ **getColumnDefs**(): `undefined` \| [`ColumnDefIf`](ColumnDefIf.md)[]

Retrieves the column definitions for a table.

#### Returns

`undefined` \| [`ColumnDefIf`](ColumnDefIf.md)[]

An array of column definitions or undefined if there are no column definitions.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:207](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L207)

___

### getColumnProperty

▸ **getColumnProperty**(`columnIndex`): `string`

Retrieves the property of a specific column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column. |

#### Returns

`string`

The property of the column.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:215](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L215)

___

### getColumnWidth

▸ **getColumnWidth**(`columnIndex`): `number`

Retrieves the width (in pixels) of a specific column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column to get the width of. |

#### Returns

`number`

The width of the specified column.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L79)

▸ **getColumnWidth**(`columnIndex`): `number`

Retrieves the width of a given column in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column for which to get the width. |

#### Returns

`number`

The width of the column in pixels.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L231)

___

### getContentHeightInPixel

▸ **getContentHeightInPixel**(): `number`

Retrieves the content height in pixels.

#### Returns

`number`

The height of the content in pixels.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:280](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L280)

___

### getContentWidthInPixel

▸ **getContentWidthInPixel**(): `number`

Returns the content width in pixels.

#### Returns

`number`

The width of the content in pixels.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:287](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L287)

___

### getFixedLeftColumnCount

▸ **getFixedLeftColumnCount**(): `number`

Retrieves the number of fixed left columns.

#### Returns

`number`

The count of fixed left columns.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L109)

___

### getFixedRightColumnCount

▸ **getFixedRightColumnCount**(): `number`

Retrieves the count of fixed right columns.

#### Returns

`number`

The count of fixed right columns.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L116)

___

### getPadding

▸ **getPadding**(): [`Padding`](../classes/Padding.md)

Retrieves the padding value of the element.

#### Returns

[`Padding`](../classes/Padding.md)

The padding value of the element.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:273](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L273)

___

### getRowHeight

▸ **getRowHeight**(`rowAreaIdent`, `rowIndex`): `number`

Retrieves the height of a specific row in the provided row area.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowAreaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the row area. |
| `rowIndex` | `number` | The index of the row for which to retrieve the height. |

#### Returns

`number`

The height of the specified row in pixels.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L192)

___

### getSelectionModel

▸ **getSelectionModel**(): `undefined` \| [`SelectionModelIf`](SelectionModelIf.md)

Retrieves the selection model associated with the component.

#### Returns

`undefined` \| [`SelectionModelIf`](SelectionModelIf.md)

The selection model instance if available, or undefined if none is found.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:316](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L316)

___

### getTableScope

▸ **getTableScope**(): `undefined` \| [`TableScope`](../classes/TableScope.md)

#### Returns

`undefined` \| [`TableScope`](../classes/TableScope.md)

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:319](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L319)

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L87)

___

### init

▸ **init**(): `void`

Triggered by TableScope.firstInit() after the table tag is attached to the dom.

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L54)

___

### isColumnVisible

▸ **isColumnVisible**(`column`): `boolean`

Optional: whether a column is shown. Implemented by [TableModel](../classes/TableModel.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](ColumnDefIf.md) | column index, property or column definition |

#### Returns

`boolean`

false for hidden and for unknown columns

**`Example`**

```ts
tableModel.isColumnVisible?.("category");
```

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L176)

___

### isFooterVisibe

▸ **isFooterVisibe**(): `boolean`

Checks if the footer is visible.

#### Returns

`boolean`

Returns true if the footer is visible, otherwise returns false.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L130)

___

### isHeaderVisibe

▸ **isHeaderVisibe**(): `boolean`

Checks if the header is visible.

#### Returns

`boolean`

- Returns true if the header is visible, false otherwise.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L123)

___

### isRowCheckboxVisible

▸ **isRowCheckboxVisible**(): `boolean`

Determines if the row checkbox is visible.

#### Returns

`boolean`

True if the row checkbox is visible, false otherwise.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L183)

___

### isSortable

▸ **isSortable**(`colIdx`): `boolean`

Checks if a column at the specified index is sortable.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `colIdx` | `number` | The index of the column to check. |

#### Returns

`boolean`

- true if the column is sortable, false otherwise.

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L48)

___

### recalcHeightAndPadding

▸ **recalcHeightAndPadding**(): `void`

Recalculates the height and padding of an element.

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:266](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L266)

___

### recalcPadding

▸ **recalcPadding**(): `void`

Recalculates the padding of the element based on its content.
This method updates the padding of the element to ensure that its content
is properly aligned and displayed.

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:259](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L259)

___

### recalcSize

▸ **recalcSize**(`clientWidth`): `void`

Recalculates the size of the element based on the provided client width.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientWidth` | `number` | The current client width of the element. |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:250](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L250)

___

### setColumnVisible

▸ **setColumnVisible**(`column`, `visible`): `boolean`

Optional: shows or hides a column (width 0, definition, position and width are kept). Implemented by
[TableModel](../classes/TableModel.md); [TableApi.setColumnVisible](../classes/TableApi.md#setcolumnvisible) uses it and repaints.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](ColumnDefIf.md) | column index, property or column definition |
| `visible` | `boolean` | false hides the column |

#### Returns

`boolean`

false if there is no such column definition

**`Example`**

```ts
tableModel.setColumnVisible?.(3, false);
```

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L165)

___

### setColumnWidth

▸ **setColumnWidth**(`columnIndex`, `width`): `void`

Sets the width of a column in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | The index of the column to set the width for. |
| `width` | `number` | The width to set for the column, in pixels. |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L240)

___

### setFooterVisible

▸ **setFooterVisible**(`visible`): `void`

Optional: shows or hides the footer (height 0, the rows stay in the model). Implemented by [TableModel](../classes/TableModel.md);
[TableApi.setFooterVisible](../classes/TableApi.md#setfootervisible) uses it and repaints.

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L152)

___

### setHeaderVisible

▸ **setHeaderVisible**(`visible`): `void`

Optional: shows or hides the header (height 0, the rows stay in the model). Implemented by [TableModel](../classes/TableModel.md);
[TableApi.setHeaderVisible](../classes/TableApi.md#setheadervisible) uses it and repaints.

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L141)

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

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L64)

___

### setTableScope

▸ **setTableScope**(`tableScope`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](../classes/TableScope.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L318)

___

### sort

▸ **sort**(`compareFn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `compareFn` | (`a`: `any`, `b`: `any`) => `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/table-model.if.ts:309](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/table-model.if.ts#L309)
