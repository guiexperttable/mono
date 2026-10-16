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
- [getDirection](ConvenienceDomService.md#getdirection)
- [getInlineStart](ConvenienceDomService.md#getinlinestart)
- [removeAttribute](ConvenienceDomService.md#removeattribute)
- [removeClass](ConvenienceDomService.md#removeclass)
- [setAriaHidden](ConvenienceDomService.md#setariahidden)
- [setAttribute](ConvenienceDomService.md#setattribute)
- [setDirection](ConvenienceDomService.md#setdirection)
- [setStyle](ConvenienceDomService.md#setstyle)
- [toPhysicalStyleKey](ConvenienceDomService.md#tophysicalstylekey)

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

[src/lib/table/service/convenience-dom.service.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L54)

## Properties

### domService

• `Readonly` **domService**: [`DomServiceIf`](../interfaces/DomServiceIf.md)

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L55)

___

### focusBorderWidthInPx

▪ `Static` **focusBorderWidthInPx**: `number` = `2`

Width of the focus frame of a cell in px (WCAG 2.4.7: visible focus, not only a color).

**`Since`**

1.1.91

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L45)

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

[src/lib/table/service/convenience-dom.service.ts:499](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L499)

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

[src/lib/table/service/convenience-dom.service.ts:377](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L377)

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

[src/lib/table/service/convenience-dom.service.ts:204](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L204)

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

[src/lib/table/service/convenience-dom.service.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L222)

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

[src/lib/table/service/convenience-dom.service.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L546)

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

[src/lib/table/service/convenience-dom.service.ts:320](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L320)

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

[src/lib/table/service/convenience-dom.service.ts:634](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L634)

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

[src/lib/table/service/convenience-dom.service.ts:589](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L589)

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

[src/lib/table/service/convenience-dom.service.ts:566](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L566)

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

[src/lib/table/service/convenience-dom.service.ts:412](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L412)

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

[src/lib/table/service/convenience-dom.service.ts:280](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L280)

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

[src/lib/table/service/convenience-dom.service.ts:452](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L452)

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

[src/lib/table/service/convenience-dom.service.ts:615](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L615)

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

[src/lib/table/service/convenience-dom.service.ts:182](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L182)

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

[src/lib/table/service/convenience-dom.service.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L197)

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

[src/lib/table/service/convenience-dom.service.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L137)

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

[src/lib/table/service/convenience-dom.service.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L132)

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

[src/lib/table/service/convenience-dom.service.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L125)

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

[src/lib/table/service/convenience-dom.service.ts:159](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L159)

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

[src/lib/table/service/convenience-dom.service.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L142)

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

[src/lib/table/service/convenience-dom.service.ts:175](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L175)

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

[src/lib/table/service/convenience-dom.service.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L165)

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

[src/lib/table/service/convenience-dom.service.ts:154](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L154)

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

[src/lib/table/service/convenience-dom.service.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L148)

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

[src/lib/table/service/convenience-dom.service.ts:650](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L650)

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

[src/lib/table/service/convenience-dom.service.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L263)

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

[src/lib/table/service/convenience-dom.service.ts:272](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L272)

___

### getDirection

▸ **getDirection**(): [`ResolvedTableDirection`](../modules.md#resolvedtabledirection)

The writing direction set with [setDirection](ConvenienceDomService.md#setdirection) (default `"ltr"`).

#### Returns

[`ResolvedTableDirection`](../modules.md#resolvedtabledirection)

`"ltr"` or `"rtl"`

**`Since`**

1.1.98

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L87)

___

### getInlineStart

▸ **getInlineStart**(`ele`): `number`

The position of an element from the inline start in px, as written by this service (`style.left`, right-to-left
`style.right`); 0 if it has none.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ele` | `HTMLElement` | an element positioned by this service |

#### Returns

`number`

px

**`Since`**

1.1.98

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L114)

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

[src/lib/table/service/convenience-dom.service.ts:243](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L243)

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

[src/lib/table/service/convenience-dom.service.ts:213](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L213)

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

[src/lib/table/service/convenience-dom.service.ts:257](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L257)

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

[src/lib/table/service/convenience-dom.service.ts:231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L231)

___

### setDirection

▸ **setDirection**(`direction`): `void`

Sets the writing direction of the table. All positions of the table are computed from the **start** of a row
(x = 0 is the first column); in right-to-left this service writes them as `right` instead of `left` – in
[setStyle](ConvenienceDomService.md#setstyle), [applyStyle](ConvenienceDomService.md#applystyle), [applyStyleInPx](ConvenienceDomService.md#applystyleinpx) and all `add…` methods – so that the whole table is
mirrored. Called once by the table before anything is positioned.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | [`ResolvedTableDirection`](../modules.md#resolvedtabledirection) | `"ltr"` or `"rtl"` |

#### Returns

`void`

**`Example`**

```ts
const dom = new ConvenienceDomService(new SimpleDomService());
dom.setDirection("rtl");
const div = document.createElement("div");
dom.setStyle(div, "left", "20px"); // div.style.right = "20px"
```

**`Since`**

1.1.98

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L75)

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

[src/lib/table/service/convenience-dom.service.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L119)

___

### toPhysicalStyleKey

▸ **toPhysicalStyleKey**(`key`): `string`

The physical CSS property for a logical position key: in right-to-left `left` ↔ `right`, everything else as is.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | a CSS property |

#### Returns

`string`

the property to write

**`Since`**

1.1.98

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L98)
