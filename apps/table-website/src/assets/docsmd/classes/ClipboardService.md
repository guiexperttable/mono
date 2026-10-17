[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ClipboardService

# Class: ClipboardService

Copy, cut and paste like Excel ([TableOptionsIf.clipboard](../interfaces/TableOptionsIf.md#clipboard)): the `copy`, `cut` and `paste` events of the
browser (synchronous, no permission prompt). The keys (Ctrl/⌘+C, X, V) focus a hidden text field for the moment of
the key press, so that every browser – also Safari, which sends no clipboard events to a focused `div` – fires the
event; the focus returns to the table right after it. The Edit menu of the browser works on the focused table, too.
Created by [TableScope](TableScope.md): with the option (`tableScope.clipboardService`, keys and events), otherwise on
demand for the API ([TableApi.pasteText](TableApi.md#pastetext), [TableApi.getSelectionAsText](TableApi.md#getselectionastext)).

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](ClipboardService.md#constructor)

### Properties

- [options](ClipboardService.md#options)

### Methods

- [arm](ClipboardService.md#arm)
- [cancelCut](ClipboardService.md#cancelcut)
- [destroy](ClipboardService.md#destroy)
- [getSelectionAsText](ClipboardService.md#getselectionastext)
- [isCutMarked](ClipboardService.md#iscutmarked)
- [paste](ClipboardService.md#paste)
- [runWithoutKey](ClipboardService.md#runwithoutkey)
- [update](ClipboardService.md#update)
- [writeSelection](ClipboardService.md#writeselection)

## Constructors

### constructor

• **new ClipboardService**(`tableScope`, `options`, `listen`): [`ClipboardService`](ClipboardService.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) | the table |
| `options` | [`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md) | complete options |
| `listen` | `boolean` | true: keys and clipboard events (the option is on); false: only the API |

#### Returns

[`ClipboardService`](ClipboardService.md)

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L77)

## Properties

### options

• `Readonly` **options**: [`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md)

complete options

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L77)

## Methods

### arm

▸ **arm**(`kind`): `boolean`

Ctrl/⌘+C, X or V (from the shortcut mapping): focuses the hidden text field so that the browser fires its
clipboard event there. The key must not be consumed (`preventDefault`) – the caller returns `false`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `kind` | [`ClipboardKind`](../modules.md#clipboardkind) | the key |

#### Returns

`boolean`

true if the event will be handled; false: not here (the editor is open, header focus, an own
         `CopyServiceIf` for copying)

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L113)

___

### cancelCut

▸ **cancelCut**(): `void`

Removes the mark of cut cells (Escape, another change, [TableApi.cancelCut](TableApi.md#cancelcut)); the clipboard keeps the text.

#### Returns

`void`

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:310](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L310)

___

### destroy

▸ **destroy**(): `void`

Removes the hidden text field and the frame (table destroyed).

#### Returns

`void`

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:348](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L348)

___

### getSelectionAsText

▸ **getSelectionAsText**(): `string`

The selected cells as tab-separated text, as Ctrl/⌘+C copies them (see [TableApi.getSelectionAsText](TableApi.md#getselectionastext)).

#### Returns

`string`

the text; `""` without cells or with more than `CopyService.maxCopyCells`

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L140)

___

### isCutMarked

▸ **isCutMarked**(): `boolean`

True while cut cells are marked (dashed frame).

#### Returns

`boolean`

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L101)

___

### paste

▸ **paste**(`text`, `html?`, `target?`): [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

Pastes text (see [TableApi.pasteText](TableApi.md#pastetext)): parsed like the clipboard, from `target` or the selection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `text` | `string` | tab-separated text |
| `html?` | `string` | `text/html` (used only without text) |
| `target?` | [`number`, `number`] | display row and model column of the first cell (no tiling) |

#### Returns

[`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[]

the written (batch edit: newly pending) cells

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:199](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L199)

___

### runWithoutKey

▸ **runWithoutKey**(`kind`): `Promise`\<`void`\>

Copy, cut or paste without a key (an `ActionId` from [TableApi.triggerAction](TableApi.md#triggeraction), e.g. a context menu): the
asynchronous clipboard API – the browser may ask for permission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `kind` | [`ClipboardKind`](../modules.md#clipboardkind) | what to do |

#### Returns

`Promise`\<`void`\>

resolves when done (a refused permission is ignored)

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L178)

___

### update

▸ **update**(): `void`

Places the dashed frame of cut cells (after every render pass); removes it if the cut rows moved.

#### Returns

`void`

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L318)

___

### writeSelection

▸ **writeSelection**(`cut`): `Promise`\<`void`\>

Copies (or cuts) the selected cells with the asynchronous clipboard API (`text/plain` and `text/html` with
`ClipboardItem`, otherwise `writeText`) – for buttons and menus (see [TableApi.copySelection](TableApi.md#copyselection)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cut` | `boolean` | true: mark the cells, they move on the next paste |

#### Returns

`Promise`\<`void`\>

resolves when the clipboard was written

#### Defined in

[src/lib/table/clipboard/clipboard-service.ts:151](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-service.ts#L151)
