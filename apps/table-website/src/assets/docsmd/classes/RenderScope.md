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
- [getNumberByAttr](RenderScope.md#getnumberbyattr)
- [getRowHeights](RenderScope.md#getrowheights)
- [getScrollerRangeY](RenderScope.md#getscrollerrangey)
- [getScrollerToContentRatioY](RenderScope.md#getscrollertocontentratioy)
- [getStringByAttr](RenderScope.md#getstringbyattr)
- [getTreeArrowColumnIndex](RenderScope.md#gettreearrowcolumnindex)
- [getViewportScrollLeft](RenderScope.md#getviewportscrollleft)
- [hasBodyRowExtras](RenderScope.md#hasbodyrowextras)
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
- [measureRowNumberText](RenderScope.md#measurerownumbertext)
- [onOverlayChanged](RenderScope.md#onoverlaychanged)
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
- [setEditorDraft](RenderScope.md#seteditordraft)
- [setHostAriaAttribute](RenderScope.md#sethostariaattribute)
- [setRawValue](RenderScope.md#setrawvalue)
- [setViewportScrollLeft](RenderScope.md#setviewportscrollleft)
- [snapToDevicePixel](RenderScope.md#snaptodevicepixel)
- [storeColumnWidths](RenderScope.md#storecolumnwidths)
- [updateCells](RenderScope.md#updatecells)
- [updateOverlay](RenderScope.md#updateoverlay)

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

[src/lib/table/render-scope.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L197)

## Properties

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

[src/lib/table/ele-scope.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L61)

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

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

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

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

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

[src/lib/table/render-scope.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L123)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Inherited from

[EleScope](EleScope.md).[ariaIds](EleScope.md#ariaids)

#### Defined in

[src/lib/table/ele-scope.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L65)

___

### ariaTexts

• `Readonly` **ariaTexts**: [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

Texts for screen readers (English defaults + `tableOptions.ariaTexts`).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/render-scope.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L132)

___

### batchEditService

• `Optional` **batchEditService**: [`BatchEditService`](BatchEditService.md)

Batch edit of this table (pending values, shown in the cells) – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Defined in

[src/lib/table/render-scope.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L158)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedEast](EleScope.md#borderfixedeast)

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFixedWest](EleScope.md#borderfixedwest)

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderFooterTop](EleScope.md#borderfootertop)

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[borderHeaderBottom](EleScope.md#borderheaderbottom)

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### cellEditorService

• `Optional` **cellEditorService**: [`CellEditorService`](CellEditorService.md)

Excel-style editing of this table (the editor above the cell) – created by [TableScope](TableScope.md) with
`tableOptions.editing`.

**`Since`**

1.1.99

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

#### Defined in

[src/lib/table/render-scope.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L105)

___

### colAndRowspanModels

• `Protected` **colAndRowspanModels**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`ColAndRowspanModel`](ColAndRowspanModel.md)\>

#### Defined in

[src/lib/table/render-scope.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L115)

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

[src/lib/table/render-scope.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L119)

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

[src/lib/table/render-scope.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L125)

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

[src/lib/table/ele-scope.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L74)

___

### displayedRowCount

• **displayedRowCount**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L89)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Inherited from

[EleScope](EleScope.md).[dom](EleScope.md#dom)

#### Defined in

[src/lib/table/ele-scope.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L80)

___

### dragging

• `Protected` **dragging**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L94)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[draggingColumn](EleScope.md#draggingcolumn)

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### draggingTargetColumnIndex

• `Protected` **draggingTargetColumnIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L116)

___

### editing

• `Protected` **editing**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L95)

___

### fillHandleService

• `Optional` **fillHandleService**: [`FillHandleService`](FillHandleService.md)

Fill handle of this table – created by [TableScope](TableScope.md).

**`Since`**

1.1.96

#### Defined in

[src/lib/table/render-scope.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L164)

___

### firstFullVisibleRowIndex

• **firstFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L87)

___

### firstVisibleRowIndex

• **firstVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L85)

___

### getFocusModel

• `Protected` `Optional` **getFocusModel**: [`GetT`](../modules.md#gett)\<[`FocusModelIf`](../interfaces/FocusModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L100)

___

### getSelectionModel

• `Protected` `Optional` **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](../interfaces/SelectionModelIf.md)\>

#### Defined in

[src/lib/table/render-scope.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L99)

___

### headerFocus

• `Protected` `Optional` **headerFocus**: [`number`, `number`]

The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
first body row, see `TableScope`. `undefined`: the focus is in the body ([FocusModelIf](../interfaces/FocusModelIf.md)).

#### Defined in

[src/lib/table/render-scope.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L146)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hostElement](EleScope.md#hostelement)

#### Defined in

[src/lib/table/ele-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L78)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverColumn](EleScope.md#hovercolumn)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Inherited from

[EleScope](EleScope.md).[hoverRow](EleScope.md#hoverrow)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### lastFullVisibleRowIndex

• **lastFullVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L88)

___

### lastVisibleRowIndex

• **lastVisibleRowIndex**: `number` = `-1`

#### Defined in

[src/lib/table/render-scope.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L86)

___

### loggingActive

• **loggingActive**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L92)

___

### masterDetailService

• `Optional` **masterDetailService**: [`MasterDetailService`](MasterDetailService.md)

Master/detail of this table (detail rows below master rows) – created by [TableScope](TableScope.md) with
`tableOptions.masterDetail`.

**`Since`**

1.1.97

#### Defined in

[src/lib/table/render-scope.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L184)

___

### mouseEvent

• `Protected` `Optional` **mouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/render-scope.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L117)

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

[src/lib/table/render-scope.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L121)

___

### pixelLimitForFullVisible

• **pixelLimitForFullVisible**: `number` = `5`

#### Defined in

[src/lib/table/render-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L91)

___

### rowDragService

• `Optional` **rowDragService**: [`RowDragService`](RowDragService.md)

Row drag of this table (drag handles, pointer and keyboard drag) – created by [TableScope](TableScope.md).

**`Since`**

1.1.95

#### Defined in

[src/lib/table/render-scope.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L152)

___

### scrollFactorX

• `Protected` **scrollFactorX**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L104)

___

### scrollFactorY

• `Protected` **scrollFactorY**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L103)

___

### scrollLeft

• `Protected` **scrollLeft**: `number` = `0`

#### Defined in

[src/lib/table/render-scope.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L101)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Inherited from

[EleScope](EleScope.md).[scrollTop](EleScope.md#scrolltop)

#### Defined in

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

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

[src/lib/table/render-scope.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L102)

___

### storeScrollPosStateService

• `Protected` `Optional` **storeScrollPosStateService**: [`StoreStateScrollPosService`](StoreStateScrollPosService.md)

**`Deprecated`**

since 1.1.92 – no longer used, see [TableStateService](TableStateService.md).

#### Defined in

[src/lib/table/render-scope.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L98)

___

### storedColumnWidths

• `Protected` **storedColumnWidths**: `number`[] = `[]`

#### Defined in

[src/lib/table/render-scope.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L96)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableModel](EleScope.md#tablemodel)

#### Defined in

[src/lib/table/ele-scope.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L79)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Inherited from

[EleScope](EleScope.md).[tableOptions](EleScope.md#tableoptions)

#### Defined in

[src/lib/table/ele-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L81)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Inherited from

[EleScope](EleScope.md).[tableOverlay](EleScope.md#tableoverlay)

#### Defined in

[src/lib/table/ele-scope.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L68)

___

### tableSheet

• `Optional` **tableSheet**: [`TableSheet`](TableSheet.md)

Cell formulas of this table – created by [TableScope](TableScope.md) with `tableOptions.cellFormulas` (flat bodies).

**`Since`**

1.1.99

#### Defined in

[src/lib/table/render-scope.ts:190](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L190)

___

### tree

• `Protected` **tree**: `boolean` = `false`

#### Defined in

[src/lib/table/render-scope.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L114)

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

[src/lib/table/render-scope.ts:2081](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2081)

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

[src/lib/table/render-scope.ts:644](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L644)

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

[src/lib/table/render-scope.ts:1211](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1211)

___

### adjustBody

▸ **adjustBody**(): `void`

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:1851](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1851)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Inherited from

[EleScope](EleScope.md).[adjustContainersAndRows](EleScope.md#adjustcontainersandrows)

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

#### Overrides

[EleScope](EleScope.md).[adjustDetailLayerBounds](EleScope.md#adjustdetaillayerbounds)

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

#### Defined in

[src/lib/table/render-scope.ts:764](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L764)

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

[src/lib/table/render-scope.ts:1515](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1515)

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

#### Defined in

[src/lib/table/render-scope.ts:1474](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1474)

___

### checkForScrollPosSaving

▸ **checkForScrollPosSaving**(): `void`

Marks the scroll position as changed (it is stored with the table state, see [TableStateService](TableStateService.md)).

#### Returns

`void`

**`Deprecated`**

since 1.1.92 – the table does this after every render pass.

#### Defined in

[src/lib/table/render-scope.ts:806](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L806)

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

[EleScope](EleScope.md).[clientXToHostX](EleScope.md#clientxtohostx)

#### Defined in

[src/lib/table/ele-scope.ts:250](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L250)

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

[src/lib/table/render-scope.ts:2473](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2473)

___

### disposeRendering

▸ **disposeRendering**(): `void`

Cancels a pending debounced rendering and calls all renderer cleanup functions
(e.g. unmounts framework components rendered into cells). Used by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:1725](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1725)

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

[src/lib/table/render-scope.ts:1830](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1830)

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

[EleScope](EleScope.md).[getAreaChild](EleScope.md#getareachild)

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

#### Overrides

[EleScope](EleScope.md).[getBodyContentHeight](EleScope.md#getbodycontentheight)

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

#### Defined in

[src/lib/table/render-scope.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L254)

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

[src/lib/table/render-scope.ts:1654](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1654)

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

#### Defined in

[src/lib/table/render-scope.ts:2298](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2298)

___

### getContentScrollLeft

▸ **getContentScrollLeft**(): `number`

Content pixels of the center columns scrolled out on the left – the offset that is actually rendered
(see adjustColumnsToRowParent), the horizontal counterpart of `contentScrollTop`.

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:2426](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2426)

___

### getContentScrollRangeY

▸ **getContentScrollRangeY**(): `number`

Scrollable range of the content in content pixels (content height minus visible body height).

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1121)

___

### getDisplayedRowCount

▸ **getDisplayedRowCount**(): `number`

#### Returns

`number`

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

#### Defined in

[src/lib/table/render-scope.ts:243](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L243)

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

[src/lib/table/render-scope.ts:1997](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1997)

___

### getFirstFullVisibleRowIndex

▸ **getFirstFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1014](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1014)

___

### getFirstVisibleRowIndex

▸ **getFirstVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1006](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1006)

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

[src/lib/table/render-scope.ts:466](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L466)

___

### getLastFullVisibleRowIndex

▸ **getLastFullVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1018](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1018)

___

### getLastVisibleRowIndex

▸ **getLastVisibleRowIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/render-scope.ts:1010](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1010)

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

[src/lib/table/render-scope.ts:1177](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1177)

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

[src/lib/table/render-scope.ts:2314](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2314)

___

### getScrollerRangeY

▸ **getScrollerRangeY**(): `number`

Scrollable range of the scroll viewport in scroll bar pixels.

#### Returns

`number`

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

#### Defined in

[src/lib/table/render-scope.ts:447](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L447)

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

[src/lib/table/render-scope.ts:1194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1194)

___

### getTreeArrowColumnIndex

▸ **getTreeArrowColumnIndex**(): `number`

Retrieves the column index of the tree arrow column in the table.

#### Returns

`number`

The column index of the tree arrow column: the first data column (0, behind a row number
               column 1), one more with a visible row checkbox column.

#### Defined in

[src/lib/table/render-scope.ts:1978](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1978)

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

[src/lib/table/ele-scope.ts:228](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L228)

___

### hasBodyRowExtras

▸ **hasBodyRowExtras**(): `boolean`

True if open detail rows take space between the body rows.

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:410](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L410)

___

### hideDraggingColumn

▸ **hideDraggingColumn**(): `void`

Hides the dragging column by applying a 'display: none' style to it.
This method is protected and can only be accessed within the class.

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:2440](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2440)

___

### hideHoverRow

▸ **hideHoverRow**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/render-scope.ts:2370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2370)

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

#### Defined in

[src/lib/table/render-scope.ts:386](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L386)

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

[src/lib/table/render-scope.ts:2002](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2002)

___

### isEditing

▸ **isEditing**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/render-scope.ts:456](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L456)

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

[src/lib/table/ele-scope.ts:217](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L217)

___

### isScrollHeightCapped

▸ **isScrollHeightCapped**(): `boolean`

True if the table content is taller than [EleScope.maxScrollHeightInPx](TableScope.md#maxscrollheightinpx); then the scroll bar is
scaled and scrollTop is no longer a content pixel position.

#### Returns

`boolean`

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

#### Defined in

[src/lib/table/render-scope.ts:2059](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2059)

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

[src/lib/table/render-scope.ts:794](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L794)

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

[src/lib/table/render-scope.ts:1136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1136)

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

[src/lib/table/render-scope.ts:617](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L617)

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

#### Defined in

[src/lib/table/render-scope.ts:2550](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L2550)

___

### repaint

▸ **repaint**(): `void`

Adjusts the content after scrolling and initiates a repaint of the component.

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:597](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L597)

___

### rerenderCalculatedCells

▸ **rerenderCalculatedCells**(): `void`

After `updateCells()` without a repaint: draws the rendered cells of calculated and „Show values as“ columns of
the body again (they depend on the changed cells, e.g. `total = price * quantity` or a share of the total).

#### Returns

`void`

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

#### Defined in

[src/lib/table/render-scope.ts:941](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L941)

___

### rerenderGroupRowCells

▸ **rerenderGroupRowCells**(): `void`

After `updateCells()` without a repaint: draws the rendered aggregate cells of the group rows of a row grouping
again (they follow the changed rows; labels and counts don't change – a moved row repaints the whole table).

#### Returns

`void`

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

[EleScope](EleScope.md).[resetSizeOfWrapperDiv](EleScope.md#resetsizeofwrapperdiv)

#### Defined in

[src/lib/table/ele-scope.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L546)

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

[src/lib/table/ele-scope.ts:295](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L295)

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

[src/lib/table/render-scope.ts:399](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L399)

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

[src/lib/table/render-scope.ts:480](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L480)

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

[src/lib/table/ele-scope.ts:275](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L275)

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

[src/lib/table/render-scope.ts:876](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L876)

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

[src/lib/table/ele-scope.ts:238](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L238)

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

[src/lib/table/render-scope.ts:1091](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1091)

___

### storeColumnWidths

▸ **storeColumnWidths**(): `void`

Stores the widths of all columns in the table.

#### Returns

`void`

**`Function`**

storeColumnWidths

#### Defined in

[src/lib/table/render-scope.ts:1033](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L1033)

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

[src/lib/table/render-scope.ts:818](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L818)

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

[src/lib/table/render-scope.ts:774](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/render-scope.ts#L774)
