[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RenderScope

# Class: RenderScope

## Hierarchy

- [`EleScope`](EleScope.md)

  ↳ **`RenderScope`**

  ↳↳ [`TableScope`](TableScope.md)

## Table of contents

### Constructors

- [constructor](RenderScope.md#constructor)

### Properties

- [areaBodyCenter](RenderScope.md#areabodycenter)
- [areaBodyCenterGeo](RenderScope.md#areabodycentergeo)
- [areaBodyEast](RenderScope.md#areabodyeast)
- [areaBodyEastGeo](RenderScope.md#areabodyeastgeo)
- [areaBodyWest](RenderScope.md#areabodywest)
- [areaBodyWestGeo](RenderScope.md#areabodywestgeo)
- [areaFooterCenter](RenderScope.md#areafootercenter)
- [areaFooterEast](RenderScope.md#areafootereast)
- [areaFooterWest](RenderScope.md#areafooterwest)
- [areaHeaderCenter](RenderScope.md#areaheadercenter)
- [areaHeaderEast](RenderScope.md#areaheadereast)
- [areaHeaderWest](RenderScope.md#areaheaderwest)
- [areaHeightsOfRenderPass](RenderScope.md#areaheightsofrenderpass)
- [borderFixedEast](RenderScope.md#borderfixedeast)
- [borderFixedWest](RenderScope.md#borderfixedwest)
- [borderFooterTop](RenderScope.md#borderfootertop)
- [borderHeaderBottom](RenderScope.md#borderheaderbottom)
- [cleanupFunctions](RenderScope.md#cleanupfunctions)
- [colAndRowspanModels](RenderScope.md#colandrowspanmodels)
- [contentDiv](RenderScope.md#contentdiv)
- [contentScrollTop](RenderScope.md#contentscrolltop)
- [contentWrapperDiv](RenderScope.md#contentwrapperdiv)
- [displayedRowCount](RenderScope.md#displayedrowcount)
- [dom](RenderScope.md#dom)
- [dragging](RenderScope.md#dragging)
- [draggingColumn](RenderScope.md#draggingcolumn)
- [draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)
- [editing](RenderScope.md#editing)
- [firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)
- [firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)
- [getFocusModel](RenderScope.md#getfocusmodel)
- [getSelectionModel](RenderScope.md#getselectionmodel)
- [hostElement](RenderScope.md#hostelement)
- [hoverColumn](RenderScope.md#hovercolumn)
- [hoverRow](RenderScope.md#hoverrow)
- [lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)
- [lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)
- [loggingActive](RenderScope.md#loggingactive)
- [mouseEvent](RenderScope.md#mouseevent)
- [pendingContentScroll](RenderScope.md#pendingcontentscroll)
- [pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)
- [scrollFactorX](RenderScope.md#scrollfactorx)
- [scrollFactorY](RenderScope.md#scrollfactory)
- [scrollLeft](RenderScope.md#scrollleft)
- [scrollTop](RenderScope.md#scrolltop)
- [scrollViewport](RenderScope.md#scrollviewport)
- [scrollViewportLeft](RenderScope.md#scrollviewportleft)
- [storeScrollPosStateService](RenderScope.md#storescrollposstateservice)
- [storedColumnWidths](RenderScope.md#storedcolumnwidths)
- [tableModel](RenderScope.md#tablemodel)
- [tableOptions](RenderScope.md#tableoptions)
- [tree](RenderScope.md#tree)
- [maxScrollHeightInPx](RenderScope.md#maxscrollheightinpx)

### Methods

- [addAndRenderCellDiv](RenderScope.md#addandrendercelldiv)
- [adjustAfterScrolling](RenderScope.md#adjustafterscrolling)
- [adjustArea](RenderScope.md#adjustarea)
- [adjustBody](RenderScope.md#adjustbody)
- [adjustColumnsToRowParent](RenderScope.md#adjustcolumnstorowparent)
- [adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)
- [adjustDraggingColumn](RenderScope.md#adjustdraggingcolumn)
- [adjustHoverColumns](RenderScope.md#adjusthovercolumns)
- [adjustHoverRows](RenderScope.md#adjusthoverrows)
- [applyCssClasses](RenderScope.md#applycssclasses)
- [checkForScrollPosSaving](RenderScope.md#checkforscrollpossaving)
- [clearSelection](RenderScope.md#clearselection)
- [debounce](RenderScope.md#debounce)
- [disposeRendering](RenderScope.md#disposerendering)
- [drawBigCell](RenderScope.md#drawbigcell)
- [findRowOfImportantRowspanCell](RenderScope.md#findrowofimportantrowspancell)
- [getArea](RenderScope.md#getarea)
- [getAreaAndSideIdentByAttr](RenderScope.md#getareaandsideidentbyattr)
- [getColumnWidths](RenderScope.md#getcolumnwidths)
- [getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)
- [getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)
- [getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)
- [getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)
- [getNumberByAttr](RenderScope.md#getnumberbyattr)
- [getRowHeights](RenderScope.md#getrowheights)
- [getScrollerRangeY](RenderScope.md#getscrollerrangey)
- [getStringByAttr](RenderScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](RenderScope.md#gettreearrowcolumnindex)
- [hideDraggingColumn](RenderScope.md#hidedraggingcolumn)
- [hideHoverColumn](RenderScope.md#hidehovercolumn)
- [hideHoverRow](RenderScope.md#hidehoverrow)
- [initRenderEditor](RenderScope.md#initrendereditor)
- [isEditing](RenderScope.md#isediting)
- [isScrollHeightCapped](RenderScope.md#isscrollheightcapped)
- [onWheel](RenderScope.md#onwheel)
- [recalcColumnWidths](RenderScope.md#recalccolumnwidths)
- [renderContentOfDraggingColumn](RenderScope.md#rendercontentofdraggingcolumn)
- [renderContentOfDraggingColumnForArea](RenderScope.md#rendercontentofdraggingcolumnforarea)
- [repaint](RenderScope.md#repaint)
- [repaintHard](RenderScope.md#repainthard)
- [rerenderCellContent](RenderScope.md#rerendercellcontent)
- [resetEditorRenderer](RenderScope.md#reseteditorrenderer)
- [resetSizeOfWrapperDiv](RenderScope.md#resetsizeofwrapperdiv)
- [snapToDevicePixel](RenderScope.md#snaptodevicepixel)
- [storeColumnWidths](RenderScope.md#storecolumnwidths)
- [updateCells](RenderScope.md#updatecells)

## Constructors

### constructor

• **new RenderScope**(`hostElement`, `tableModel`, `dom`, `tableOptions`): [`RenderScope`](RenderScope.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `hostElement` | `HTMLDivElement` |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) |
| `dom` | [`ConvenienceDomService`](ConvenienceDomService.md) |
| `tableOptions` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) |

#### Returns

[`RenderScope`](RenderScope.md)

#### Overrides

[EleScope](EleScope.md).[constructor](EleScope.md#constructor)

#### Defined in

[src/lib/table/render-scope.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L115)

## Properties

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyCenter](EleScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyCenterGeo](EleScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyEast](EleScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyEastGeo](EleScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyWest](EleScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyWestGeo](EleScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterCenter](EleScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterEast](EleScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterWest](EleScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderCenter](EleScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderEast](EleScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderWest](EleScope.md#areaheaderwest)

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

#### Defined in

[src/lib/table/render-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L107)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedEast](EleScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedWest](EleScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFooterTop](EleScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderHeaderBottom](EleScope.md#borderheaderbottom)

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

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Defined in

[src/lib/table/render-scope.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L99)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[contentDiv](EleScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L27)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[contentWrapperDiv](EleScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L26)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L73)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[EleScope](EleScope.md).[dom](EleScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L61)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L78)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[draggingColumn](EleScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L100)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L79)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L71)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L69)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L83)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L82)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hostElement](EleScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverColumn](EleScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverRow](EleScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L72)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L70)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L76)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/render-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L101)

___

### pendingContentScroll

• `Protected` `Optional` **pendingContentScroll**: `Object`

Exact content position requested by scrollToPixel() for a capped scroll height (see TableScope).

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contentTop` | `number` |
| `scrollTop` | `number` |

#### Defined in

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Defined in

[src/lib/table/render-scope.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L75)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L84)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[EleScope](EleScope.md).[scrollTop](EleScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[scrollViewport](EleScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L24)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L86)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

#### Defined in

[src/lib/table/render-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L81)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Defined in

[src/lib/table/render-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L80)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableModel](EleScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableOptions](EleScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

___

### tree

• `Protected` **tree**: `boolean` = `false`

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

[EleScope](EleScope.md).[maxScrollHeightInPx](EleScope.md#maxscrollheightinpx)

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

[EleScope](EleScope.md).[adjustAfterScrolling](EleScope.md#adjustafterscrolling)

#### Defined in

[src/lib/table/render-scope.ts:270](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L270)

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

#### Defined in

[src/lib/table/render-scope.ts:628](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L628)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:942](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L942)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[EleScope](EleScope.md).[adjustContainersAndRows](EleScope.md#adjustcontainersandrows)

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

#### Defined in

[src/lib/table/render-scope.ts:1200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1200)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Checks if the scroll position should be saved and saves it.

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L180)

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

#### Defined in

[src/lib/table/render-scope.ts:1353](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1353)

___

### disposeRendering

▸ **disposeRendering**(): `void`

Cancels a pending debounced rendering and calls all renderer cleanup functions
(e.g. unmounts framework components rendered into cells). Used by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:833](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L833)

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

#### Defined in

[src/lib/table/render-scope.ts:921](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L921)

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

#### Defined in

[src/lib/table/render-scope.ts:1221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1221)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:538](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L538)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:455](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L455)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:447](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L447)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:439](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L439)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:451](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L451)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

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

#### Defined in

[src/lib/table/render-scope.ts:1237](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1237)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

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

#### Defined in

[src/lib/table/render-scope.ts:1070](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1070)

___

### hideDraggingColumn

▸ **hideDraggingColumn**(): `void`

Hides the dragging column by applying a 'display: none' style to it.
This method is protected and can only be accessed within the class.

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L196)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L153)

___

### isScrollHeightCapped

▸ **isScrollHeightCapped**(): `boolean`

True if the table content is taller than [EleScope.maxScrollHeightInPx](TableScope.md#maxscrollheightinpx); then the scroll bar is
scaled and scrollTop is no longer a content pixel position.

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:533](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L533)

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

#### Defined in

[src/lib/table/render-scope.ts:553](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L553)

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

#### Defined in

[src/lib/table/render-scope.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L254)

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

#### Defined in

[src/lib/table/render-scope.ts:1420](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1420)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

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

[EleScope](EleScope.md).[resetSizeOfWrapperDiv](EleScope.md#resetsizeofwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:312](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L312)

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

#### Defined in

[src/lib/table/render-scope.ts:524](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L524)

___

### storeColumnWidths

▸ **storeColumnWidths**(): `void`

Stores the widths of all columns in the table.

#### Returns

`void`

**`Function`**

storeColumnWidths

#### Defined in

[src/lib/table/render-scope.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L466)

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

#### Defined in

[src/lib/table/render-scope.ts:371](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L371)
