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

- [allExpanded](TableScope.md#allexpanded)
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
- [ariaIds](TableScope.md#ariaids)
- [ariaTexts](TableScope.md#ariatexts)
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
- [debounceTimeout](TableScope.md#debouncetimeout)
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
- [headerFocus](TableScope.md#headerfocus)
- [hostElement](TableScope.md#hostelement)
- [hoverColumn](TableScope.md#hovercolumn)
- [hoverRow](TableScope.md#hoverrow)
- [inputHandler](TableScope.md#inputhandler)
- [keyEvent](TableScope.md#keyevent)
- [lastFullVisibleRowIndex](TableScope.md#lastfullvisiblerowindex)
- [lastVisibleRowIndex](TableScope.md#lastvisiblerowindex)
- [licenseManager](TableScope.md#licensemanager)
- [listenerAbortController](TableScope.md#listenerabortcontroller)
- [liveAnnouncer](TableScope.md#liveannouncer)
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
- [stateService](TableScope.md#stateservice)
- [storeScrollPosStateService](TableScope.md#storescrollposstateservice)
- [storeSortingService](TableScope.md#storesortingservice)
- [storeStateCollapsedExpandService](TableScope.md#storestatecollapsedexpandservice)
- [storedColumnWidths](TableScope.md#storedcolumnwidths)
- [tableModel](TableScope.md#tablemodel)
- [tableOptions](TableScope.md#tableoptions)
- [tableOverlay](TableScope.md#tableoverlay)
- [tree](TableScope.md#tree)
- [actionsBlockedWhileLoading](TableScope.md#actionsblockedwhileloading)
- [filterAnnouncementDelayInMs](TableScope.md#filterannouncementdelayinms)
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
- [adjustRowNumberColumnWidth](TableScope.md#adjustrownumbercolumnwidth)
- [afterRenderPass](TableScope.md#afterrenderpass)
- [announce](TableScope.md#announce)
- [announceCopied](TableScope.md#announcecopied)
- [applyCellAria](TableScope.md#applycellaria)
- [applyCssClasses](TableScope.md#applycssclasses)
- [applyRowAria](TableScope.md#applyrowaria)
- [applySortItems](TableScope.md#applysortitems)
- [autoResizeColumns](TableScope.md#autoresizecolumns)
- [calcAutoColumnWidths](TableScope.md#calcautocolumnwidths)
- [cancelEditing](TableScope.md#cancelediting)
- [cancelPendingRepaint](TableScope.md#cancelpendingrepaint)
- [checkForScrollPosSaving](TableScope.md#checkforscrollpossaving)
- [clearSelection](TableScope.md#clearselection)
- [contextmenu](TableScope.md#contextmenu)
- [createGeMouseEvent](TableScope.md#creategemouseevent)
- [debounce](TableScope.md#debounce)
- [debounceRepaint](TableScope.md#debouncerepaint)
- [destroy](TableScope.md#destroy)
- [disposeRendering](TableScope.md#disposerendering)
- [drawBigCell](TableScope.md#drawbigcell)
- [ensureColumnIsVisible](TableScope.md#ensurecolumnisvisible)
- [ensureRowIsVisible](TableScope.md#ensurerowisvisible)
- [externalFilterChanged](TableScope.md#externalfilterchanged)
- [findRowOfImportantRowspanCell](TableScope.md#findrowofimportantrowspancell)
- [firstInit](TableScope.md#firstinit)
- [focusModel](TableScope.md#focusmodel)
- [getApi](TableScope.md#getapi)
- [getArea](TableScope.md#getarea)
- [getAreaAndSideIdentByAttr](TableScope.md#getareaandsideidentbyattr)
- [getAreaChild](TableScope.md#getareachild)
- [getAriaGridInfo](TableScope.md#getariagridinfo)
- [getAvailableColumnWidth](TableScope.md#getavailablecolumnwidth)
- [getCheckboxAriaLabel](TableScope.md#getcheckboxarialabel)
- [getColumnAriaLabel](TableScope.md#getcolumnarialabel)
- [getColumnLeftInHost](TableScope.md#getcolumnleftinhost)
- [getColumnWidths](TableScope.md#getcolumnwidths)
- [getContentScrollLeft](TableScope.md#getcontentscrollleft)
- [getContentScrollRangeY](TableScope.md#getcontentscrollrangey)
- [getDisplayedRowCount](TableScope.md#getdisplayedrowcount)
- [getFirstDataColumnIndex](TableScope.md#getfirstdatacolumnindex)
- [getFirstFullVisibleRowIndex](TableScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableScope.md#getfirstvisiblerowindex)
- [getHeaderFocus](TableScope.md#getheaderfocus)
- [getLastFullVisibleRowIndex](TableScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableScope.md#getlastvisiblerowindex)
- [getMouseEventTarget](TableScope.md#getmouseeventtarget)
- [getNumberByAttr](TableScope.md#getnumberbyattr)
- [getOverlayState](TableScope.md#getoverlaystate)
- [getRowHeights](TableScope.md#getrowheights)
- [getScrollLeftForColumnIndex](TableScope.md#getscrollleftforcolumnindex)
- [getScrollerRangeY](TableScope.md#getscrollerrangey)
- [getStringByAttr](TableScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](TableScope.md#gettreearrowcolumnindex)
- [headerGroupsChanged](TableScope.md#headergroupschanged)
- [hideDraggingColumn](TableScope.md#hidedraggingcolumn)
- [hideHoverColumn](TableScope.md#hidehovercolumn)
- [hideHoverRow](TableScope.md#hidehoverrow)
- [hideOverlay](TableScope.md#hideoverlay)
- [holdSelectionEvents](TableScope.md#holdselectionevents)
- [initHostAria](TableScope.md#inithostaria)
- [initRenderEditor](TableScope.md#initrendereditor)
- [invalidateAggregates](TableScope.md#invalidateaggregates)
- [isColumnResizable](TableScope.md#iscolumnresizable)
- [isDestroyed](TableScope.md#isdestroyed)
- [isEditing](TableScope.md#isediting)
- [isScrollHeightCapped](TableScope.md#isscrollheightcapped)
- [measureRowNumberText](TableScope.md#measurerownumbertext)
- [mouseDraggingEndOnFrame](TableScope.md#mousedraggingendonframe)
- [mouseDraggingOnFrame](TableScope.md#mousedraggingonframe)
- [mouseMove](TableScope.md#mousemove)
- [onActionTriggered](TableScope.md#onactiontriggered)
- [onFocusChanged](TableScope.md#onfocuschanged)
- [onHeaderDblClicked](TableScope.md#onheaderdblclicked)
- [onMouseClicked](TableScope.md#onmouseclicked)
- [onMouseDown](TableScope.md#onmousedown)
- [onOverlayChanged](TableScope.md#onoverlaychanged)
- [onSelectionChanged](TableScope.md#onselectionchanged)
- [onWheel](TableScope.md#onwheel)
- [publishGeMouseEvent](TableScope.md#publishgemouseevent)
- [reSort](TableScope.md#resort)
- [reapplySorting](TableScope.md#reapplysorting)
- [recalcColumnWidths](TableScope.md#recalccolumnwidths)
- [recalcWrappers](TableScope.md#recalcwrappers)
- [removeHostAria](TableScope.md#removehostaria)
- [renderContentOfDraggingColumn](TableScope.md#rendercontentofdraggingcolumn)
- [renderContentOfDraggingColumnForArea](TableScope.md#rendercontentofdraggingcolumnforarea)
- [repaint](TableScope.md#repaint)
- [repaintHard](TableScope.md#repainthard)
- [rerenderCellContent](TableScope.md#rerendercellcontent)
- [rerenderDerivedFooterCells](TableScope.md#rerenderderivedfootercells)
- [rerenderGroupRowCells](TableScope.md#rerendergrouprowcells)
- [resetEditorRenderer](TableScope.md#reseteditorrenderer)
- [resetSizeOfWrapperDiv](TableScope.md#resetsizeofwrapperdiv)
- [restoreHostAriaAttribute](TableScope.md#restorehostariaattribute)
- [scrollToIndex](TableScope.md#scrolltoindex)
- [scrollToPixel](TableScope.md#scrolltopixel)
- [selectionModel](TableScope.md#selectionmodel)
- [setColumnVisible](TableScope.md#setcolumnvisible)
- [setColumnWidth](TableScope.md#setcolumnwidth)
- [setDragging](TableScope.md#setdragging)
- [setFooterVisible](TableScope.md#setfootervisible)
- [setHeaderGroupCollapsed](TableScope.md#setheadergroupcollapsed)
- [setHeaderVisible](TableScope.md#setheadervisible)
- [setHostAriaAttribute](TableScope.md#sethostariaattribute)
- [setPivotConfig](TableScope.md#setpivotconfig)
- [setRowGroupBy](TableScope.md#setrowgroupby)
- [setSelectionModel](TableScope.md#setselectionmodel)
- [setTreeRowExpanded](TableScope.md#settreerowexpanded)
- [showLoadingOverlay](TableScope.md#showloadingoverlay)
- [showNoRowsOverlay](TableScope.md#shownorowsoverlay)
- [snapToDevicePixel](TableScope.md#snaptodevicepixel)
- [sort](TableScope.md#sort)
- [sortByColumn](TableScope.md#sortbycolumn)
- [stateChanged](TableScope.md#statechanged)
- [storeColumnWidths](TableScope.md#storecolumnwidths)
- [toggleExpandCollapseAll](TableScope.md#toggleexpandcollapseall)
- [toggleHeaderGroup](TableScope.md#toggleheadergroup)
- [toggleRowCheckbox](TableScope.md#togglerowcheckbox)
- [updateCells](TableScope.md#updatecells)
- [updateModelValueAfterEdit](TableScope.md#updatemodelvalueafteredit)
- [updateOverlay](TableScope.md#updateoverlay)
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

[src/lib/table/table-scope.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L140)

## Properties

### allExpanded

• **allExpanded**: `boolean` = `true`

The last "expand / collapse all" state – the header icon toggles it.

#### Defined in

[src/lib/table/table-scope.ts:934](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L934)

___

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenter](RenderScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenterGeo](RenderScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEast](RenderScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEastGeo](RenderScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWest](RenderScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWestGeo](RenderScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterCenter](RenderScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterEast](RenderScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterWest](RenderScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderCenter](RenderScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderEast](RenderScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L36)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderWest](RenderScope.md#areaheaderwest)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

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

[src/lib/table/render-scope.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L116)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaIds](RenderScope.md#ariaids)

#### Defined in

[src/lib/table/ele-scope.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L63)

___

### ariaTexts

• `Readonly` **ariaTexts**: [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

Texts for screen readers (English defaults + `tableOptions.ariaTexts`).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaTexts](RenderScope.md#ariatexts)

#### Defined in

[src/lib/table/render-scope.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L125)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedEast](RenderScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedWest](RenderScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFooterTop](RenderScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderHeaderBottom](RenderScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

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

[src/lib/table/render-scope.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L98)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[colAndRowspanModels](RenderScope.md#colandrowspanmodels)

#### Defined in

[src/lib/table/render-scope.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L108)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentDiv](RenderScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L32)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Inherited from

[RenderScope](RenderScope.md).[contentScrollTop](RenderScope.md#contentscrolltop)

#### Defined in

[src/lib/table/render-scope.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L112)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentWrapperDiv](RenderScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### copyService

• `Readonly` **copyService**: [`CopyServiceIf`](../interfaces/CopyServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L146)

___

### debounceTimeout

• `Protected` `Optional` **debounceTimeout**: ``null`` \| `Timeout`

#### Inherited from

[RenderScope](RenderScope.md).[debounceTimeout](RenderScope.md#debouncetimeout)

#### Defined in

[src/lib/table/render-scope.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L118)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[displayedRowCount](RenderScope.md#displayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L82)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[RenderScope](RenderScope.md).[dom](RenderScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L72)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[dragging](RenderScope.md#dragging)

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[draggingColumn](RenderScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L109)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[editing](RenderScope.md#editing)

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### eventListener

• `Protected` `Readonly` **eventListener**: [`EventListenerIf`](../interfaces/EventListenerIf.md)

#### Defined in

[src/lib/table/table-scope.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L145)

___

### excelService

• `Readonly` **excelService**: [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L147)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L80)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L78)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getFocusModel](RenderScope.md#getfocusmodel)

#### Defined in

[src/lib/table/render-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L93)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getSelectionModel](RenderScope.md#getselectionmodel)

#### Defined in

[src/lib/table/render-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L92)

___

### headerFocus

• `Protected` `Optional` **headerFocus**: [`number`, `number`]

The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
first body row, see `TableScope`. `undefined`: the focus is in the body ([FocusModelIf](../interfaces/FocusModelIf.md)).

#### Inherited from

[RenderScope](RenderScope.md).[headerFocus](RenderScope.md#headerfocus)

#### Defined in

[src/lib/table/render-scope.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L139)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hostElement](RenderScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L70)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverColumn](RenderScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverRow](RenderScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### inputHandler

• **inputHandler**: [`InputHandler`](InputHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L94)

___

### keyEvent

• `Protected` `Optional` **keyEvent**: [`GeKeyEvent`](GeKeyEvent.md)

#### Defined in

[src/lib/table/table-scope.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L110)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L81)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L79)

___

### licenseManager

• **licenseManager**: [`LicenseManager`](LicenseManager.md)

#### Defined in

[src/lib/table/table-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L86)

___

### listenerAbortController

• `Readonly` **listenerAbortController**: `AbortController`

Signal for all DOM listeners of this table (host element, scroll viewport, window).
[destroy](TableScope.md#destroy) aborts it, which removes every listener at once.

#### Defined in

[src/lib/table/table-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L91)

___

### liveAnnouncer

• `Readonly` **liveAnnouncer**: [`LiveAnnouncer`](LiveAnnouncer.md)

The live region of this table: screen readers speak its messages (sorting, filter, copy …).
Use [TableApi.announce](TableApi.md#announce) for own messages.

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-scope.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L118)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[loggingActive](RenderScope.md#loggingactive)

#### Defined in

[src/lib/table/render-scope.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L85)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Inherited from

[RenderScope](RenderScope.md).[mouseEvent](RenderScope.md#mouseevent)

#### Defined in

[src/lib/table/render-scope.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L110)

___

### mouseHandler

• **mouseHandler**: [`MouseHandler`](MouseHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L93)

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

[src/lib/table/render-scope.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L114)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Inherited from

[RenderScope](RenderScope.md).[pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)

#### Defined in

[src/lib/table/render-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L84)

___

### resizeHandler

• **resizeHandler**: [`ResizeHandler`](ResizeHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L95)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorX](RenderScope.md#scrollfactorx)

#### Defined in

[src/lib/table/render-scope.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L97)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorY](RenderScope.md#scrollfactory)

#### Defined in

[src/lib/table/render-scope.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L96)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollLeft](RenderScope.md#scrollleft)

#### Defined in

[src/lib/table/render-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L94)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollTop](RenderScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewport](RenderScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewportLeft](RenderScope.md#scrollviewportleft)

#### Defined in

[src/lib/table/render-scope.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L95)

___

### selectionService

• `Protected` **selectionService**: [`SelectionService`](SelectionService.md)

#### Defined in

[src/lib/table/table-scope.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L109)

___

### shortcutService

• **shortcutService**: [`ShortcutService`](ShortcutService.md)

#### Defined in

[src/lib/table/table-scope.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L96)

___

### stateService

• `Readonly` **stateService**: [`TableStateService`](TableStateService.md)

Collects, applies, stores and reports the state of this table (column layout, sorting, scroll, tree, checked
and selected rows …). Use [TableApi.getState](TableApi.md#getstate) / [TableApi.applyState](TableApi.md#applystate).

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L107)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

**`Deprecated`**

since 1.1.92 – no longer used, see [TableStateService](TableStateService.md).

#### Inherited from

[RenderScope](RenderScope.md).[storeScrollPosStateService](RenderScope.md#storescrollposstateservice)

#### Defined in

[src/lib/table/render-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L91)

___

### storeSortingService

• `Optional` **storeSortingService**: [`StoreStateSortingService`](StoreStateSortingService.md)

**`Deprecated`**

since 1.1.92 – always `undefined`; the state is kept by [stateService](TableScope.md#stateservice).

#### Defined in

[src/lib/table/table-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L101)

___

### storeStateCollapsedExpandService

• `Optional` **storeStateCollapsedExpandService**: [`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

**`Deprecated`**

since 1.1.92 – always `undefined`; the state is kept by [stateService](TableScope.md#stateservice).

#### Defined in

[src/lib/table/table-scope.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L99)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Inherited from

[RenderScope](RenderScope.md).[storedColumnWidths](RenderScope.md#storedcolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableModel](RenderScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L71)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableOptions](RenderScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L73)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Inherited from

[RenderScope](RenderScope.md).[tableOverlay](RenderScope.md#tableoverlay)

#### Defined in

[src/lib/table/ele-scope.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L66)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[tree](RenderScope.md#tree)

#### Defined in

[src/lib/table/render-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L107)

___

### actionsBlockedWhileLoading

▪ `Static` **actionsBlockedWhileLoading**: (``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"``)[]

Keyboard actions ignored while a blocking loading overlay is shown ([OverlayOptionsIf.blockInteractionWhileLoading](../interfaces/OverlayOptionsIf.md#blockinteractionwhileloading)).

#### Defined in

[src/lib/table/table-scope.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L120)

___

### filterAnnouncementDelayInMs

▪ `Static` **filterAnnouncementDelayInMs**: `number` = `400`

Delay of the "42 rows" announcement after a filter change (typing in a filter field: one announcement).

#### Defined in

[src/lib/table/table-scope.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L122)

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

[src/lib/table/ele-scope.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L27)

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

[src/lib/table/render-scope.ts:1652](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1652)

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

[src/lib/table/table-scope.ts:1289](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1289)

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

[src/lib/table/render-scope.ts:819](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L819)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustBody](RenderScope.md#adjustbody)

#### Defined in

[src/lib/table/render-scope.ts:764](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L764)

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

[src/lib/table/render-scope.ts:1422](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1422)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)

#### Defined in

[src/lib/table/ele-scope.ts:299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L299)

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

[src/lib/table/render-scope.ts:2006](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2006)

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

[src/lib/table/render-scope.ts:1896](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1896)

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

[src/lib/table/render-scope.ts:1854](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1854)

___

### adjustRowNumberColumnWidth

▸ **adjustRowNumberColumnWidth**(): `boolean`

Fits the width of a leading row number column ([RowNumberColumnDef](RowNumberColumnDef.md)) to its largest number. Cheap on every
render pass: only the text of the largest number is compared; it is measured (canvas) only when it changed.

#### Returns

`boolean`

true if the width changed (the containers must be adjusted)

**`Since`**

1.1.93

#### Inherited from

[RenderScope](RenderScope.md).[adjustRowNumberColumnWidth](RenderScope.md#adjustrownumbercolumnwidth)

#### Defined in

[src/lib/table/render-scope.ts:1595](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1595)

___

### afterRenderPass

▸ **afterRenderPass**(): `void`

Called at the end of every render pass (scroll, repaint). [TableScope](TableScope.md) marks the scroll position of the
table state as changed here (stored and reported debounced, see [TableStateService](TableStateService.md)).

#### Returns

`void`

**`Since`**

1.1.92

#### Overrides

[RenderScope](RenderScope.md).[afterRenderPass](RenderScope.md#afterrenderpass)

#### Defined in

[src/lib/table/table-scope.ts:1092](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1092)

___

### announce

▸ **announce**(`text`, `delayInMs?`): `void`

Speaks a message to screen reader users (polite live region, see [LiveAnnouncer](LiveAnnouncer.md)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | plain text, e.g. "Orders loaded" |
| `delayInMs?` | `number` | wait before the text is written (default [LiveAnnouncer.defaultDelayInMs](LiveAnnouncer.md#defaultdelayinms)) |

#### Returns

`void`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-scope.ts:299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L299)

___

### announceCopied

▸ **announceCopied**(`_text?`): `void`

"12 cells copied" – the selected cells of the shown columns (without a selection: the focused cell).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_text?` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:371](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L371)

___

### applyCellAria

▸ **applyCellAria**(`cell`, `areaIdent`, `areaModel`, `rowIndex`, `columnIndex`): [`number`, `number`]

`role`, `aria-colindex`, spans and `aria-sort` of a cell.

#### Parameters

| Name | Type |
| :------ | :------ |
| `cell` | `HTMLDivElement` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

[`number`, `number`]

rowspan and colspan of the cell (≥ 1)

#### Inherited from

[RenderScope](RenderScope.md).[applyCellAria](RenderScope.md#applycellaria)

#### Defined in

[src/lib/table/render-scope.ts:1089](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1089)

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

[src/lib/table/render-scope.ts:1802](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1802)

___

### applyRowAria

▸ **applyRowAria**(`rowDiv`, `areaIdent`, `areaModel`, `rowIndex`, `rowState?`): `void`

`role="row"` and `aria-rowindex`; body rows of a tree: level, position, expanded; row selection: selected.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `rowDiv` | `HTMLDivElement` | `undefined` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | `undefined` |
| `rowIndex` | `number` | `undefined` |
| `rowState` | `boolean` | `true` |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[applyRowAria](RenderScope.md#applyrowaria)

#### Defined in

[src/lib/table/render-scope.ts:1056](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1056)

___

### applySortItems

▸ **applySortItems**(`sortItems`): `void`

Sorts the body by the given items (first = primary key) and sets the header icons – used to apply a stored
state. Does not repaint.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sortItems` | [`SortItem`](SortItem.md)[] | column index and sort state per sorted column; `[]` only clears the icons |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1671](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1671)

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

[src/lib/table/table-scope.ts:1629](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1629)

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

[src/lib/table/table-scope.ts:1523](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1523)

___

### cancelEditing

▸ **cancelEditing**(`editor?`): `void`

Closes the cell editor without changing the model (Escape in the editor).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `editor?` | `HTMLInputElement` \| `HTMLSelectElement` \| `HTMLTextAreaElement` | the editor element: its value is reset first, so the blur caused by closing does not commit the typed text ("change" event) |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:610](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L610)

___

### cancelPendingRepaint

▸ **cancelPendingRepaint**(): `boolean`

Cancels a repaint scheduled by [debounceRepaint](TableScope.md#debouncerepaint).

#### Returns

`boolean`

true if a repaint was pending

#### Defined in

[src/lib/table/table-scope.ts:1067](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1067)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Marks the scroll position as changed (it is stored with the table state, see [TableStateService](TableStateService.md)).

#### Returns

`void`

**`Deprecated`**

since 1.1.92 – the table does this after every render pass.

#### Inherited from

[RenderScope](RenderScope.md).[checkForScrollPosSaving](RenderScope.md#checkforscrollpossaving)

#### Defined in

[src/lib/table/render-scope.ts:489](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L489)

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

[src/lib/table/render-scope.ts:207](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L207)

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

[src/lib/table/table-scope.ts:901](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L901)

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

[src/lib/table/table-scope.ts:742](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L742)

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

[src/lib/table/render-scope.ts:1988](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1988)

___

### debounceRepaint

▸ **debounceRepaint**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1058](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1058)

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

[src/lib/table/table-scope.ts:706](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L706)

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

[src/lib/table/render-scope.ts:1973](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1973)

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

[src/lib/table/render-scope.ts:1299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1299)

___

### ensureColumnIsVisible

▸ **ensureColumnIsVisible**(`columnIndex`): `boolean`

Ensures that a column of the scrollable center area is fully visible by scrolling horizontally if necessary –
the counterpart of [ensureRowIsVisible](TableScope.md#ensurerowisvisible). A column left of the viewport becomes the first visible column,
a column right of it the last one (a column wider than the viewport: the first). The vertical position is kept.

Fixed west/east columns are always visible: nothing to do.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index (west + center + east) |

#### Returns

`boolean`

true if the table was scrolled, false if the column was already visible (or is fixed / hidden / out of range)

**`Example`**

```ts
tableScope.ensureColumnIsVisible(12);
```

#### Defined in

[src/lib/table/table-scope.ts:1758](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1758)

___

### ensureRowIsVisible

▸ **ensureRowIsVisible**(`rowIndex`): `boolean`

Ensures that a specific row is visible in the viewport by scrolling if necessary.
This method checks if the target row is within the currently visible range and
adjusts the scroll position if it's not visible.

The method performs the following:
1. Checks if the row is above the current viewport (before first visible row)
2. Checks if the row is below the current viewport (after last visible row)
3. Scrolls to make the row visible if needed – vertically only, the horizontal position is kept

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

[src/lib/table/table-scope.ts:1728](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1728)

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

[src/lib/table/table-scope.ts:1136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1136)

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

[src/lib/table/render-scope.ts:1401](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1401)

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

[src/lib/table/table-scope.ts:665](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L665)

___

### focusModel

▸ **focusModel**(): `undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

Retrieves the focus model.

#### Returns

`undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

The focus model if it exists, or undefined otherwise.

#### Defined in

[src/lib/table/table-scope.ts:1410](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1410)

___

### getApi

▸ **getApi**(): [`TableApi`](TableApi.md)

Retrieves the TableApi object.

#### Returns

[`TableApi`](TableApi.md)

The TableApi object.

#### Defined in

[src/lib/table/table-scope.ts:652](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L652)

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

[src/lib/table/render-scope.ts:684](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L684)

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

[src/lib/table/render-scope.ts:664](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L664)

___

### getAreaChild

▸ **getAreaChild**(`area`, `side`): `HTMLDivElement`

The element that holds the rows of an area (`DivScope.child`).

#### Parameters

| Name | Type |
| :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) |
| `side` | [`SideIdent`](../modules.md#sideident) |

#### Returns

`HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[getAreaChild](RenderScope.md#getareachild)

#### Defined in

[src/lib/table/ele-scope.ts:284](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L284)

___

### getAriaGridInfo

▸ **getAriaGridInfo**(): [`AriaGridInfo`](AriaGridInfo.md)

Row and column numbers for screen readers of the current render pass (computed at its start).

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

the counts

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[getAriaGridInfo](RenderScope.md#getariagridinfo)

#### Defined in

[src/lib/table/render-scope.ts:1048](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1048)

___

### getAvailableColumnWidth

▸ **getAvailableColumnWidth**(`hostWidth?`): `number`

The width that % and weight columns share: host width minus the fixed west columns and a vertical scroll bar.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostWidth?` | `number` | the width of the host element (default: its current client width) |

#### Returns

`number`

the width in px (0 if the host has no width yet, e.g. while it is hidden)

#### Inherited from

[RenderScope](RenderScope.md).[getAvailableColumnWidth](RenderScope.md#getavailablecolumnwidth)

#### Defined in

[src/lib/table/render-scope.ts:317](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L317)

___

### getCheckboxAriaLabel

▸ **getCheckboxAriaLabel**(`areaIdent`, `rowIndex`): `string`

Name of a row checkbox: "Select row 5" (body) resp. "Select all rows" (header).

#### Parameters

| Name | Type |
| :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `rowIndex` | `number` |

#### Returns

`string`

#### Inherited from

[RenderScope](RenderScope.md).[getCheckboxAriaLabel](RenderScope.md#getcheckboxarialabel)

#### Defined in

[src/lib/table/render-scope.ts:1228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1228)

___

### getColumnAriaLabel

▸ **getColumnAriaLabel**(`columnIndex`): `string`

The label of a column for screen readers: the header label of its column definition, otherwise the text of the
lowest header row, otherwise the property.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index |

#### Returns

`string`

e.g. "Total"

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[getColumnAriaLabel](RenderScope.md#getcolumnarialabel)

#### Defined in

[src/lib/table/render-scope.ts:1210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1210)

___

### getColumnLeftInHost

▸ **getColumnLeftInHost**(`columnIndex`, `columnLeft`): `number`

The x position of a column relative to the host element: fixed west and east columns do not scroll.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model index of the column |
| `columnLeft` | `number` | x position of the column over all columns (`getXPosByColumnIndex`) |

#### Returns

`number`

the left position in px

#### Inherited from

[RenderScope](RenderScope.md).[getColumnLeftInHost](RenderScope.md#getcolumnleftinhost)

#### Defined in

[src/lib/table/render-scope.ts:1921](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1921)

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

[src/lib/table/render-scope.ts:1823](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1823)

___

### getContentScrollLeft

▸ **getContentScrollLeft**(): `number`

Content pixels of the center columns scrolled out on the left – the offset that is actually rendered
(see adjustColumnsToRowParent), the horizontal counterpart of `contentScrollTop`.

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getContentScrollLeft](RenderScope.md#getcontentscrollleft)

#### Defined in

[src/lib/table/render-scope.ts:1941](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1941)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)

#### Defined in

[src/lib/table/render-scope.ts:729](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L729)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:646](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L646)

___

### getFirstDataColumnIndex

▸ **getFirstDataColumnIndex**(): `number`

Index of the first column that is not a row number column: 1 behind a [RowNumberColumnDef](RowNumberColumnDef.md), otherwise 0.
The checkbox of `showCheckboxWihoutExtraColumn` and the tree arrow are bound to it.

#### Returns

`number`

0 or 1

**`Since`**

1.1.93

#### Inherited from

[RenderScope](RenderScope.md).[getFirstDataColumnIndex](RenderScope.md#getfirstdatacolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:1568](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1568)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:638](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L638)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:630](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L630)

___

### getHeaderFocus

▸ **getHeaderFocus**(): `undefined` \| [`number`, `number`]

The header cell with the keyboard focus (arrow up in the first body row moves the focus into the header).

#### Returns

`undefined` \| [`number`, `number`]

header row and column index of the cell, `undefined` if the focus is in the body

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-scope.ts:415](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L415)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:642](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L642)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:634](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L634)

___

### getMouseEventTarget

▸ **getMouseEventTarget**(`evt`): ``null`` \| `EventTarget`

The element a mouse event belongs to – usually `evt.target`. The scroll viewport lies above the footer areas (its
horizontal scroll bar must stay usable), so a mouse event on a footer cell arrives at the viewport: then the footer
element below the mouse pointer is returned (not on the scroll bar itself).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `MouseEvent` | a mouse event on the host element |

#### Returns

``null`` \| `EventTarget`

the target element

#### Defined in

[src/lib/table/table-scope.ts:770](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L770)

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

[src/lib/table/render-scope.ts:785](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L785)

___

### getOverlayState

▸ **getOverlayState**(): [`GeOverlayKind`](../modules.md#geoverlaykind)

The overlay shown now (see [TableApi.getOverlayState](TableApi.md#getoverlaystate)).

#### Returns

[`GeOverlayKind`](../modules.md#geoverlaykind)

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:339](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L339)

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

[src/lib/table/render-scope.ts:1839](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1839)

___

### getScrollLeftForColumnIndex

▸ **getScrollLeftForColumnIndex**(`columnIndex`): `number`

The horizontal scroll position (`scrollLeft` of the scroll viewport) that shows a column as the first column of
the scrollable center area, clamped to the scroll range.
A fixed west column returns 0 (start); fixed east columns and indices outside the columns return the current position.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index (west + center + east) |

#### Returns

`number`

scrollLeft in scroll bar pixels

#### Defined in

[src/lib/table/table-scope.ts:1264](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1264)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getScrollerRangeY](RenderScope.md#getscrollerrangey)

#### Defined in

[src/lib/table/render-scope.ts:734](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L734)

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

[src/lib/table/render-scope.ts:802](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L802)

___

### getTreeArrowColumnIndex

▸ **getTreeArrowColumnIndex**(): `number`

Retrieves the column index of the tree arrow column in the table.

#### Returns

`number`

The column index of the tree arrow column: the first data column (0, behind a row number
               column 1), one more with a visible row checkbox column.

#### Inherited from

[RenderScope](RenderScope.md).[getTreeArrowColumnIndex](RenderScope.md#gettreearrowcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:1549](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1549)

___

### headerGroupsChanged

▸ **headerGroupsChanged**(): `void`

Rebuilds the layout after a header group was collapsed or expanded (other columns are shown) and marks the
state as changed.

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1360](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1360)

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

[src/lib/table/render-scope.ts:2134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2134)

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

[src/lib/table/render-scope.ts:1955](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1955)

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

[src/lib/table/render-scope.ts:1885](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1885)

___

### hideOverlay

▸ **hideOverlay**(): `void`

Ends an overlay shown by the API (see [TableApi.hideOverlay](TableApi.md#hideoverlay)).

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:330](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L330)

___

### holdSelectionEvents

▸ **holdSelectionEvents**(`fn`): `void`

Runs `fn` and reports all selection changes made in it as ONE `onSelectionChanged` event (a click used to fire
up to three: `clear()`, adding the new range and the selection service itself).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | () => `void` | code that changes the selection model |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1114)

___

### initHostAria

▸ **initHostAria**(): `void`

Sets the static ARIA attributes of the host element: `role="grid"` (a tree body: `"treegrid"`) and its name
and description from the table options. Counts and the active cell follow with every render pass.

#### Returns

`void`

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[initHostAria](RenderScope.md#inithostaria)

#### Defined in

[src/lib/table/ele-scope.ts:269](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L269)

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

[src/lib/table/render-scope.ts:223](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L223)

___

### invalidateAggregates

▸ **invalidateAggregates**(`change?`): `void`

Drops cached, derived values of the area models ([AreaModelIf.invalidateDerivedValues](../interfaces/AreaModelIf.md#invalidatederivedvalues), e.g. the totals of an
[AreaModelAggregateFooter](AreaModelAggregateFooter.md)) – called where data may have changed (filter, sorting, editing, `updateCells`,
the public `tableApi.repaint()` / `repaintHard()`), not on scrolling.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `change?` | [`DerivedValuesChangeIf`](../interfaces/DerivedValuesChangeIf.md) | the changed rows of an edit or `updateCells()` (models may recompute less) |

#### Returns

`void`

**`Since`**

1.1.94

#### Inherited from

[RenderScope](RenderScope.md).[invalidateAggregates](RenderScope.md#invalidateaggregates)

#### Defined in

[src/lib/table/render-scope.ts:267](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L267)

___

### isColumnResizable

▸ **isColumnResizable**(`columnIndex`): `boolean`

false for a row number column: it has no resize handle (its width follows the numbers).

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isColumnResizable](RenderScope.md#iscolumnresizable)

#### Defined in

[src/lib/table/render-scope.ts:1573](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1573)

___

### isDestroyed

▸ **isDestroyed**(): `boolean`

Returns `true` once [destroy](TableScope.md#destroy) has been called.

#### Returns

`boolean`

#### Defined in

[src/lib/table/table-scope.ts:732](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L732)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isEditing](RenderScope.md#isediting)

#### Defined in

[src/lib/table/render-scope.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L180)

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

[src/lib/table/render-scope.ts:724](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L724)

___

### measureRowNumberText

▸ **measureRowNumberText**(`text`): [`number`, `boolean`]

Width in px of a row number text: with the font and padding of a rendered number cell label; before the first
number cell exists with the font of the host and 6 px padding on each side (then `approximate` is true).
Digits are measured as "0" (tabular figures: all digits are as wide as the widest).

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

[`number`, `boolean`]

the width and whether it is approximate

#### Inherited from

[RenderScope](RenderScope.md).[measureRowNumberText](RenderScope.md#measurerownumbertext)

#### Defined in

[src/lib/table/render-scope.ts:1630](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1630)

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

[src/lib/table/table-scope.ts:860](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L860)

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

[src/lib/table/table-scope.ts:817](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L817)

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

[src/lib/table/table-scope.ts:888](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L888)

___

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided actionId.

This function can be invoked manually via the table API or by keyboard shortcuts.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` | The identifier of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was triggered successfully, false otherwise.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/table-scope.ts:231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L231)

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

[src/lib/table/table-scope.ts:1080](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1080)

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

[src/lib/table/table-scope.ts:1165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1165)

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

[src/lib/table/table-scope.ts:1037](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1037)

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

[src/lib/table/table-scope.ts:795](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L795)

___

### onOverlayChanged

▸ **onOverlayChanged**(`change`): `void`

Screen readers: `aria-busy` while loading, the loading text is spoken; "no rows" is spoken when it appears
after the start (not for the initially empty table). "No matching rows" is not spoken: the filter
announcement ([AriaTextsIf.filtered](../interfaces/AriaTextsIf.md#filtered)) already says it.

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | [`TableOverlayChange`](../interfaces/TableOverlayChange.md) |

#### Returns

`void`

#### Overrides

[RenderScope](RenderScope.md).[onOverlayChanged](RenderScope.md#onoverlaychanged)

#### Defined in

[src/lib/table/table-scope.ts:348](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L348)

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

[src/lib/table/table-scope.ts:1096](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1096)

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

[src/lib/table/render-scope.ts:744](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L744)

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

[src/lib/table/table-scope.ts:1076](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1076)

___

### reSort

▸ **reSort**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1647](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1647)

___

### reapplySorting

▸ **reapplySorting**(): `void`

Sorts the (freshly filtered) body rows again, so a filter keeps the current order:
the last `sort(compareFn)` call, otherwise the columns with a `sortState` (header icons).

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1689](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1689)

___

### recalcColumnWidths

▸ **recalcColumnWidths**(`clientWidth?`): `void`

Recalculates the column widths of the table (% and weight columns depend on the available width) and repaints.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientWidth?` | `number` | The (new) width of the host element, e.g. from a ResizeObserver. Default: its current width. |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[recalcColumnWidths](RenderScope.md#recalccolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L300)

___

### recalcWrappers

▸ **recalcWrappers**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1641](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1641)

___

### removeHostAria

▸ **removeHostAria**(): `void`

Removes the ARIA attributes the table has set on the host element (see [initHostAria](TableScope.md#inithostaria)).

#### Returns

`void`

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[removeHostAria](RenderScope.md#removehostaria)

#### Defined in

[src/lib/table/ele-scope.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L252)

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

[src/lib/table/render-scope.ts:2043](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2043)

___

### renderContentOfDraggingColumnForArea

▸ **renderContentOfDraggingColumnForArea**(`columnGeo`, `areaIdent`, `y?`, `firstRowIndex?`, `maxY?`): `number`

Renders the content of the dragging column for a specific area.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `columnGeo` | [`GeoData`](GeoData.md) | `undefined` | The geometry data of the dragging column. |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` | The identifier of the area. |
| `y?` | `number` | `0` | The starting y-position. |
| `firstRowIndex` | `number` | `0` | - |
| `maxY` | `number` | `Number.POSITIVE_INFINITY` | - |

#### Returns

`number`

The final y-position after rendering all the content.

#### Inherited from

[RenderScope](RenderScope.md).[renderContentOfDraggingColumnForArea](RenderScope.md#rendercontentofdraggingcolumnforarea)

#### Defined in

[src/lib/table/render-scope.ts:2063](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2063)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[repaint](RenderScope.md#repaint)

#### Defined in

[src/lib/table/render-scope.ts:255](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L255)

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

[src/lib/table/render-scope.ts:281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L281)

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

[src/lib/table/render-scope.ts:589](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L589)

___

### rerenderDerivedFooterCells

▸ **rerenderDerivedFooterCells**(`events`): `void`

After `updateCells()` without a repaint: draws the rendered cells of a footer with cached totals again (only if the
footer implements [AreaModelIf.invalidateDerivedValues](../interfaces/AreaModelIf.md#invalidatederivedvalues), and not if the events changed the footer itself).

#### Parameters

| Name | Type |
| :------ | :------ |
| `events` | [`TableCellUpdateEventIf`](../interfaces/TableCellUpdateEventIf.md)[] |

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[rerenderDerivedFooterCells](RenderScope.md#rerenderderivedfootercells)

#### Defined in

[src/lib/table/render-scope.ts:565](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L565)

___

### rerenderGroupRowCells

▸ **rerenderGroupRowCells**(): `void`

After `updateCells()` without a repaint: draws the rendered aggregate cells of the group rows of a row grouping
again (they follow the changed rows; labels and counts don't change – a moved row repaints the whole table).

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[rerenderGroupRowCells](RenderScope.md#rerendergrouprowcells)

#### Defined in

[src/lib/table/render-scope.ts:544](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L544)

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

[src/lib/table/render-scope.ts:193](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L193)

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

[src/lib/table/ele-scope.ts:460](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L460)

___

### restoreHostAriaAttribute

▸ **restoreHostAriaAttribute**(`key`): `void`

Gives an ARIA attribute of the host back the value it had before the table changed it (e.g. `aria-busy` after
loading), or removes it if the host had none.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

**`Since`**

1.1.92

#### Inherited from

[RenderScope](RenderScope.md).[restoreHostAriaAttribute](RenderScope.md#restorehostariaattribute)

#### Defined in

[src/lib/table/ele-scope.ts:236](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L236)

___

### scrollToIndex

▸ **scrollToIndex**(`indexX`, `indexY`): `void`

Scrolls to a column and a row: the row becomes the first row of the viewport, the column the first column of the
scrollable center area (as far as the scroll range allows).

A fixed west column scrolls back to the start (x = 0, like before columns were supported). A fixed east column,
`-1` or any other index outside the column range keeps the current horizontal position.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `indexX` | `number` | The column index (model index over west + center + east), `-1` = keep the horizontal position. |
| `indexY` | `number` | The row index of the body. |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1250](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1250)

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

[src/lib/table/table-scope.ts:1222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1222)

___

### selectionModel

▸ **selectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Retrieves the selection model.

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The selection model if available, otherwise undefined.

#### Defined in

[src/lib/table/table-scope.ts:1398](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1398)

___

### setColumnVisible

▸ **setColumnVisible**(`column`, `visible`): `boolean`

Shows or hides a column and repaints (see [TableApi.setColumnVisible](TableApi.md#setcolumnvisible)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | `string` \| `number` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) | column index, property or column definition |
| `visible` | `boolean` | false hides the column |

#### Returns

`boolean`

false if the column has no column definition (or the table model can't hide columns)

#### Defined in

[src/lib/table/table-scope.ts:1588](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1588)

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

[src/lib/table/table-scope.ts:1576](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1576)

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

[src/lib/table/table-scope.ts:1417](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1417)

___

### setFooterVisible

▸ **setFooterVisible**(`visible`): `void`

Shows or hides the footer and repaints (see [TableApi.setFooterVisible](TableApi.md#setfootervisible)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | false hides the footer |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1611](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1611)

___

### setHeaderGroupCollapsed

▸ **setHeaderGroupCollapsed**(`id`, `collapsed`): `boolean`

Collapses or expands a header group by its id ([TableApi.setHeaderGroupCollapsed](TableApi.md#setheadergroupcollapsed)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | `string` | [CellGroupIf.id](../interfaces/CellGroupIf.md#id) or the path of the labels, e.g. `"Customer"` |
| `collapsed` | `boolean` | true = collapse |

#### Returns

`boolean`

false if the header has no such group

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1342](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1342)

___

### setHeaderVisible

▸ **setHeaderVisible**(`visible`): `void`

Shows or hides the header and repaints (see [TableApi.setHeaderVisible](TableApi.md#setheadervisible)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `visible` | `boolean` | false hides the header |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1602](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1602)

___

### setHostAriaAttribute

▸ **setHostAriaAttribute**(`key`, `value`): `void`

Sets (or with `undefined` removes) an ARIA attribute of the host and remembers the app's own value the first
time, so that [removeHostAria](TableScope.md#removehostaria) can restore it (e.g. an `aria-label` the app set on an Angular host).

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `undefined` \| `string` |

#### Returns

`void`

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[setHostAriaAttribute](RenderScope.md#sethostariaattribute)

#### Defined in

[src/lib/table/ele-scope.ts:216](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L216)

___

### setPivotConfig

▸ **setPivotConfig**(`changes`, `rows?`): `boolean`

Pivots a pivot table again (see [TableApi.setPivotConfig](TableApi.md#setpivotconfig)): new columns, header and totals in the same model,
then the layout of the table is built again. Sorting and selection are reset (the columns are different).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | `Partial`\<[`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`any`\>\> | the changed parts of the configuration |
| `rows?` | `unknown`[] | new source rows |

#### Returns

`boolean`

false if the table model is no pivot table

**`Since`**

1.1.94

#### Defined in

[src/lib/table/table-scope.ts:985](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L985)

___

### setRowGroupBy

▸ **setRowGroupBy**(`groupBy`): `boolean`

Groups the rows of a row grouping by other levels (see [TableApi.setRowGroupBy](TableApi.md#setrowgroupby)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupBy` | [`RowGroupField`](../modules.md#rowgroupfield)[] | the new levels, top first |

#### Returns

`boolean`

false if the body is no row grouping

#### Defined in

[src/lib/table/table-scope.ts:961](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L961)

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

[src/lib/table/table-scope.ts:1312](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1312)

___

### setTreeRowExpanded

▸ **setTreeRowExpanded**(`row`, `expanded`): `boolean`

Expands or collapses one row of a tree table, repaints, and remembers the state (`autoRestoreOptions`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> | a tree row of the body model |
| `expanded` | `boolean` | the new state |

#### Returns

`boolean`

false if the body is no tree or the state was already set

#### Defined in

[src/lib/table/table-scope.ts:943](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L943)

___

### showLoadingOverlay

▸ **showLoadingOverlay**(`text?`): `void`

Shows the loading overlay over the body (see [TableApi.showLoadingOverlay](TableApi.md#showloadingoverlay)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay, default [OverlayOptionsIf.loadingText](../interfaces/OverlayOptionsIf.md#loadingtext) |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L311)

___

### showNoRowsOverlay

▸ **showNoRowsOverlay**(`text?`): `void`

Shows the "no rows" overlay (see [TableApi.showNoRowsOverlay](TableApi.md#shownorowsoverlay)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay, default [OverlayOptionsIf.noRowsText](../interfaces/OverlayOptionsIf.md#norowstext) |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:321](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L321)

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

[src/lib/table/render-scope.ts:715](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L715)

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

[src/lib/table/table-scope.ts:1655](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1655)

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

[src/lib/table/table-scope.ts:1183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1183)

___

### stateChanged

▸ **stateChanged**(`evt`): `void`

Reports a changed state to the event listener (called by [TableStateService](TableStateService.md)).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | [`GeStateChangeEvent`](GeStateChangeEvent.md) |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1088](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1088)

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

[src/lib/table/render-scope.ts:657](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L657)

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

[src/lib/table/table-scope.ts:922](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L922)

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

[src/lib/table/table-scope.ts:1325](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1325)

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

[src/lib/table/table-scope.ts:1018](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1018)

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

[src/lib/table/render-scope.ts:501](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L501)

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

[src/lib/table/table-scope.ts:622](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L622)

___

### updateOverlay

▸ **updateOverlay**(): `void`

Shows the overlay that fits the body now (see [TableOverlay.update](TableOverlay.md#update)) and reports a change to
[onOverlayChanged](RenderScope.md#onoverlaychanged).

#### Returns

`void`

**`Since`**

1.1.92

#### Inherited from

[RenderScope](RenderScope.md).[updateOverlay](RenderScope.md#updateoverlay)

#### Defined in

[src/lib/table/render-scope.ts:457](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L457)

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

[src/lib/table/table-scope.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L219)
