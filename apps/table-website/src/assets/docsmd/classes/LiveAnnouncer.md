[GuiExpert Table API](../README.md) / [Exports](../modules.md) / LiveAnnouncer

# Class: LiveAnnouncer

A polite live region (`role="status"`) that lets screen readers speak short messages: "Sorted by Total,
descending", "42 rows", "12 cells copied" … Every table has one ([TableApi.announce](TableApi.md#announce)).

The element lives in `document.body`, not in the table: a `role="grid"` may only contain rows, and the body is
never managed by a framework. The table creates it in `firstInit()` – before the first message. Known limit: inside
a modal dialog (`aria-modal="true"`) screen readers ignore content outside the dialog; announce such messages with
a live region of your own in the dialog. It is visually hidden (inline styles – it works without the table CSS, e.g. outside
a shadow root) and removed by [destroy](LiveAnnouncer.md#destroy) (called by `TableScope.destroy()`).

The text is written with `textContent` (never HTML). It is set after a short delay and the region is emptied
first, so the same message is announced again, and a burst of messages (typing in a filter field) ends with one
announcement of the last one.

**`Example`**

```ts
const announcer = new LiveAnnouncer(document, "orders-live", new SimpleDomService());
announcer.announce("Orders loaded");
// later
announcer.destroy();
```

**`Since`**

1.1.91

## Table of contents

### Constructors

- [constructor](LiveAnnouncer.md#constructor)

### Properties

- [defaultDelayInMs](LiveAnnouncer.md#defaultdelayinms)

### Methods

- [announce](LiveAnnouncer.md#announce)
- [destroy](LiveAnnouncer.md#destroy)
- [getElement](LiveAnnouncer.md#getelement)

## Constructors

### constructor

• **new LiveAnnouncer**(`document`, `id`, `domService`): [`LiveAnnouncer`](LiveAnnouncer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | `undefined` \| `Document` |
| `id` | `string` |
| `domService` | [`DomServiceIf`](../interfaces/DomServiceIf.md) |

#### Returns

[`LiveAnnouncer`](LiveAnnouncer.md)

#### Defined in

[src/lib/table/aria/live-announcer.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/live-announcer.ts#L34)

## Properties

### defaultDelayInMs

▪ `Static` **defaultDelayInMs**: `number` = `150`

Delay in ms before a message is written (default for [announce](LiveAnnouncer.md#announce)).

#### Defined in

[src/lib/table/aria/live-announcer.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/live-announcer.ts#L29)

## Methods

### announce

▸ **announce**(`text`, `delayInMs?`): `void`

Speaks a message (replaces a message that is still waiting).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `text` | `string` | `undefined` | plain text |
| `delayInMs?` | `number` | `LiveAnnouncer.defaultDelayInMs` | wait this long before the text is written |

#### Returns

`void`

#### Defined in

[src/lib/table/aria/live-announcer.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/live-announcer.ts#L47)

___

### destroy

▸ **destroy**(): `void`

Cancels a waiting message and removes the live region from the document.

#### Returns

`void`

#### Defined in

[src/lib/table/aria/live-announcer.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/live-announcer.ts#L74)

___

### getElement

▸ **getElement**(): `undefined` \| `HTMLElement`

The live region element (created on the first call).

#### Returns

`undefined` \| `HTMLElement`

undefined without a document body (e.g. server side rendering)

#### Defined in

[src/lib/table/aria/live-announcer.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/live-announcer.ts#L67)
