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
- [storeScrollPosStateService](TableScope.md#storescrollposstateservice)
- [storeSortingService](TableScope.md#storesortingservice)
- [storeStateCollapsedExpandService](TableScope.md#storestatecollapsedexpandservice)
- [storedColumnWidths](TableScope.md#storedcolumnwidths)
- [tableModel](TableScope.md#tablemodel)
- [tableOptions](TableScope.md#tableoptions)
- [tree](TableScope.md#tree)
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
- [announce](TableScope.md#announce)
- [announceCopied](TableScope.md#announcecopied)
- [applyCellAria](TableScope.md#applycellaria)
- [applyCssClasses](TableScope.md#applycssclasses)
- [applyRowAria](TableScope.md#applyrowaria)
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
- [getContentScrollRangeY](TableScope.md#getcontentscrollrangey)
- [getDisplayedRowCount](TableScope.md#getdisplayedrowcount)
- [getFirstFullVisibleRowIndex](TableScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](TableScope.md#getfirstvisiblerowindex)
- [getHeaderFocus](TableScope.md#getheaderfocus)
- [getLastFullVisibleRowIndex](TableScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](TableScope.md#getlastvisiblerowindex)
- [getMouseEventTarget](TableScope.md#getmouseeventtarget)
- [getNumberByAttr](TableScope.md#getnumberbyattr)
- [getRowHeights](TableScope.md#getrowheights)
- [getScrollLeftForColumnIndex](TableScope.md#getscrollleftforcolumnindex)
- [getScrollerRangeY](TableScope.md#getscrollerrangey)
- [getStringByAttr](TableScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](TableScope.md#gettreearrowcolumnindex)
- [hideDraggingColumn](TableScope.md#hidedraggingcolumn)
- [hideHoverColumn](TableScope.md#hidehovercolumn)
- [hideHoverRow](TableScope.md#hidehoverrow)
- [holdSelectionEvents](TableScope.md#holdselectionevents)
- [initHostAria](TableScope.md#inithostaria)
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
- [removeHostAria](TableScope.md#removehostaria)
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
- [setColumnVisible](TableScope.md#setcolumnvisible)
- [setColumnWidth](TableScope.md#setcolumnwidth)
- [setDragging](TableScope.md#setdragging)
- [setFooterVisible](TableScope.md#setfootervisible)
- [setHeaderVisible](TableScope.md#setheadervisible)
- [setHostAriaAttribute](TableScope.md#sethostariaattribute)
- [setSelectionModel](TableScope.md#setselectionmodel)
- [setTreeRowExpanded](TableScope.md#settreerowexpanded)
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

[src/lib/table/table-scope.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L121)

## Properties

### allExpanded

• **allExpanded**: `boolean` = `true`

The last "expand / collapse all" state – the header icon toggles it.

#### Defined in

[src/lib/table/table-scope.ts:836](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L836)

___

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenter](RenderScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L37)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyCenterGeo](RenderScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEast](RenderScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyEastGeo](RenderScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWest](RenderScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[RenderScope](RenderScope.md).[areaBodyWestGeo](RenderScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L57)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterCenter](RenderScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterEast](RenderScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaFooterWest](RenderScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderCenter](RenderScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderEast](RenderScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[RenderScope](RenderScope.md).[areaHeaderWest](RenderScope.md#areaheaderwest)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

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

[src/lib/table/render-scope.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L112)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaIds](RenderScope.md#ariaids)

#### Defined in

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

___

### ariaTexts

• `Readonly` **ariaTexts**: [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

Texts for screen readers (English defaults + `tableOptions.ariaTexts`).

**`Since`**

1.1.91

#### Inherited from

[RenderScope](RenderScope.md).[ariaTexts](RenderScope.md#ariatexts)

#### Defined in

[src/lib/table/render-scope.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L121)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedEast](RenderScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFixedWest](RenderScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderFooterTop](RenderScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[borderHeaderBottom](RenderScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L46)

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

[src/lib/table/render-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L94)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[colAndRowspanModels](RenderScope.md#colandrowspanmodels)

#### Defined in

[src/lib/table/render-scope.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L104)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentDiv](RenderScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Inherited from

[RenderScope](RenderScope.md).[contentScrollTop](RenderScope.md#contentscrolltop)

#### Defined in

[src/lib/table/render-scope.ts:108](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L108)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[contentWrapperDiv](RenderScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L30)

___

### copyService

• `Readonly` **copyService**: [`CopyServiceIf`](../interfaces/CopyServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L127)

___

### debounceTimeout

• `Protected` `Optional` **debounceTimeout**: ``null`` \| `Timeout`

#### Inherited from

[RenderScope](RenderScope.md).[debounceTimeout](RenderScope.md#debouncetimeout)

#### Defined in

[src/lib/table/render-scope.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L114)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[displayedRowCount](RenderScope.md#displayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L78)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[RenderScope](RenderScope.md).[dom](RenderScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L68)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[dragging](RenderScope.md#dragging)

#### Defined in

[src/lib/table/render-scope.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L83)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[draggingColumn](RenderScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)

#### Defined in

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[editing](RenderScope.md#editing)

#### Defined in

[src/lib/table/render-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L84)

___

### eventListener

• `Protected` `Readonly` **eventListener**: [`EventListenerIf`](../interfaces/EventListenerIf.md)

#### Defined in

[src/lib/table/table-scope.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L126)

___

### excelService

• `Readonly` **excelService**: [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md)

#### Defined in

[src/lib/table/table-scope.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L128)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L76)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L74)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getFocusModel](RenderScope.md#getfocusmodel)

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Inherited from

[RenderScope](RenderScope.md).[getSelectionModel](RenderScope.md#getselectionmodel)

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### headerFocus

• `Protected` `Optional` **headerFocus**: [`number`, `number`]

The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
first body row, see `TableScope`. `undefined`: the focus is in the body ([FocusModelIf](../interfaces/FocusModelIf.md)).

#### Inherited from

[RenderScope](RenderScope.md).[headerFocus](RenderScope.md#headerfocus)

#### Defined in

[src/lib/table/render-scope.ts:135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L135)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hostElement](RenderScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L66)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverColumn](RenderScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[hoverRow](RenderScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### inputHandler

• **inputHandler**: [`InputHandler`](InputHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L87)

___

### keyEvent

• `Protected` `Optional` **keyEvent**: [`GeKeyEvent`](GeKeyEvent.md)

#### Defined in

[src/lib/table/table-scope.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L95)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L77)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Inherited from

[RenderScope](RenderScope.md).[lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L75)

___

### licenseManager

• **licenseManager**: [`LicenseManager`](LicenseManager.md)

#### Defined in

[src/lib/table/table-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L79)

___

### listenerAbortController

• `Readonly` **listenerAbortController**: `AbortController`

Signal for all DOM listeners of this table (host element, scroll viewport, window).
[destroy](TableScope.md#destroy) aborts it, which removes every listener at once.

#### Defined in

[src/lib/table/table-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L84)

___

### liveAnnouncer

• `Readonly` **liveAnnouncer**: [`LiveAnnouncer`](LiveAnnouncer.md)

The live region of this table: screen readers speak its messages (sorting, filter, copy …).
Use [TableApi.announce](TableApi.md#announce) for own messages.

**`Since`**

1.1.91

#### Defined in

[src/lib/table/table-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L103)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[loggingActive](RenderScope.md#loggingactive)

#### Defined in

[src/lib/table/render-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L81)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Inherited from

[RenderScope](RenderScope.md).[mouseEvent](RenderScope.md#mouseevent)

#### Defined in

[src/lib/table/render-scope.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L106)

___

### mouseHandler

• **mouseHandler**: [`MouseHandler`](MouseHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L86)

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

[src/lib/table/render-scope.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L110)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Inherited from

[RenderScope](RenderScope.md).[pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)

#### Defined in

[src/lib/table/render-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L80)

___

### resizeHandler

• **resizeHandler**: [`ResizeHandler`](ResizeHandler.md)

#### Defined in

[src/lib/table/table-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L88)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorX](RenderScope.md#scrollfactorx)

#### Defined in

[src/lib/table/render-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L93)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollFactorY](RenderScope.md#scrollfactory)

#### Defined in

[src/lib/table/render-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L92)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollLeft](RenderScope.md#scrollleft)

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollTop](RenderScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewport](RenderScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L28)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Inherited from

[RenderScope](RenderScope.md).[scrollViewportLeft](RenderScope.md#scrollviewportleft)

#### Defined in

[src/lib/table/render-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L91)

___

### selectionService

• `Protected` **selectionService**: [`SelectionService`](SelectionService.md)

#### Defined in

[src/lib/table/table-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L94)

___

### shortcutService

• **shortcutService**: [`ShortcutService`](ShortcutService.md)

#### Defined in

[src/lib/table/table-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L89)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

#### Inherited from

[RenderScope](RenderScope.md).[storeScrollPosStateService](RenderScope.md#storescrollposstateservice)

#### Defined in

[src/lib/table/render-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L86)

___

### storeSortingService

• `Optional` **storeSortingService**: [`StoreStateSortingService`](StoreStateSortingService.md)

#### Defined in

[src/lib/table/table-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L92)

___

### storeStateCollapsedExpandService

• `Optional` **storeStateCollapsedExpandService**: [`StoreStateCollapsedExpandService`](StoreStateCollapsedExpandService.md)

#### Defined in

[src/lib/table/table-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L91)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Inherited from

[RenderScope](RenderScope.md).[storedColumnWidths](RenderScope.md#storedcolumnwidths)

#### Defined in

[src/lib/table/render-scope.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L85)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableModel](RenderScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L67)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[RenderScope](RenderScope.md).[tableOptions](RenderScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L69)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Inherited from

[RenderScope](RenderScope.md).[tree](RenderScope.md#tree)

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### filterAnnouncementDelayInMs

▪ `Static` **filterAnnouncementDelayInMs**: `number` = `400`

Delay of the "42 rows" announcement after a filter change (typing in a filter field: one announcement).

#### Defined in

[src/lib/table/table-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L105)

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

[src/lib/table/ele-scope.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L26)

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

[src/lib/table/render-scope.ts:1391](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1391)

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

[src/lib/table/table-scope.ts:1138](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1138)

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

[src/lib/table/render-scope.ts:672](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L672)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustBody](RenderScope.md#adjustbody)

#### Defined in

[src/lib/table/render-scope.ts:617](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L617)

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

[src/lib/table/render-scope.ts:1252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1252)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)

#### Defined in

[src/lib/table/ele-scope.ts:265](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L265)

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

[src/lib/table/render-scope.ts:1726](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1726)

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

[src/lib/table/render-scope.ts:1627](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1627)

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

[src/lib/table/render-scope.ts:1586](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1586)

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

[src/lib/table/table-scope.ts:291](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L291)

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

[src/lib/table/table-scope.ts:298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L298)

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

[src/lib/table/render-scope.ts:942](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L942)

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

[src/lib/table/render-scope.ts:1534](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1534)

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

[src/lib/table/render-scope.ts:909](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L909)

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

[src/lib/table/table-scope.ts:1532](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1532)

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

[src/lib/table/table-scope.ts:1428](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1428)

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

[src/lib/table/table-scope.ts:537](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L537)

___

### cancelPendingRepaint

▸ **cancelPendingRepaint**(): `boolean`

Cancels a repaint scheduled by [debounceRepaint](TableScope.md#debouncerepaint).

#### Returns

`boolean`

true if a repaint was pending

#### Defined in

[src/lib/table/table-scope.ts:933](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L933)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Checks if the scroll position should be saved and saves it.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[checkForScrollPosSaving](RenderScope.md#checkforscrollpossaving)

#### Defined in

[src/lib/table/render-scope.ts:400](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L400)

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

[src/lib/table/render-scope.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L203)

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

[src/lib/table/table-scope.ts:803](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L803)

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

[src/lib/table/table-scope.ts:649](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L649)

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

[src/lib/table/render-scope.ts:1708](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1708)

___

### debounceRepaint

▸ **debounceRepaint**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:924](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L924)

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

[src/lib/table/table-scope.ts:619](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L619)

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

[src/lib/table/render-scope.ts:1693](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1693)

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

[src/lib/table/render-scope.ts:1129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1129)

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

[src/lib/table/table-scope.ts:1635](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1635)

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

[src/lib/table/table-scope.ts:1605](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1605)

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

[src/lib/table/table-scope.ts:989](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L989)

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

[src/lib/table/render-scope.ts:1231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1231)

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

[src/lib/table/table-scope.ts:580](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L580)

___

### focusModel

▸ **focusModel**(): `undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

Retrieves the focus model.

#### Returns

`undefined` \| [`FocusModelIf`](../interfaces/FocusModelIf.md)

The focus model if it exists, or undefined otherwise.

#### Defined in

[src/lib/table/table-scope.ts:1228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1228)

___

### getApi

▸ **getApi**(): [`TableApi`](TableApi.md)

Retrieves the TableApi object.

#### Returns

[`TableApi`](TableApi.md)

The TableApi object.

#### Defined in

[src/lib/table/table-scope.ts:567](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L567)

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

[src/lib/table/render-scope.ts:537](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L537)

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

[src/lib/table/render-scope.ts:517](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L517)

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

[src/lib/table/ele-scope.ts:250](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L250)

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

[src/lib/table/render-scope.ts:901](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L901)

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

[src/lib/table/render-scope.ts:299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L299)

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

[src/lib/table/render-scope.ts:1058](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1058)

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

[src/lib/table/render-scope.ts:1040](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1040)

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

[src/lib/table/render-scope.ts:1652](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1652)

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

[src/lib/table/render-scope.ts:1555](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1555)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)

#### Defined in

[src/lib/table/render-scope.ts:582](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L582)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)

#### Defined in

[src/lib/table/render-scope.ts:499](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L499)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:491](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L491)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:483](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L483)

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

[src/lib/table/table-scope.ts:342](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L342)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:495](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L495)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)

#### Defined in

[src/lib/table/render-scope.ts:487](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L487)

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

[src/lib/table/table-scope.ts:677](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L677)

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

[src/lib/table/render-scope.ts:638](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L638)

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

[src/lib/table/render-scope.ts:1571](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1571)

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

[src/lib/table/table-scope.ts:1113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1113)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

#### Inherited from

[RenderScope](RenderScope.md).[getScrollerRangeY](RenderScope.md#getscrollerrangey)

#### Defined in

[src/lib/table/render-scope.ts:587](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L587)

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

[src/lib/table/render-scope.ts:655](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L655)

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

[src/lib/table/render-scope.ts:1380](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1380)

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

[src/lib/table/render-scope.ts:1854](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1854)

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

[src/lib/table/render-scope.ts:1675](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1675)

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

[src/lib/table/render-scope.ts:1616](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1616)

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

[src/lib/table/table-scope.ts:967](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L967)

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

[src/lib/table/ele-scope.ts:235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L235)

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

[src/lib/table/render-scope.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L219)

___

### isDestroyed

▸ **isDestroyed**(): `boolean`

Returns `true` once [destroy](TableScope.md#destroy) has been called.

#### Returns

`boolean`

#### Defined in

[src/lib/table/table-scope.ts:639](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L639)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RenderScope](RenderScope.md).[isEditing](RenderScope.md#isediting)

#### Defined in

[src/lib/table/render-scope.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L176)

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

[src/lib/table/render-scope.ts:577](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L577)

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

[src/lib/table/table-scope.ts:765](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L765)

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

[src/lib/table/table-scope.ts:723](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L723)

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

[src/lib/table/table-scope.ts:790](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L790)

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

[src/lib/table/table-scope.ts:226](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L226)

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

[src/lib/table/table-scope.ts:946](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L946)

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

[src/lib/table/table-scope.ts:1017](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1017)

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

[src/lib/table/table-scope.ts:903](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L903)

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

[src/lib/table/table-scope.ts:702](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L702)

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

[src/lib/table/table-scope.ts:950](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L950)

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

[src/lib/table/render-scope.ts:597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L597)

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

[src/lib/table/table-scope.ts:942](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L942)

___

### reSort

▸ **reSort**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1548](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1548)

___

### reapplySorting

▸ **reapplySorting**(): `void`

Sorts the (freshly filtered) body rows again, so a filter keeps the current order:
the last `sort(compareFn)` call, otherwise the columns with a `sortState` (header icons).

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1566](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1566)

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

[src/lib/table/render-scope.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L282)

___

### recalcWrappers

▸ **recalcWrappers**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/table-scope.ts:1542](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1542)

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

[src/lib/table/ele-scope.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L218)

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

[src/lib/table/render-scope.ts:1763](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1763)

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

[src/lib/table/render-scope.ts:1783](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1783)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

#### Inherited from

[RenderScope](RenderScope.md).[repaint](RenderScope.md#repaint)

#### Defined in

[src/lib/table/render-scope.ts:251](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L251)

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

[src/lib/table/render-scope.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L263)

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

[src/lib/table/render-scope.ts:442](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L442)

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

[src/lib/table/render-scope.ts:189](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L189)

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

[src/lib/table/ele-scope.ts:419](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L419)

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

[src/lib/table/table-scope.ts:1099](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1099)

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

[src/lib/table/table-scope.ts:1071](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1071)

___

### selectionModel

▸ **selectionModel**(): `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

Retrieves the selection model.

#### Returns

`undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

The selection model if available, otherwise undefined.

#### Defined in

[src/lib/table/table-scope.ts:1216](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1216)

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

[src/lib/table/table-scope.ts:1492](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1492)

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

[src/lib/table/table-scope.ts:1481](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1481)

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

[src/lib/table/table-scope.ts:1235](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1235)

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

[src/lib/table/table-scope.ts:1514](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1514)

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

[src/lib/table/table-scope.ts:1505](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1505)

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

[src/lib/table/ele-scope.ts:199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L199)

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

[src/lib/table/table-scope.ts:1161](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1161)

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

[src/lib/table/table-scope.ts:845](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L845)

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

[src/lib/table/render-scope.ts:568](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L568)

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

[src/lib/table/table-scope.ts:1555](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1555)

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

[src/lib/table/table-scope.ts:1035](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1035)

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

[src/lib/table/render-scope.ts:510](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L510)

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

[src/lib/table/table-scope.ts:824](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L824)

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

[src/lib/table/table-scope.ts:1174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L1174)

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

[src/lib/table/table-scope.ts:885](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L885)

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

[src/lib/table/render-scope.ts:415](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L415)

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

[src/lib/table/table-scope.ts:549](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L549)

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

[src/lib/table/table-scope.ts:214](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/table-scope.ts#L214)
