[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableOverlay

# Class: TableOverlay

The overlay layer over the table body: "Loading…" with a CSS spinner, "No rows to show", "No matching rows".
One element per table (`.ge-table-overlay`, a child of the host, `aria-hidden` – the table announces the texts
through its live region instead). It is created once and only changed when the shown overlay changes, so
scrolling costs one comparison per frame.

Apps use it through [TableApi.showLoadingOverlay](TableApi.md#showloadingoverlay), [TableApi.showNoRowsOverlay](TableApi.md#shownorowsoverlay),
[TableApi.hideOverlay](TableApi.md#hideoverlay) and [TableApi.getOverlayState](TableApi.md#getoverlaystate); texts and behaviour come from
[TableOptionsIf.overlayOptions](../interfaces/TableOptionsIf.md#overlayoptions).

**`Example`**

```ts
const overlay = new TableOverlay(hostDiv, new ConvenienceDomService(new SimpleDomService()), {}, () => {
  overlay.update(0, 0);
});
overlay.showLoading("Saving…"); // calls the update callback
console.log(overlay.getState()); // "loading"
overlay.destroy();
```

**`Since`**

1.1.91

## Table of contents

### Constructors

- [constructor](TableOverlay.md#constructor)

### Properties

- [contentElement](TableOverlay.md#contentelement)
- [element](TableOverlay.md#element)
- [options](TableOverlay.md#options)

### Methods

- [destroy](TableOverlay.md#destroy)
- [getState](TableOverlay.md#getstate)
- [hide](TableOverlay.md#hide)
- [isBlocking](TableOverlay.md#isblocking)
- [isEventBlocked](TableOverlay.md#iseventblocked)
- [setBounds](TableOverlay.md#setbounds)
- [showLoading](TableOverlay.md#showloading)
- [showNoRows](TableOverlay.md#shownorows)
- [update](TableOverlay.md#update)

## Constructors

### constructor

• **new TableOverlay**(`hostElement`, `dom`, `overlayOptions?`, `requestUpdate?`): [`TableOverlay`](TableOverlay.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostElement` | `HTMLDivElement` | the table host; the overlay is appended to it |
| `dom` | [`ConvenienceDomService`](ConvenienceDomService.md) | DOM access of the table |
| `overlayOptions?` | `Partial`\<[`OverlayOptionsIf`](../interfaces/OverlayOptionsIf.md)\> | [TableOptionsIf.overlayOptions](../interfaces/TableOptionsIf.md#overlayoptions) |
| `requestUpdate?` | () => `void` | called when the requested overlay changed (API call, end of the delay); the table answers with [update](TableOverlay.md#update) |

#### Returns

[`TableOverlay`](TableOverlay.md)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L72)

## Properties

### contentElement

• `Readonly` **contentElement**: `HTMLDivElement`

The content box, centered in the overlay (`.ge-table-overlay-content`).

#### Defined in

[src/lib/table/overlay/table-overlay.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L54)

___

### element

• `Readonly` **element**: `HTMLDivElement`

The overlay element (`.ge-table-overlay`).

#### Defined in

[src/lib/table/overlay/table-overlay.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L52)

___

### options

• `Readonly` **options**: [`OverlayOptions`](OverlayOptions.md)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L55)

## Methods

### destroy

▸ **destroy**(): `void`

Removes the overlay element and a waiting delay. Calling it twice is harmless.

#### Returns

`void`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:197](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L197)

___

### getState

▸ **getState**(): [`GeOverlayKind`](../modules.md#geoverlaykind)

The overlay that is shown now.

#### Returns

[`GeOverlayKind`](../modules.md#geoverlaykind)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L131)

___

### hide

▸ **hide**(): `void`

Ends a requested overlay; the automatic "no rows" / "no matching rows" stays as long as the body is empty.

#### Returns

`void`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L121)

___

### isBlocking

▸ **isBlocking**(): `boolean`

`true` while a loading overlay blocks mouse and keyboard ([OverlayOptionsIf.blockInteractionWhileLoading](../interfaces/OverlayOptionsIf.md#blockinteractionwhileloading)).

#### Returns

`boolean`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L136)

___

### isEventBlocked

▸ **isEventBlocked**(`evt`): `boolean`

`true` for a mouse event on a blocking loading overlay: the table ignores it (click, double click, mouse down,
context menu, hover). The event is not stopped – page handlers (e.g. "click outside closes the menu") see it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `evt` | `Event` | a mouse event that reached the host |

#### Returns

`boolean`

the table must not react to it

#### Defined in

[src/lib/table/overlay/table-overlay.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L147)

___

### setBounds

▸ **setBounds**(`left`, `top`, `width`, `height`): `void`

Places the overlay over the body (px, relative to the host). Unchanged values do not touch the DOM.

#### Parameters

| Name | Type |
| :------ | :------ |
| `left` | `number` |
| `top` | `number` |
| `width` | `number` |
| `height` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:182](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L182)

___

### showLoading

▸ **showLoading**(`text?`): `void`

Requests the loading overlay (after [OverlayOptionsIf.loadingDelayInMs](../interfaces/OverlayOptionsIf.md#loadingdelayinms)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay, default [OverlayOptionsIf.loadingText](../interfaces/OverlayOptionsIf.md#loadingtext) |

#### Returns

`void`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L90)

___

### showNoRows

▸ **showNoRows**(`text?`): `void`

Requests the "no rows" overlay, also over rows and with [OverlayOptionsIf.autoNoRows](../interfaces/OverlayOptionsIf.md#autonorows) `false`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text?` | `string` | text for this overlay, default [OverlayOptionsIf.noRowsText](../interfaces/OverlayOptionsIf.md#norowstext) |

#### Returns

`void`

#### Defined in

[src/lib/table/overlay/table-overlay.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L111)

___

### update

▸ **update**(`rowCount`, `unfilteredRowCount?`): `undefined` \| [`TableOverlayChange`](../interfaces/TableOverlayChange.md)

Shows the overlay that fits the body: a requested one, else "no matching rows" / "no rows to show"
for an empty body. Changes the DOM only if the result differs from what is shown.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | `getRowCount()` of the body |
| `unfilteredRowCount?` | `number` | `getUnfilteredRowCount()` of the body (only needed for 0 rows) |

#### Returns

`undefined` \| [`TableOverlayChange`](../interfaces/TableOverlayChange.md)

the change, `undefined` if nothing changed

#### Defined in

[src/lib/table/overlay/table-overlay.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L160)
