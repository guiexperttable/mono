[GuiExpert Table API](../README.md) / [Exports](../modules.md) / EleScope

# Class: EleScope

Represents a store for HTML elements.

## Hierarchy

- **`EleScope`**

  ↳ [`RenderScope`](RenderScope.md)

## Table of contents

### Constructors

- [constructor](EleScope.md#constructor)

### Properties

- [areaBodyCenter](EleScope.md#areabodycenter)
- [areaBodyCenterGeo](EleScope.md#areabodycentergeo)
- [areaBodyEast](EleScope.md#areabodyeast)
- [areaBodyEastGeo](EleScope.md#areabodyeastgeo)
- [areaBodyWest](EleScope.md#areabodywest)
- [areaBodyWestGeo](EleScope.md#areabodywestgeo)
- [areaFooterCenter](EleScope.md#areafootercenter)
- [areaFooterEast](EleScope.md#areafootereast)
- [areaFooterWest](EleScope.md#areafooterwest)
- [areaHeaderCenter](EleScope.md#areaheadercenter)
- [areaHeaderEast](EleScope.md#areaheadereast)
- [areaHeaderWest](EleScope.md#areaheaderwest)
- [ariaIds](EleScope.md#ariaids)
- [borderFixedEast](EleScope.md#borderfixedeast)
- [borderFixedWest](EleScope.md#borderfixedwest)
- [borderFooterTop](EleScope.md#borderfootertop)
- [borderHeaderBottom](EleScope.md#borderheaderbottom)
- [contentDiv](EleScope.md#contentdiv)
- [contentWrapperDiv](EleScope.md#contentwrapperdiv)
- [direction](EleScope.md#direction)
- [dom](EleScope.md#dom)
- [draggingColumn](EleScope.md#draggingcolumn)
- [horizontalScrollBarHeight](EleScope.md#horizontalscrollbarheight)
- [hostElement](EleScope.md#hostelement)
- [hoverColumn](EleScope.md#hovercolumn)
- [hoverRow](EleScope.md#hoverrow)
- [scrollTop](EleScope.md#scrolltop)
- [scrollViewport](EleScope.md#scrollviewport)
- [tableModel](EleScope.md#tablemodel)
- [tableOptions](EleScope.md#tableoptions)
- [tableOverlay](EleScope.md#tableoverlay)
- [verticalScrollBarWidth](EleScope.md#verticalscrollbarwidth)
- [maxScrollHeightInPx](EleScope.md#maxscrollheightinpx)

### Methods

- [adjustAfterScrolling](EleScope.md#adjustafterscrolling)
- [adjustContainersAndRows](EleScope.md#adjustcontainersandrows)
- [adjustDetailLayerBounds](EleScope.md#adjustdetaillayerbounds)
- [clientXToHostX](EleScope.md#clientxtohostx)
- [getAreaChild](EleScope.md#getareachild)
- [getBodyContentHeight](EleScope.md#getbodycontentheight)
- [getLayoutHeight](EleScope.md#getlayoutheight)
- [getLayoutWidth](EleScope.md#getlayoutwidth)
- [getViewportScrollLeft](EleScope.md#getviewportscrollleft)
- [initHostAria](EleScope.md#inithostaria)
- [isRtl](EleScope.md#isrtl)
- [layoutContainers](EleScope.md#layoutcontainers)
- [measureHorizontalScrollBarHeight](EleScope.md#measurehorizontalscrollbarheight)
- [measureVerticalScrollBarWidth](EleScope.md#measureverticalscrollbarwidth)
- [removeHostAria](EleScope.md#removehostaria)
- [resetSizeOfWrapperDiv](EleScope.md#resetsizeofwrapperdiv)
- [restoreHostAriaAttribute](EleScope.md#restorehostariaattribute)
- [setHostAriaAttribute](EleScope.md#sethostariaattribute)
- [setViewportScrollLeft](EleScope.md#setviewportscrollleft)
- [updateOverlay](EleScope.md#updateoverlay)

## Constructors

### constructor

• **new EleScope**(`hostElement`, `tableModel`, `dom`, `tableOptions`): [`EleScope`](EleScope.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `hostElement` | `HTMLDivElement` |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) |
| `dom` | [`ConvenienceDomService`](ConvenienceDomService.md) |
| `tableOptions` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) |

#### Returns

[`EleScope`](EleScope.md)

#### Defined in

[src/lib/table/ele-scope.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L90)

## Properties

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L74)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L75)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L41)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L73)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L46)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L36)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L37)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/ele-scope.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L78)

___

### borderFixedEast

• `Protected` `Optional` **borderFixedEast**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### borderFixedWest

• `Protected` `Optional` **borderFixedWest**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### borderFooterTop

• `Protected` `Optional` **borderFooterTop**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### borderHeaderBottom

• `Protected` `Optional` **borderHeaderBottom**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### direction

• `Readonly` **direction**: [`ResolvedTableDirection`](../modules.md#resolvedtabledirection)

The resolved writing direction of the table ([TableOptionsIf.direction](../interfaces/TableOptionsIf.md#direction); `"auto"` is decided when the table
is built).

**`Since`**

1.1.98

#### Defined in

[src/lib/table/ele-scope.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L87)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Defined in

[src/lib/table/ele-scope.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L93)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L57)

___

### horizontalScrollBarHeight

• `Protected` **horizontalScrollBarHeight**: `number` = `0`

Height of the horizontal scroll bar of [scrollViewport](TableScope.md#scrollviewport) in px, measured in [adjustContainersAndRows](TableScope.md#adjustcontainersandrows).
0 without a horizontal scroll bar and with overlay scroll bars (macOS default, mobile) – they take no space.

#### Defined in

[src/lib/table/ele-scope.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L65)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L91)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L92)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L94)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Defined in

[src/lib/table/ele-scope.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L81)

___

### verticalScrollBarWidth

• `Protected` **verticalScrollBarWidth**: `number` = `0`

Width of the vertical scroll bar of [scrollViewport](TableScope.md#scrollviewport) in px (at the end of the rows: right, in right-to-left
on the left), measured in [adjustContainersAndRows](TableScope.md#adjustcontainersandrows). 0 without one and with overlay scroll bars.

#### Defined in

[src/lib/table/ele-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L71)

___

### maxScrollHeightInPx

▪ `Static` **maxScrollHeightInPx**: `number` = `8_000_000`

Maximum height (px) of the scrollable content wrapper. Taller tables are scrolled proportionally
(rendering is based on the scroll factor anyway): browsers clamp element heights (Chrome ~33.5 million px)
and GPU rasterization loses precision long before (1px borders disappear and text jitters beyond
~16.7 million px). 8 million px keep sub-pixel precision.

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

## Methods

### adjustAfterScrolling

▸ **adjustAfterScrolling**(): `void`

Adjusts the position or appearance of elements after scrolling.
This method must be overwritten in child classes.

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:591](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L591)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state: lays out the areas
([layoutContainers](EleScope.md#layoutcontainers)) and renders the visible rows ([adjustAfterScrolling](EleScope.md#adjustafterscrolling)).

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:372](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L372)

___

### adjustDetailLayerBounds

▸ **adjustDetailLayerBounds**(`_left`, `_top`, `_width`, `_height`): `void`

Position and size of the detail layer (master/detail) in the host – overwritten in [RenderScope](RenderScope.md).

#### Parameters

| Name | Type |
| :------ | :------ |
| `_left` | `number` |
| `_top` | `number` |
| `_width` | `number` |
| `_height` | `number` |

#### Returns

`void`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/ele-scope.ts:581](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L581)

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

#### Defined in

[src/lib/table/ele-scope.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L263)

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

#### Defined in

[src/lib/table/ele-scope.ts:356](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L356)

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

#### Defined in

[src/lib/table/ele-scope.ts:602](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L602)

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

#### Defined in

[src/lib/table/ele-scope.ts:557](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L557)

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

#### Defined in

[src/lib/table/ele-scope.ts:241](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L241)

___

### initHostAria

▸ **initHostAria**(): `void`

Sets the static ARIA attributes of the host element: `role="grid"` (a tree body: `"treegrid"`) and its name
and description from the table options. Counts and the active cell follow with every render pass.

#### Returns

`void`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/ele-scope.ts:341](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L341)

___

### isRtl

▸ **isRtl**(): `boolean`

Whether the table runs from right to left ([TableOptionsIf.direction](../interfaces/TableOptionsIf.md#direction)).

#### Returns

`boolean`

true for `"rtl"` (also a resolved `"auto"`)

**`Since`**

1.1.98

#### Defined in

[src/lib/table/ele-scope.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L230)

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

#### Defined in

[src/lib/table/ele-scope.ts:384](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L384)

___

### measureHorizontalScrollBarHeight

▸ **measureHorizontalScrollBarHeight**(): `number`

Height of the horizontal scroll bar of the scroll viewport: offsetHeight − clientHeight (the viewport has no
border, see the constructor).

#### Returns

`number`

#### Defined in

[src/lib/table/ele-scope.ts:565](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L565)

___

### measureVerticalScrollBarWidth

▸ **measureVerticalScrollBarWidth**(): `number`

Width of the vertical scroll bar of the scroll viewport: offsetWidth − clientWidth.

#### Returns

`number`

#### Defined in

[src/lib/table/ele-scope.ts:571](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L571)

___

### removeHostAria

▸ **removeHostAria**(): `void`

Removes the ARIA attributes the table has set on the host element (see [initHostAria](TableScope.md#inithostaria)).

#### Returns

`void`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/ele-scope.ts:324](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L324)

___

### resetSizeOfWrapperDiv

▸ **resetSizeOfWrapperDiv**(): `void`

Resets the size of the wrapper div based on the content dimensions.

#### Returns

`void`

Returns nothing.

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

#### Defined in

[src/lib/table/ele-scope.ts:308](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L308)

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

#### Defined in

[src/lib/table/ele-scope.ts:288](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L288)

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

#### Defined in

[src/lib/table/ele-scope.ts:251](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L251)

___

### updateOverlay

▸ **updateOverlay**(): `void`

Shows the overlay that fits the current state (requested by the API, or "no rows" for an empty body).
Overwritten in [RenderScope](RenderScope.md).

#### Returns

`void`

**`Since`**

1.1.92

#### Defined in

[src/lib/table/ele-scope.ts:275](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L275)
