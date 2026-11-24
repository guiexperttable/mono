[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FilterPopupOpenOptionsIf

# Interface: FilterPopupOpenOptionsIf

## Table of contents

### Properties

- [anchorRect](FilterPopupOpenOptionsIf.md#anchorrect)
- [ariaLabel](FilterPopupOpenOptionsIf.md#arialabel)
- [className](FilterPopupOpenOptionsIf.md#classname)
- [isTrigger](FilterPopupOpenOptionsIf.md#istrigger)
- [onClose](FilterPopupOpenOptionsIf.md#onclose)
- [triggerEl](FilterPopupOpenOptionsIf.md#triggerel)

## Properties

### anchorRect

• **anchorRect**: `DOMRect` \| \{ `bottom`: `number` ; `height`: `number` ; `left`: `number` ; `right`: `number` ; `top`: `number` ; `width`: `number`  }

Anchor rectangle in viewport coordinates (`getBoundingClientRect()`).

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L12)

___

### ariaLabel

• **ariaLabel**: `string`

Accessible name of the `role="dialog"` container.

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L8)

___

### className

• `Optional` **className**: `string`

Extra CSS class(es) added to the popup container.

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L10)

___

### isTrigger

• `Optional` **isTrigger**: (`el`: `HTMLElement`) => `boolean`

#### Type declaration

▸ (`el`): `boolean`

Recognizes the trigger when `triggerEl` was replaced meanwhile (header cells are rebuilt on every render):
a press on such an element is not "outside".

##### Parameters

| Name | Type |
| :------ | :------ |
| `el` | `HTMLElement` |

##### Returns

`boolean`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L19)

___

### onClose

• `Optional` **onClose**: (`reason`: [`FilterPopupCloseReason`](../modules.md#filterpopupclosereason)) => `void`

#### Type declaration

▸ (`reason`): `void`

Called once when the popup closes.

##### Parameters

| Name | Type |
| :------ | :------ |
| `reason` | [`FilterPopupCloseReason`](../modules.md#filterpopupclosereason) |

##### Returns

`void`

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L21)

___

### triggerEl

• `Optional` **triggerEl**: ``null`` \| `Element`

Optional trigger element whose click opened the popup (ignored for immediate outside-dismiss).

#### Defined in

[src/lib/table/column-filter/filter-popup-shell.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/filter-popup-shell.ts#L14)
