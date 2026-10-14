[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SimpleDomService

# Class: SimpleDomService

## Implements

- [`DomServiceIf`](../interfaces/DomServiceIf.md)

## Table of contents

### Constructors

- [constructor](SimpleDomService.md#constructor)

### Methods

- [addClass](SimpleDomService.md#addclass)
- [appendChild](SimpleDomService.md#appendchild)
- [appendText](SimpleDomService.md#appendtext)
- [createElement](SimpleDomService.md#createelement)
- [createText](SimpleDomService.md#createtext)
- [removeAttribute](SimpleDomService.md#removeattribute)
- [removeClass](SimpleDomService.md#removeclass)
- [setAttribute](SimpleDomService.md#setattribute)
- [setStyle](SimpleDomService.md#setstyle)

## Constructors

### constructor

• **new SimpleDomService**(): [`SimpleDomService`](SimpleDomService.md)

#### Returns

[`SimpleDomService`](SimpleDomService.md)

## Methods

### addClass

▸ **addClass**(`div`, `clazz`): `HTMLDivElement`

Adds a CSS class.

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLDivElement` |
| `clazz` | `string` |

#### Returns

`HTMLDivElement`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[addClass](../interfaces/DomServiceIf.md#addclass)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L21)

___

### appendChild

▸ **appendChild**(`parent`, `child`): `void`

Appends a child element.

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLElement` |
| `child` | `HTMLElement` |

#### Returns

`void`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[appendChild](../interfaces/DomServiceIf.md#appendchild)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L39)

___

### appendText

▸ **appendText**(`parent`, `text`): `HTMLDivElement`

Appends text to an element (no HTML parsing).

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | `HTMLDivElement` |
| `text` | `string` |

#### Returns

`HTMLDivElement`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[appendText](../interfaces/DomServiceIf.md#appendtext)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L14)

___

### createElement

▸ **createElement**\<`T`\>(`name`): `T`

Creates an element: `createElement<HTMLSpanElement>("span")`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`T`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[createElement](../interfaces/DomServiceIf.md#createelement)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L43)

___

### createText

▸ **createText**(`value`): `any`

Creates a text node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`any`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[createText](../interfaces/DomServiceIf.md#createtext)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L47)

___

### removeAttribute

▸ **removeAttribute**(`ele`, `key`): `void`

Removes an attribute (used for ARIA attributes of reused row divs). Optional: without it the table calls
`ele.removeAttribute(key)` itself.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLElement` |
| `key` | `string` |

#### Returns

`void`

**`Since`**

1.1.91

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[removeAttribute](../interfaces/DomServiceIf.md#removeattribute)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L55)

___

### removeClass

▸ **removeClass**(`div`, `clazz`): `HTMLDivElement`

Removes a CSS class.

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLDivElement` |
| `clazz` | `string` |

#### Returns

`HTMLDivElement`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[removeClass](../interfaces/DomServiceIf.md#removeclass)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L30)

___

### setAttribute

▸ **setAttribute**(`ele`, `key`, `value`): `void`

Sets an attribute.

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `HTMLElement` |
| `key` | `string` |
| `value` | `string` |

#### Returns

`void`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[setAttribute](../interfaces/DomServiceIf.md#setattribute)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L51)

___

### setStyle

▸ **setStyle**(`el`, `style`, `value`): `any`

Sets one CSS property: `setStyle(el, "background-color", "#fdf2f8")`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `el` | `any` |
| `style` | `string` |
| `value` | `any` |

#### Returns

`any`

#### Implementation of

[DomServiceIf](../interfaces/DomServiceIf.md).[setStyle](../interfaces/DomServiceIf.md#setstyle)

#### Defined in

[src/lib/table/service/simple-dom-service.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/simple-dom-service.ts#L8)
