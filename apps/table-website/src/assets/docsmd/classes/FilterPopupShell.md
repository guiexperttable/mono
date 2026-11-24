[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FilterPopupShell

# Class: FilterPopupShell

Top-layer popup shell shared by the per-column filter menu (Part C) and the column chooser (Part D).

Uses the native Popover API (`popover="manual"` inside `hostElement`, so the popup stays visible in
`hostElement.requestFullscreen()`, is never clipped by `overflow: hidden` and inherits `--ge-table-*` and `dir`
even inside a Shadow DOM) with a `document.body` + `position: fixed` fallback for older browsers.

**`Since`**

1.1.114

## Table of contents

### Constructors

- [constructor](FilterPopupShell.md#constructor)

### Methods

- [close](FilterPopupShell.md#close)
- [destroy](FilterPopupShell.md#destroy)
- [focusInitial](FilterPopupShell.md#focusinitial)
- [getElement](FilterPopupShell.md#getelement)
- [isInPopup](FilterPopupShell.md#isinpopup)
- [isOpen](FilterPopupShell.md#isopen)
- [open](FilterPopupShell.md#open)
- [reposition](FilterPopupShell.md#reposition)

## Constructors

### constructor

• **new FilterPopupShell**(`scope`): [`FilterPopupShell`](FilterPopupShell.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `scope` | [`TableScope`](TableScope.md) |

#### Returns

[`FilterPopupShell`](FilterPopupShell.md)

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L65)

## Methods

### close

▸ **close**(`reason?`): `void`

Closes the popup, releases listeners and DOM, and notifies `onClose(reason)`. Safe to call repeatedly.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `reason` | [`FilterPopupCloseReason`](../modules.md#filterpopupclosereason) | `"api"` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:309](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L309)

___

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:346](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L346)

___

### focusInitial

▸ **focusInitial**(`preferred?`): `void`

Moves initial focus to `preferred` (if focusable), otherwise the first focusable control or the dialog itself.

#### Parameters

| Name | Type |
| :------ | :------ |
| `preferred?` | ``null`` \| `HTMLElement` |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:291](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L291)

___

### getElement

▸ **getElement**(): `undefined` \| `HTMLDivElement`

#### Returns

`undefined` \| `HTMLDivElement`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L71)

___

### isInPopup

▸ **isInPopup**(`evt`): `boolean`

True if a DOM event originated inside this popup (via `composedPath()`, safe across Shadow DOM).

#### Parameters

| Name | Type |
| :------ | :------ |
| `evt` | `Event` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L76)

___

### isOpen

▸ **isOpen**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L67)

___

### open

▸ **open**(`options`): `HTMLDivElement`

Opens the popup (closing any previous instance first) and returns its empty container `<div>` so the caller can
populate its content before calling [reposition](FilterPopupShell.md#reposition) and [focusInitial](FilterPopupShell.md#focusinitial).

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`FilterPopupOpenOptionsIf`](../interfaces/FilterPopupOpenOptionsIf.md) |

#### Returns

`HTMLDivElement`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L92)

___

### reposition

▸ **reposition**(`anchorRect?`): `void`

Computes viewport-aware fixed coordinates (flipping on block and inline axes in LTR & RTL).

#### Parameters

| Name | Type |
| :------ | :------ |
| `anchorRect` | `undefined` \| `DOMRect` \| \{ `bottom`: `number` ; `height`: `number` ; `left`: `number` ; `right`: `number` ; `top`: `number` ; `width`: `number`  } |

#### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:244](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L244)
