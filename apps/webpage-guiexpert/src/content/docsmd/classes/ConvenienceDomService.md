[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ConvenienceDomService

# Class: ConvenienceDomService

## Table of contents

### Constructors

- [constructor](ConvenienceDomService.md#constructor)

### Properties

- [domService](ConvenienceDomService.md#domservice)

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
- [removeClass](ConvenienceDomService.md#removeclass)
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

[src/lib/table/service/convenience-dom.service.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L36)

## Properties

### domService

• `Readonly` **domService**: [`DomServiceIf`](../interfaces/DomServiceIf.md)

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L37)

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

[src/lib/table/service/convenience-dom.service.ts:386](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L386)

___

### addCheckboxToDiv

▸ **addCheckboxToDiv**(`parent`, `checkedType`, `areaIdent`, `rowIndex`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `checkedType` | [`CheckedType`](../modules.md#checkedtype) |
| `areaIdent` | [`AreaIdent`](../modules.md#areaident) |
| `rowIndex` | `number` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:276](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L276)

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

[src/lib/table/service/convenience-dom.service.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L127)

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

[src/lib/table/service/convenience-dom.service.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L145)

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

[src/lib/table/service/convenience-dom.service.ts:432](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L432)

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

[src/lib/table/service/convenience-dom.service.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L219)

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

[src/lib/table/service/convenience-dom.service.ts:546](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L546)

___

### addFocusBorderDivs

▸ **addFocusBorderDivs**(`parent`, `geo`, `style`): `HTMLDivElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `geo` | [`GeoData`](GeoData.md) |
| `style` | [`HtmlStyle`](../modules.md#htmlstyle) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/convenience-dom.service.ts:469](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L469)

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

[src/lib/table/service/convenience-dom.service.ts:452](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L452)

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

[src/lib/table/service/convenience-dom.service.ts:300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L300)

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

[src/lib/table/service/convenience-dom.service.ts:179](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L179)

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

[src/lib/table/service/convenience-dom.service.ts:340](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L340)

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

[src/lib/table/service/convenience-dom.service.ts:528](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L528)

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

[src/lib/table/service/convenience-dom.service.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L105)

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

[src/lib/table/service/convenience-dom.service.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L120)

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

[src/lib/table/service/convenience-dom.service.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L60)

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

[src/lib/table/service/convenience-dom.service.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L55)

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

[src/lib/table/service/convenience-dom.service.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L48)

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

[src/lib/table/service/convenience-dom.service.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L82)

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

[src/lib/table/service/convenience-dom.service.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L65)

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

[src/lib/table/service/convenience-dom.service.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L98)

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

[src/lib/table/service/convenience-dom.service.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L88)

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

[src/lib/table/service/convenience-dom.service.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L77)

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

[src/lib/table/service/convenience-dom.service.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L71)

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

[src/lib/table/service/convenience-dom.service.ts:561](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L561)

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

[src/lib/table/service/convenience-dom.service.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L162)

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

[src/lib/table/service/convenience-dom.service.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L136)

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

[src/lib/table/service/convenience-dom.service.ts:154](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L154)

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

[src/lib/table/service/convenience-dom.service.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/convenience-dom.service.ts#L42)
