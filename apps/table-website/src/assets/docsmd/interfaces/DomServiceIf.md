[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DomServiceIf

# Interface: DomServiceIf

All DOM changes of the table go through this service – the third argument of `new TableScope(…)`.
Plain TypeScript and most wrappers use [SimpleDomService](../classes/SimpleDomService.md); Angular uses its `Renderer2`.
Cell renderers get it as last argument of [CellRendererIf.render](CellRendererIf.md#render).

**`Example`**

```ts
// inside CellRendererIf.render(cellDiv, …, cellValue, dom)
const badge = dom.createElement<HTMLSpanElement>("span");
dom.addClass(badge, "status-badge");
dom.setStyle(badge, "margin-left", "4px");
badge.textContent = String(cellValue);
dom.appendChild(cellDiv, badge);
```

## Implemented by

- [`SimpleDomService`](../classes/SimpleDomService.md)

## Table of contents

### Methods

- [addClass](DomServiceIf.md#addclass)
- [appendChild](DomServiceIf.md#appendchild)
- [appendText](DomServiceIf.md#appendtext)
- [createElement](DomServiceIf.md#createelement)
- [createText](DomServiceIf.md#createtext)
- [removeClass](DomServiceIf.md#removeclass)
- [setAttribute](DomServiceIf.md#setattribute)
- [setStyle](DomServiceIf.md#setstyle)

## Methods

### addClass

▸ **addClass**(`div`, `clazz`): `HTMLDivElement`

Adds a CSS class.

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLElement` |
| `clazz` | `string` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/dom-service.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L22)

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

#### Defined in

[src/lib/table/service/dom-service.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L37)

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

#### Defined in

[src/lib/table/service/dom-service.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L34)

___

### createElement

▸ **createElement**\<`T`\>(`ele`): `T`

Creates an element: `createElement<HTMLSpanElement>("span")`.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ele` | `string` |

#### Returns

`T`

#### Defined in

[src/lib/table/service/dom-service.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L28)

___

### createText

▸ **createText**(`text`): `HTMLElement`

Creates a text node.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`HTMLElement`

#### Defined in

[src/lib/table/service/dom-service.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L31)

___

### removeClass

▸ **removeClass**(`div`, `clazz`): `HTMLDivElement`

Removes a CSS class.

#### Parameters

| Name | Type |
| :------ | :------ |
| `div` | `HTMLElement` |
| `clazz` | `string` |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/service/dom-service.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L25)

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

#### Defined in

[src/lib/table/service/dom-service.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L40)

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

#### Defined in

[src/lib/table/service/dom-service.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/dom-service.if.ts#L19)
