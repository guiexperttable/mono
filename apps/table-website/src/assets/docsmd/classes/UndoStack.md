[GuiExpert Table API](../README.md) / [Exports](../modules.md) / UndoStack

# Class: UndoStack\<T\>

The undo and redo stacks of steps (DOM-free): a new step clears the redo stack; at most `maxSteps` steps and
`maxCells` cells (over both stacks) are kept – the oldest go first; a single step with more than `maxCells` cells
empties the history and is not kept.

**`Example`**

```ts
const stack = new UndoStack<{ cellCount: number; label: string }>(100, 1_000_000);
stack.push({ cellCount: 1, label: "Edit" });
stack.undo()?.label;   // "Edit" – now on the redo stack
stack.canRedo();       // true
```

**`Since`**

1.1.99

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

## Table of contents

### Constructors

- [constructor](UndoStack.md#constructor)

### Methods

- [canRedo](UndoStack.md#canredo)
- [canUndo](UndoStack.md#canundo)
- [cellCount](UndoStack.md#cellcount)
- [clear](UndoStack.md#clear)
- [peekRedo](UndoStack.md#peekredo)
- [peekUndo](UndoStack.md#peekundo)
- [push](UndoStack.md#push)
- [redo](UndoStack.md#redo)
- [size](UndoStack.md#size)
- [undo](UndoStack.md#undo)

## Constructors

### constructor

• **new UndoStack**\<`T`\>(`maxSteps`, `maxCells`): [`UndoStack`](UndoStack.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxSteps` | `number` | steps kept on the undo stack |
| `maxCells` | `number` | cells kept over both stacks |

#### Returns

[`UndoStack`](UndoStack.md)\<`T`\>

#### Defined in

[src/lib/table/undo/undo-stack.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L25)

## Methods

### canRedo

▸ **canRedo**(): `boolean`

#### Returns

`boolean`

true if there is a step to redo

#### Defined in

[src/lib/table/undo/undo-stack.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L86)

___

### canUndo

▸ **canUndo**(): `boolean`

#### Returns

`boolean`

true if there is a step to undo

#### Defined in

[src/lib/table/undo/undo-stack.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L81)

___

### cellCount

▸ **cellCount**(): `number`

#### Returns

`number`

cells kept over both stacks

#### Defined in

[src/lib/table/undo/undo-stack.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L96)

___

### clear

▸ **clear**(): `void`

Empties both stacks.

#### Returns

`void`

#### Defined in

[src/lib/table/undo/undo-stack.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L101)

___

### peekRedo

▸ **peekRedo**(): `undefined` \| `T`

#### Returns

`undefined` \| `T`

the step the next redo takes

#### Defined in

[src/lib/table/undo/undo-stack.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L76)

___

### peekUndo

▸ **peekUndo**(): `undefined` \| `T`

#### Returns

`undefined` \| `T`

the step the next undo takes

#### Defined in

[src/lib/table/undo/undo-stack.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L71)

___

### push

▸ **push**(`step`): `boolean`

Adds a step and clears the redo stack.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `step` | `T` | the new step |

#### Returns

`boolean`

false if the step was too large (the history is empty now)

#### Defined in

[src/lib/table/undo/undo-stack.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L34)

___

### redo

▸ **redo**(): `undefined` \| `T`

Takes the last undone step for redo (it moves back to the undo stack).

#### Returns

`undefined` \| `T`

the step, `undefined` if there is none

#### Defined in

[src/lib/table/undo/undo-stack.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L64)

___

### size

▸ **size**(): `number`

#### Returns

`number`

steps on the undo stack

#### Defined in

[src/lib/table/undo/undo-stack.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L91)

___

### undo

▸ **undo**(): `undefined` \| `T`

Takes the last step for undo (it moves to the redo stack).

#### Returns

`undefined` \| `T`

the step, `undefined` if there is none

#### Defined in

[src/lib/table/undo/undo-stack.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/undo/undo-stack.ts#L53)
