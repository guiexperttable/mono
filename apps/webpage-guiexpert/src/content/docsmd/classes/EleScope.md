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
- [dom](EleScope.md#dom)
- [draggingColumn](EleScope.md#draggingcolumn)
- [hostElement](EleScope.md#hostelement)
- [hoverColumn](EleScope.md#hovercolumn)
- [hoverRow](EleScope.md#hoverrow)
- [scrollTop](EleScope.md#scrolltop)
- [scrollViewport](EleScope.md#scrollviewport)
- [tableModel](EleScope.md#tablemodel)
- [tableOptions](EleScope.md#tableoptions)
- [tableOverlay](EleScope.md#tableoverlay)
- [maxScrollHeightInPx](EleScope.md#maxscrollheightinpx)

### Methods

- [adjustAfterScrolling](EleScope.md#adjustafterscrolling)
- [adjustContainersAndRows](EleScope.md#adjustcontainersandrows)
- [adjustDetailLayerBounds](EleScope.md#adjustdetaillayerbounds)
- [getAreaChild](EleScope.md#getareachild)
- [getBodyContentHeight](EleScope.md#getbodycontentheight)
- [initHostAria](EleScope.md#inithostaria)
- [removeHostAria](EleScope.md#removehostaria)
- [resetSizeOfWrapperDiv](EleScope.md#resetsizeofwrapperdiv)
- [restoreHostAriaAttribute](EleScope.md#restorehostariaattribute)
- [setHostAriaAttribute](EleScope.md#sethostariaattribute)
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

[src/lib/table/ele-scope.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L69)

## Properties

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L36)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

___

### ariaIds

• `Readonly` **ariaIds**: [`AriaIds`](AriaIds.md)

The IDs this table uses for ARIA references (prefix from the host id).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/ele-scope.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L63)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L50)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L32)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Defined in

[src/lib/table/ele-scope.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L72)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L70)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L52)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Defined in

[src/lib/table/ele-scope.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L56)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L71)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L73)

___

### tableOverlay

• `Readonly` **tableOverlay**: [`TableOverlay`](TableOverlay.md)

The overlay layer over the body ("Loading…", "No rows to show").

**`Since`**

1.1.92

#### Defined in

[src/lib/table/ele-scope.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L66)

___

### maxScrollHeightInPx

▪ `Static` **maxScrollHeightInPx**: `number` = `8_000_000`

Maximum height (px) of the scrollable content wrapper. Taller tables are scrolled proportionally
(rendering is based on the scroll factor anyway): browsers clamp element heights (Chrome ~33.5 million px)
and GPU rasterization loses precision long before (1px borders disappear and text jitters beyond
~16.7 million px). 8 million px keep sub-pixel precision.

#### Defined in

[src/lib/table/ele-scope.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L27)

## Methods

### adjustAfterScrolling

▸ **adjustAfterScrolling**(): `void`

Adjusts the position or appearance of elements after scrolling.
This method must be overwritten in child classes.

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:465](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L465)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:299](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L299)

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

[src/lib/table/ele-scope.ts:455](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L455)

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

[src/lib/table/ele-scope.ts:284](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L284)

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

[src/lib/table/ele-scope.ts:476](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L476)

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

[src/lib/table/ele-scope.ts:269](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L269)

___

### removeHostAria

▸ **removeHostAria**(): `void`

Removes the ARIA attributes the table has set on the host element (see [initHostAria](TableScope.md#inithostaria)).

#### Returns

`void`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/ele-scope.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L252)

___

### resetSizeOfWrapperDiv

▸ **resetSizeOfWrapperDiv**(): `void`

Resets the size of the wrapper div based on the content dimensions.

#### Returns

`void`

Returns nothing.

#### Defined in

[src/lib/table/ele-scope.ts:487](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L487)

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

[src/lib/table/ele-scope.ts:236](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L236)

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

[src/lib/table/ele-scope.ts:216](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L216)

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

[src/lib/table/ele-scope.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L203)
