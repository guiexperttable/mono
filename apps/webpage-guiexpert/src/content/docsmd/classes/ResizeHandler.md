[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ResizeHandler

# Class: ResizeHandler

Class representing a ResizeHandler.

**`Classdesc`**

Handles resizing of elements and calls a callback function on resize. These calls will be debounced with 500 ms.

## Table of contents

### Constructors

- [constructor](ResizeHandler.md#constructor)

### Properties

- [debounceDelay](ResizeHandler.md#debouncedelay)
- [tableScope](ResizeHandler.md#tablescope)

### Methods

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

[src/lib/table/resize-handler.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L16)

## Properties

### debounceDelay

• `Protected` **debounceDelay**: `number` = `500`

#### Defined in

[src/lib/table/resize-handler.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L18)

___

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/resize-handler.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L17)

## Methods

### disconnect

▸ **disconnect**(): `void`

Stops observing the host element. Called by [TableScope.destroy](TableScope.md#destroy).

#### Returns

`void`

#### Defined in

[src/lib/table/resize-handler.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/resize-handler.ts#L27)
