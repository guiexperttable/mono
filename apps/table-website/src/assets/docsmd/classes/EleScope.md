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
- [maxScrollHeightInPx](EleScope.md#maxscrollheightinpx)

### Methods

- [adjustAfterScrolling](EleScope.md#adjustafterscrolling)
- [adjustContainersAndRows](EleScope.md#adjustcontainersandrows)
- [resetSizeOfWrapperDiv](EleScope.md#resetsizeofwrapperdiv)

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

[src/lib/table/ele-scope.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L58)

## Properties

### areaBodyCenter

• `Protected` **areaBodyCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L33)

___

### areaBodyCenterGeo

• `Protected` **areaBodyCenterGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L54)

___

### areaBodyEast

• `Protected` **areaBodyEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L35)

___

### areaBodyEastGeo

• `Protected` **areaBodyEastGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L55)

___

### areaBodyWest

• `Protected` **areaBodyWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L34)

___

### areaBodyWestGeo

• `Protected` **areaBodyWestGeo**: [`GeoData`](GeoData.md)

#### Defined in

[src/lib/table/ele-scope.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L53)

___

### areaFooterCenter

• `Protected` **areaFooterCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L38)

___

### areaFooterEast

• `Protected` **areaFooterEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L40)

___

### areaFooterWest

• `Protected` **areaFooterWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L39)

___

### areaHeaderCenter

• `Protected` **areaHeaderCenter**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L29)

___

### areaHeaderEast

• `Protected` **areaHeaderEast**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L31)

___

### areaHeaderWest

• `Protected` **areaHeaderWest**: [`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/ele-scope.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L30)

___

### borderFixedEast

• `Protected` **borderFixedEast**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L45)

___

### borderFixedWest

• `Protected` **borderFixedWest**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L44)

___

### borderFooterTop

• `Protected` **borderFooterTop**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L43)

___

### borderHeaderBottom

• `Protected` **borderHeaderBottom**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L42)

___

### contentDiv

• `Protected` **contentDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L27)

___

### contentWrapperDiv

• `Protected` **contentWrapperDiv**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L26)

___

### dom

• `Protected` `Readonly` **dom**: [`ConvenienceDomService`](ConvenienceDomService.md)

#### Defined in

[src/lib/table/ele-scope.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L61)

___

### draggingColumn

• `Protected` **draggingColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L49)

___

### hostElement

• `Readonly` **hostElement**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L59)

___

### hoverColumn

• `Protected` **hoverColumn**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L48)

___

### hoverRow

• `Protected` **hoverRow**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L47)

___

### scrollTop

• `Protected` **scrollTop**: `number` = `0`

#### Defined in

[src/lib/table/ele-scope.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L51)

___

### scrollViewport

• **scrollViewport**: `HTMLDivElement`

#### Defined in

[src/lib/table/ele-scope.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L24)

___

### tableModel

• `Readonly` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L60)

___

### tableOptions

• `Readonly` **tableOptions**: [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/ele-scope.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L62)

___

### maxScrollHeightInPx

▪ `Static` **maxScrollHeightInPx**: `number` = `8_000_000`

Maximum height (px) of the scrollable content wrapper. Taller tables are scrolled proportionally
(rendering is based on the scroll factor anyway): browsers clamp element heights (Chrome ~33.5 million px)
and GPU rasterization loses precision long before (1px borders disappear and text jitters beyond
~16.7 million px). 8 million px keep sub-pixel precision.

#### Defined in

[src/lib/table/ele-scope.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L22)

## Methods

### adjustAfterScrolling

▸ **adjustAfterScrolling**(): `void`

Adjusts the position or appearance of elements after scrolling.
This method must be overwritten in child classes.

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:301](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L301)

___

### adjustContainersAndRows

▸ **adjustContainersAndRows**(): `void`

Adjusts the containers and rows of the table based on the current state.

#### Returns

`void`

#### Defined in

[src/lib/table/ele-scope.ts:158](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L158)

___

### resetSizeOfWrapperDiv

▸ **resetSizeOfWrapperDiv**(): `void`

Resets the size of the wrapper div based on the content dimensions.

#### Returns

`void`

Returns nothing.

#### Defined in

[src/lib/table/ele-scope.ts:312](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/ele-scope.ts#L312)
