[GuiExpert Table API](../README.md) / [Exports](../modules.md) / OverlayOptions

# Class: OverlayOptions

The defaults of [OverlayOptionsIf](../interfaces/OverlayOptionsIf.md): English texts, an automatic "No rows to show", a loading overlay that
blocks the body and appears right away.

**`Example`**

```ts
const overlayOptions = OverlayOptions.create({ noRowsText: "Keine Daten" });
console.log(overlayOptions.loadingText); // "Loading…"
```

**`Since`**

1.1.92

## Implements

- [`OverlayOptionsIf`](../interfaces/OverlayOptionsIf.md)

## Table of contents

### Constructors

- [constructor](OverlayOptions.md#constructor)

### Properties

- [autoNoRows](OverlayOptions.md#autonorows)
- [blockInteractionWhileLoading](OverlayOptions.md#blockinteractionwhileloading)
- [getOverlayElement](OverlayOptions.md#getoverlayelement)
- [loadingDelayInMs](OverlayOptions.md#loadingdelayinms)
- [loadingText](OverlayOptions.md#loadingtext)
- [noMatchesText](OverlayOptions.md#nomatchestext)
- [noRowsText](OverlayOptions.md#norowstext)

### Methods

- [create](OverlayOptions.md#create)

## Constructors

### constructor

• **new OverlayOptions**(): [`OverlayOptions`](OverlayOptions.md)

#### Returns

[`OverlayOptions`](OverlayOptions.md)

## Properties

### autoNoRows

• **autoNoRows**: `boolean` = `true`

`true` (default): an empty body shows "No rows to show" (or "No matching rows") by itself, after every
repaint. `false`: only [TableApi.showNoRowsOverlay](TableApi.md#shownorowsoverlay) shows it.

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[autoNoRows](../interfaces/OverlayOptionsIf.md#autonorows)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L20)

___

### blockInteractionWhileLoading

• **blockInteractionWhileLoading**: `boolean` = `true`

`true` (default): while "Loading…" is shown, the table ignores mouse events on the body (click, double click,
hover, context menu – the page still sees them) and the keyboard cannot start editing or toggle rows in the body;
navigation, copying and the header still work.
`false`: the loading overlay is only a picture, the table stays usable.
"No rows" / "No matching rows" never block.

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[blockInteractionWhileLoading](../interfaces/OverlayOptionsIf.md#blockinteractionwhileloading)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L21)

___

### getOverlayElement

• `Optional` **getOverlayElement**: (`kind`: [`GeOverlayKind`](../modules.md#geoverlaykind), `text`: `string`) => `undefined` \| `HTMLElement` = `undefined`

#### Type declaration

▸ (`kind`, `text`): `undefined` \| `HTMLElement`

##### Parameters

| Name | Type |
| :------ | :------ |
| `kind` | [`GeOverlayKind`](../modules.md#geoverlaykind) |
| `text` | `string` |

##### Returns

`undefined` \| `HTMLElement`

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[getOverlayElement](../interfaces/OverlayOptionsIf.md#getoverlayelement)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L23)

___

### loadingDelayInMs

• **loadingDelayInMs**: `number` = `0`

Waits this long (ms) before the loading overlay appears. Answers that come faster show no spinner at all
(no flashing); meanwhile an automatic "No rows to show" stays as it is. Default: `0` (right away).

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[loadingDelayInMs](../interfaces/OverlayOptionsIf.md#loadingdelayinms)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L22)

___

### loadingText

• **loadingText**: `string` = `"Loading…"`

Text of the loading overlay. Default: `"Loading…"`.

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[loadingText](../interfaces/OverlayOptionsIf.md#loadingtext)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L17)

___

### noMatchesText

• **noMatchesText**: `string` = `"No matching rows"`

Text when the external filter hides all rows. Default: `"No matching rows"`.

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[noMatchesText](../interfaces/OverlayOptionsIf.md#nomatchestext)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L19)

___

### noRowsText

• **noRowsText**: `string` = `"No rows to show"`

Text of the overlay of an empty body. Default: `"No rows to show"`.

#### Implementation of

[OverlayOptionsIf](../interfaces/OverlayOptionsIf.md).[noRowsText](../interfaces/OverlayOptionsIf.md#norowstext)

#### Defined in

[src/lib/table/data/options/overlay-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L18)

## Methods

### create

▸ **create**(`partial?`): [`OverlayOptions`](OverlayOptions.md)

The defaults with the given fields on top (`undefined` fields keep their default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `partial?` | `Partial`\<[`OverlayOptionsIf`](../interfaces/OverlayOptionsIf.md)\> | e.g. `tableOptions.overlayOptions` |

#### Returns

[`OverlayOptions`](OverlayOptions.md)

a new object

#### Defined in

[src/lib/table/data/options/overlay-options.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.ts#L31)
