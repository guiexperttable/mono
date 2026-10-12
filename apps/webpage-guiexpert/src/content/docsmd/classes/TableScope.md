[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableScope

# Class: TableScope

Creates and runs one table in a host element – the core that every framework wrapper uses.

It connects the four building blocks: host element, [table model](../interfaces/TableModelIf.md), [options](../interfaces/TableOptionsIf.md)
and an [event listener](../interfaces/EventListenerIf.md), renders only the visible cells (virtual scrolling in both
directions) and handles mouse, keyboard, selection, sorting and editing. Talk to the table through
[getApi](TableScope.md#getapi) – the [TableApi](TableApi.md).

The host element needs a height: the table fills it.

**`Example`**

```ts
import "@guiexpert/table/css/main.css";
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

const host = document.querySelector<HTMLDivElement>(".table-div")!;   // CSS: .table-div { height: 500px }
const tableModel = TableFactory.createTableModel({ rows: orders });
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
tableScope.firstInit();
const tableApi = tableScope.getApi();

// later: remove the table (route change, new model)
tableScope.destroy();
```

**`See`**

Training: [Your first table in plain TypeScript](https://gui.expert/training/first-table/)

## Hierarchy

- [`RenderScope`](RenderScope.md)

  ↳ **`TableScope`**

## Implements

- [`OnActionTriggeredIf`](../interfaces/OnActionTriggeredIf.md)
- [`EventFocusChangedListenerIf`](../interfaces/EventFocusChangedListenerIf.md)
- [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)

## Table of contents

### Constructors

- [constructor](TableScope.md#constructor)

### Properties

- [areaBodyCenter](TableScope.md#areabodycenter)
- [areaBodyCenterGeo](TableScope.md#areabodycentergeo)
- [areaBodyEast](TableScope.md#areabodyeast)
- [areaBodyEastGeo](TableScope.md#areabodyeastgeo)
- [areaBodyWest](TableScope.md#areabodywest)
- [areaBodyWestGeo](TableScope.md#areabodywestgeo)
- [areaFooterCenter](TableScope.md#areafootercenter)
- [areaFooterEast](TableScope.md#areafootereast)
- [areaFooterWest](TableScope.md#areafooterwest)
- [areaHeaderCenter](TableScope.md#areaheadercenter)
- [areaHeaderEast](TableScope.md#areaheadereast)
- [areaHeaderWest](TableScope.md#areaheaderwest)
- [areaHeightsOfRenderPass](TableScope.md#areaheightsofrenderpass)
- [borderFixedEast](TableScope.md#borderfixedeast)
- [borderFixedWest](TableScope.md#borderfixedwest)
- [borderFooterTop](TableScope.md#borderfootertop)
- [borderHeaderBottom](TableScope.md#borderheaderbottom)
- [cleanupFunctions](TableScope.md#cleanupfunctions)
- [colAndRowspanModels](TableScope.md#colandrowspanmodels)
- [contentDiv](TableScope.md#contentdiv)
- [contentScrollTop](TableScope.md#contentscrolltop)
- [contentWrapperDiv](TableScope.md#contentwrapperdiv)
- [copyService](TableScope.md#copyservice)
- [displayedRowCount](TableScope.md#displayedrowcount)
- [dom](TableScope.md#dom)
- [dragging](TableScope.md#dragging)
- [draggingColumn](TableScope.md#draggingcolumn)
- [draggingTargetColumnIndex](TableScope.md#draggingtargetcolumnindex)
- [editing](TableScope.md#editing)
- [eventListener](TableScope.md#eventlistener)
- [excelService](TableScope.md#excelservice)
- [firstFullVisibleRowIndex](TableScope.md#firstfullvisiblerowindex)
- [firstVisibleRowIndex](TableScope.md#firstvisiblerowindex)
- [getFocusModel](TableScope.md#getfocusmodel)
- [getSelectionModel](TableScope.md#getselectionmodel)
- [hostElement](TableScope.md#hostelement)
- [hoverColumn](TableScope.md#hovercolumn)
- [hoverRow](TableScope.md#hoverrow)
- [inputHandler](TableScope.md#inputhandler)
- [keyEvent](TableScope.md#keyevent)
- [lastFullVisibleRowIndex](TableScope.md#lastfullvisiblerowindex)
- [lastVisibleRowIndex](TableScope.md#lastvisiblerowindex)
- [licenseManager](TableScope.md#licensemanager)
- [listenerAbortController](TableScope.md#listenerabortcontroller)
- [loggingActive](TableScope.md#loggingactive)
- [mouseEvent](TableScope.md#mouseevent)
- [mouseHandler](TableScope.md#mousehandler)
- [pendingContentScroll](TableScope.md#pendingcontentscroll)
- [pixelLimitForFullVisible](TableScope.md#pixellimitforfullvisible)
- [resizeHandler](TableScope.md#resizehandler)
- [scrollFactorX](TableScope.md#scrollfactorx)
- [scrollFactorY](TableScope.md#scrollfactory)
- [scrollLeft](TableScope.md#scrollleft)
- [scrollTop](TableScope.md#scrolltop)
- [scrollViewport](TableScope.md#scrollviewport)
- [scrollViewportLeft](TableScope.md#scrollviewportleft)
- [selectionService](TableScope.md#selectionservice)
- [shortcutService](TableScope.md#shortcutservice)
- [storeScrollPosStateService](TableScope.md#storescrollposstateservice)
- [storeSortingService](TableScope.md#storesortingservice)
- [storeStateCollapsedExpandService](TableScope.md#storestatecollapsedexpandservice)
- [storedColumnWidths](TableScope.md#storedcolumnwidths)
- [tableModel](TableScope.md#tablemodel)
- [tableOptions](TableScope.md#tableoptions)
- [tree](TableScope.md#tree)
- [maxScrollHeightInPx](TableScope.md#maxscrollheightinpx)

### Methods

- [addAndRenderCellDiv](TableScope.md#addandrendercelldiv)
- [adjustAfterScrolling](TableScope.md#adjustafterscrolling)
- [adjustArea](TableScope.md#adjustarea)
- [adjustBody](TableScope.md#adjustbody)
- [adjustColumnsToRowParent](TableScope.md#adjustcolumnstorowparent)
- [adjustContainersAndRows](TableScope.md#adjustcontainersandrows)
- [adjustDraggingColumn](TableScope.md#adjustdraggingcolumn)
- [adjustHoverColumns](TableScope.md#adjusthovercolumns)
- [adjustHoverRows](TableScope.md#adjusthoverrows)
- [applyCssClasses](TableScope.md#applycssclasses)
- [autoResizeColumns](TableScope.md#autoresizecolumns)
- [calcAutoColumnWidths](TableScope.md#calcautocolumnwidths)
- [checkForScrollPosSaving](TableScope.md#checkforscrollpossaving)
- [clearSelection](TableScope.md#clearselection)
- [contextmenu](TableScope.md#contextmenu)
- [createGeMouseEvent](TableScope.md#creategemouseevent)
- [debounce](TableScope.md#debounce)
- [debounceRepaint](TableScope.md#debouncerepaint)
- [destroy](TableScope.md#destroy)
- [disposeRendering](TableScope.md#disposerendering)
- [drawBigCell](TableScope.md#drawbigcell)
- [ensureRowIsVisible](TableScope.md#ensurerowisvisible)
- [externalFilterChanged](TableScope.md#externalfilterchanged)
- [findRowOfImportantRowspanCell](TableScope.md#findrowofimportantrowspancell)
- [firstInit](TableScope.md#firstinit)
- [focusModel](TableScope.md#focusmodel)
- [getApi](TableScope.md#getapi)
- [getArea](TableScope.md#getarea)
- [getAreaAndSideIdentByAttr](TableScope.md#getareaandsideidentbyattr)
- [getColumnWidths](TableScope.md#getcolumnwidths)
- [getContentScrollRangeY](TableScope.md#getcontentscrollrangey)
- [getDisplayedRowCount](TableScope.md#getdisplayedrowcount)
- [getFirstFullVisibleRowIndex](TableScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableScope.md#getfirstvisiblerowindex)
- [getLastFullVisibleRowIndex](TableScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableScope.md#getlastvisiblerowindex)
- [getNumberByAttr](TableScope.md#getnumberbyattr)
- [getRowHeights](TableScope.md#getrowheights)
- [getScrollerRangeY](TableScope.md#getscrollerrangey)
- [getStringByAttr](TableScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](TableScope.md#gettreearrowcolumnindex)
- [hideDraggingColumn](TableScope.md#hidedraggingcolumn)
- [hideHoverColumn](TableScope.md#hidehovercolumn)
- [hideHoverRow](TableScope.md#hidehoverrow)
- [initRenderEditor](TableScope.md#initrendereditor)
- [isDestroyed](TableScope.md#isdestroyed)
- [isEditing](TableScope.md#isediting)
- [isScrollHeightCapped](TableScope.md#isscrollheightcapped)
- [mouseDraggingEndOnFrame](TableScope.md#mousedraggingendonframe)
- [mouseDraggingOnFrame](TableScope.md#mousedraggingonframe)
- [mouseMove](TableScope.md#mousemove)
- [onActionTriggered](TableScope.md#onactiontriggered)
- [onFocusChanged](TableScope.md#onfocuschanged)
- [onHeaderDblClicked](TableScope.md#onheaderdblclicked)
- [onMouseClicked](TableScope.md#onmouseclicked)
- [onMouseDown](TableScope.md#onmousedown)
- [onSelectionChanged](TableScope.md#onselectionchanged)
- [onWheel](TableScope.md#onwheel)
- [publishGeMouseEvent](TableScope.md#publishgemouseevent)
- [reSort](TableScope.md#resort)
- [reapplySorting](TableScope.md#reapplysorting)
- [recalcColumnWidths](TableScope.md#recalccolumnwidths)
- [recalcWrappers](TableScope.md#recalcwrappers)
- [renderContentOfDraggingColumn](TableScope.md#rendercontentofdraggingcolumn)
- [renderContentOfDraggingColumnForArea](TableScope.md#rendercontentofdraggingcolumnforarea)
- [repaint](TableScope.md#repaint)
- [repaintHard](TableScope.md#repainthard)
- [rerenderCellContent](TableScope.md#rerendercellcontent)
- [resetEditorRenderer](TableScope.md#reseteditorrenderer)
- [resetSizeOfWrapperDiv](TableScope.md#resetsizeofwrapperdiv)
- [scrollToIndex](TableScope.md#scrolltoindex)
- [scrollToPixel](TableScope.md#scrolltopixel)
- [selectionModel](TableScope.md#selectionmodel)
- [setColumnWidth](TableScope.md#setcolumnwidth)
- [setDragging](TableScope.md#setdragging)
- [setSelectionModel](TableScope.md#setselectionmodel)
- [snapToDevicePixel](TableScope.md#snaptodevicepixel)
- [sort](TableScope.md#sort)
- [sortByColumn](TableScope.md#sortbycolumn)
- [storeColumnWidths](TableScope.md#storecolumnwidths)
- [toggleExpandCollapseAll](TableScope.md#toggleexpandcollapseall)
- [toggleHeaderGroup](TableScope.md#toggleheadergroup)
- [toggleRowCheckbox](TableScope.md#togglerowcheckbox)
- [updateCells](TableScope.md#updatecells)
- [updateModelValueAfterEdit](TableScope.md#updatemodelvalueafteredit)
- [create](TableScope.md#create)

## Constructors

### constructor

• **new TableScope**(`hostElement`, `tableModel`, `domService`, `tableOptions`, `eventListener`, `copyService?`, `excelService?`): [`TableScope`](TableScope.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `hostElement` | `HTMLDivElement` |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) |
| `tableOptions` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) |
| `eventListener` | [`EventListenerIf`](../interfaces/EventListenerIf.md) |
| `copyService` | [`CopyServiceIf`](../interfaces/CopyServiceIf.md) |
| `excelService` | [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md) |

#### Returns

[`TableScope`](TableScope.md)

#### Overrides

[RenderScope](RenderScope.md).[constructor](RenderScope.md#constructor)

#### Defined in

[src/lib/table/table-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L107)

## Properties

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenter](RenderScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenterGeo](RenderScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEast](RenderScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEastGeo](RenderScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWest](RenderScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWestGeo](RenderScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterCenter](RenderScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterEast](RenderScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterWest](RenderScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderCenter](RenderScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderEast](RenderScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderWest](RenderScope.md#areaheaderwest)

#### Defined in

[src/lib/table/ele-scope.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L30)

___

### areaHeightsOfRenderPass

• `Protected` `Optional` **areaHeightsOfRenderPass**: `Object`

Area heights read once at the start of adjustAfterScrolling() (before the DOM is modified).

#### Type declaration

| Name | Type |
| :------ | :------ |
| `body` | `undefined` \| `number` |
| `footer` | `undefined` \| `number` |
| `header` | `undefined` \| `number` |

#### Inherited from

[RenderScope](RenderScope.md).[areaHeightsOfRenderPass](RenderScope.md#areaheightsofrenderpass)

#### Defined in

[src/lib/table/render-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L107)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedEast](RenderScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedWest](RenderScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFooterTop](RenderScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderHeaderBottom](RenderScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### cleanupFunctions

• `Protected` `Readonly` **cleanupFunctions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `body` | `Function`[] |
| `footer` | `Function`[] |
| `header` | `Function`[] |

#### Inherited from

[RenderScope](RenderScope.md).[cleanupFunctions](RenderScope.md#cleanupfunctions)

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[colAndRowspanModels](RenderScope.md#colandrowspanmodels)

#### Defined in

[src/lib/table/render-scope.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L99)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentDiv](RenderScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L27)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Inherited from

[RenderScope](RenderScope.md).[contentScrollTop](RenderScope.md#contentscrolltop)

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentWrapperDiv](RenderScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L26)

___

### copyService

• `Readonly` **copyService**: [`CopyServiceIf`](../interfaces/CopyServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L113)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[displayedRowCount](RenderScope.md#displayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L73)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[RenderScope](RenderScope.md).[dom](RenderScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L61)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[dragging](RenderScope.md#dragging)

#### Defined in

[src/lib/table/render-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L78)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[draggingColumn](RenderScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L100)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[editing](RenderScope.md#editing)

#### Defined in

[src/lib/table/render-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L79)

___

### eventListener

• `Protected` `Readonly` **eventListener**: [`EventListenerIf`](../interfaces/EventListenerIf.md)

#### Defined in

[src/lib/table/table-scope.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L112)

___

### excelService

• `Readonly` **excelService**: [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L114)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L71)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L69)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getFocusModel](RenderScope.md#getfocusmodel)

#### Defined in

[src/lib/table/render-scope.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L83)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getSelectionModel](RenderScope.md#getselectionmodel)

#### Defined in

[src/lib/table/render-scope.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L82)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hostElement](RenderScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverColumn](RenderScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverRow](RenderScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### inputHandler

• **inputHandler**: [`InputHandler`](InputHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L84)

___

### keyEvent

• `Protected` `Optional` **keyEvent**: [`GeKeyEvent`](GeKeyEvent.md)

#### Defined in

[src/lib/table/table-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L92)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L72)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L70)

___

### licenseManager

• **licenseManager**: [`LicenseManager`](LicenseManager.md)

#### Defined in

[src/lib/table/table-scope.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L76)

___

### listenerAbortController

• `Readonly` **listenerAbortController**: `AbortController`

Signal for all DOM listeners of this table (host element, scroll viewport, window).
[destroy](TableScope.md#destroy) aborts it, which removes every listener at once.

#### Defined in

[src/lib/table/table-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L81)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[loggingActive](RenderScope.md#loggingactive)

#### Defined in

[src/lib/table/render-scope.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L76)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Inherited from

[RenderScope](RenderScope.md).[mouseEvent](RenderScope.md#mouseevent)

#### Defined in

[src/lib/table/render-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L101)

___

### mouseHandler

• **mouseHandler**: [`MouseHandler`](MouseHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L83)

___

### pendingContentScroll

• `Protected` `Optional` **pendingContentScroll**: `Object`

Exact content position requested by scrollToPixel() for a capped scroll height (see TableScope).

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contentTop` | `number` |
| `scrollTop` | `number` |

#### Inherited from

[RenderScope](RenderScope.md).[pendingContentScroll](RenderScope.md#pendingcontentscroll)

#### Defined in

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Inherited from

[RenderScope](RenderScope.md).[pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)

#### Defined in

[src/lib/table/render-scope.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L75)

___

### resizeHandler

• **resizeHandler**: [`ResizeHandler`](ResizeHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L85)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorX](RenderScope.md#scrollfactorx)

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorY](RenderScope.md#scrollfactory)

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollLeft](RenderScope.md#scrollleft)

#### Defined in

[src/lib/table/render-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L84)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollTop](RenderScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewport](RenderScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L24)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewportLeft](RenderScope.md#scrollviewportleft)

#### Defined in

[src/lib/table/render-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L86)

___

### selectionService

• `Protected` **selectionService**: [`SelectionService`](SelectionService.md)

#### Defined in

[src/lib/table/table-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L91)

___

### shortcutService

• **shortcutService**: [`ShortcutService`](ShortcutService.md)

#### Defined in

[src/lib/table/table-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L86)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

#### Inherited from

[RenderScope](RenderScope.md).[storeScrollPosStateService](RenderScope.md#storescrollposstateservice)

#### Defined in

[src/lib/table/render-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L81)

___

### storeSortingService

• `Optional` **storeSortingService**: [`StoreStateSortingService`](StoreStateSortingService.md)

#### Defined in

[src/lib/table/table-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L89)

___

### storeStateCollapsedExpandService

• `Optional` **storeStateCollapsedExpandService**: [`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

#### Defined in

[src/lib/table/table-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L88)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Inherited from

[RenderScope](RenderScope.md).[storedColumnWidths](RenderScope.md#storedcolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L80)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableModel](RenderScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableOptions](RenderScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[tree](RenderScope.md#tree)

#### Defined in

[src/lib/table/render-scope.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L98)

___

### maxScrollHeightInPx

▪ `Static` **maxScrollHeightInPx**: `number` = `8_000_000`

Maximum height (px) of the scrollable content wrapper. Taller tables are scrolled proportionally
(rendering is based on the scroll factor anyway): browsers clamp element heights (Chrome ~33.5 million px)
and GPU rasterization loses precision long before (1px borders disappear and text jitters beyond
~16.7 million px). 8 million px keep sub-pixel precision.

#### Inherited from

[RenderScope](RenderScope.md).[maxScrollHeightInPx](RenderScope.md#maxscrollheightinpx)

#### Defined in

[src/lib/table/ele-scope.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L22)

## Methods

### addAndRenderCellDiv

▸ **addAndRenderCellDiv**(`«destructured»`): [`HTMLDivElement`, `undefined` \| `Function`]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ArgsRenderCellDiv`](../interfaces/ArgsRenderCellDiv.md) |

#### Returns

[`HTMLDivElement`, `undefined` \| `Function`]

#### Inherited from

[RenderScope](RenderScope.md).[addAndRenderCellDiv](RenderScope.md#addandrendercelldiv)

#### Defined in

[src/lib/table/render-scope.ts:1081](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1081)

___

### adjustAfterScrolling

▸ **adjustAfterScrolling**(): `void`

Adjusts the table after scrolling. This method performs various adjustments
to the table's appearance and behavior after a scroll event occurs.

#### Returns

`void`

#### Overrides

[RenderScope](RenderScope.md).[adjustAfterScrolling](RenderScope.md#adjustafterscrolling)

#### Defined in

[src/lib/table/table-scope.ts:646](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L646)

___

### adjustArea

▸ **adjustArea**(`areaIdent`, `yStart?`): `void`

Adjusts the layout and positioning of the specified area in the table.
This method is used internally and should not be called directly.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` | The identifier of the area to adjust (e.g. header, body, footer). |
| `yStart?` | `number` | `0` | The starting y-position for the layout adjustments. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustArea](RenderScope.md#adjustarea)

#### Defined in

[src/lib/table/render-scope.ts:628](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L628)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustBody](RenderScope.md#adjustbody)

#### Defined in

[src/lib/table/render-scope.ts:573](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L573)

___

### adjustColumnsToRowParent

▸ **adjustColumnsToRowParent**(`params`): `void`

Adjusts the columns to fit the width of the row's parent element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ArgsAdjustColumnsToRowParentParams`](../interfaces/ArgsAdjustColumnsToRowParentParams.md) | The parameters for adjusting the columns. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustColumnsToRowParent](RenderScope.md#adjustcolumnstorowparent)

#### Defined in

[src/lib/table/render-scope.ts:942](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L942)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)

#### Defined in

[src/lib/table/ele-scope.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L158)

___

### adjustDraggingColumn

▸ **adjustDraggingColumn**(`mouseMoveEvent`, `sourceColumnIndex`, `firstDraggingRendering`): `void`

Adjusts the dragging column during a mouse move event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseMoveEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse move event. |
| `sourceColumnIndex` | `number` | The index of the source column. |
| `firstDraggingRendering` | `boolean` | Indicates if it's the first rendering of the dragging column. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustDraggingColumn](RenderScope.md#adjustdraggingcolumn)

#### Defined in

[src/lib/table/render-scope.ts:1368](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1368)

___

### adjustHoverColumns

▸ **adjustHoverColumns**(`mouseMoveEvent`): `void`

Adjusts the position and size of the hover column based on the mouse move event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseMoveEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse move event object. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustHoverColumns](RenderScope.md#adjusthovercolumns)

#### Defined in

[src/lib/table/render-scope.ts:1292](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1292)

___

### adjustHoverRows

▸ **adjustHoverRows**(`mouseMoveEvent`): `void`

Adjusts the position and size of the hover row based on the mouse move event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseMoveEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse move event. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustHoverRows](RenderScope.md#adjusthoverrows)

#### Defined in

[src/lib/table/render-scope.ts:1252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1252)

___

### applyCssClasses

▸ **applyCssClasses**(`ele`, `cssClasses?`): `void`

Applies CSS classes to an HTML element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ele` | `HTMLDivElement` | The HTML element to which CSS classes will be applied. |
| `cssClasses` | `Object` | An object containing CSS class names as keys and boolean values indicating whether to apply or remove the class. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[applyCssClasses](RenderScope.md#applycssclasses)

#### Defined in

[src/lib/table/render-scope.ts:1200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1200)

___

### autoResizeColumns

▸ **autoResizeColumns**(`recalcWrappers?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `recalcWrappers` | `boolean` | `true` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:965](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L965)

___

### calcAutoColumnWidths

▸ **calcAutoColumnWidths**(): `number`[]

Calculates a width per column that fits the widest text of header, body and footer.

The text is measured with the font and padding of a rendered cell label (canvas `measureText`),
so dates, numbers and long names are no longer cut off. To stay fast with millions of rows, the body
is scanned once by character length and only the longest candidates per column are measured.
Without a canvas (e.g. in tests) it falls back to 8 px per character.

#### Returns

`number`[]

one width in px per column (at least 50 px)

#### Defined in

[src/lib/table/table-scope.ts:908](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L908)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Checks if the scroll position should be saved and saves it.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[checkForScrollPosSaving](RenderScope.md#checkforscrollpossaving)

#### Defined in

[src/lib/table/render-scope.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L356)

___

### clearSelection

▸ **clearSelection**(`rerender?`): `void`

Clears the selection in the component.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rerender` | `boolean` | `false` | Indicates whether to rerender the component after clearing the selection. Default value is false. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[clearSelection](RenderScope.md#clearselection)

#### Defined in

[src/lib/table/render-scope.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L180)

___

### contextmenu

▸ **contextmenu**(`mouseMoveEvent`): `void`

Triggers the context menu event based on the mouse move event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseMoveEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse move event object. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:445](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L445)

___

### createGeMouseEvent

▸ **createGeMouseEvent**(`mouseEvent`): [`GeMouseEvent`](GeMouseEvent.md)

Creates a GeMouseEvent object based on a MouseEvent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseEvent` | `MouseEvent` | The MouseEvent object to create the GeMouseEvent from. |

#### Returns

[`GeMouseEvent`](GeMouseEvent.md)

- The created GeMouseEvent object.

#### Defined in

[src/lib/table/table-scope.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L311)

___

### debounce

▸ **debounce**(`fn`, `delay?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `fn` | () => `void` | `undefined` |
| `delay` | `number` | `1000` |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[debounce](RenderScope.md#debounce)

#### Defined in

[src/lib/table/render-scope.ts:1353](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1353)

___

### debounceRepaint

▸ **debounceRepaint**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:517](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L517)

___

### destroy

▸ **destroy**(): `void`

Releases the table: removes all DOM listeners (host element, scroll viewport, window resize),
stops the resize observer, unregisters from the selection and focus model, calls the cleanup
functions of all cell renderers and clears the host element.

Call it before you create a new `TableScope` for the same host element (e.g. when a framework
wrapper receives a new table model) or when the table is removed from the page.
Calling it twice is harmless.

#### Returns

`void`

**`Example`**

```ts
const scope = new TableScope(hostDiv, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
scope.firstInit();
// later, e.g. when a new model arrives:
scope.destroy();
new TableScope(hostDiv, newTableModel, new SimpleDomService(), new TableOptions(), new EventAdapter()).firstInit();
```

#### Defined in

[src/lib/table/table-scope.ts:283](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L283)

___

### disposeRendering

▸ **disposeRendering**(): `void`

Cancels a pending debounced rendering and calls all renderer cleanup functions
(e.g. unmounts framework components rendered into cells). Used by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[disposeRendering](RenderScope.md#disposerendering)

#### Defined in

[src/lib/table/render-scope.ts:1338](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1338)

___

### drawBigCell

▸ **drawBigCell**(`range`, `xStart`, `yStart`, `areaModel`, `parentDiv`, `sideIdent`): `void`

Draws big cells (rowspan and or colspan) in body/center

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | CellRange |
| `xStart` | `number` | X position in pixel for top left corner |
| `yStart` | `number` | Y position in pixel for top left corner |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | AreaModelIf |
| `parentDiv` | `HTMLDivElement` | Parent div as HTMLDivElement |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) | SideIdent (west,center,east) |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[drawBigCell](RenderScope.md#drawbigcell)

#### Defined in

[src/lib/table/render-scope.ts:833](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L833)

___

### ensureRowIsVisible

▸ **ensureRowIsVisible**(`rowIndex`): `boolean`

Ensures that a specific row is visible in the viewport by scrolling if necessary.
This method checks if the target row is within the currently visible range and
adjusts the scroll position if it's not visible.

The method performs the following:
1. Checks if the row is above the current viewport (before first visible row)
2. Checks if the row is below the current viewport (after last visible row)
3. Scrolls to make the row visible if needed

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to make visible |

#### Returns

`boolean`

Returns true if scrolling was needed and performed, false if the row was already visible

**`Example`**

```ts
// Ensure row 5 is visible in the viewport
tableScope.ensureRowIsVisible(5);
```

**`Throws`**

Implicitly may throw if rowIndex is not a number or if required properties are undefined

**`See`**

 - [scrollToIndex](TableScope.md#scrolltoindex) - The underlying method used for scrolling
 - [getDisplayedRowCount](TableScope.md#getdisplayedrowcount) - Related method for getting visible row count

#### Defined in

[src/lib/table/table-scope.ts:1037](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1037)

___

### externalFilterChanged

▸ **externalFilterChanged**(`clearSelection?`): `void`

Updates the table (repaint) when an external filter is changed.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `clearSelection` | `boolean` | `true` | Indicates whether to clear the selection model or not. Default value is true. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:541](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L541)

___

### findRowOfImportantRowspanCell

▸ **findRowOfImportantRowspanCell**(`areaModel`, `rowIndex`, `colIndex`): `number`

Finds the row index of an important rowspan cell in a given area model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | The area model to search in. |
| `rowIndex` | `number` | The current row index. |
| `colIndex` | `number` | The current column index. |

#### Returns

`number`

- The row index of the important rowspan cell, or -1 if not found.

#### Inherited from

[RenderScope](RenderScope.md).[findRowOfImportantRowspanCell](RenderScope.md#findrowofimportantrowspancell)

#### Defined in

[src/lib/table/render-scope.ts:921](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L921)

___

### firstInit

▸ **firstInit**(): [`TableScope`](TableScope.md)

Initializes the table. Called by the table component.

#### Returns

[`TableScope`](TableScope.md)

This instance of the table scope.

**`Function`**

firstInit

**`Memberof`**

TableScope

#### Defined in

[src/lib/table/table-scope.ts:253](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L253)

___

### focusModel

▸ **focusModel**(): `undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

Retrieves the focus model.

#### Returns

`undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

The focus model if it exists, or undefined otherwise.

#### Defined in

[src/lib/table/table-scope.ts:733](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L733)

___

### getApi

▸ **getApi**(): [`TableApi`](TableApi.md)

Retrieves the TableApi object.

#### Returns

[`TableApi`](TableApi.md)

The TableApi object.

#### Defined in

[src/lib/table/table-scope.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L240)

___

### getArea

▸ **getArea**(`areaIdent`, `sideIdent`): [`DivScope`](../modules.md#divscope)

Retrieves the specified area from the grid layout.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier for the area ('header', 'body', or 'footer'). |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) | The identifier for the side of the area ('west', 'center', or 'east'). |

#### Returns

[`DivScope`](../modules.md#divscope)

- The requested area element.

**`Throws`**

- If the area identifier or side identifier is incorrect.

#### Inherited from

[RenderScope](RenderScope.md).[getArea](RenderScope.md#getarea)

#### Defined in

[src/lib/table/render-scope.ts:493](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L493)

___

### getAreaAndSideIdentByAttr

▸ **getAreaAndSideIdentByAttr**(`srcElement`): [`undefined` \| [`AreaIdent`](../modules.md#areaident), `undefined` \| [`SideIdent`](../modules.md#sideident)]

#### Parameters

| Name | Type |
| :------ | :------ |
| `srcElement` | `HTMLElement` |

#### Returns

[`undefined` \| [`AreaIdent`](../modules.md#areaident), `undefined` \| [`SideIdent`](../modules.md#sideident)]

#### Inherited from

[RenderScope](RenderScope.md).[getAreaAndSideIdentByAttr](RenderScope.md#getareaandsideidentbyattr)

#### Defined in

[src/lib/table/render-scope.ts:473](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L473)

___

### getColumnWidths

▸ **getColumnWidths**(`startIndex`, `endIndex`): `number`[]

Retrieves the column widths of a table within a specified range.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startIndex` | `number` | The index of the first column to retrieve the width of. |
| `endIndex` | `number` | The index of the last column to retrieve the width of. |

#### Returns

`number`[]

An array containing the widths of the columns within the specified range.

#### Inherited from

[RenderScope](RenderScope.md).[getColumnWidths](RenderScope.md#getcolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:1221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1221)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)

#### Defined in

[src/lib/table/render-scope.ts:538](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L538)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:455](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L455)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:447](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L447)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:439](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L439)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:451](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L451)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:443](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L443)

___

### getNumberByAttr

▸ **getNumberByAttr**(`srcElement`, `key`): `number`

Returns a number value extracted from the specified attribute of the source element.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `srcElement` | `HTMLElement` | The source element from which to extract the attribute value. |
| `key` | `string` | The attribute key to extract the value from. |

#### Returns

`number`

- The extracted number value, or -1 if the attribute was not found or not a valid number.

#### Inherited from

[RenderScope](RenderScope.md).[getNumberByAttr](RenderScope.md#getnumberbyattr)

#### Defined in

[src/lib/table/render-scope.ts:594](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L594)

___

### getRowHeights

▸ **getRowHeights**(`startIndex`, `endIndex`, `areaModel`): `number`[]

Retrieves the heights of rows within a specified range.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `startIndex` | `number` | The index of the first row in the range. |
| `endIndex` | `number` | The index of the last row in the range. |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | The area model. |

#### Returns

`number`[]

- An array containing the heights of the rows within the specified range.

#### Inherited from

[RenderScope](RenderScope.md).[getRowHeights](RenderScope.md#getrowheights)

#### Defined in

[src/lib/table/render-scope.ts:1237](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1237)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getScrollerRangeY](RenderScope.md#getscrollerrangey)

#### Defined in

[src/lib/table/render-scope.ts:543](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L543)

___

### getStringByAttr

▸ **getStringByAttr**(`srcElement`, `key`): `string`

Retrieves the value of the specified attribute from the nearest ancestor element that has the attribute.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `srcElement` | `HTMLElement` | The source element from which to start searching for the nearest ancestor element. |
| `key` | `string` | The name of the attribute to retrieve. |

#### Returns

`string`

The value of the specified attribute, or an empty string if the attribute is not found.

#### Inherited from

[RenderScope](RenderScope.md).[getStringByAttr](RenderScope.md#getstringbyattr)

#### Defined in

[src/lib/table/render-scope.ts:611](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L611)

___

### getTreeArrowColumnIndex

▸ **getTreeArrowColumnIndex**(): ``0`` \| ``1``

Retrieves the column index of the tree arrow column in the table.

#### Returns

``0`` \| ``1``

The column index of the tree arrow column.
               Returns 0 if the checkbox is not visible,
               otherwise returns 1.

#### Inherited from

[RenderScope](RenderScope.md).[getTreeArrowColumnIndex](RenderScope.md#gettreearrowcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:1070](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1070)

___

### hideDraggingColumn

▸ **hideDraggingColumn**(): `void`

Hides the dragging column by applying a 'display: none' style to it.
This method is protected and can only be accessed within the class.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[hideDraggingColumn](RenderScope.md#hidedraggingcolumn)

#### Defined in

[src/lib/table/render-scope.ts:1489](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1489)

___

### hideHoverColumn

▸ **hideHoverColumn**(): `void`

Hide hover column.

This method hides the hover column by applying a style of 'display: none'
to the element representing the hover column.

#### Returns

`void`

**`Memberof`**

ClassName

#### Inherited from

[RenderScope](RenderScope.md).[hideHoverColumn](RenderScope.md#hidehovercolumn)

#### Defined in

[src/lib/table/render-scope.ts:1320](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1320)

___

### hideHoverRow

▸ **hideHoverRow**(): `void`

Hides the hover row by applying 'display: none' style to it.

#### Returns

`void`

**`Function`**

**`Name`**

hideHoverRow

**`Memberof`**

ClassName

#### Inherited from

[RenderScope](RenderScope.md).[hideHoverRow](RenderScope.md#hidehoverrow)

#### Defined in

[src/lib/table/render-scope.ts:1281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1281)

___

### initRenderEditor

▸ **initRenderEditor**(`rowIdx`, `colIdx`): `void`

Initializes and renders the editor for a specified row and column index.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIdx` | `number` | The index of the row. |
| `colIdx` | `number` | The index of the column. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[initRenderEditor](RenderScope.md#initrendereditor)

#### Defined in

[src/lib/table/render-scope.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L196)

___

### isDestroyed

▸ **isDestroyed**(): `boolean`

Returns `true` once [destroy](TableScope.md#destroy) has been called.

#### Returns

`boolean`

#### Defined in

[src/lib/table/table-scope.ts:301](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L301)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isEditing](RenderScope.md#isediting)

#### Defined in

[src/lib/table/render-scope.ts:153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L153)

___

### isScrollHeightCapped

▸ **isScrollHeightCapped**(): `boolean`

True if the table content is taller than [EleScope.maxScrollHeightInPx](TableScope.md#maxscrollheightinpx); then the scroll bar is
scaled and scrollTop is no longer a content pixel position.

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isScrollHeightCapped](RenderScope.md#isscrollheightcapped)

#### Defined in

[src/lib/table/render-scope.ts:533](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L533)

___

### mouseDraggingEndOnFrame

▸ **mouseDraggingEndOnFrame**(`mouseEvent`): `void`

Handles the end of mouse dragging event on a frame.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse event object. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:407](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L407)

___

### mouseDraggingOnFrame

▸ **mouseDraggingOnFrame**(`mouseEvent`, `startMouseEvent`): `void`

Handles mouse dragging on the frame.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse event object. |
| `startMouseEvent` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) |  |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:367](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L367)

___

### mouseMove

▸ **mouseMove**(`mouseMoveEvent`): `void`

Handles the mouse move event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseMoveEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse move event object. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:432](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L432)

___

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided actionId.

This function can be invoked manually via the table API or by keyboard shortcuts.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` | The identifier of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was triggered successfully, false otherwise.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/table-scope.ts:178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L178)

___

### onFocusChanged

▸ **onFocusChanged**(`sm`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sm` | [`FocusModelIf`](../interfaces/FocusModelIf.md) |

#### Returns

`void`

#### Implementation of

[EventFocusChangedListenerIf](../interfaces/EventFocusChangedListenerIf.md).[onFocusChanged](../interfaces/EventFocusChangedListenerIf.md#onfocuschanged)

#### Defined in

[src/lib/table/table-scope.ts:525](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L525)

___

### onHeaderDblClicked

▸ **onHeaderDblClicked**(`event`, `_rowIdx`, `colIdx`): `void`

Handle the double click event on the table header.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `MouseEvent` | The mouse event that triggered the double click. |
| `_rowIdx` | `number` | The row index of the header. |
| `colIdx` | `number` | The column index of the header. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:565](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L565)

___

### onMouseClicked

▸ **onMouseClicked**(`evt`, `previousEvt`): `boolean`

Handle mouse click events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse click event. |
| `previousEvt` | `undefined` \| [`GeMouseEvent`](GeMouseEvent.md) | The previous mouse click event, if any. |

#### Returns

`boolean`

#### Defined in

[src/lib/table/table-scope.ts:502](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L502)

___

### onMouseDown

▸ **onMouseDown**(`mouseEvent`): `void`

Handles the mouse down event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mouseEvent` | [`GeMouseEvent`](GeMouseEvent.md) | The mouse event object. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:346](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L346)

___

### onSelectionChanged

▸ **onSelectionChanged**(`sm`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sm` | [`SelectionModelIf`](../interfaces/SelectionModelIf.md) |

#### Returns

`void`

#### Implementation of

[EventSelectionChangedListenerIf](../interfaces/EventSelectionChangedListenerIf.md).[onSelectionChanged](../interfaces/EventSelectionChangedListenerIf.md#onselectionchanged)

#### Defined in

[src/lib/table/table-scope.ts:529](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L529)

___

### onWheel

▸ **onWheel**(`evt`): `void`

Mouse wheel on a capped scroll height: scale the wheel delta, so one wheel step still moves the content
by the usual amount of pixels (otherwise it would jump many rows). No-op for normal tables.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `WheelEvent` | the wheel event of the scroll viewport |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[onWheel](RenderScope.md#onwheel)

#### Defined in

[src/lib/table/render-scope.ts:553](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L553)

___

### publishGeMouseEvent

▸ **publishGeMouseEvent**(`evt`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeMouseEvent`](GeMouseEvent.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:521](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L521)

___

### reSort

▸ **reSort**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:981](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L981)

___

### reapplySorting

▸ **reapplySorting**(): `void`

Sorts the (freshly filtered) body rows again, so a filter keeps the current order:
the last `sort(compareFn)` call, otherwise the columns with a `sortState` (header icons).

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:998](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L998)

___

### recalcColumnWidths

▸ **recalcColumnWidths**(`clientWidth?`): `void`

Recalculates the column widths of the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientWidth?` | `number` | The client width of the table. If not provided, the client width of the scroll viewport will be used. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[recalcColumnWidths](RenderScope.md#recalccolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L254)

___

### recalcWrappers

▸ **recalcWrappers**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:975](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L975)

___

### renderContentOfDraggingColumn

▸ **renderContentOfDraggingColumn**(`columnGeo`): `void`

Renders the content of a dragging column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnGeo` | [`GeoData`](GeoData.md) | The geographic data of the column. |

#### Returns

`void`

The y-coordinate of the rendered content.

#### Inherited from

[RenderScope](RenderScope.md).[renderContentOfDraggingColumn](RenderScope.md#rendercontentofdraggingcolumn)

#### Defined in

[src/lib/table/render-scope.ts:1405](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1405)

___

### renderContentOfDraggingColumnForArea

▸ **renderContentOfDraggingColumnForArea**(`columnGeo`, `areaIdent`, `y?`): `number`

Renders the content of the dragging column for a specific area.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `columnGeo` | [`GeoData`](GeoData.md) | `undefined` | The geometry data of the dragging column. |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` | The identifier of the area. |
| `y?` | `number` | `0` | The starting y-position. |

#### Returns

`number`

The final y-position after rendering all the content.

#### Inherited from

[RenderScope](RenderScope.md).[renderContentOfDraggingColumnForArea](RenderScope.md#rendercontentofdraggingcolumnforarea)

#### Defined in

[src/lib/table/render-scope.ts:1420](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1420)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[repaint](RenderScope.md#repaint)

#### Defined in

[src/lib/table/render-scope.ts:228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L228)

___

### repaintHard

▸ **repaintHard**(): `void`

Repaints the UI by resetting the size of the wrapper div,
adjusting the containers and rows, and performing additional adjustments
after scrolling.

#### Returns

`void`

This method does not return any value.

#### Inherited from

[RenderScope](RenderScope.md).[repaintHard](RenderScope.md#repainthard)

#### Defined in

[src/lib/table/render-scope.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L240)

___

### rerenderCellContent

▸ **rerenderCellContent**(`«destructured»`): `void`

Rerenders the content of a table cell based on the given parameters.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`TableCellUpdateEventIf`](../interfaces/TableCellUpdateEventIf.md) |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[rerenderCellContent](RenderScope.md#rerendercellcontent)

#### Defined in

[src/lib/table/render-scope.ts:398](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L398)

___

### resetEditorRenderer

▸ **resetEditorRenderer**(): `void`

Resets the editor renderer by clearing its values and state.

#### Returns

`void`

**`Function`**

resetEditorRenderer

**`Memberof`**

ClassName

#### Inherited from

[RenderScope](RenderScope.md).[resetEditorRenderer](RenderScope.md#reseteditorrenderer)

#### Defined in

[src/lib/table/render-scope.ts:166](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L166)

___

### resetSizeOfWrapperDiv

▸ **resetSizeOfWrapperDiv**(): `void`

Resets the size of the wrapper div based on the content dimensions.

#### Returns

`void`

Returns nothing.

#### Inherited from

[RenderScope](RenderScope.md).[resetSizeOfWrapperDiv](RenderScope.md#resetsizeofwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:312](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L312)

___

### scrollToIndex

▸ **scrollToIndex**(`_indexX`, `indexY`): `void`

Scrolls to the specified index in the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_indexX` | `number` | The horizontal index of the table where scrolling is needed. |
| `indexY` | `number` | The vertical index of the table where scrolling is needed. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:640](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L640)

___

### scrollToPixel

▸ **scrollToPixel**(`px`, `py`): `void`

Scrolls the viewport to the specified pixel coordinates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `px` | `number` | The horizontal pixel coordinate to scroll to. |
| `py` | `number` | The vertical pixel coordinate to scroll to. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:616](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L616)

___

### selectionModel

▸ **selectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Retrieves the selection model.

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The selection model if available, otherwise undefined.

#### Defined in

[src/lib/table/table-scope.ts:721](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L721)

___

### setColumnWidth

▸ **setColumnWidth**(`columnIndex`, `width`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |
| `width` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:961](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L961)

___

### setDragging

▸ **setDragging**(`dragging`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dragging` | `boolean` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:740](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L740)

___

### setSelectionModel

▸ **setSelectionModel**(`sm`, `rerender?`): `void`

Sets the selection model for the table.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `sm` | [`SelectionModel`](SelectionModel.md) | `undefined` | The selection model to be set. |
| `rerender` | `boolean` | `false` | Optional parameter indicating whether to rerender the table after setting the selection model. Default value is false. |

#### Returns

`void`

- This method does not return any value.

#### Defined in

[src/lib/table/table-scope.ts:669](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L669)

___

### snapToDevicePixel

▸ **snapToDevicePixel**(`px`): `number`

Rounds a pixel offset to whole device pixels. The scroll offsets are derived from a scroll factor and are
fractional; rows and cells placed at fractional positions render blurry text and 1px borders.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `px` | `number` | offset in CSS pixels |

#### Returns

`number`

offset snapped to the device pixel grid

#### Inherited from

[RenderScope](RenderScope.md).[snapToDevicePixel](RenderScope.md#snaptodevicepixel)

#### Defined in

[src/lib/table/render-scope.ts:524](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L524)

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

[src/lib/table/table-scope.ts:987](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L987)

___

### sortByColumn

▸ **sortByColumn**(`column`, `sortState?`): `boolean`

Sorts the body by one column – the same as a double click on its header (header icon, filter and
auto-restore included). Without `sortState` the next state of the column's sort order is used
(asc → desc → asc …).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` | column index or property, e.g. 10 or "total" |
| `sortState?` | [`SortState`](../modules.md#sortstate) | "asc", "desc" or "" (unsorted icon, rows keep their current order) |

#### Returns

`boolean`

false if the column does not exist

#### Defined in

[src/lib/table/table-scope.ts:583](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L583)

___

### storeColumnWidths

▸ **storeColumnWidths**(): `void`

Stores the widths of all columns in the table.

#### Returns

`void`

**`Function`**

storeColumnWidths

#### Inherited from

[RenderScope](RenderScope.md).[storeColumnWidths](RenderScope.md#storecolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L466)

___

### toggleExpandCollapseAll

▸ **toggleExpandCollapseAll**(`expand?`): `void`

Toggles the expand or collapse state of all items in the body area model.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `expand?` | `boolean` | `true` | Whether to expand or collapse all items. Default is true. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L466)

___

### toggleHeaderGroup

▸ **toggleHeaderGroup**(`mouseTargetData`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mouseTargetData` | [`MouseTargetData`](MouseTargetData.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:679](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L679)

___

### toggleRowCheckbox

▸ **toggleRowCheckbox**(`rowIdx`, `_colIdx`, `areaIdent`): `void`

Toggles the checkbox state of a specific row in a table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIdx` | `number` | The index of the row to toggle the checkbox state. |
| `_colIdx` | `number` | The index of the column. This parameter is unused. |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | The identifier of the table area. |

#### Returns

`void`

- This method does not return anything.

#### Defined in

[src/lib/table/table-scope.ts:485](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L485)

___

### updateCells

▸ **updateCells**(`events`, `repaintAll?`): `void`

Updates the cells in the table with the provided values and optionally repaints all cells.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `events` | [`TableCellUpdateEventIf`](../interfaces/TableCellUpdateEventIf.md)[] | `undefined` | The array of events containing information about the cells to update. |
| `repaintAll` | `boolean` | `false` | Optional. If true, repaints all cells after updating. Defaults to false. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[updateCells](RenderScope.md#updatecells)

#### Defined in

[src/lib/table/render-scope.ts:371](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L371)

___

### updateModelValueAfterEdit

▸ **updateModelValueAfterEdit**(`areaIdent`, `rowIndex`, `columnIndex`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `rowIndex` | `number` |
| `columnIndex` | `number` |
| `value` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L222)

___

### create

▸ **create**(`hostElement`, `tableModel`, `tableOptions?`, `eventListener?`, `domService?`, `copyService?`): [`TableScope`](TableScope.md)

Creates a TableScope instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostElement` | `HTMLDivElement` | The HTML div element that will contain the table. |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | The table model object. |
| `tableOptions?` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) | The optional table options object. |
| `eventListener?` | [`EventListenerIf`](../interfaces/EventListenerIf.md) | The optional event listener object. |
| `domService?` | [`DomServiceIf`](../interfaces/DomServiceIf.md) | The optional DOM service object. |
| `copyService?` | [`CopyServiceIf`](../interfaces/CopyServiceIf.md) | The optional copy service object. |

#### Returns

[`TableScope`](TableScope.md)

- The newly created TableScope instance.

#### Defined in

[src/lib/table/table-scope.ts:166](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L166)
