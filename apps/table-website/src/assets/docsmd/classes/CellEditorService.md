[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellEditorService

# Class: CellEditorService

Excel-style editing ([TableOptionsIf.editing](../interfaces/TableOptionsIf.md#editing)): **one** editor element above the edited cell (not inside
it – the cells are rebuilt on every render pass, the editor survives scrolling and repaints), typing to edit,
Enter/Tab/arrow keys commit and move, Escape cancels, a click elsewhere commits. Created by [TableScope](TableScope.md)
only with the option (`tableScope.cellEditorService`).

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](CellEditorService.md#constructor)

### Properties

- [options](CellEditorService.md#options)

### Methods

- [cancel](CellEditorService.md#cancel)
- [commit](CellEditorService.md#commit)
- [destroy](CellEditorService.md#destroy)
- [getCell](CellEditorService.md#getcell)
- [getOwnedEditorId](CellEditorService.md#getownededitorid)
- [handlesColumn](CellEditorService.md#handlescolumn)
- [isOpen](CellEditorService.md#isopen)
- [start](CellEditorService.md#start)
- [update](CellEditorService.md#update)

## Constructors

### constructor

• **new CellEditorService**(`tableScope`, `options`): [`CellEditorService`](CellEditorService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |
| `options` | [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md) |

#### Returns

[`CellEditorService`](CellEditorService.md)

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L63)

## Properties

### options

• `Readonly` **options**: [`EditingOptionsIf`](../interfaces/EditingOptionsIf.md)

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L63)

## Methods

### cancel

▸ **cancel**(): `void`

Closes the editor without writing (Escape).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:260](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L260)

___

### commit

▸ **commit**(`move?`, `opts?`): `boolean`

Writes the editor's value (through `editInputPipe` and `validate`; batch edit: marks it) and moves on.
An invalid value keeps the editor open (`aria-invalid`, the message is announced and the `title`).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `move?` | [`EditMove`](../modules.md#editmove) | `"none"` | where the active cell goes afterwards |
| `opts?` | `Object` | `{}` | Ctrl/⌘+Enter: into all selected cells; a mouse click: repaint after the click (a repaint between mousedown and click loses the click) |
| `opts.deferRepaint?` | `boolean` | `undefined` | - |
| `opts.fillSelection?` | `boolean` | `undefined` | - |
| `opts.tab?` | `boolean` | `undefined` | - |

#### Returns

`boolean`

true if the editor closed

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:217](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L217)

___

### destroy

▸ **destroy**(): `void`

Removes the editor (table destroyed).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:304](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L304)

___

### getCell

▸ **getCell**(): `undefined` \| [`number`, `number`]

The edited cell.

#### Returns

`undefined` \| [`number`, `number`]

display row and model column, `undefined` without editor

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:87](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L87)

___

### getOwnedEditorId

▸ **getOwnedEditorId**(`rowIndex`, `columnIndex`): `undefined` \| `string`

The id of the editor element (and of the formula popups) if `(rowIndex, columnIndex)` is the edited cell – the cell gets `aria-owns` with it
(screen readers find the editor in the cell, not as a stray child of the grid).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index |
| `columnIndex` | `number` | model column index |

#### Returns

`undefined` \| `string`

the id

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L99)

___

### handlesColumn

▸ **handlesColumn**(`columnIndex`): `boolean`

True if this service edits the column (otherwise the column's own `getEditRenderer` – or an own
`tableOptions.getEditRenderer` of the app – edits inside the cell, as before 1.1.99).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index |

#### Returns

`boolean`

true for the editor above the cell

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L115)

___

### isOpen

▸ **isOpen**(): `boolean`

True while the editor is open.

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L78)

___

### start

▸ **start**(`rowIndex`, `columnIndex`, `opts?`): `boolean`

Opens the editor on a body cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | display row index |
| `columnIndex` | `number` | model column index |
| `opts?` | `Object` | "enter" with the typed character, or "edit" (F2: caret at the end) |
| `opts.imeStart?` | `boolean` | - |
| `opts.mode?` | [`CellEditMode`](../modules.md#celleditmode) | - |
| `opts.textSelection?` | ``"all"`` \| ``"end"`` | - |
| `opts.typedText?` | `string` | - |

#### Returns

`boolean`

true if the editor is open

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L136)

___

### update

▸ **update**(): `void`

Places the editor over its cell (called after every render pass) – also when the cell scrolled out of view.

#### Returns

`void`

#### Defined in

[src/lib/table/sheet-editing/cell-editor-service.ts:268](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet-editing/cell-editor-service.ts#L268)
