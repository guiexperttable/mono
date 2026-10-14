[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ConvenienceDomService

# Class: ConvenienceDomService

## Table of contents

### Constructors

- [constructor](ConvenienceDomService.md#constructor)

### Properties

- [domService](ConvenienceDomService.md#domservice)
- [focusBorderWidthInPx](ConvenienceDomService.md#focusborderwidthinpx)

### Methods

- [addArrowDiv](ConvenienceDomService.md#addarrowdiv)
- [addCheckboxToDiv](ConvenienceDomService.md#addcheckboxtodiv)
- [addClass](ConvenienceDomService.md#addclass)
- [addClasses](ConvenienceDomService.md#addclasses)
- [addColumnBorderDivs](ConvenienceDomService.md#addcolumnborderdivs)
- [addColumnDiv](ConvenienceDomService.md#addcolumndiv)
- [addDiv](ConvenienceDomService.md#adddiv)
- [addFocusBorderDivs](ConvenienceDomService.md#addfocusborderdivs)
- [addHorizontalBorder](ConvenienceDomService.md#addhorizontalborder)
- [addLabelDiv](ConvenienceDomService.md#addlabeldiv)
- [addRowDiv](ConvenienceDomService.md#addrowdiv)
- [addSortedIcon](ConvenienceDomService.md#addsortedicon)
- [addVerticalBorder](ConvenienceDomService.md#addverticalborder)
- [appendRelativeChildDiv](ConvenienceDomService.md#appendrelativechilddiv)
- [appendText](ConvenienceDomService.md#appendtext)
- [applyDisplayBlockStyle](ConvenienceDomService.md#applydisplayblockstyle)
- [applyDisplayNoneStyle](ConvenienceDomService.md#applydisplaynonestyle)
- [applyStyle](ConvenienceDomService.md#applystyle)
- [applyStyleFullSize](ConvenienceDomService.md#applystylefullsize)
- [applyStyleInPx](ConvenienceDomService.md#applystyleinpx)
- [applyStyleNoPadding](ConvenienceDomService.md#applystylenopadding)
- [applyStyleOverflowAuto](ConvenienceDomService.md#applystyleoverflowauto)
- [applyStylePosistionAbsolute](ConvenienceDomService.md#applystyleposistionabsolute)
- [applyStylePosistionRelative](ConvenienceDomService.md#applystyleposistionrelative)
- [applyStyleString](ConvenienceDomService.md#applystylestring)
- [createAreaDivWithClass](ConvenienceDomService.md#createareadivwithclass)
- [createDivWithClass](ConvenienceDomService.md#createdivwithclass)
- [removeAttribute](ConvenienceDomService.md#removeattribute)
- [removeClass](ConvenienceDomService.md#removeclass)
- [setAriaHidden](ConvenienceDomService.md#setariahidden)
- [setAttribute](ConvenienceDomService.md#setattribute)
- [setStyle](ConvenienceDomService.md#setstyle)

## Constructors

### constructor

• **new ConvenienceDomService**(`domService`): [`ConvenienceDomService`](ConvenienceDomService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) |

#### Returns

[`ConvenienceDomService`](ConvenienceDomService.md)

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L41)

## Properties

### domService

• `Readonly` **domService**: [`DomServiceIf`](../interfaces/DomServiceIf.md)

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L42)

___

### focusBorderWidthInPx

▪ `Static` **focusBorderWidthInPx**: `number` = `2`

Width of the focus frame of a cell in px (WCAG 2.4.7: visible focus, not only a color).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L39)

## Methods

### addArrowDiv

▸ **addArrowDiv**(`parent`, `arrow?`, `treeOptions?`, `rowIndex?`, `columnIndex?`, `areaIdent?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parent` | `HTMLDivElement` | `undefined` |
| `arrow` | [`TreeArrowType`](../modules.md#treearrowtype) | `"none"` |
| `treeOptions` | [`TreeOptionsIf`](../interfaces/TreeOptionsIf.md) | `undefined` |
| `rowIndex` | `number` | `-1` |
| `columnIndex` | `number` | `-1` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"body"` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:427](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L427)

___

### addCheckboxToDiv

▸ **addCheckboxToDiv**(`parent`, `checkedType`, `areaIdent`, `rowIndex`, `ariaLabel?`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `checkedType` | [`CheckedType`](../modules.md#checkedtype) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `rowIndex` | `number` |
| `ariaLabel?` | `string` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:305](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L305)

___

### addClass

▸ **addClass**(`clazz`, `div`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clazz` | `string` |
| `div` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L132)

___

### addClasses

▸ **addClasses**(`classes`, `div`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `classes` | `undefined` \| `string`[] |
| `div` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L150)

___

### addColumnBorderDivs

▸ **addColumnBorderDivs**(`tableOptions`, `parent`, `geo`, `areaIdent`, `sideIdent`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableOptions` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) |
| `parent` | `HTMLDivElement` |
| `geo` | [`GeoData`](GeoData.md) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:474](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L474)

___

### addColumnDiv

▸ **addColumnDiv**(`para`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `para` | [`AddColumnDivPara`](../interfaces/AddColumnDivPara.md) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:248](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L248)

___

### addDiv

▸ **addDiv**(`parent`, `geo`, `clazz?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parent` | `HTMLDivElement` | `undefined` |
| `geo` | [`GeoData`](GeoData.md) | `undefined` |
| `clazz` | `string` | `""` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:562](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L562)

___

### addFocusBorderDivs

▸ **addFocusBorderDivs**(`parent`, `geo`, `style`): `HTMLDivElement`

Draws the focus frame of a cell: four divs with the class `ge-table-focus-border` (2 px, color
`--ge-table-focus-outline-color` resp. `--ge-table-focus-border`). Hidden from screen readers – they get the
focus through `aria-activedescendant`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `geo` | [`GeoData`](GeoData.md) |
| `style` | [`HtmlStyle`](../modules.md#htmlstyle) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:517](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L517)

___

### addHorizontalBorder

▸ **addHorizontalBorder**(`geo`, `parent`, `clazz?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `geo` | [`GeoData`](GeoData.md) | `undefined` |
| `parent` | `HTMLDivElement` | `undefined` |
| `clazz` | `string` | `"ge-table-body-center-horizontal-border"` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:494](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L494)

___

### addLabelDiv

▸ **addLabelDiv**(`parent`, `text?`, `firstTreeColumn?`, `rowIndex?`, `columnIndex?`, `areaIdent?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parent` | `HTMLDivElement` | `undefined` |
| `text` | `string` | `""` |
| `firstTreeColumn` | `boolean` | `false` |
| `rowIndex` | `number` | `-1` |
| `columnIndex` | `number` | `-1` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `"body"` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:340](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L340)

___

### addRowDiv

▸ **addRowDiv**(`divScope`, `geo`, `rowIndex?`, `areaIdent`, `sideIdent`, `text?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `divScope` | [`DivScope`](../modules.md#divscope) | `undefined` |
| `geo` | [`GeoData`](GeoData.md) | `undefined` |
| `rowIndex` | `number` | `-1` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) | `undefined` |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) | `undefined` |
| `text` | `string` | `""` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:208](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L208)

___

### addSortedIcon

▸ **addSortedIcon**(`parent`, `sorted?`, `sortedOptions?`, `columnIndex?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parent` | `HTMLDivElement` | `undefined` |
| `sorted` | [`SortState`](../modules.md#sortstate) | `""` |
| `sortedOptions` | [`SortedOptionsIf`](../interfaces/SortedOptionsIf.md) | `undefined` |
| `columnIndex` | `number` | `-1` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:380](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L380)

___

### addVerticalBorder

▸ **addVerticalBorder**(`geo`, `parent`, `clazz?`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `geo` | [`GeoData`](GeoData.md) | `undefined` |
| `parent` | `HTMLDivElement` | `undefined` |
| `clazz` | `string` | `"ge-table-body-center-vertical-border"` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:543](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L543)

___

### appendRelativeChildDiv

▸ **appendRelativeChildDiv**(`parent`): [`DivScope`](../modules.md#divscope)

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |

#### Returns

[`DivScope`](../modules.md#divscope)

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L110)

___

### appendText

▸ **appendText**(`parent`, `text`): `HTMLElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `text` | `string` |

#### Returns

`HTMLElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L125)

___

### applyDisplayBlockStyle

▸ **applyDisplayBlockStyle**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L65)

___

### applyDisplayNoneStyle

▸ **applyDisplayNoneStyle**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L60)

___

### applyStyle

▸ **applyStyle**(`ele`, `style`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |
| `style` | [`HtmlStyle`](../modules.md#htmlstyle) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L53)

___

### applyStyleFullSize

▸ **applyStyleFullSize**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L87)

___

### applyStyleInPx

▸ **applyStyleInPx**(`ele`, `geoData`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |
| `geoData` | [`GeoData`](GeoData.md) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L70)

___

### applyStyleNoPadding

▸ **applyStyleNoPadding**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:103](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L103)

___

### applyStyleOverflowAuto

▸ **applyStyleOverflowAuto**(`overflowX?`, `overflowY?`, `ele`): `HTMLDivElement`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `overflowX` | ``"auto"`` \| ``"scroll"`` | `"auto"` |
| `overflowY` | ``"auto"`` \| ``"scroll"`` | `"auto"` |
| `ele` | `HTMLDivElement` | `undefined` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L93)

___

### applyStylePosistionAbsolute

▸ **applyStylePosistionAbsolute**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L82)

___

### applyStylePosistionRelative

▸ **applyStylePosistionRelative**(`ele`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L76)

___

### applyStyleString

▸ **applyStyleString**(`div`, `style`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLDivElement` |
| `style` | `string` |

#### Returns

`void`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:578](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L578)

___

### createAreaDivWithClass

▸ **createAreaDivWithClass**(`clazz`, `parent`, `areaIdent`, `sideIdent`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clazz` | `string` |
| `parent` | `HTMLDivElement` |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `sideIdent` | [`SideIdent`](../modules.md#sideident) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:191](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L191)

___

### createDivWithClass

▸ **createDivWithClass**(`clazz`, `parent`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clazz` | `string` |
| `parent` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L200)

___

### removeAttribute

▸ **removeAttribute**(`ele`, `key`): `HTMLElement`

Removes an attribute (via [DomServiceIf.removeAttribute](../interfaces/DomServiceIf.md#removeattribute) if the DOM service has it).

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLElement` |
| `key` | `string` |

#### Returns

`HTMLElement`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L171)

___

### removeClass

▸ **removeClass**(`clazz`, `div`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `clazz` | `string` |
| `div` | `HTMLDivElement` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L141)

___

### setAriaHidden

▸ **setAriaHidden**\<`T`\>(`ele`): `T`

Hides a purely decorative element (border, hover, icon …) from screen readers: `aria-hidden="true"`.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `HTMLElement` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `T` |

#### Returns

`T`

**`Since`**

1.1.91

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:185](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L185)

___

### setAttribute

▸ **setAttribute**(`div`, `key`, `value`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLDivElement` |
| `key` | `string` |
| `value` | `string` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:159](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L159)

___

### setStyle

▸ **setStyle**(`el`, `style`, `value`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `el` | `any` |
| `style` | `string` |
| `value` | `any` |

#### Returns

`any`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L47)
