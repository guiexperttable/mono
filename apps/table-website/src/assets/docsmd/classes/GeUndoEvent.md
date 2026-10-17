[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeUndoEvent

# Class: GeUndoEvent

The undo history changed ([EventListenerIf.onUndoStackChanged](../interfaces/EventListenerIf.md#onundostackchanged), wrapper event `undoStackChanged`): enough to
enable and label own buttons ("Undo Paste").

**`Example`**

```ts
const listener = new EventAdapter();
listener.onUndoStackChanged = (evt: GeUndoEvent) => {
  undoButton.disabled = !evt.canUndo;
  undoButton.title = evt.undoLabel ? `Undo ${evt.undoLabel}` : "Undo";
};
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](GeUndoEvent.md#constructor)

### Properties

- [canRedo](GeUndoEvent.md#canredo)
- [canUndo](GeUndoEvent.md#canundo)
- [redoLabel](GeUndoEvent.md#redolabel)
- [size](GeUndoEvent.md#size)
- [undoLabel](GeUndoEvent.md#undolabel)

## Constructors

### constructor

• **new GeUndoEvent**(`canUndo`, `canRedo`, `undoLabel`, `redoLabel`, `size`): [`GeUndoEvent`](GeUndoEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `canUndo` | `boolean` | a step can be undone |
| `canRedo` | `boolean` | a step can be redone |
| `undoLabel` | `undefined` \| `string` | the label of the step undo takes (`"Edit"`, `"Paste"` …) |
| `redoLabel` | `undefined` \| `string` | the label of the step redo takes |
| `size` | `number` | steps on the undo stack |

#### Returns

[`GeUndoEvent`](GeUndoEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L23)

## Properties

### canRedo

• `Readonly` **canRedo**: `boolean`

a step can be redone

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L25)

___

### canUndo

• `Readonly` **canUndo**: `boolean`

a step can be undone

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L24)

___

### redoLabel

• `Readonly` **redoLabel**: `undefined` \| `string`

the label of the step redo takes

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L27)

___

### size

• `Readonly` **size**: `number`

steps on the undo stack

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L28)

___

### undoLabel

• `Readonly` **undoLabel**: `undefined` \| `string`

the label of the step undo takes (`"Edit"`, `"Paste"` …)

#### Defined in

[src/lib/table/data/common/event/ge-undo-event.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-undo-event.ts#L26)
