[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeEditEvent

# Class: GeEditEvent

Reported by [EventListenerIf.onEditingChanged](../interfaces/EventListenerIf.md#oneditingchanged): the cell editor opened, its text changed, it committed or
it was cancelled – e.g. to show the input in an own formula bar or to disable buttons while editing.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onEditingChanged = (evt: GeEditEvent) => {
  hint.textContent = evt.type === "start" ? `Editing row ${evt.rowIndex + 1}` : "";
};
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](GeEditEvent.md#constructor)

### Properties

- [columnIndex](GeEditEvent.md#columnindex)
- [input](GeEditEvent.md#input)
- [mode](GeEditEvent.md#mode)
- [rowIndex](GeEditEvent.md#rowindex)
- [type](GeEditEvent.md#type)

## Constructors

### constructor

• **new GeEditEvent**(`type`, `rowIndex`, `columnIndex`, `mode`, `input?`): [`GeEditEvent`](GeEditEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeEditEventType`](../modules.md#geediteventtype) | What happened. |
| `rowIndex` | `number` | Display row index of the edited body cell. |
| `columnIndex` | `number` | Model column index. |
| `mode` | [`CellEditMode`](../modules.md#celleditmode) | "enter" (opened by typing) or "edit" (F2, Enter, double click). |
| `input?` | `string` | The text of the editor (`"input"` and `"commit"`). |

#### Returns

[`GeEditEvent`](GeEditEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L27)

## Properties

### columnIndex

• `Readonly` **columnIndex**: `number`

Model column index.

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L33)

___

### input

• `Optional` `Readonly` **input**: `string`

The text of the editor (`"input"` and `"commit"`).

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L37)

___

### mode

• `Readonly` **mode**: [`CellEditMode`](../modules.md#celleditmode)

"enter" (opened by typing) or "edit" (F2, Enter, double click).

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L35)

___

### rowIndex

• `Readonly` **rowIndex**: `number`

Display row index of the edited body cell.

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L31)

___

### type

• `Readonly` **type**: [`GeEditEventType`](../modules.md#geediteventtype)

What happened.

#### Defined in

[src/lib/table/data/common/event/ge-edit-event.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-edit-event.ts#L29)
