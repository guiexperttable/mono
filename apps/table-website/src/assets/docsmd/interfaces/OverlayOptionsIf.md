[GuiExpert Table API](../README.md) / [Exports](../modules.md) / OverlayOptionsIf

# Interface: OverlayOptionsIf

Texts and behaviour of the overlays over the table body: "Loading…" ([TableApi.showLoadingOverlay](../classes/TableApi.md#showloadingoverlay)),
"No rows to show" (empty body) and "No matching rows" (the external filter hides all rows).

Set it with [TableOptionsIf.overlayOptions](TableOptionsIf.md#overlayoptions) – every field is optional there, missing ones keep their
default ([OverlayOptions](../classes/OverlayOptions.md)). The overlays are plain HTML and CSS (spinner: `@keyframes`), colours come from
the CSS variables `--ge-table-overlay-bg`, `--ge-table-overlay-color`, `--ge-table-spinner-color`,
`--ge-table-spinner-track-color` and `--ge-table-spinner-size`.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  overlayOptions: {
    loadingText: "Lädt…",
    noRowsText: "Keine Daten",
    noMatchesText: "Keine Treffer",
    loadingDelayInMs: 200, // fast answers show no spinner at all
  },
};
```

**`Since`**

1.1.91

**`See`**

Training: [Live data](https://gui.expert/training/live-data/)

## Implemented by

- [`OverlayOptions`](../classes/OverlayOptions.md)

## Table of contents

### Properties

- [autoNoRows](OverlayOptionsIf.md#autonorows)
- [blockInteractionWhileLoading](OverlayOptionsIf.md#blockinteractionwhileloading)
- [getOverlayElement](OverlayOptionsIf.md#getoverlayelement)
- [loadingDelayInMs](OverlayOptionsIf.md#loadingdelayinms)
- [loadingText](OverlayOptionsIf.md#loadingtext)
- [noMatchesText](OverlayOptionsIf.md#nomatchestext)
- [noRowsText](OverlayOptionsIf.md#norowstext)

## Properties

### autoNoRows

• **autoNoRows**: `boolean`

`true` (default): an empty body shows "No rows to show" (or "No matching rows") by itself, after every
repaint. `false`: only [TableApi.showNoRowsOverlay](../classes/TableApi.md#shownorowsoverlay) shows it.

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L42)

___

### blockInteractionWhileLoading

• **blockInteractionWhileLoading**: `boolean`

`true` (default): while "Loading…" is shown, mouse events on the body (click, double click, hover, context
menu) are blocked and the keyboard cannot start editing or toggle rows; navigation and copying still work.
`false`: the loading overlay is only a picture, the table stays usable.
"No rows" / "No matching rows" never block.

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L50)

___

### getOverlayElement

• `Optional` **getOverlayElement**: (`kind`: [`GeOverlayKind`](../modules.md#geoverlaykind), `text`: `string`) => `undefined` \| `HTMLElement`

#### Type declaration

▸ (`kind`, `text`): `undefined` \| `HTMLElement`

Own content of an overlay instead of the built-in one (spinner + text). Called once each time the overlay
of a kind appears; return `undefined` to keep the built-in content for that kind. The table removes the
element again when the overlay disappears or changes and in [TableApi.destroy](../classes/TableApi.md#destroy).

The overlay is hidden from screen readers (`aria-hidden`, the table announces its text instead):
put no buttons or links into it.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `kind` | [`GeOverlayKind`](../modules.md#geoverlaykind) | `"loading"`, `"noRows"` or `"noMatches"` |
| `text` | `string` | the text the built-in content would show |

##### Returns

`undefined` \| `HTMLElement`

the element to show, or `undefined` for the default

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  overlayOptions: {
    getOverlayElement: (kind: GeOverlayKind, text: string) => {
      if (kind !== "noRows") return undefined; // built-in spinner and texts for the others
      const div = document.createElement("div");
      div.className = "my-empty-state";
      div.textContent = `📭 ${text}`;
      return div;
    },
  },
};
```

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L84)

___

### loadingDelayInMs

• **loadingDelayInMs**: `number`

Waits this long (ms) before the loading overlay appears. Answers that come faster show no spinner at all
(no flashing). Default: `0` (right away).

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L56)

___

### loadingText

• **loadingText**: `string`

Text of the loading overlay. Default: `"Loading…"`.

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L30)

___

### noMatchesText

• **noMatchesText**: `string`

Text when the external filter hides all rows. Default: `"No matching rows"`.

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L36)

___

### noRowsText

• **noRowsText**: `string`

Text of the overlay of an empty body. Default: `"No rows to show"`.

#### Defined in

[src/lib/table/data/options/overlay-options.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/overlay-options.if.ts#L33)
