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
- [batchEditService](TableScope.md#batcheditservice)
- [borderFixedEast](TableScope.md#borderfixedeast)
- [borderFixedWest](TableScope.md#borderfixedwest)
- [borderFooterTop](TableScope.md#borderfootertop)
- [borderHeaderBottom](TableScope.md#borderheaderbottom)
- [cellEditorService](TableScope.md#celleditorservice)
- [cleanupFunctions](TableScope.md#cleanupfunctions)
- [clipboardService](TableScope.md#clipboardservice)
- [colAndRowspanModels](TableScope.md#colandrowspanmodels)
- [contentDiv](TableScope.md#contentdiv)
- [contentScrollTop](TableScope.md#contentscrolltop)
- [contentWrapperDiv](TableScope.md#contentwrapperdiv)
- [copyService](TableScope.md#copyservice)
- [debounceTimeout](TableScope.md#debouncetimeout)
- [direction](TableScope.md#direction)
- [displayedRowCount](TableScope.md#displayedrowcount)
- [dom](TableScope.md#dom)
- [dragging](TableScope.md#dragging)
- [draggingColumn](TableScope.md#draggingcolumn)
- [draggingTargetColumnIndex](TableScope.md#draggingtargetcolumnindex)
- [editing](TableScope.md#editing)
- [eventListener](TableScope.md#eventlistener)
- [excelService](TableScope.md#excelservice)
- [fillHandleService](TableScope.md#fillhandleservice)
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
- [masterDetailService](TableScope.md#masterdetailservice)
- [mouseEvent](TableScope.md#mouseevent)
- [mouseHandler](TableScope.md#mousehandler)
- [pendingContentScroll](TableScope.md#pendingcontentscroll)
- [pixelLimitForFullVisible](TableScope.md#pixellimitforfullvisible)
- [resizeHandler](TableScope.md#resizehandler)
- [rowDragService](TableScope.md#rowdragservice)
- [scrollFactorX](TableScope.md#scrollfactorx)
- [scrollFactorY](TableScope.md#scrollfactory)
- [scrollLeft](TableScope.md#scrollleft)
- [scrollTop](TableScope.md#scrolltop)
- [scrollViewport](TableScope.md#scrollviewport)
- [scrollViewportLeft](TableScope.md#scrollviewportleft)
- [selectionService](TableScope.md#selectionservice)
- [shortcutKeyEvent](TableScope.md#shortcutkeyevent)
- [shortcutService](TableScope.md#shortcutservice)
- [stateService](TableScope.md#stateservice)
- [storeScrollPosStateService](TableScope.md#storescrollposstateservice)
- [storeSortingService](TableScope.md#storesortingservice)
- [storeStateCollapsedExpandService](TableScope.md#storestatecollapsedexpandservice)
- [storedColumnWidths](TableScope.md#storedcolumnwidths)
- [tableModel](TableScope.md#tablemodel)
- [tableOptions](TableScope.md#tableoptions)
- [tableOverlay](TableScope.md#tableoverlay)
- [tableSheet](TableScope.md#tablesheet)
- [tree](TableScope.md#tree)
- [undoService](TableScope.md#undoservice)
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
- [adjustDetailLayerBounds](TableScope.md#adjustdetaillayerbounds)
- [adjustDraggingColumn](TableScope.md#adjustdraggingcolumn)
- [adjustHoverColumns](TableScope.md#adjusthovercolumns)
- [adjustHoverRows](TableScope.md#adjusthoverrows)
- [adjustRowNumberColumnWidth](TableScope.md#adjustrownumbercolumnwidth)
- [afterRenderPass](TableScope.md#afterrenderpass)
- [afterRowsMoved](TableScope.md#afterrowsmoved)
- [announce](TableScope.md#announce)
- [announceCopied](TableScope.md#announcecopied)
- [applyCellAria](TableScope.md#applycellaria)
- [applyCellChanges](TableScope.md#applycellchanges)
- [applyCssClasses](TableScope.md#applycssclasses)
- [applyRowAria](TableScope.md#applyrowaria)
- [applySortItems](TableScope.md#applysortitems)
- [autoResizeColumns](TableScope.md#autoresizecolumns)
- [calcAutoColumnWidths](TableScope.md#calcautocolumnwidths)
- [canStartEditing](TableScope.md#canstartediting)
- [cancelEditing](TableScope.md#cancelediting)
- [cancelPendingRepaint](TableScope.md#cancelpendingrepaint)
- [checkForScrollPosSaving](TableScope.md#checkforscrollpossaving)
- [checkPastedValue](TableScope.md#checkpastedvalue)
- [clearCells](TableScope.md#clearcells)
- [clearSelection](TableScope.md#clearselection)
- [clientXToHostX](TableScope.md#clientxtohostx)
- [commitCellEditor](TableScope.md#commitcelleditor)
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
- [fillRange](TableScope.md#fillrange)
- [findRowOfImportantRowspanCell](TableScope.md#findrowofimportantrowspancell)
- [firstInit](TableScope.md#firstinit)
- [focusDetailMaster](TableScope.md#focusdetailmaster)
- [focusModel](TableScope.md#focusmodel)
- [getActiveBodyCell](TableScope.md#getactivebodycell)
- [getApi](TableScope.md#getapi)
- [getArea](TableScope.md#getarea)
- [getAreaAndSideIdentByAttr](TableScope.md#getareaandsideidentbyattr)
- [getAreaChild](TableScope.md#getareachild)
- [getAriaGridInfo](TableScope.md#getariagridinfo)
- [getAvailableColumnWidth](TableScope.md#getavailablecolumnwidth)
- [getBodyCellAtHostPoint](TableScope.md#getbodycellathostpoint)
- [getBodyCellRectInHost](TableScope.md#getbodycellrectinhost)
- [getBodyContentHeight](TableScope.md#getbodycontentheight)
- [getBodyRowIndexAtY](TableScope.md#getbodyrowindexaty)
- [getBodyRowLayout](TableScope.md#getbodyrowlayout)
- [getBodyRowTop](TableScope.md#getbodyrowtop)
- [getBodyViewport](TableScope.md#getbodyviewport)
- [getCellInput](TableScope.md#getcellinput)
- [getCheckboxAriaLabel](TableScope.md#getcheckboxarialabel)
- [getClipboardService](TableScope.md#getclipboardservice)
- [getColumnAriaLabel](TableScope.md#getcolumnarialabel)
- [getColumnLeftInHost](TableScope.md#getcolumnleftinhost)
- [getColumnWidths](TableScope.md#getcolumnwidths)
- [getContentScrollLeft](TableScope.md#getcontentscrollleft)
- [getContentScrollRangeY](TableScope.md#getcontentscrollrangey)
- [getCopyValue](TableScope.md#getcopyvalue)
- [getDisplayedRowCount](TableScope.md#getdisplayedrowcount)
- [getDomService](TableScope.md#getdomservice)
- [getEditTexts](TableScope.md#getedittexts)
- [getEditingOptions](TableScope.md#geteditingoptions)
- [getEventListener](TableScope.md#geteventlistener)
- [getFillHandleOptions](TableScope.md#getfillhandleoptions)
- [getFillSourceRange](TableScope.md#getfillsourcerange)
- [getFirstDataColumnIndex](TableScope.md#getfirstdatacolumnindex)
- [getFirstFullVisibleRowIndex](TableScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableScope.md#getfirstvisiblerowindex)
- [getFormulaErrorText](TableScope.md#getformulaerrortext)
- [getHeaderFocus](TableScope.md#getheaderfocus)
- [getInCellEditorCell](TableScope.md#getincelleditorcell)
- [getLastFullVisibleRowIndex](TableScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableScope.md#getlastvisiblerowindex)
- [getMouseEventTarget](TableScope.md#getmouseeventtarget)
- [getNumberByAttr](TableScope.md#getnumberbyattr)
- [getOverlayState](TableScope.md#getoverlaystate)
- [getRowHeights](TableScope.md#getrowheights)
- [getScrollLeftForColumnIndex](TableScope.md#getscrollleftforcolumnindex)
- [getScrollerRangeY](TableScope.md#getscrollerrangey)
- [getScrollerToContentRatioY](TableScope.md#getscrollertocontentratioy)
- [getSelectedBodyCells](TableScope.md#getselectedbodycells)
- [getSheetTexts](TableScope.md#getsheettexts)
- [getShortcutLayers](TableScope.md#getshortcutlayers)
- [getShownCellValue](TableScope.md#getshowncellvalue)
- [getStringByAttr](TableScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](TableScope.md#gettreearrowcolumnindex)
- [getTypedCellValue](TableScope.md#gettypedcellvalue)
- [getUndoOptions](TableScope.md#getundooptions)
- [getUndoTexts](TableScope.md#getundotexts)
- [getViewportScrollLeft](TableScope.md#getviewportscrollleft)
- [hasBodyRowExtras](TableScope.md#hasbodyrowextras)
- [hasShownColumnBeside](TableScope.md#hasshowncolumnbeside)
- [headerGroupsChanged](TableScope.md#headergroupschanged)
- [hideDraggingColumn](TableScope.md#hidedraggingcolumn)
- [hideHover](TableScope.md#hidehover)
- [hideHoverColumn](TableScope.md#hidehovercolumn)
- [hideHoverRow](TableScope.md#hidehoverrow)
- [hideOverlay](TableScope.md#hideoverlay)
- [holdSelectionEvents](TableScope.md#holdselectionevents)
- [initHostAria](TableScope.md#inithostaria)
- [initRenderEditor](TableScope.md#initrendereditor)
- [invalidateAggregates](TableScope.md#invalidateaggregates)
- [invalidateRowLayout](TableScope.md#invalidaterowlayout)
- [isBatchEditActive](TableScope.md#isbatcheditactive)
- [isColumnResizable](TableScope.md#iscolumnresizable)
- [isDestroyed](TableScope.md#isdestroyed)
- [isEditing](TableScope.md#isediting)
- [isEventInDetail](TableScope.md#iseventindetail)
- [isOverlayBlocking](TableScope.md#isoverlayblocking)
- [isRowGroupingOrTree](TableScope.md#isrowgroupingortree)
- [isRtl](TableScope.md#isrtl)
- [isScrollHeightCapped](TableScope.md#isscrollheightcapped)
- [measureRowNumberText](TableScope.md#measurerownumbertext)
- [mouseDraggingEndOnFrame](TableScope.md#mousedraggingendonframe)
- [mouseDraggingOnFrame](TableScope.md#mousedraggingonframe)
- [mouseMove](TableScope.md#mousemove)
- [moveActiveCell](TableScope.md#moveactivecell)
- [nextShownColumn](TableScope.md#nextshowncolumn)
- [onActionTriggered](TableScope.md#onactiontriggered)
- [onDetailHeightChanged](TableScope.md#ondetailheightchanged)
- [onDetailToggled](TableScope.md#ondetailtoggled)
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
- [refreshAfterStructureChange](TableScope.md#refreshafterstructurechange)
- [removeHostAria](TableScope.md#removehostaria)
- [renderContentOfDraggingColumn](TableScope.md#rendercontentofdraggingcolumn)
- [renderContentOfDraggingColumnForArea](TableScope.md#rendercontentofdraggingcolumnforarea)
- [repaint](TableScope.md#repaint)
- [repaintHard](TableScope.md#repainthard)
- [rerenderCalculatedCells](TableScope.md#rerendercalculatedcells)
- [rerenderCellContent](TableScope.md#rerendercellcontent)
- [rerenderDerivedFooterCells](TableScope.md#rerenderderivedfootercells)
- [rerenderGroupRowCells](TableScope.md#rerendergrouprowcells)
- [resetEditorRenderer](TableScope.md#reseteditorrenderer)
- [resetSizeOfWrapperDiv](TableScope.md#resetsizeofwrapperdiv)
- [resolvePastedValue](TableScope.md#resolvepastedvalue)
- [restoreHostAriaAttribute](TableScope.md#restorehostariaattribute)
- [rowsAppended](TableScope.md#rowsappended)
- [scrollToIndex](TableScope.md#scrolltoindex)
- [scrollToPixel](TableScope.md#scrolltopixel)
- [selectBodyRange](TableScope.md#selectbodyrange)
- [selectionModel](TableScope.md#selectionmodel)
- [setBodyRowExtra](TableScope.md#setbodyrowextra)
- [setColumnVisible](TableScope.md#setcolumnvisible)
- [setColumnWidth](TableScope.md#setcolumnwidth)
- [setDetailExpanded](TableScope.md#setdetailexpanded)
- [setDragging](TableScope.md#setdragging)
- [setEditorDraft](TableScope.md#seteditordraft)
- [setFooterVisible](TableScope.md#setfootervisible)
- [setHeaderGroupCollapsed](TableScope.md#setheadergroupcollapsed)
- [setHeaderVisible](TableScope.md#setheadervisible)
- [setHostAriaAttribute](TableScope.md#sethostariaattribute)
- [setHostKeyShortcuts](TableScope.md#sethostkeyshortcuts)
- [setPivotConfig](TableScope.md#setpivotconfig)
- [setRawValue](TableScope.md#setrawvalue)
- [setRowGroupBy](TableScope.md#setrowgroupby)
- [setSelectionModel](TableScope.md#setselectionmodel)
- [setTreeRowExpanded](TableScope.md#settreerowexpanded)
- [setViewportScrollLeft](TableScope.md#setviewportscrollleft)
- [showLoadingOverlay](TableScope.md#showloadingoverlay)
- [showNoRowsOverlay](TableScope.md#shownorowsoverlay)
- [snapToDevicePixel](TableScope.md#snaptodevicepixel)
- [sort](TableScope.md#sort)
- [sortByColumn](TableScope.md#sortbycolumn)
- [startEditing](TableScope.md#startediting)
- [stateChanged](TableScope.md#statechanged)
- [storeColumnWidths](TableScope.md#storecolumnwidths)
- [subscribe](TableScope.md#subscribe)
- [takeFocusFromDetail](TableScope.md#takefocusfromdetail)
- [toggleBooleanCell](TableScope.md#togglebooleancell)
- [toggleDetail](TableScope.md#toggledetail)
- [toggleExpandCollapseAll](TableScope.md#toggleexpandcollapseall)
- [toggleHeaderGroup](TableScope.md#toggleheadergroup)
- [toggleRowCheckbox](TableScope.md#togglerowcheckbox)
- [updateCells](TableScope.md#updatecells)
- [updateModelValueAfterEdit](TableScope.md#updatemodelvalueafteredit)
- [updateOverlay](TableScope.md#updateoverlay)
- [writeCells](TableScope.md#writecells)
- [writePastedCells](TableScope.md#writepastedcells)
- [writeUndoCells](TableScope.md#writeundocells)
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

[src/lib/table/table-scope.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L192)

## Properties

### allExpanded

• **allExpanded**: `boolean` = `true`

The last "expand / collapse all" state – the header icon toggles it.

#### Defined in

[src/lib/table/table-scope.ts:2428](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2428)

___

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenter](RenderScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenterGeo](RenderScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L61)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEast](RenderScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEastGeo](RenderScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWest](RenderScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L41)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWestGeo](RenderScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterCenter](RenderScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterEast](RenderScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterWest](RenderScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L46)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderCenter](RenderScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L36)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderEast](RenderScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderWest](RenderScope.md#areaheaderwest)

#### Defined in

[src/lib/table/ele-scope.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L37)

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

[src/lib/table/render-scope.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L123)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaIds](RenderScope.md#ariaids)

#### Defined in

[src/lib/table/ele-scope.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L65)

___

### ariaTexts

• `Readonly` **ariaTexts**: [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

Texts for screen readers (English defaults + `tableOptions.ariaTexts`).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaTexts](RenderScope.md#ariatexts)

#### Defined in

[src/lib/table/render-scope.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L132)

___

### batchEditService

• `Optional` **batchEditService**: [`BatchEditService`](BatchEditService.md)

Batch edit of this table (pending values, shown in the cells) – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Inherited from

[RenderScope](RenderScope.md).[batchEditService](RenderScope.md#batcheditservice)

#### Defined in

[src/lib/table/render-scope.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L158)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedEast](RenderScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedWest](RenderScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFooterTop](RenderScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderHeaderBottom](RenderScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### cellEditorService

• `Optional` **cellEditorService**: [`CellEditorService`](CellEditorService.md)

Excel-style editing of this table (the editor above the cell) – created by [TableScope](TableScope.md) with
`tableOptions.editing`.

**`Since`**

1.1.99

#### Inherited from

[RenderScope](RenderScope.md).[cellEditorService](RenderScope.md#celleditorservice)

#### Defined in

[src/lib/table/render-scope.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L171)

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

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### clipboardService

• `Optional` **clipboardService**: [`ClipboardService`](ClipboardService.md)

Copy, cut and paste: with the option keys and events, otherwise created for the API.

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L184)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[colAndRowspanModels](RenderScope.md#colandrowspanmodels)

#### Defined in

[src/lib/table/render-scope.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L115)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentDiv](RenderScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Inherited from

[RenderScope](RenderScope.md).[contentScrollTop](RenderScope.md#contentscrolltop)

#### Defined in

[src/lib/table/render-scope.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L119)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentWrapperDiv](RenderScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### copyService

• `Readonly` **copyService**: [`CopyServiceIf`](../interfaces/CopyServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:198](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L198)

___

### debounceTimeout

• `Protected` `Optional` **debounceTimeout**: ``null`` \| `Timeout`

#### Inherited from

[RenderScope](RenderScope.md).[debounceTimeout](RenderScope.md#debouncetimeout)

#### Defined in

[src/lib/table/render-scope.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L125)

___

### direction

• `Readonly` **direction**: [`ResolvedTableDirection`](../modules.md#resolvedtabledirection)

The resolved writing direction of the table ([TableOptionsIf.direction](../interfaces/TableOptionsIf.md#direction); `"auto"` is decided when the table
is built).

**`Since`**

1.1.98

#### Inherited from

[RenderScope](RenderScope.md).[direction](RenderScope.md#direction)

#### Defined in

[src/lib/table/ele-scope.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L74)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[displayedRowCount](RenderScope.md#displayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[RenderScope](RenderScope.md).[dom](RenderScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L80)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[dragging](RenderScope.md#dragging)

#### Defined in

[src/lib/table/render-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L94)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[draggingColumn](RenderScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L116)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[editing](RenderScope.md#editing)

#### Defined in

[src/lib/table/render-scope.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L95)

___

### eventListener

• `Protected` `Readonly` **eventListener**: [`EventListenerIf`](../interfaces/EventListenerIf.md)

#### Defined in

[src/lib/table/table-scope.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L197)

___

### excelService

• `Readonly` **excelService**: [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L199)

___

### fillHandleService

• `Optional` **fillHandleService**: [`FillHandleService`](FillHandleService.md)

Fill handle of this table – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Inherited from

[RenderScope](RenderScope.md).[fillHandleService](RenderScope.md#fillhandleservice)

#### Defined in

[src/lib/table/render-scope.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L164)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L85)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getFocusModel](RenderScope.md#getfocusmodel)

#### Defined in

[src/lib/table/render-scope.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L100)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getSelectionModel](RenderScope.md#getselectionmodel)

#### Defined in

[src/lib/table/render-scope.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L99)

___

### headerFocus

• `Protected` `Optional` **headerFocus**: [`number`, `number`]

The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
first body row, see `TableScope`. `undefined`: the focus is in the body ([FocusModelIf](../interfaces/FocusModelIf.md)).

#### Inherited from

[RenderScope](RenderScope.md).[headerFocus](RenderScope.md#headerfocus)

#### Defined in

[src/lib/table/render-scope.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L146)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hostElement](RenderScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L78)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverColumn](RenderScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverRow](RenderScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### inputHandler

• **inputHandler**: [`InputHandler`](InputHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L132)

___

### keyEvent

• `Protected` `Optional` **keyEvent**: [`GeKeyEvent`](GeKeyEvent.md)

#### Defined in

[src/lib/table/table-scope.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L148)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L86)

___

### licenseManager

• **licenseManager**: [`LicenseManager`](LicenseManager.md)

#### Defined in

[src/lib/table/table-scope.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L124)

___

### listenerAbortController

• `Readonly` **listenerAbortController**: `AbortController`

Signal for all DOM listeners of this table (host element, scroll viewport, window).
[destroy](TableScope.md#destroy) aborts it, which removes every listener at once.

#### Defined in

[src/lib/table/table-scope.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L129)

___

### liveAnnouncer

• `Readonly` **liveAnnouncer**: [`LiveAnnouncer`](LiveAnnouncer.md)

The live region of this table: screen readers speak its messages (sorting, filter, copy …).
Use [TableApi.announce](TableApi.md#announce) for own messages.

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-scope.ts:156](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L156)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[loggingActive](RenderScope.md#loggingactive)

#### Defined in

[src/lib/table/render-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L92)

___

### masterDetailService

• `Optional` **masterDetailService**: [`MasterDetailService`](MasterDetailService.md)

Master/detail of this table (detail rows below master rows) – created by [TableScope](TableScope.md) with
`tableOptions.masterDetail`.

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[masterDetailService](RenderScope.md#masterdetailservice)

#### Defined in

[src/lib/table/render-scope.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L184)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Inherited from

[RenderScope](RenderScope.md).[mouseEvent](RenderScope.md#mouseevent)

#### Defined in

[src/lib/table/render-scope.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L117)

___

### mouseHandler

• **mouseHandler**: [`MouseHandler`](MouseHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L131)

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

[src/lib/table/render-scope.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L121)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Inherited from

[RenderScope](RenderScope.md).[pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)

#### Defined in

[src/lib/table/render-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L91)

___

### resizeHandler

• **resizeHandler**: [`ResizeHandler`](ResizeHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L133)

___

### rowDragService

• `Optional` **rowDragService**: [`RowDragService`](RowDragService.md)

Row drag of this table (drag handles, pointer and keyboard drag) – created by [TableScope](TableScope.md).

**`Since`**

1.1.95

#### Inherited from

[RenderScope](RenderScope.md).[rowDragService](RenderScope.md#rowdragservice)

#### Defined in

[src/lib/table/render-scope.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L152)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorX](RenderScope.md#scrollfactorx)

#### Defined in

[src/lib/table/render-scope.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L104)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorY](RenderScope.md#scrollfactory)

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollLeft](RenderScope.md#scrollleft)

#### Defined in

[src/lib/table/render-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L101)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollTop](RenderScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewport](RenderScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewportLeft](RenderScope.md#scrollviewportleft)

#### Defined in

[src/lib/table/render-scope.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L102)

___

### selectionService

• `Protected` **selectionService**: [`SelectionService`](SelectionService.md)

#### Defined in

[src/lib/table/table-scope.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L147)

___

### shortcutKeyEvent

• `Optional` **shortcutKeyEvent**: `KeyboardEvent`

The key event the [ShortcutService](ShortcutService.md) is handling right now (`undefined` for `triggerAction`).

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:190](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L190)

___

### shortcutService

• **shortcutService**: [`ShortcutService`](ShortcutService.md)

#### Defined in

[src/lib/table/table-scope.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L134)

___

### stateService

• `Readonly` **stateService**: [`TableStateService`](TableStateService.md)

Collects, applies, stores and reports the state of this table (column layout, sorting, scroll, tree, checked
and selected rows …). Use [TableApi.getState](TableApi.md#getstate) / [TableApi.applyState](TableApi.md#applystate).

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L145)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

**`Deprecated`**

since 1.1.92 – no longer used, see [TableStateService](TableStateService.md).

#### Inherited from

[RenderScope](RenderScope.md).[storeScrollPosStateService](RenderScope.md#storescrollposstateservice)

#### Defined in

[src/lib/table/render-scope.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L98)

___

### storeSortingService

• `Optional` **storeSortingService**: [`StoreStateSortingService`](StoreStateSortingService.md)

**`Deprecated`**

since 1.1.92 – always `undefined`; the state is kept by [stateService](TableScope.md#stateservice).

#### Defined in

[src/lib/table/table-scope.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L139)

___

### storeStateCollapsedExpandService

• `Optional` **storeStateCollapsedExpandService**: [`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

**`Deprecated`**

since 1.1.92 – always `undefined`; the state is kept by [stateService](TableScope.md#stateservice).

#### Defined in

[src/lib/table/table-scope.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L137)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Inherited from

[RenderScope](RenderScope.md).[storedColumnWidths](RenderScope.md#storedcolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L96)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableModel](RenderScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L79)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableOptions](RenderScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L81)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Inherited from

[RenderScope](RenderScope.md).[tableOverlay](RenderScope.md#tableoverlay)

#### Defined in

[src/lib/table/ele-scope.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L68)

___

### tableSheet

• `Optional` **tableSheet**: [`TableSheet`](TableSheet.md)

Cell formulas of this table – created by [TableScope](TableScope.md) with `tableOptions.cellFormulas` (flat bodies).

**`Since`**

1.1.99

#### Inherited from

[RenderScope](RenderScope.md).[tableSheet](RenderScope.md#tablesheet)

#### Defined in

[src/lib/table/render-scope.ts:190](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L190)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[tree](RenderScope.md#tree)

#### Defined in

[src/lib/table/render-scope.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L114)

___

### undoService

• `Optional` **undoService**: [`UndoService`](UndoService.md)

Undo and redo: records the changes of the write path (only with the option).

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:188](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L188)

___

### actionsBlockedWhileLoading

▪ `Static` **actionsBlockedWhileLoading**: (``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` \| ``"MOVE_ROW_UP"`` \| ``"MOVE_ROW_DOWN"`` \| ``"FILL_DOWN"`` \| ``"FILL_RIGHT"`` \| ``"NAVIGATE_NEXT_CELL"`` \| ``"NAVIGATE_PREVIOUS_CELL"`` \| ``"EXTEND_SELECTION_UP"`` \| ``"EXTEND_SELECTION_DOWN"`` \| ``"EXTEND_SELECTION_LEFT"`` \| ``"EXTEND_SELECTION_RIGHT"`` \| ``"EXTEND_SELECTION_ROW_START"`` \| ``"EXTEND_SELECTION_ROW_END"`` \| ``"EXTEND_SELECTION_PAGE_UP"`` \| ``"EXTEND_SELECTION_PAGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_UP"`` \| ``"NAVIGATE_DATA_EDGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_LEFT"`` \| ``"NAVIGATE_DATA_EDGE_RIGHT"`` \| ``"EXTEND_TO_DATA_EDGE_UP"`` \| ``"EXTEND_TO_DATA_EDGE_DOWN"`` \| ``"EXTEND_TO_DATA_EDGE_LEFT"`` \| ``"EXTEND_TO_DATA_EDGE_RIGHT"`` \| ``"SELECT_ROW"`` \| ``"SELECT_COLUMN"`` \| ``"CLEAR_CELLS"`` \| ``"CLEAR_AND_EDIT"`` \| ``"CUT_2_CLIPBOARD"`` \| ``"PASTE_FROM_CLIPBOARD"`` \| ``"UNDO"`` \| ``"REDO"``)[]

Keyboard actions ignored while a blocking loading overlay is shown ([OverlayOptionsIf.blockInteractionWhileLoading](../interfaces/OverlayOptionsIf.md#blockinteractionwhileloading)).

#### Defined in

[src/lib/table/table-scope.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L158)

___

### filterAnnouncementDelayInMs

▪ `Static` **filterAnnouncementDelayInMs**: `number` = `400`

Delay of the "42 rows" announcement after a filter change (typing in a filter field: one announcement).

#### Defined in

[src/lib/table/table-scope.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L160)

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

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

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

[src/lib/table/render-scope.ts:2081](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2081)

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

[src/lib/table/table-scope.ts:2785](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2785)

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

[src/lib/table/render-scope.ts:1211](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1211)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustBody](RenderScope.md#adjustbody)

#### Defined in

[src/lib/table/render-scope.ts:1156](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1156)

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

[src/lib/table/render-scope.ts:1851](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1851)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)

#### Defined in

[src/lib/table/ele-scope.ts:358](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L358)

___

### adjustDetailLayerBounds

▸ **adjustDetailLayerBounds**(`left`, `top`, `width`, `height`): `void`

The detail layer (master/detail) covers the visible body.

#### Parameters

| Name | Type |
| :------ | :------ |
| `left` | `number` |
| `top` | `number` |
| `width` | `number` |
| `height` | `number` |

#### Returns

`void`

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[adjustDetailLayerBounds](RenderScope.md#adjustdetaillayerbounds)

#### Defined in

[src/lib/table/render-scope.ts:1111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1111)

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

[src/lib/table/render-scope.ts:2491](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2491)

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

[src/lib/table/render-scope.ts:2381](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2381)

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

[src/lib/table/render-scope.ts:2329](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2329)

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

[src/lib/table/render-scope.ts:2024](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2024)

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

[src/lib/table/table-scope.ts:2586](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2586)

___

### afterRowsMoved

▸ **afterRowsMoved**(): `void`

Called after rows were moved in the body model (row drag, [TableApi.moveRows](TableApi.md#moverows)): drops derived values
(totals, „Show values as“) and forgets a sort function of `tableApi.sort(fn)` – the moved order wins.
The caller repaints.

#### Returns

`void`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-scope.ts:966](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L966)

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

[src/lib/table/table-scope.ts:978](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L978)

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

[src/lib/table/table-scope.ts:1050](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1050)

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

[src/lib/table/render-scope.ts:1515](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1515)

___

### applyCellChanges

▸ **applyCellChanges**(`changes`, `source?`, `opts?`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

The one place that changes body cells (editor, fill handle, batch commit, [TableApi.applyCellChanges](TableApi.md#applycellchanges)):
skips cells that are not editable (`editable`, calculated columns without `valueSetter`, group/pivot rows),
applies `editInputPipe` and [ColumnDefIf.validate](../interfaces/ColumnDefIf.md#validate), then writes – or, in a batch edit, marks the values as
pending. Writing reports **one** `onModelChanged` with all cells; derived values (totals, calculated columns) are
recomputed and the table repaints.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `changes` | [`CellValueChangeIf`](../interfaces/CellValueChangeIf.md)[] | `undefined` | cells and values (column as index or property) |
| `source?` | [`CellChangeSource`](../modules.md#cellchangesource) | `'api'` | reported in the event |
| `opts` | `Object` | `{}` | - |
| `opts.undoable?` | `boolean` | `undefined` | - |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the written (or, in a batch edit, newly pending) cells

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1382](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1382)

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

[src/lib/table/render-scope.ts:2277](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2277)

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

[src/lib/table/render-scope.ts:1474](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1474)

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

[src/lib/table/table-scope.ts:3173](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3173)

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

[src/lib/table/table-scope.ts:3131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3131)

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

[src/lib/table/table-scope.ts:3025](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3025)

___

### canStartEditing

▸ **canStartEditing**(): `boolean`

True if a new editor may open now: no header focus, no blocking overlay, no running drag or fill.

#### Returns

`boolean`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:520](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L520)

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

[src/lib/table/table-scope.ts:1318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1318)

___

### cancelPendingRepaint

▸ **cancelPendingRepaint**(): `boolean`

Cancels a repaint scheduled by [debounceRepaint](TableScope.md#debouncerepaint).

#### Returns

`boolean`

true if a repaint was pending

#### Defined in

[src/lib/table/table-scope.ts:2561](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2561)

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

[src/lib/table/render-scope.ts:806](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L806)

___

### checkPastedValue

▸ **checkPastedValue**(`rowIndex`, `columnIndex`, `value`, `raw`): `undefined` \| `string`

The message of the column's `validate` for a value that would be pasted, `undefined` if it is valid.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row |
| `columnIndex` | `number` | model column |
| `value` | `unknown` | the value |
| `raw` | `boolean` | true: without `editInputPipe` |

#### Returns

`undefined` \| `string`

the message

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1552](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1552)

___

### clearCells

▸ **clearCells**(`ranges?`): `number`

Clears body cells (Delete in Excel-style editing): editable cells get `ColumnDef.emptyValue` (default
`EditingOptionsIf.emptyValue`, `""`), cells that are already empty are left alone; **one** `onModelChanged` with
the source `"clear"`. Without `ranges`: the selected cells, or the focused cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ranges?` | [`CellRange`](CellRange.md)[] | body ranges (display indices) |

#### Returns

`number`

the number of cleared cells; `-1` if more than `maxClearCells`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:697](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L697)

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

[src/lib/table/render-scope.ts:518](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L518)

___

### clientXToHostX

▸ **clientXToHostX**(`clientX`): `number`

A client x coordinate (e.g. `PointerEvent.clientX`) as x in the host from the start of its padding box – the
coordinates in which the table positions everything (right-to-left: from the right edge).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `clientX` | `number` | x in client (viewport) coordinates |

#### Returns

`number`

px from the start

**`Since`**

1.1.98

#### Inherited from

[RenderScope](RenderScope.md).[clientXToHostX](RenderScope.md#clientxtohostx)

#### Defined in

[src/lib/table/ele-scope.ts:250](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L250)

___

### commitCellEditor

▸ **commitCellEditor**(`cells`, `value`, `deferRepaint`): `Object`

Writes the value of the editor above the cell (Excel-style editing): into one cell, or – Ctrl/⌘+Enter – into
several; batch edit: marks it. Used by [CellEditorService](CellEditorService.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | [`number`, `number`][] | display row and model column per cell |
| `value` | `unknown` | the editor value (it runs through `editInputPipe` and `validate`) |
| `deferRepaint` | `boolean` | repaint after the current mouse click |

#### Returns

`Object`

what happened

| Name | Type |
| :------ | :------ |
| `invalid` | `number` |
| `message?` | `string` |
| `written` | `number` |

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:733](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L733)

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

[src/lib/table/table-scope.ts:2395](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2395)

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

[src/lib/table/table-scope.ts:2231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2231)

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

[src/lib/table/render-scope.ts:2473](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2473)

___

### debounceRepaint

▸ **debounceRepaint**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:2552](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2552)

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

[src/lib/table/table-scope.ts:2062](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2062)

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

[src/lib/table/render-scope.ts:2458](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2458)

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

[src/lib/table/render-scope.ts:1725](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1725)

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

[src/lib/table/table-scope.ts:3276](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3276)

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

[src/lib/table/table-scope.ts:3230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3230)

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

[src/lib/table/table-scope.ts:2633](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2633)

___

### fillRange

▸ **fillRange**(`source`, `direction`, `count`, `mode?`, `selectAfter?`): `number`

Fills cells next to a range (fill handle, Ctrl/⌘+D, [TableApi.fillRange](TableApi.md#fillrange)): computes the values
([computeFillChanges](../modules.md#computefillchanges), shown values – a batch edit's pending values count), writes them with
[applyCellChanges](TableScope.md#applycellchanges) and selects source and filled cells.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `source` | [`CellRange`](CellRange.md) | `undefined` | the source range (body display indices) |
| `direction` | [`FillDirection`](../modules.md#filldirection) | `undefined` | down, up, right or left |
| `count` | `number` | `undefined` | rows or columns to fill (clamped to the table) |
| `mode?` | [`FillMode`](../modules.md#fillmode) | `'auto'` | series or copy |
| `selectAfter?` | [`CellRange`](CellRange.md) | `undefined` | the selection afterwards (default: source and filled cells) |

#### Returns

`number`

the number of filled (or, in a batch edit, marked) cells; `-1` if refused (too many cells)

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1844](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1844)

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

[src/lib/table/render-scope.ts:1830](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1830)

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

[src/lib/table/table-scope.ts:2021](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2021)

___

### focusDetailMaster

▸ **focusDetailMaster**(`rowIndex`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:2209](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2209)

___

### focusModel

▸ **focusModel**(): `undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

Retrieves the focus model.

#### Returns

`undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

The focus model if it exists, or undefined otherwise.

#### Defined in

[src/lib/table/table-scope.ts:2906](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2906)

___

### getActiveBodyCell

▸ **getActiveBodyCell**(): `undefined` \| [`number`, `number`]

The body cell with the keyboard focus, `undefined` if there is none (or the header has the focus).

#### Returns

`undefined` \| [`number`, `number`]

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:541](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L541)

___

### getApi

▸ **getApi**(): [`TableApi`](TableApi.md)

Retrieves the TableApi object.

#### Returns

[`TableApi`](TableApi.md)

The TableApi object.

#### Defined in

[src/lib/table/table-scope.ts:2008](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2008)

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

[src/lib/table/render-scope.ts:1060](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1060)

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

[src/lib/table/render-scope.ts:1040](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1040)

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

[src/lib/table/ele-scope.ts:343](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L343)

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

[src/lib/table/render-scope.ts:1466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1466)

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

[src/lib/table/render-scope.ts:634](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L634)

___

### getBodyCellAtHostPoint

▸ **getBodyCellAtHostPoint**(`x`, `y`): [`number`, `number`]

The body cell at a point in host coordinates, clamped to the body (a point above the body = row 0, right of the
columns = the last column …) – computed, not read from the DOM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | x relative to the host's padding box |
| `y` | `number` | y relative to the host's padding box |

#### Returns

[`number`, `number`]

row and column index, `[-1, -1]` without rows or columns

**`Since`**

1.1.96

#### Inherited from

[RenderScope](RenderScope.md).[getBodyCellAtHostPoint](RenderScope.md#getbodycellathostpoint)

#### Defined in

[src/lib/table/render-scope.ts:318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L318)

___

### getBodyCellRectInHost

▸ **getBodyCellRectInHost**(`rowIndex`, `columnIndex`): `Object`

The rectangle of a body cell in host coordinates (relative to the padding box of the host) – computed from the
row and column positions, also for cells that are not rendered – and the visible part of its area (`clip…`: the
body between header and footer, horizontally the fixed west/east area or the scrollable center).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model index |

#### Returns

`Object`

the geometry

| Name | Type |
| :------ | :------ |
| `clipBottom` | `number` |
| `clipLeft` | `number` |
| `clipRight` | `number` |
| `clipTop` | `number` |
| `height` | `number` |
| `left` | `number` |
| `top` | `number` |
| `width` | `number` |

**`Since`**

1.1.96

#### Inherited from

[RenderScope](RenderScope.md).[getBodyCellRectInHost](RenderScope.md#getbodycellrectinhost)

#### Defined in

[src/lib/table/render-scope.ts:276](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L276)

___

### getBodyContentHeight

▸ **getBodyContentHeight**(): `number`

The height of all body rows in px – the model's content height plus, in [RenderScope](RenderScope.md), the heights of open
detail rows (master/detail).

#### Returns

`number`

px

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[getBodyContentHeight](RenderScope.md#getbodycontentheight)

#### Defined in

[src/lib/table/render-scope.ts:1115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1115)

___

### getBodyRowIndexAtY

▸ **getBodyRowIndexAtY**(`contentY`): `number`

The body row at a content position (a position in an open detail row belongs to its master row). Above the rows:
0, below: the last row, without rows: -1.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contentY` | `number` | px from the top of the first body row |

#### Returns

`number`

display index

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[getBodyRowIndexAtY](RenderScope.md#getbodyrowindexaty)

#### Defined in

[src/lib/table/render-scope.ts:437](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L437)

___

### getBodyRowLayout

▸ **getBodyRowLayout**(): [`RowLayout`](RowLayout.md)

The positions of the body rows: prefix sums of the row heights (O(log n) lookups also for variable heights) plus
the heights of open detail rows. Built lazily – again after [invalidateRowLayout](TableScope.md#invalidaterowlayout), a new body model or
another row count.

#### Returns

[`RowLayout`](RowLayout.md)

the layout of the body rows

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[getBodyRowLayout](RenderScope.md#getbodyrowlayout)

#### Defined in

[src/lib/table/render-scope.ts:365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L365)

___

### getBodyRowTop

▸ **getBodyRowTop**(`rowIndex`): `number`

The top of a body row in content pixels: [AreaModelIf.getYPosByRowIndex](../interfaces/AreaModelIf.md#getyposbyrowindex) plus the heights of the open detail
rows above it (master/detail).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |

#### Returns

`number`

px from the top of the first body row

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[getBodyRowTop](RenderScope.md#getbodyrowtop)

#### Defined in

[src/lib/table/render-scope.ts:422](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L422)

___

### getBodyViewport

▸ **getBodyViewport**(): `Object`

The visible body in client (viewport) coordinates – including fixed west/east columns, without the scroll bar –
and the content pixels scrolled out at its top. Row drag computes the row under the pointer with it.

#### Returns

`Object`

the geometry

| Name | Type |
| :------ | :------ |
| `contentScrollTop` | `number` |
| `height` | `number` |
| `left` | `number` |
| `top` | `number` |
| `width` | `number` |

**`Since`**

1.1.95

#### Inherited from

[RenderScope](RenderScope.md).[getBodyViewport](RenderScope.md#getbodyviewport)

#### Defined in

[src/lib/table/render-scope.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L254)

___

### getCellInput

▸ **getCellInput**(`rowIndex`, `columnIndex`): `unknown`

The input of a body cell – what was typed: the formula text of a cell formula (`"=B2*C2"`), otherwise the value
([AreaModelIf.getInputValueAt](../interfaces/AreaModelIf.md#getinputvalueat)). Editor, undo and the batch edit use it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row |
| `columnIndex` | `number` | model column |

#### Returns

`unknown`

the input

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1568](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1568)

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

[src/lib/table/render-scope.ts:1654](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1654)

___

### getClipboardService

▸ **getClipboardService**(): [`ClipboardService`](ClipboardService.md)

The clipboard service for the API ([TableApi.pasteText](TableApi.md#pastetext), [TableApi.getSelectionAsText](TableApi.md#getselectionastext)): the one of
the option, otherwise one with the defaults that does not listen to keys or events.

#### Returns

[`ClipboardService`](ClipboardService.md)

the service

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1728](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1728)

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

[src/lib/table/render-scope.ts:1636](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1636)

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

[src/lib/table/render-scope.ts:2406](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2406)

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

[src/lib/table/render-scope.ts:2298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2298)

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

[src/lib/table/render-scope.ts:2426](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2426)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)

#### Defined in

[src/lib/table/render-scope.ts:1121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1121)

___

### getCopyValue

▸ **getCopyValue**(`rowIndex`, `columnIndex`): `unknown`

The value of a cell for a copy inside the table: a formula cell gives a CopiedFormula.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row |
| `columnIndex` | `number` | model column |

#### Returns

`unknown`

the value

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1638](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1638)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:1022](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1022)

___

### getDomService

▸ **getDomService**(): [`ConvenienceDomService`](ConvenienceDomService.md)

The DOM service of this table (all DOM access of the table goes through it).

#### Returns

[`ConvenienceDomService`](ConvenienceDomService.md)

the service

**`Since`**

1.1.95

#### Inherited from

[RenderScope](RenderScope.md).[getDomService](RenderScope.md#getdomservice)

#### Defined in

[src/lib/table/render-scope.ts:243](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L243)

___

### getEditTexts

▸ **getEditTexts**(): `Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"cellsFilled"`` \| ``"fillTooLarge"`` \| ``"pendingChanges"`` \| ``"changesCommitted"`` \| ``"changesDiscarded"`` \| ``"commitBlocked"`` \| ``"invalidValue"``\>\>

The texts of fill and batch edit with defaults (an own [AriaTextsIf](../interfaces/AriaTextsIf.md) implementation may lack them).

#### Returns

`Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"cellsFilled"`` \| ``"fillTooLarge"`` \| ``"pendingChanges"`` \| ``"changesCommitted"`` \| ``"changesDiscarded"`` \| ``"commitBlocked"`` \| ``"invalidValue"``\>\>

the texts

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1988](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1988)

___

### getEditingOptions

▸ **getEditingOptions**(): `undefined` \| [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

The options of Excel-style editing ([TableOptionsIf.editing](../interfaces/TableOptionsIf.md#editing)), `undefined` if it is off.

#### Returns

`undefined` \| [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

complete options

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:443](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L443)

___

### getEventListener

▸ **getEventListener**(): [`EventListenerIf`](../interfaces/EventListenerIf.md)

The event listener of this table (the one given to the constructor, or an empty [EventAdapter](EventAdapter.md)).

#### Returns

[`EventListenerIf`](../interfaces/EventListenerIf.md)

the listener

**`Since`**

1.1.95

#### Defined in

[src/lib/table/table-scope.ts:955](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L955)

___

### getFillHandleOptions

▸ **getFillHandleOptions**(): `undefined` \| [`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)

The options of the fill handle, `undefined` if it is off ([TableOptionsIf.fillHandle](../interfaces/TableOptionsIf.md#fillhandle)).

#### Returns

`undefined` \| [`FillHandleOptionsIf`](../interfaces/FillHandleOptionsIf.md)

complete options

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1827](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1827)

___

### getFillSourceRange

▸ **getFillSourceRange**(): `undefined` \| [`CellRange`](CellRange.md)

The last selected range, clamped to the body (`undefined` without one).

#### Returns

`undefined` \| [`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/table-scope.ts:1916](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1916)

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

[src/lib/table/render-scope.ts:1997](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1997)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:1014](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1014)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:1006](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1006)

___

### getFormulaErrorText

▸ **getFormulaErrorText**(`message`): `string`

The announcement of a stored formula with a syntax error (`AriaTextsIf.formulaError`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | the parser's message |

#### Returns

`string`

the text

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1597)

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

[src/lib/table/table-scope.ts:1094](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1094)

___

### getInCellEditorCell

▸ **getInCellEditorCell**(): `undefined` \| [`number`, `number`]

The cell of the open editor inside a cell (`getEditRenderer`, the way before Excel-style editing).

#### Returns

`undefined` \| [`number`, `number`]

display row and model column, `undefined` without such an editor

**`Since`**

1.1.99

#### Inherited from

[RenderScope](RenderScope.md).[getInCellEditorCell](RenderScope.md#getincelleditorcell)

#### Defined in

[src/lib/table/render-scope.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L466)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:1018](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1018)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:1010](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1010)

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

[src/lib/table/table-scope.ts:2260](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2260)

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

[src/lib/table/render-scope.ts:1177](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1177)

___

### getOverlayState

▸ **getOverlayState**(): [`GeOverlayKind`](../modules.md#geoverlaykind)

The overlay shown now (see [TableApi.getOverlayState](TableApi.md#getoverlaystate)).

#### Returns

[`GeOverlayKind`](../modules.md#geoverlaykind)

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1018](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1018)

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

[src/lib/table/render-scope.ts:2314](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2314)

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

[src/lib/table/table-scope.ts:2760](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2760)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getScrollerRangeY](RenderScope.md#getscrollerrangey)

#### Defined in

[src/lib/table/render-scope.ts:1126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1126)

___

### getScrollerToContentRatioY

▸ **getScrollerToContentRatioY**(): `number`

Scroll bar pixels per content pixel: 1, below 1 for a capped scroll height ([isScrollHeightCapped](TableScope.md#isscrollheightcapped)).

#### Returns

`number`

the factor for `scrollTop` changes

**`Since`**

1.1.95

#### Inherited from

[RenderScope](RenderScope.md).[getScrollerToContentRatioY](RenderScope.md#getscrollertocontentratioy)

#### Defined in

[src/lib/table/render-scope.ts:447](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L447)

___

### getSelectedBodyCells

▸ **getSelectedBodyCells**(`maxCells`): `undefined` \| [`number`, `number`][]

The selected body cells (shown columns, inside the table) – `undefined` if there are more than `maxCells`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | upper limit |

#### Returns

`undefined` \| [`number`, `number`][]

row and column per cell; none without selection

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:644](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L644)

___

### getSheetTexts

▸ **getSheetTexts**(): `Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"editingStarted"`` \| ``"readOnlyCell"`` \| ``"cellsCleared"`` \| ``"clearTooLarge"`` \| ``"rangeSelected"`` \| ``"rowSelected"`` \| ``"columnSelected"`` \| ``"gridEditingHint"`` \| ``"cellsPasted"`` \| ``"pasteTooLarge"`` \| ``"copyTooLarge"`` \| ``"cutMarked"`` \| ``"copiedLastRangeOnly"``\>\>

The texts of Excel-style editing (own functions of `tableOptions.ariaTexts`, otherwise English).

#### Returns

`Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"editingStarted"`` \| ``"readOnlyCell"`` \| ``"cellsCleared"`` \| ``"clearTooLarge"`` \| ``"rangeSelected"`` \| ``"rowSelected"`` \| ``"columnSelected"`` \| ``"gridEditingHint"`` \| ``"cellsPasted"`` \| ``"pasteTooLarge"`` \| ``"copyTooLarge"`` \| ``"cutMarked"`` \| ``"copiedLastRangeOnly"``\>\>

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:764](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L764)

___

### getShortcutLayers

▸ **getShortcutLayers**(`mac`): [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)[]

Shortcut layers of switched-on features, applied over the system mapping (see [ShortcutService](ShortcutService.md)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mac` | `boolean` | macOS keys |

#### Returns

[`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)[]

the layers (none without Excel-style editing)

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:454](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L454)

___

### getShownCellValue

▸ **getShownCellValue**(`rowIndex`, `columnIndex`): `unknown`

The value a body cell shows: a pending value of a batch edit, otherwise the model value – with cell formulas the
input ([getCellInput](TableScope.md#getcellinput): the formula text for the editor).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index |
| `columnIndex` | `number` | model column index |

#### Returns

`unknown`

the value

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:534](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L534)

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

[src/lib/table/render-scope.ts:1194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1194)

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

[src/lib/table/render-scope.ts:1978](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1978)

___

### getTypedCellValue

▸ **getTypedCellValue**(`rowIndex`, `columnIndex`): `unknown`

The value of a body cell to choose an editor or convert pasted text by: the result of a formula cell (a number
stays a number when overwritten), otherwise [getShownCellValue](TableScope.md#getshowncellvalue).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row |
| `columnIndex` | `number` | model column |

#### Returns

`unknown`

the value

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1584](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1584)

___

### getUndoOptions

▸ **getUndoOptions**(): `undefined` \| [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

The options of undo and redo ([TableOptionsIf.undo](../interfaces/TableOptionsIf.md#undo)), `undefined` if it is off.

#### Returns

`undefined` \| [`UndoOptionsIf`](../interfaces/UndoOptionsIf.md)

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1653](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1653)

___

### getUndoTexts

▸ **getUndoTexts**(): `Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"undone"`` \| ``"redone"`` \| ``"nothingToUndo"`` \| ``"nothingToRedo"`` \| ``"undoSkipped"`` \| ``"undoHistoryCleared"``\>\>

The texts of undo and redo (own functions of `tableOptions.ariaTexts`, otherwise English).

#### Returns

`Required`\<`Pick`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md), ``"undone"`` \| ``"redone"`` \| ``"nothingToUndo"`` \| ``"nothingToRedo"`` \| ``"undoSkipped"`` \| ``"undoHistoryCleared"``\>\>

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1691](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1691)

___

### getViewportScrollLeft

▸ **getViewportScrollLeft**(): `number`

The horizontal scroll position of the body as distance from the **start** (≥ 0) – `scrollLeft`, in
right-to-left `-scrollLeft`.

#### Returns

`number`

px

**`Since`**

1.1.98

#### Inherited from

[RenderScope](RenderScope.md).[getViewportScrollLeft](RenderScope.md#getviewportscrollleft)

#### Defined in

[src/lib/table/ele-scope.ts:228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L228)

___

### hasBodyRowExtras

▸ **hasBodyRowExtras**(): `boolean`

True if open detail rows take space between the body rows.

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[hasBodyRowExtras](RenderScope.md#hasbodyrowextras)

#### Defined in

[src/lib/table/render-scope.ts:410](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L410)

___

### hasShownColumnBeside

▸ **hasShownColumnBeside**(`columnIndex`, `direction`): `boolean`

True if there is a shown column (no row number column) next to `columnIndex` in that direction – Tab uses it:
in the last column it leaves the table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index |
| `direction` | `number` | 1 or -1 |

#### Returns

`boolean`

true if Tab can move

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:610](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L610)

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

[src/lib/table/table-scope.ts:2856](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2856)

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

[src/lib/table/render-scope.ts:2621](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2621)

___

### hideHover

▸ **hideHover**(): `void`

Hides the hover row and column – e.g. while the pointer is over a detail row (master/detail).

#### Returns

`void`

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[hideHover](RenderScope.md#hidehover)

#### Defined in

[src/lib/table/render-scope.ts:2365](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2365)

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

[src/lib/table/render-scope.ts:2440](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2440)

___

### hideHoverRow

▸ **hideHoverRow**(): `void`

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[hideHoverRow](RenderScope.md#hidehoverrow)

#### Defined in

[src/lib/table/render-scope.ts:2370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2370)

___

### hideOverlay

▸ **hideOverlay**(): `void`

Ends an overlay shown by the API (see [TableApi.hideOverlay](TableApi.md#hideoverlay)).

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/table-scope.ts:1009](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1009)

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

[src/lib/table/table-scope.ts:2611](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2611)

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

[src/lib/table/ele-scope.ts:328](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L328)

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

[src/lib/table/render-scope.ts:534](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L534)

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

[src/lib/table/render-scope.ts:578](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L578)

___

### invalidateRowLayout

▸ **invalidateRowLayout**(): `void`

Marks the positions of the body rows as outdated (rows filtered, sorted, edited, added or removed, a detail row
opened or closed) – they are computed again on the next access.

#### Returns

`void`

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[invalidateRowLayout](RenderScope.md#invalidaterowlayout)

#### Defined in

[src/lib/table/render-scope.ts:386](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L386)

___

### isBatchEditActive

▸ **isBatchEditActive**(): `boolean`

True while a batch edit collects changes.

#### Returns

`boolean`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1648](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1648)

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

[src/lib/table/render-scope.ts:2002](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2002)

___

### isDestroyed

▸ **isDestroyed**(): `boolean`

Returns `true` once [destroy](TableScope.md#destroy) has been called.

#### Returns

`boolean`

#### Defined in

[src/lib/table/table-scope.ts:2221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2221)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isEditing](RenderScope.md#isediting)

#### Defined in

[src/lib/table/render-scope.ts:456](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L456)

___

### isEventInDetail

▸ **isEventInDetail**(`evt`): `boolean`

True if a DOM event comes from a detail row (master/detail) – e.g. from a nested table. The mouse, keyboard and
pointer handlers of this table ignore such events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `Event` | an event while it is dispatched |

#### Returns

`boolean`

whether it comes from the detail layer

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2111)

___

### isOverlayBlocking

▸ **isOverlayBlocking**(): `boolean`

True while an overlay blocks the table ("Loading…").

#### Returns

`boolean`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1706](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1706)

___

### isRowGroupingOrTree

▸ **isRowGroupingOrTree**(): `boolean`

True for a tree, a row grouping or a pivot table in the body (rows cannot simply be appended).

#### Returns

`boolean`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1716](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1716)

___

### isRtl

▸ **isRtl**(): `boolean`

Whether the table runs from right to left ([TableOptionsIf.direction](../interfaces/TableOptionsIf.md#direction)).

#### Returns

`boolean`

true for `"rtl"` (also a resolved `"auto"`)

**`Since`**

1.1.98

#### Inherited from

[RenderScope](RenderScope.md).[isRtl](RenderScope.md#isrtl)

#### Defined in

[src/lib/table/ele-scope.ts:217](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L217)

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

[src/lib/table/render-scope.ts:1100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1100)

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

[src/lib/table/render-scope.ts:2059](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2059)

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

[src/lib/table/table-scope.ts:2354](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2354)

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

[src/lib/table/table-scope.ts:2310](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2310)

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

[src/lib/table/table-scope.ts:2382](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2382)

___

### moveActiveCell

▸ **moveActiveCell**(`rowIndex`, `columnIndex`, `dRow`, `dColumn`): `boolean`

Moves the keyboard focus from a cell by rows/columns (Excel-style editing: Enter, Tab and arrow keys after
committing); the selection follows with `collapseSelectionOnNavigate`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | start row |
| `columnIndex` | `number` | start column |
| `dRow` | `number` | rows |
| `dColumn` | `number` | columns (hidden columns are skipped) |

#### Returns

`boolean`

true if a focus model exists

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:626](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L626)

___

### nextShownColumn

▸ **nextShownColumn**(`columnIndex`, `direction`): `number`

The next shown column in a direction (hidden columns skipped; the same column at the edge).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index |
| `direction` | `number` | 1 or -1 |

#### Returns

`number`

the column

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L597)

___

### onActionTriggered

▸ **onActionTriggered**(`actionId`): `boolean`

Triggers an action based on the provided actionId.

This function can be invoked manually via the table API or by keyboard shortcuts.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `actionId` | ``"COPY_2_CLIPBOARD"`` \| ``"START_EDITING"`` \| ``"TOGGLE_SELECTION"`` \| ``"SELECT_ALL"`` \| ``"DESELECT_ALL"`` \| ``"NAVIGATE_LEFT"`` \| ``"NAVIGATE_RIGHT"`` \| ``"NAVIGATE_UP"`` \| ``"NAVIGATE_DOWN"`` \| ``"NAVIGATE_ROW_START"`` \| ``"NAVIGATE_ROW_END"`` \| ``"NAVIGATE_FIRST_CELL"`` \| ``"NAVIGATE_LAST_CELL"`` \| ``"NAVIGATE_PAGE_UP"`` \| ``"NAVIGATE_PAGE_DOWN"`` \| ``"ACTIVATE_CELL"`` \| ``"MOVE_ROW_UP"`` \| ``"MOVE_ROW_DOWN"`` \| ``"FILL_DOWN"`` \| ``"FILL_RIGHT"`` \| ``"NAVIGATE_NEXT_CELL"`` \| ``"NAVIGATE_PREVIOUS_CELL"`` \| ``"EXTEND_SELECTION_UP"`` \| ``"EXTEND_SELECTION_DOWN"`` \| ``"EXTEND_SELECTION_LEFT"`` \| ``"EXTEND_SELECTION_RIGHT"`` \| ``"EXTEND_SELECTION_ROW_START"`` \| ``"EXTEND_SELECTION_ROW_END"`` \| ``"EXTEND_SELECTION_PAGE_UP"`` \| ``"EXTEND_SELECTION_PAGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_UP"`` \| ``"NAVIGATE_DATA_EDGE_DOWN"`` \| ``"NAVIGATE_DATA_EDGE_LEFT"`` \| ``"NAVIGATE_DATA_EDGE_RIGHT"`` \| ``"EXTEND_TO_DATA_EDGE_UP"`` \| ``"EXTEND_TO_DATA_EDGE_DOWN"`` \| ``"EXTEND_TO_DATA_EDGE_LEFT"`` \| ``"EXTEND_TO_DATA_EDGE_RIGHT"`` \| ``"SELECT_ROW"`` \| ``"SELECT_COLUMN"`` \| ``"CLEAR_CELLS"`` \| ``"CLEAR_AND_EDIT"`` \| ``"CUT_2_CLIPBOARD"`` \| ``"PASTE_FROM_CLIPBOARD"`` \| ``"UNDO"`` \| ``"REDO"`` | The identifier of the action to be triggered. |

#### Returns

`boolean`

- Returns true if the action was triggered successfully, false otherwise.

#### Implementation of

[OnActionTriggeredIf](../interfaces/OnActionTriggeredIf.md).[onActionTriggered](../interfaces/OnActionTriggeredIf.md#onactiontriggered)

#### Defined in

[src/lib/table/table-scope.ts:343](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L343)

___

### onDetailHeightChanged

▸ **onDetailHeightChanged**(): `void`

Called by [MasterDetailService](MasterDetailService.md) after a detail row with `detailHeight: "auto"` got a new height: new scroll
height and repaint (the rows below move).

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2178)

___

### onDetailToggled

▸ **onDetailToggled**(`row`, `rowIndex`, `expanded`, `source`, `emit?`, `layoutUpdated?`): `void`

Called by [MasterDetailService](MasterDetailService.md) after detail rows were expanded or collapsed: new row positions and scroll
height, repaint, event, announcement, table state.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `row` | `unknown` | `undefined` | the master row (`undefined` for several rows) |
| `rowIndex` | `number` | `undefined` | its display index (-1 for several rows or a row that is not shown) |
| `expanded` | `boolean` | `undefined` | the new state |
| `source` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | `undefined` | what changed it |
| `emit?` | `boolean` | `true` | false: no event (several rows at once) |
| `layoutUpdated?` | `boolean` | `false` | true: the row layout was already updated for this one row |

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2153)

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

[src/lib/table/table-scope.ts:2574](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2574)

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

[src/lib/table/table-scope.ts:2662](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2662)

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

[src/lib/table/table-scope.ts:2531](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2531)

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

[src/lib/table/table-scope.ts:2288](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2288)

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

[src/lib/table/table-scope.ts:1027](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1027)

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

[src/lib/table/table-scope.ts:2593](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2593)

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

[src/lib/table/render-scope.ts:1136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1136)

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

[src/lib/table/table-scope.ts:2570](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2570)

___

### reSort

▸ **reSort**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:3149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3149)

___

### reapplySorting

▸ **reapplySorting**(): `void`

Sorts the (freshly filtered) body rows again, so a filter keeps the current order:
the last `sort(compareFn)` call, otherwise the columns with a `sortState` (header icons).

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:3191](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3191)

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

[src/lib/table/render-scope.ts:617](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L617)

___

### recalcWrappers

▸ **recalcWrappers**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:3143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3143)

___

### refreshAfterStructureChange

▸ **refreshAfterStructureChange**(`columns`): `void`

Builds the view again after rows or columns were inserted or deleted (filter and sorting applied again, new
columns measured).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columns` | `boolean` | true: the columns changed |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:558](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L558)

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

[src/lib/table/ele-scope.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L311)

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

[src/lib/table/render-scope.ts:2531](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2531)

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

[src/lib/table/render-scope.ts:2550](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2550)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[repaint](RenderScope.md#repaint)

#### Defined in

[src/lib/table/render-scope.ts:566](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L566)

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

[src/lib/table/render-scope.ts:597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L597)

___

### rerenderCalculatedCells

▸ **rerenderCalculatedCells**(): `void`

After `updateCells()` without a repaint: draws the rendered cells of calculated and „Show values as“ columns of
the body again (they depend on the changed cells, e.g. `total = price * quantity` or a share of the total).

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[rerenderCalculatedCells](RenderScope.md#rerendercalculatedcells)

#### Defined in

[src/lib/table/render-scope.ts:895](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L895)

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

[src/lib/table/render-scope.ts:965](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L965)

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

[src/lib/table/render-scope.ts:941](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L941)

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

[src/lib/table/render-scope.ts:920](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L920)

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

[src/lib/table/render-scope.ts:503](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L503)

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

[src/lib/table/ele-scope.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L546)

___

### resolvePastedValue

▸ **resolvePastedValue**(`value`, `rowIndex`, `columnIndex`, `cut`): `unknown`

Resolves a formula copied inside the table for a target cell: its relative references move (Excel); a target
without formulas gets the copied value. A cut formula moves unchanged.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `unknown` | a pasted value (maybe a CopiedFormula) |
| `rowIndex` | `number` | display row of the target |
| `columnIndex` | `number` | model column of the target |
| `cut` | `boolean` | true: the formula moves (cut and paste) |

#### Returns

`unknown`

the value to write

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1619](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1619)

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

[src/lib/table/ele-scope.ts:295](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L295)

___

### rowsAppended

▸ **rowsAppended**(): `void`

Rows were added at the end of the body (pasting with `pasteAddsRows`): derived values are recomputed.

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1711](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1711)

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

[src/lib/table/table-scope.ts:2747](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2747)

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

[src/lib/table/table-scope.ts:2719](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2719)

___

### selectBodyRange

▸ **selectBodyRange**(`range`): `void`

Selects a body range (after pasting): its first cell becomes the active cell and the anchor.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | display rows, model columns |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1529](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1529)

___

### selectionModel

▸ **selectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Retrieves the selection model.

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The selection model if available, otherwise undefined.

#### Defined in

[src/lib/table/table-scope.ts:2894](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2894)

___

### setBodyRowExtra

▸ **setBodyRowExtra**(`rowIndex`, `height`): `boolean`

Sets the height of the detail row behind one body row in the current row layout without building it again
(a detail row was expanded or collapsed). Does nothing if the layout is outdated anyway.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index of the master row |
| `height` | `number` | the detail height, 0 = none |

#### Returns

`boolean`

true if the layout was updated, false if it is outdated (it is built again on the next access)

**`Since`**

1.1.97

#### Inherited from

[RenderScope](RenderScope.md).[setBodyRowExtra](RenderScope.md#setbodyrowextra)

#### Defined in

[src/lib/table/render-scope.ts:399](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L399)

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

[src/lib/table/table-scope.ts:3090](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3090)

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

[src/lib/table/table-scope.ts:3078](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3078)

___

### setDetailExpanded

▸ **setDetailExpanded**(`rowOrIndex`, `expanded`, `source?`): `boolean`

Expands or collapses the detail row of a master row (see [TableApi.setDetailExpanded](TableApi.md#setdetailexpanded)).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | `undefined` | display index or row object |
| `expanded` | `boolean` | `undefined` | the new state |
| `source?` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | `'api'` | what changed it |

#### Returns

`boolean`

false if nothing changed

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2124)

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

[src/lib/table/table-scope.ts:2913](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2913)

___

### setEditorDraft

▸ **setEditorDraft**(`rowIndex`, `columnIndex`, `input`): `void`

Remembers the text of the open in-cell editor (called on every input, see [InputHandler](InputHandler.md)) so that a
repaint keeps it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index of the edited cell |
| `columnIndex` | `number` | model column index |
| `input` | `HTMLInputElement` \| `HTMLTextAreaElement` | the editor element |

#### Returns

`void`

**`Since`**

1.1.99

#### Inherited from

[RenderScope](RenderScope.md).[setEditorDraft](RenderScope.md#seteditordraft)

#### Defined in

[src/lib/table/render-scope.ts:480](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L480)

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

[src/lib/table/table-scope.ts:3113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3113)

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

[src/lib/table/table-scope.ts:2838](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2838)

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

[src/lib/table/table-scope.ts:3104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3104)

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

[src/lib/table/ele-scope.ts:275](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L275)

___

### setHostKeyShortcuts

▸ **setHostKeyShortcuts**(`value`): `void`

Sets `aria-keyshortcuts` of the host (the fill handle's keyboard alternative); removed again by [destroy](TableScope.md#destroy).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `undefined` \| `string` | e.g. `"Control+D Control+R"`; `undefined` restores the value before |

#### Returns

`void`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1974](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1974)

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

[src/lib/table/table-scope.ts:2479](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2479)

___

### setRawValue

▸ **setRawValue**(`rowIndex`, `columnIndex`, `value`): `boolean`

Writes a value without the column's `editInputPipe` (values copied inside the table are already converted – a pipe
that expects text could break them). All area models apply the pipe in `setValue`, so it is left out for the call.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |
| `value` | `unknown` |

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[setRawValue](RenderScope.md#setrawvalue)

#### Defined in

[src/lib/table/render-scope.ts:876](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L876)

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

[src/lib/table/table-scope.ts:2455](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2455)

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

[src/lib/table/table-scope.ts:2808](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2808)

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

[src/lib/table/table-scope.ts:2437](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2437)

___

### setViewportScrollLeft

▸ **setViewportScrollLeft**(`x`): `void`

Sets the horizontal scroll position of the body as distance from the **start** (see [getViewportScrollLeft](TableScope.md#getviewportscrollleft)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | px from the start |

#### Returns

`void`

**`Since`**

1.1.98

#### Inherited from

[RenderScope](RenderScope.md).[setViewportScrollLeft](RenderScope.md#setviewportscrollleft)

#### Defined in

[src/lib/table/ele-scope.ts:238](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L238)

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

[src/lib/table/table-scope.ts:990](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L990)

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

[src/lib/table/table-scope.ts:1000](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1000)

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

[src/lib/table/render-scope.ts:1091](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1091)

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

[src/lib/table/table-scope.ts:3157](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L3157)

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

[src/lib/table/table-scope.ts:2680](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2680)

___

### startEditing

▸ **startEditing**(`rowIndex`, `columnIndex`, `mode?`, `textSelection?`): `boolean`

Opens the cell editor of a body cell: the editor above the cell (Excel-style editing) or – for columns with an
own `getEditRenderer`, and without `tableOptions.editing` – the editor inside the cell.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowIndex` | `number` | `undefined` | display row index |
| `columnIndex` | `number` | `undefined` | model column index |
| `mode?` | [`CellEditMode`](../modules.md#celleditmode) | `'edit'` | "edit" (F2, Enter, double click) or "enter" (typing) |
| `textSelection?` | ``"all"`` \| ``"end"`` | `undefined` | select the text or put the caret at the end (default: the option) |

#### Returns

`boolean`

true if an editor is open

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:503](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L503)

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

[src/lib/table/table-scope.ts:2582](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2582)

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

[src/lib/table/render-scope.ts:1033](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1033)

___

### subscribe

▸ **subscribe**(`listener`): () => `void`

Adds a listener next to the one given to the constructor (see [TableApi.subscribe](TableApi.md#subscribe)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | `Partial`\<[`EventListenerIf`](../interfaces/EventListenerIf.md)\> | the events of interest |

#### Returns

`fn`

removes the listener again

▸ (): `void`

Adds a listener next to the one given to the constructor (see [TableApi.subscribe](TableApi.md#subscribe)).

##### Returns

`void`

removes the listener again

**`Since`**

1.1.99

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:485](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L485)

___

### takeFocusFromDetail

▸ **takeFocusFromDetail**(`rowIndex`): `void`

A detail row that holds the keyboard focus goes away (collapsed, destroyed, scrolled out of view): the host takes
the focus and the master row becomes the focused row – without a repaint (the caller repaints).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index of the master row (-1: only the host) |

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2199)

___

### toggleBooleanCell

▸ **toggleBooleanCell**(`rowIndex`, `columnIndex`): `void`

Space on a cell with a `true`/`false` value (Excel-style editing): writes the opposite value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index |
| `columnIndex` | `number` | model column index |

#### Returns

`void`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:759](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L759)

___

### toggleDetail

▸ **toggleDetail**(`rowOrIndex`, `source?`): `boolean`

Toggles the detail row of a master row (see [TableApi.toggleDetail](TableApi.md#toggledetail)).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowOrIndex` | `unknown` | `undefined` | display index or row object |
| `source?` | [`GeDetailEventSource`](../modules.md#gedetaileventsource) | `'api'` | what changed it |

#### Returns

`boolean`

false if it is no master row

**`Since`**

1.1.97

#### Defined in

[src/lib/table/table-scope.ts:2136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2136)

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

[src/lib/table/table-scope.ts:2416](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2416)

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

[src/lib/table/table-scope.ts:2821](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2821)

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

[src/lib/table/table-scope.ts:2512](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L2512)

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

[src/lib/table/render-scope.ts:818](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L818)

___

### updateModelValueAfterEdit

▸ **updateModelValueAfterEdit**(`areaIdent`, `rowIndex`, `columnIndex`, `value`): `void`

Writes the text of a cell editor (called by the input handler on "change"). Batch edit: the value is marked as
pending instead. Uses [applyCellChanges](TableScope.md#applycellchanges) – one `onModelChanged` per edit, as before.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | only `"body"` is edited |
| `rowIndex` | `number` | display index |
| `columnIndex` | `number` | model index |
| `value` | `string` | the text of the editor |

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1343](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1343)

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

[src/lib/table/render-scope.ts:774](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L774)

___

### writeCells

▸ **writeCells**(`cells`, `source`, `opts?`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

Writes cell values directly (no batch edit) – used by [applyCellChanges](TableScope.md#applycellchanges) and the batch commit.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | \{ `columnIndex`: `number` ; `rowIndex`: `number` ; `value`: `unknown`  }[] | resolved cells (display/model indices) |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | reported in the event |
| `opts?` | `Object` | changes written elsewhere (reported in the same event), no validation (commit: already checked) |
| `opts.extraChanges?` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | - |
| `opts.skipValidation?` | `boolean` | - |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the written cells (including `extraChanges`)

**`Since`**

1.1.96

#### Defined in

[src/lib/table/table-scope.ts:1406](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1406)

___

### writePastedCells

▸ **writePastedCells**(`changes`, `source`, `raw`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

Writes pasted cells (copy, cut and paste): like [applyCellChanges](TableScope.md#applycellchanges) – not editable cells skipped, `validate`,
batch edit marks – with **one** `onModelChanged`; `raw` = values copied inside the table (no `editInputPipe`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | [`CellValueChangeIf`](../interfaces/CellValueChangeIf.md)[] | target cells (and emptied cut cells) |
| `source` | [`CellChangeSource`](../modules.md#cellchangesource) | `"paste"` or `"cut"` |
| `raw` | `boolean` | true: without `editInputPipe` |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the written (batch edit: newly pending) cells

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1510](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1510)

___

### writeUndoCells

▸ **writeUndoCells**(`cells`, `hidden`, `source`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

Writes the values of an undo or redo: without `editInputPipe` (the values were piped already) and validation, only
editable cells; cells of hidden rows (`hidden`, written into their objects already) in the same event; no new
step.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | \{ `columnIndex`: `number` ; `rowIndex`: `number` ; `value`: `unknown`  }[] | shown cells |
| `hidden` | [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | cells of rows a filter hides |
| `source` | ``"undo"`` \| ``"redo"`` | reported in the event |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the written cells (including `hidden`)

**`Since`**

1.1.99

#### Defined in

[src/lib/table/table-scope.ts:1668](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1668)

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

[src/lib/table/table-scope.ts:331](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L331)
