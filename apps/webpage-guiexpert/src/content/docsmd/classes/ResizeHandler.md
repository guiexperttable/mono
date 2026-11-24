[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ResizeHandler

# Class: ResizeHandler

Class representing a ResizeHandler.

**`Classdesc`**

Handles resizing of the host element and calls `TableScope.recalcColumnWidths` – debounced by
`resizeEventDebounceDelay` (500 ms). A cover grid that fills its width (`coverGridFill`, since 1.1.117) takes the
new size over at once: in the `ResizeObserver` callback (after the layout, before the paint – the same frame, at most
one callback and so one render per frame); a pending debounced call is dropped.

## Table of contents

### Constructors

- [constructor](ResizeHandler.md#constructor)

### Properties

- [debounceDelay](ResizeHandler.md#debouncedelay)
- [tableScope](ResizeHandler.md#tablescope)

### Methods

- [cancelPending](ResizeHandler.md#cancelpending)
- [disconnect](ResizeHandler.md#disconnect)

## Constructors

### constructor

• **new ResizeHandler**(`tableScope`, `debounceDelay?`): [`ResizeHandler`](ResizeHandler.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) | `undefined` |
| `debounceDelay` | `number` | `500` |

#### Returns

[`ResizeHandler`](ResizeHandler.md)

#### Defined in

[src/lib/table/resize-handler.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L19)

## Properties

### debounceDelay

• `Protected` **debounceDelay**: `number` = `500`

#### Defined in

[src/lib/table/resize-handler.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L21)

___

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/resize-handler.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L20)

## Methods

### cancelPending

▸ **cancelPending**(): `void`

Drops a debounced call that has not run yet (e.g. a render that takes the width over anyway).

#### Returns

`void`

#### Defined in

[src/lib/table/resize-handler.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L52)

___

### disconnect

▸ **disconnect**(): `void`

Stops observing the host element. Called by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

#### Defined in

[src/lib/table/resize-handler.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L30)
