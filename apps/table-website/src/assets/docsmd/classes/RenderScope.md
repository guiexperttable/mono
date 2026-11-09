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

- [adjustingRowNumberWidth](RenderScope.md#adjustingrownumberwidth)
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
- [ariaIds](RenderScope.md#ariaids)
- [ariaTexts](RenderScope.md#ariatexts)
- [batchEditService](RenderScope.md#batcheditservice)
- [borderFixedEast](RenderScope.md#borderfixedeast)
- [borderFixedWest](RenderScope.md#borderfixedwest)
- [borderFooterTop](RenderScope.md#borderfootertop)
- [borderHeaderBottom](RenderScope.md#borderheaderbottom)
- [cellEditorService](RenderScope.md#celleditorservice)
- [cleanupFunctions](RenderScope.md#cleanupfunctions)
- [colAndRowspanModels](RenderScope.md#colandrowspanmodels)
- [contentDiv](RenderScope.md#contentdiv)
- [contentScrollTop](RenderScope.md#contentscrolltop)
- [contentWrapperDiv](RenderScope.md#contentwrapperdiv)
- [debounceTimeout](RenderScope.md#debouncetimeout)
- [direction](RenderScope.md#direction)
- [displayedRowCount](RenderScope.md#displayedrowcount)
- [dom](RenderScope.md#dom)
- [dragging](RenderScope.md#dragging)
- [draggingColumn](RenderScope.md#draggingcolumn)
- [draggingTargetColumnIndex](RenderScope.md#draggingtargetcolumnindex)
- [editing](RenderScope.md#editing)
- [fillHandleService](RenderScope.md#fillhandleservice)
- [firstFullVisibleRowIndex](RenderScope.md#firstfullvisiblerowindex)
- [firstVisibleRowIndex](RenderScope.md#firstvisiblerowindex)
- [getFocusModel](RenderScope.md#getfocusmodel)
- [getSelectionModel](RenderScope.md#getselectionmodel)
- [headerFocus](RenderScope.md#headerfocus)
- [horizontalScrollBarHeight](RenderScope.md#horizontalscrollbarheight)
- [hostElement](RenderScope.md#hostelement)
- [hoverColumn](RenderScope.md#hovercolumn)
- [hoverRow](RenderScope.md#hoverrow)
- [lastFullVisibleRowIndex](RenderScope.md#lastfullvisiblerowindex)
- [lastVisibleRowIndex](RenderScope.md#lastvisiblerowindex)
- [loggingActive](RenderScope.md#loggingactive)
- [masterDetailService](RenderScope.md#masterdetailservice)
- [mouseEvent](RenderScope.md#mouseevent)
- [pendingContentScroll](RenderScope.md#pendingcontentscroll)
- [pixelLimitForFullVisible](RenderScope.md#pixellimitforfullvisible)
- [relativeWidthsBase](RenderScope.md#relativewidthsbase)
- [renderedBodyRows](RenderScope.md#renderedbodyrows)
- [renderedScrollLeft](RenderScope.md#renderedscrollleft)
- [renderedScrollTop](RenderScope.md#renderedscrolltop)
- [rowDragService](RenderScope.md#rowdragservice)
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
- [tableOverlay](RenderScope.md#tableoverlay)
- [tableSheet](RenderScope.md#tablesheet)
- [tree](RenderScope.md#tree)
- [verticalScrollBarWidth](RenderScope.md#verticalscrollbarwidth)
- [maxScrollHeightInPx](RenderScope.md#maxscrollheightinpx)

### Methods

- [addAndRenderCellDiv](RenderScope.md#addandrendercelldiv)
- [adjustAfterScrolling](RenderScope.md#adjustafterscrolling)
- [adjustArea](RenderScope.md#adjustarea)
- [adjustBody](RenderScope.md#adjustbody)
- [adjustColumnsToRowParent](RenderScope.md#adjustcolumnstorowparent)
- [adjustContainersAndRows](RenderScope.md#adjustcontainersandrows)
- [adjustDetailLayerBounds](RenderScope.md#adjustdetaillayerbounds)
- [adjustDraggingColumn](RenderScope.md#adjustdraggingcolumn)
- [adjustHoverColumns](RenderScope.md#adjusthovercolumns)
- [adjustHoverRows](RenderScope.md#adjusthoverrows)
- [adjustRelativeColumnWidthsToScrollBar](RenderScope.md#adjustrelativecolumnwidthstoscrollbar)
- [adjustRowNumberColumnWidth](RenderScope.md#adjustrownumbercolumnwidth)
- [afterRenderPass](RenderScope.md#afterrenderpass)
- [applyCellAria](RenderScope.md#applycellaria)
- [applyCssClasses](RenderScope.md#applycssclasses)
- [applyRowAria](RenderScope.md#applyrowaria)
- [checkForScrollPosSaving](RenderScope.md#checkforscrollpossaving)
- [clearSelection](RenderScope.md#clearselection)
- [clientXToHostX](RenderScope.md#clientxtohostx)
- [debounce](RenderScope.md#debounce)
- [disposeRendering](RenderScope.md#disposerendering)
- [drawBigCell](RenderScope.md#drawbigcell)
- [findRowOfImportantRowspanCell](RenderScope.md#findrowofimportantrowspancell)
- [getArea](RenderScope.md#getarea)
- [getAreaAndSideIdentByAttr](RenderScope.md#getareaandsideidentbyattr)
- [getAreaChild](RenderScope.md#getareachild)
- [getAriaGridInfo](RenderScope.md#getariagridinfo)
- [getAvailableColumnWidth](RenderScope.md#getavailablecolumnwidth)
- [getBodyCellAtHostPoint](RenderScope.md#getbodycellathostpoint)
- [getBodyCellRectInHost](RenderScope.md#getbodycellrectinhost)
- [getBodyContentHeight](RenderScope.md#getbodycontentheight)
- [getBodyRowIndexAtY](RenderScope.md#getbodyrowindexaty)
- [getBodyRowLayout](RenderScope.md#getbodyrowlayout)
- [getBodyRowTop](RenderScope.md#getbodyrowtop)
- [getBodyViewport](RenderScope.md#getbodyviewport)
- [getCheckboxAriaLabel](RenderScope.md#getcheckboxarialabel)
- [getColumnAriaLabel](RenderScope.md#getcolumnarialabel)
- [getColumnLeftInHost](RenderScope.md#getcolumnleftinhost)
- [getColumnWidths](RenderScope.md#getcolumnwidths)
- [getContentScrollLeft](RenderScope.md#getcontentscrollleft)
- [getContentScrollRangeY](RenderScope.md#getcontentscrollrangey)
- [getDisplayedRowCount](RenderScope.md#getdisplayedrowcount)
- [getDomService](RenderScope.md#getdomservice)
- [getFirstDataColumnIndex](RenderScope.md#getfirstdatacolumnindex)
- [getFirstFullVisibleRowIndex](RenderScope.md#getfirstfullvisiblerowindex)
- [getFirstVisibleRowIndex](RenderScope.md#getfirstvisiblerowindex)
- [getInCellEditorCell](RenderScope.md#getincelleditorcell)
- [getLastFullVisibleRowIndex](RenderScope.md#getlastfullvisiblerowindex)
- [getLastVisibleRowIndex](RenderScope.md#getlastvisiblerowindex)
- [getLayoutHeight](RenderScope.md#getlayoutheight)
- [getLayoutWidth](RenderScope.md#getlayoutwidth)
- [getNumberByAttr](RenderScope.md#getnumberbyattr)
- [getRowHeights](RenderScope.md#getrowheights)
- [getScrollerRangeY](RenderScope.md#getscrollerrangey)
- [getScrollerToContentRatioY](RenderScope.md#getscrollertocontentratioy)
- [getStringByAttr](RenderScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](RenderScope.md#gettreearrowcolumnindex)
- [getViewportScrollLeft](RenderScope.md#getviewportscrollleft)
- [hasBodyRowExtras](RenderScope.md#hasbodyrowextras)
- [hasRelativeColumnWidths](RenderScope.md#hasrelativecolumnwidths)
- [hideDraggingColumn](RenderScope.md#hidedraggingcolumn)
- [hideHover](RenderScope.md#hidehover)
- [hideHoverColumn](RenderScope.md#hidehovercolumn)
- [hideHoverRow](RenderScope.md#hidehoverrow)
- [initHostAria](RenderScope.md#inithostaria)
- [initRenderEditor](RenderScope.md#initrendereditor)
- [invalidateAggregates](RenderScope.md#invalidateaggregates)
- [invalidateRowLayout](RenderScope.md#invalidaterowlayout)
- [isColumnResizable](RenderScope.md#iscolumnresizable)
- [isEditing](RenderScope.md#isediting)
- [isRtl](RenderScope.md#isrtl)
- [isScrollHeightCapped](RenderScope.md#isscrollheightcapped)
- [layoutContainers](RenderScope.md#layoutcontainers)
- [measureHorizontalScrollBarHeight](RenderScope.md#measurehorizontalscrollbarheight)
- [measureRowNumberText](RenderScope.md#measurerownumbertext)
- [measureVerticalScrollBarWidth](RenderScope.md#measureverticalscrollbarwidth)
- [onOverlayChanged](RenderScope.md#onoverlaychanged)
- [onViewportScroll](RenderScope.md#onviewportscroll)
- [onWheel](RenderScope.md#onwheel)
- [recalcColumnWidths](RenderScope.md#recalccolumnwidths)
- [removeHostAria](RenderScope.md#removehostaria)
- [renderContentOfDraggingColumn](RenderScope.md#rendercontentofdraggingcolumn)
- [renderContentOfDraggingColumnForArea](RenderScope.md#rendercontentofdraggingcolumnforarea)
- [repaint](RenderScope.md#repaint)
- [repaintHard](RenderScope.md#repainthard)
- [rerenderCalculatedCells](RenderScope.md#rerendercalculatedcells)
- [rerenderCellContent](RenderScope.md#rerendercellcontent)
- [rerenderDerivedFooterCells](RenderScope.md#rerenderderivedfootercells)
- [rerenderGroupRowCells](RenderScope.md#rerendergrouprowcells)
- [resetEditorRenderer](RenderScope.md#reseteditorrenderer)
- [resetSizeOfWrapperDiv](RenderScope.md#resetsizeofwrapperdiv)
- [restoreHostAriaAttribute](RenderScope.md#restorehostariaattribute)
- [setBodyRowExtra](RenderScope.md#setbodyrowextra)
- [setContentScrollPosition](RenderScope.md#setcontentscrollposition)
- [setEditorDraft](RenderScope.md#seteditordraft)
- [setHostAriaAttribute](RenderScope.md#sethostariaattribute)
- [setParentWidth](RenderScope.md#setparentwidth)
- [setRawValue](RenderScope.md#setrawvalue)
- [setViewportScrollLeft](RenderScope.md#setviewportscrollleft)
- [snapToDevicePixel](RenderScope.md#snaptodevicepixel)
- [storeColumnWidths](RenderScope.md#storecolumnwidths)
- [updateCells](RenderScope.md#updatecells)
- [updateOverlay](RenderScope.md#updateoverlay)
- [updateRowCountWithoutRender](RenderScope.md#updaterowcountwithoutrender)

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

[src/lib/table/render-scope.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L210)

## Properties

### adjustingRowNumberWidth

• `Protected` **adjustingRowNumberWidth**: `boolean` = `false`

true while the containers are adjusted to a new row number width (no second change in that nested pass).

#### Defined in

[src/lib/table/render-scope.ts:2183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2183)

___

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyCenter](EleScope.md#areabodycenter)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyCenterGeo](EleScope.md#areabodycentergeo)

#### Defined in

[src/lib/table/ele-scope.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L74)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyEast](EleScope.md#areabodyeast)

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyEastGeo](EleScope.md#areabodyeastgeo)

#### Defined in

[src/lib/table/ele-scope.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L75)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaBodyWest](EleScope.md#areabodywest)

#### Defined in

[src/lib/table/ele-scope.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L41)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Inherited from

[EleScope](EleScope.md).[areaBodyWestGeo](EleScope.md#areabodywestgeo)

#### Defined in

[src/lib/table/ele-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L73)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterCenter](EleScope.md#areafootercenter)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterEast](EleScope.md#areafootereast)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaFooterWest](EleScope.md#areafooterwest)

#### Defined in

[src/lib/table/ele-scope.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L46)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderCenter](EleScope.md#areaheadercenter)

#### Defined in

[src/lib/table/ele-scope.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L36)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderEast](EleScope.md#areaheadereast)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Inherited from

[EleScope](EleScope.md).[areaHeaderWest](EleScope.md#areaheaderwest)

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

#### Defined in

[src/lib/table/render-scope.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L136)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Inherited from

[EleScope](EleScope.md).[ariaIds](EleScope.md#ariaids)

#### Defined in

[src/lib/table/ele-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L78)

___

### ariaTexts

• `Readonly` **ariaTexts**: [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

Texts for screen readers (English defaults + `tableOptions.ariaTexts`).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/render-scope.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L145)

___

### batchEditService

• `Optional` **batchEditService**: [`BatchEditService`](BatchEditService.md)

Batch edit of this table (pending values, shown in the cells) – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Defined in

[src/lib/table/render-scope.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L171)

___

### borderFixedEast

• `Protected` `Optional` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedEast](EleScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### borderFixedWest

• `Protected` `Optional` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedWest](EleScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### borderFooterTop

• `Protected` `Optional` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFooterTop](EleScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### borderHeaderBottom

• `Protected` `Optional` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderHeaderBottom](EleScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### cellEditorService

• `Optional` **cellEditorService**: [`CellEditorService`](CellEditorService.md)

Excel-style editing of this table (the editor above the cell) – created by [TableScope](TableScope.md) with
`tableOptions.editing`.

**`Since`**

1.1.99

#### Defined in

[src/lib/table/render-scope.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L184)

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

[src/lib/table/render-scope.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L107)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Defined in

[src/lib/table/render-scope.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L117)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[contentDiv](EleScope.md#contentdiv)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### contentScrollTop

• `Protected` **contentScrollTop**: `number` = `0`

Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody).

#### Defined in

[src/lib/table/render-scope.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L121)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[contentWrapperDiv](EleScope.md#contentwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### debounceTimeout

• `Protected` `Optional` **debounceTimeout**: ``null`` \| `Timeout`

#### Defined in

[src/lib/table/render-scope.ts:138](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L138)

___

### direction

• `Readonly` **direction**: [`ResolvedTableDirection`](../modules.md#resolvedtabledirection)

The resolved writing direction of the table ([TableOptionsIf.direction](../interfaces/TableOptionsIf.md#direction); `"auto"` is decided when the table
is built).

**`Since`**

1.1.98

#### Inherited from

[EleScope](EleScope.md).[direction](EleScope.md#direction)

#### Defined in

[src/lib/table/ele-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L87)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L91)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[EleScope](EleScope.md).[dom](EleScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L93)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L96)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[draggingColumn](EleScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L57)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L118)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L97)

___

### fillHandleService

• `Optional` **fillHandleService**: [`FillHandleService`](FillHandleService.md)

Fill handle of this table – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Defined in

[src/lib/table/render-scope.ts:177](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L177)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L102)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L101)

___

### headerFocus

• `Protected` `Optional` **headerFocus**: [`number`, `number`]

The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
first body row, see `TableScope`. `undefined`: the focus is in the body ([FocusModelIf](../interfaces/FocusModelIf.md)).

#### Defined in

[src/lib/table/render-scope.ts:159](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L159)

___

### horizontalScrollBarHeight

• `Protected` **horizontalScrollBarHeight**: `number` = `0`

Height of the horizontal scroll bar of [scrollViewport](TableScope.md#scrollviewport) in px, measured in [adjustContainersAndRows](TableScope.md#adjustcontainersandrows).
0 without a horizontal scroll bar and with overlay scroll bars (macOS default, mobile) – they take no space.

#### Inherited from

[EleScope](EleScope.md).[horizontalScrollBarHeight](EleScope.md#horizontalscrollbarheight)

#### Defined in

[src/lib/table/ele-scope.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L65)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hostElement](EleScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L91)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverColumn](EleScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverRow](EleScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L90)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L94)

___

### masterDetailService

• `Optional` **masterDetailService**: [`MasterDetailService`](MasterDetailService.md)

Master/detail of this table (detail rows below master rows) – created by [TableScope](TableScope.md) with
`tableOptions.masterDetail`.

**`Since`**

1.1.97

#### Defined in

[src/lib/table/render-scope.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L197)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/render-scope.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L119)

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

[src/lib/table/render-scope.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L123)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Defined in

[src/lib/table/render-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L93)

___

### relativeWidthsBase

• `Protected` **relativeWidthsBase**: `number` = `-1`

The width % and weight columns were last computed for (`TableModelIf.setParentWidth`), -1 = unknown.

#### Defined in

[src/lib/table/render-scope.ts:2187](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2187)

___

### renderedBodyRows

• `Protected` **renderedBodyRows**: `Object`

The body rows of the last render pass (live data, since 1.1.108): row count, first visible row and the content
offset into it, last (partly) visible row, and whether the view was at the end.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `atEnd` | `boolean` |
| `count` | `number` |
| `first` | `number` |
| `last` | `number` |
| `offset` | `number` |

#### Defined in

[src/lib/table/render-scope.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L133)

___

### renderedScrollLeft

• `Protected` **renderedScrollLeft**: `number` = `Number.NaN`

#### Defined in

[src/lib/table/render-scope.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L134)

___

### renderedScrollTop

• `Protected` **renderedScrollTop**: `number` = `Number.NaN`

The scroll position (`scrollTop`, logical `scrollLeft`) of the last render pass – the `scroll` event of a position
that is already rendered (`repaintHard({ py })`, `scrollToPixel()` render it at once) renders nothing.

#### Defined in

[src/lib/table/render-scope.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L128)

___

### rowDragService

• `Optional` **rowDragService**: [`RowDragService`](RowDragService.md)

Row drag of this table (drag handles, pointer and keyboard drag) – created by [TableScope](TableScope.md).

**`Since`**

1.1.95

#### Defined in

[src/lib/table/render-scope.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L165)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L106)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[EleScope](EleScope.md).[scrollTop](EleScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[scrollViewport](EleScope.md#scrollviewport)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### scrollViewportLeft

• `Protected` **scrollViewportLeft**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L104)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

**`Deprecated`**

since 1.1.92 – no longer used, see [TableStateService](TableStateService.md).

#### Defined in

[src/lib/table/render-scope.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L100)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Defined in

[src/lib/table/render-scope.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L98)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableModel](EleScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L92)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableOptions](EleScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L94)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Inherited from

[EleScope](EleScope.md).[tableOverlay](EleScope.md#tableoverlay)

#### Defined in

[src/lib/table/ele-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L81)

___

### tableSheet

• `Optional` **tableSheet**: [`TableSheet`](TableSheet.md)

Cell formulas of this table – created by [TableScope](TableScope.md) with `tableOptions.cellFormulas` (flat bodies).

**`Since`**

1.1.99

#### Defined in

[src/lib/table/render-scope.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L203)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L116)

___

### verticalScrollBarWidth

• `Protected` **verticalScrollBarWidth**: `number` = `0`

Width of the vertical scroll bar of [scrollViewport](TableScope.md#scrollviewport) in px (at the end of the rows: right, in right-to-left
on the left), measured in [adjustContainersAndRows](TableScope.md#adjustcontainersandrows). 0 without one and with overlay scroll bars.

#### Inherited from

[EleScope](EleScope.md).[verticalScrollBarWidth](EleScope.md#verticalscrollbarwidth)

#### Defined in

[src/lib/table/ele-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L71)

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

#### Defined in

[src/lib/table/render-scope.ts:2255](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2255)

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

[src/lib/table/render-scope.ts:812](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L812)

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

[src/lib/table/render-scope.ts:1381](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1381)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:1330](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1330)

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

[src/lib/table/render-scope.ts:2021](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2021)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state: lays out the areas
([layoutContainers](EleScope.md#layoutcontainers)) and renders the visible rows ([adjustAfterScrolling](EleScope.md#adjustafterscrolling)).

#### Returns

`void`

#### Inherited from

[EleScope](EleScope.md).[adjustContainersAndRows](EleScope.md#adjustcontainersandrows)

#### Defined in

[src/lib/table/ele-scope.ts:372](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L372)

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

#### Overrides

[EleScope](EleScope.md).[adjustDetailLayerBounds](EleScope.md#adjustdetaillayerbounds)

#### Defined in

[src/lib/table/render-scope.ts:1279](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1279)

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

[src/lib/table/render-scope.ts:2665](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2665)

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

[src/lib/table/render-scope.ts:2555](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2555)

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

[src/lib/table/render-scope.ts:2503](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2503)

___

### adjustRelativeColumnWidthsToScrollBar

▸ **adjustRelativeColumnWidthsToScrollBar**(): `void`

% and weight columns share the width next to the vertical scroll bar. The bar appears (or disappears) only after
the rows are laid out – the first layout, rows added or removed, a filter: then the columns were computed for the
wrong width – too wide by the width of the bar, so a horizontal scroll bar appeared and covered the last row. Here
they are computed again (once – the flag stops a second pass) with the width that is available now.

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:776](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L776)

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

#### Defined in

[src/lib/table/render-scope.ts:2198](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2198)

___

### afterRenderPass

▸ **afterRenderPass**(): `void`

Called at the end of every render pass (scroll, repaint). [TableScope](TableScope.md) marks the scroll position of the
table state as changed here (stored and reported debounced, see [TableStateService](TableStateService.md)).

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/render-scope.ts:938](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L938)

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

#### Defined in

[src/lib/table/render-scope.ts:1685](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1685)

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

[src/lib/table/render-scope.ts:2451](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2451)

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

#### Defined in

[src/lib/table/render-scope.ts:1644](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1644)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Marks the scroll position as changed (it is stored with the table state, see [TableStateService](TableStateService.md)).

#### Returns

`void`

**`Deprecated`**

since 1.1.92 – the table does this after every render pass.

#### Defined in

[src/lib/table/render-scope.ts:980](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L980)

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

[src/lib/table/render-scope.ts:531](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L531)

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

[EleScope](EleScope.md).[clientXToHostX](EleScope.md#clientxtohostx)

#### Defined in

[src/lib/table/ele-scope.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L263)

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

[src/lib/table/render-scope.ts:2647](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2647)

___

### disposeRendering

▸ **disposeRendering**(): `void`

Cancels a pending debounced rendering and calls all renderer cleanup functions
(e.g. unmounts framework components rendered into cells). Used by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:2632](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2632)

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

[src/lib/table/render-scope.ts:1895](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1895)

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

[src/lib/table/render-scope.ts:2000](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2000)

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

[src/lib/table/render-scope.ts:1234](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1234)

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

[src/lib/table/render-scope.ts:1214](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1214)

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

[EleScope](EleScope.md).[getAreaChild](EleScope.md#getareachild)

#### Defined in

[src/lib/table/ele-scope.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L356)

___

### getAriaGridInfo

▸ **getAriaGridInfo**(): [`AriaGridInfo`](AriaGridInfo.md)

Row and column numbers for screen readers of the current render pass (computed at its start).

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

the counts

**`Since`**

1.1.91

#### Defined in

[src/lib/table/render-scope.ts:1636](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1636)

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

#### Defined in

[src/lib/table/render-scope.ts:802](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L802)

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

#### Defined in

[src/lib/table/render-scope.ts:331](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L331)

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

#### Defined in

[src/lib/table/render-scope.ts:289](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L289)

___

### getBodyContentHeight

▸ **getBodyContentHeight**(): `number`

The model's content height plus the heights of open detail rows (master/detail).

#### Returns

`number`

px

**`Since`**

1.1.97

#### Overrides

[EleScope](EleScope.md).[getBodyContentHeight](EleScope.md#getbodycontentheight)

#### Defined in

[src/lib/table/render-scope.ts:1289](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1289)

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

#### Defined in

[src/lib/table/render-scope.ts:450](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L450)

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

#### Defined in

[src/lib/table/render-scope.ts:378](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L378)

___

### getBodyRowTop

▸ **getBodyRowTop**(`rowIndex`): `number`

The top of a body row in content pixels – from the row layout of the table ([getBodyRowLayout](TableScope.md#getbodyrowlayout): the heights
the rows are drawn with, plus the open detail rows above it). Since 1.1.107 always from the layout (before: without
detail rows from [AreaModelIf.getYPosByRowIndex](../interfaces/AreaModelIf.md#getyposbyrowindex), which an area model with its own `getRowHeight()` could
get wrong – `scrollToIndex()` landed beside the row). O(1) for constant heights, otherwise after one O(n) build.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display index |

#### Returns

`number`

px from the top of the first body row

**`Since`**

1.1.97

#### Defined in

[src/lib/table/render-scope.ts:437](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L437)

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

#### Defined in

[src/lib/table/render-scope.ts:267](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L267)

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

#### Defined in

[src/lib/table/render-scope.ts:1824](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1824)

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

#### Defined in

[src/lib/table/render-scope.ts:1806](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1806)

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

#### Defined in

[src/lib/table/render-scope.ts:2580](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2580)

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

[src/lib/table/render-scope.ts:2472](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2472)

___

### getContentScrollLeft

▸ **getContentScrollLeft**(): `number`

Content pixels of the center columns scrolled out on the left – the offset that is actually rendered
(see adjustColumnsToRowParent), the horizontal counterpart of `contentScrollTop`.

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:2600](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2600)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1295](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1295)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1196)

___

### getDomService

▸ **getDomService**(): [`ConvenienceDomService`](ConvenienceDomService.md)

The DOM service of this table (all DOM access of the table goes through it).

#### Returns

[`ConvenienceDomService`](ConvenienceDomService.md)

the service

**`Since`**

1.1.95

#### Defined in

[src/lib/table/render-scope.ts:256](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L256)

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

#### Defined in

[src/lib/table/render-scope.ts:2167](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2167)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1188](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1188)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1180)

___

### getInCellEditorCell

▸ **getInCellEditorCell**(): `undefined` \| [`number`, `number`]

The cell of the open editor inside a cell (`getEditRenderer`, the way before Excel-style editing).

#### Returns

`undefined` \| [`number`, `number`]

display row and model column, `undefined` without such an editor

**`Since`**

1.1.99

#### Defined in

[src/lib/table/render-scope.ts:479](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L479)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1192)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1184)

___

### getLayoutHeight

▸ **getLayoutHeight**(): `number`

The height the table lays out header, body and footer in: the host height minus a horizontal scroll bar that
takes space (see [horizontalScrollBarHeight](TableScope.md#horizontalscrollbarheight)).

#### Returns

`number`

px

**`Since`**

1.1.104

#### Inherited from

[EleScope](EleScope.md).[getLayoutHeight](EleScope.md#getlayoutheight)

#### Defined in

[src/lib/table/ele-scope.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L546)

___

### getLayoutWidth

▸ **getLayoutWidth**(): `number`

The width the table lays out header, body and footer in: the host width minus a vertical scroll bar that takes
space (see [verticalScrollBarWidth](TableScope.md#verticalscrollbarwidth)). A logical width – in right-to-left the bar is on the left.

#### Returns

`number`

px

**`Since`**

1.1.104

#### Inherited from

[EleScope](EleScope.md).[getLayoutWidth](EleScope.md#getlayoutwidth)

#### Defined in

[src/lib/table/ele-scope.ts:557](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L557)

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

[src/lib/table/render-scope.ts:1347](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1347)

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

[src/lib/table/render-scope.ts:2488](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2488)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1300)

___

### getScrollerToContentRatioY

▸ **getScrollerToContentRatioY**(): `number`

Scroll bar pixels per content pixel: 1, below 1 for a capped scroll height ([isScrollHeightCapped](TableScope.md#isscrollheightcapped)).

#### Returns

`number`

the factor for `scrollTop` changes

**`Since`**

1.1.95

#### Defined in

[src/lib/table/render-scope.ts:460](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L460)

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

[src/lib/table/render-scope.ts:1364](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1364)

___

### getTreeArrowColumnIndex

▸ **getTreeArrowColumnIndex**(): `number`

Retrieves the column index of the tree arrow column in the table.

#### Returns

`number`

The column index of the tree arrow column: the first data column (0, behind a row number
               column 1), one more with a visible row checkbox column.

#### Defined in

[src/lib/table/render-scope.ts:2148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2148)

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

[EleScope](EleScope.md).[getViewportScrollLeft](EleScope.md#getviewportscrollleft)

#### Defined in

[src/lib/table/ele-scope.ts:241](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L241)

___

### hasBodyRowExtras

▸ **hasBodyRowExtras**(): `boolean`

True if open detail rows take space between the body rows.

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:423](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L423)

___

### hasRelativeColumnWidths

▸ **hasRelativeColumnWidths**(): `boolean`

True if a column has a % or weight width (it depends on the width of the host).

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:761](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L761)

___

### hideDraggingColumn

▸ **hideDraggingColumn**(): `void`

Hides the dragging column by applying a 'display: none' style to it.
This method is protected and can only be accessed within the class.

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:2795](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2795)

___

### hideHover

▸ **hideHover**(): `void`

Hides the hover row and column – e.g. while the pointer is over a detail row (master/detail).

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/render-scope.ts:2539](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2539)

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

[src/lib/table/render-scope.ts:2614](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2614)

___

### hideHoverRow

▸ **hideHoverRow**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:2544](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2544)

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

[EleScope](EleScope.md).[initHostAria](EleScope.md#inithostaria)

#### Defined in

[src/lib/table/ele-scope.ts:341](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L341)

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

[src/lib/table/render-scope.ts:547](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L547)

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

#### Defined in

[src/lib/table/render-scope.ts:591](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L591)

___

### invalidateRowLayout

▸ **invalidateRowLayout**(): `void`

Marks the positions of the body rows as outdated (rows filtered, sorted, edited, added or removed, a detail row
opened or closed) – they are computed again on the next access.

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/render-scope.ts:399](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L399)

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

#### Defined in

[src/lib/table/render-scope.ts:2172](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2172)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:469](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L469)

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

[EleScope](EleScope.md).[isRtl](EleScope.md#isrtl)

#### Defined in

[src/lib/table/ele-scope.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L230)

___

### isScrollHeightCapped

▸ **isScrollHeightCapped**(): `boolean`

True if the table content is taller than [EleScope.maxScrollHeightInPx](TableScope.md#maxscrollheightinpx); then the scroll bar is
scaled and scrollTop is no longer a content pixel position.

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:1274](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1274)

___

### layoutContainers

▸ **layoutContainers**(): `void`

Lays out the scroll viewport, the nine areas, the separator borders, the overlay and the detail layer for the
current size of the host and the current padding – without rendering the rows (that is
[adjustAfterScrolling](EleScope.md#adjustafterscrolling)). `repaintHard()` uses it to set a new scroll position before its one render pass.

#### Returns

`void`

**`Since`**

1.1.107

#### Overrides

[EleScope](EleScope.md).[layoutContainers](EleScope.md#layoutcontainers)

#### Defined in

[src/lib/table/render-scope.ts:765](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L765)

___

### measureHorizontalScrollBarHeight

▸ **measureHorizontalScrollBarHeight**(): `number`

Height of the horizontal scroll bar of the scroll viewport: offsetHeight − clientHeight (the viewport has no
border, see the constructor).

#### Returns

`number`

#### Inherited from

[EleScope](EleScope.md).[measureHorizontalScrollBarHeight](EleScope.md#measurehorizontalscrollbarheight)

#### Defined in

[src/lib/table/ele-scope.ts:565](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L565)

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

#### Defined in

[src/lib/table/render-scope.ts:2233](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2233)

___

### measureVerticalScrollBarWidth

▸ **measureVerticalScrollBarWidth**(): `number`

Width of the vertical scroll bar of the scroll viewport: offsetWidth − clientWidth.

#### Returns

`number`

#### Inherited from

[EleScope](EleScope.md).[measureVerticalScrollBarWidth](EleScope.md#measureverticalscrollbarwidth)

#### Defined in

[src/lib/table/ele-scope.ts:571](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L571)

___

### onOverlayChanged

▸ **onOverlayChanged**(`_change`): `void`

Called after the shown overlay changed (ARIA in [TableScope](TableScope.md)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_change` | [`TableOverlayChange`](../interfaces/TableOverlayChange.md) | previous and new overlay, its text |

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/render-scope.ts:968](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L968)

___

### onViewportScroll

▸ **onViewportScroll**(): `void`

The `scroll` listener of the scroll viewport: renders the new position – nothing if the position is already
rendered (the event of a `repaintHard({ py })`, `scrollToPixel()` or `ensureColumnIsVisible()` arrives after
their own render pass).

#### Returns

`void`

**`Since`**

1.1.107

#### Defined in

[src/lib/table/render-scope.ts:727](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L727)

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

[src/lib/table/render-scope.ts:1310](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1310)

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

#### Defined in

[src/lib/table/render-scope.ts:743](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L743)

___

### removeHostAria

▸ **removeHostAria**(): `void`

Removes the ARIA attributes the table has set on the host element (see [initHostAria](TableScope.md#inithostaria)).

#### Returns

`void`

**`Since`**

1.1.91

#### Inherited from

[EleScope](EleScope.md).[removeHostAria](EleScope.md#removehostaria)

#### Defined in

[src/lib/table/ele-scope.ts:324](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L324)

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

[src/lib/table/render-scope.ts:2705](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2705)

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

#### Defined in

[src/lib/table/render-scope.ts:2724](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2724)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:579](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L579)

___

### repaintHard

▸ **repaintHard**(`scrollTo?`): `void`

Repaints the UI after the row count or the row heights changed: new heights and padding, new size of the scroll
content, new layout of the areas – then **one** render pass (since 1.1.107; before: two).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `scrollTo?` | [`ScrollPositionIf`](../interfaces/ScrollPositionIf.md) | a content position to show in that render pass (like scrollToPixel, exact also with a capped scroll height); a missing axis keeps its position |

#### Returns

`void`

This method does not return any value.

#### Defined in

[src/lib/table/render-scope.ts:611](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L611)

___

### rerenderCalculatedCells

▸ **rerenderCalculatedCells**(): `void`

After `updateCells()` without a repaint: draws the rendered cells of calculated and „Show values as“ columns of
the body again (they depend on the changed cells, e.g. `total = price * quantity` or a share of the total).

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:1069](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1069)

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

[src/lib/table/render-scope.ts:1139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1139)

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

#### Defined in

[src/lib/table/render-scope.ts:1115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1115)

___

### rerenderGroupRowCells

▸ **rerenderGroupRowCells**(): `void`

After `updateCells()` without a repaint: draws the rendered aggregate cells of the group rows of a row grouping
again (they follow the changed rows; labels and counts don't change – a moved row repaints the whole table).

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:1094](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1094)

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

[src/lib/table/render-scope.ts:516](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L516)

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

[src/lib/table/ele-scope.ts:613](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L613)

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

[EleScope](EleScope.md).[restoreHostAriaAttribute](EleScope.md#restorehostariaattribute)

#### Defined in

[src/lib/table/ele-scope.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L308)

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

#### Defined in

[src/lib/table/render-scope.ts:412](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L412)

___

### setContentScrollPosition

▸ **setContentScrollPosition**(`px`, `py`): `boolean`

Sets the scroll position of the viewport to a content position **without rendering** (shared by
`scrollToPixel()` and `repaintHard({ px, py })`). `py` is a content position: the scroll bar range differs from the
content range – always with a capped scroll height, but also slightly without (the scroll content is 1 px higher
than the rows, the scroll viewport includes the footer and the horizontal scroll bar). `scrollTop = py` would leave
the target row a few pixels off, so the exact content position is remembered (`pendingContentScroll`) and used by
the next render passes as long as the scroll bar is not moved.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `px` | `undefined` \| `number` | from the start of the rows (logical, right-to-left from the right edge); `undefined` keeps the horizontal position |
| `py` | `undefined` \| `number` | content px from the top of the first body row; `undefined` keeps the vertical position |

#### Returns

`boolean`

true if the exact content position was set (then render now – a scroll event may not fire);
  false if the browser renders it with its scroll event (nothing to scroll vertically, or only `px`)

**`Since`**

1.1.107

#### Defined in

[src/lib/table/render-scope.ts:694](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L694)

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

#### Defined in

[src/lib/table/render-scope.ts:493](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L493)

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

[EleScope](EleScope.md).[setHostAriaAttribute](EleScope.md#sethostariaattribute)

#### Defined in

[src/lib/table/ele-scope.ts:288](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L288)

___

### setParentWidth

▸ **setParentWidth**(`widthInPixel`): `void`

`TableModelIf.setParentWidth` – remembers the width for [adjustRelativeColumnWidthsToScrollBar](TableScope.md#adjustrelativecolumnwidthstoscrollbar).

#### Parameters

| Name | Type |
| :------ | :------ |
| `widthInPixel` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:755](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L755)

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

#### Defined in

[src/lib/table/render-scope.ts:1050](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1050)

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

[EleScope](EleScope.md).[setViewportScrollLeft](EleScope.md#setviewportscrollleft)

#### Defined in

[src/lib/table/ele-scope.ts:251](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L251)

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

[src/lib/table/render-scope.ts:1265](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1265)

___

### storeColumnWidths

▸ **storeColumnWidths**(): `void`

Stores the widths of all columns in the table.

#### Returns

`void`

**`Function`**

storeColumnWidths

#### Defined in

[src/lib/table/render-scope.ts:1207](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1207)

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

[src/lib/table/render-scope.ts:992](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L992)

___

### updateOverlay

▸ **updateOverlay**(): `void`

Shows the overlay that fits the body now (see [TableOverlay.update](TableOverlay.md#update)) and reports a change to
[onOverlayChanged](RenderScope.md#onoverlaychanged).

#### Returns

`void`

**`Since`**

1.1.92

#### Overrides

[EleScope](EleScope.md).[updateOverlay](EleScope.md#updateoverlay)

#### Defined in

[src/lib/table/render-scope.ts:948](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L948)

___

### updateRowCountWithoutRender

▸ **updateRowCountWithoutRender**(`py`): `boolean`

Live data (since 1.1.108, prompt 018 part B): the body got more rows, but the drawn rows stay the same (rows
appended or sorted in behind the visible ones, the view does not follow). Updates heights, scroll content, scroll
bar and `aria-rowcount` – **without** rebuilding the cells. Returns false (and does nothing more) if that is not
enough: the vertical scroll bar appeared or disappeared (the widths change) or col-/rowspans exist.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `py` | `number` | the content position to keep (the same rows as drawn) |

#### Returns

`boolean`

true if done, false if the caller must render

#### Defined in

[src/lib/table/render-scope.ts:653](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L653)
