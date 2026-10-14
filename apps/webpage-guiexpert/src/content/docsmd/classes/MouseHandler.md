[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MouseHandler

# Class: MouseHandler

Class representing a MouseHandler.

## Table of contents

### Constructors

- [constructor](MouseHandler.md#constructor)

### Properties

- [doubleClickDelay](MouseHandler.md#doubleclickdelay)
- [geMouseEvent](MouseHandler.md#gemouseevent)
- [geMouseEventOld](MouseHandler.md#gemouseeventold)
- [mouseEvent](MouseHandler.md#mouseevent)
- [startMouseEvent](MouseHandler.md#startmouseevent)
- [tableScope](MouseHandler.md#tablescope)

## Constructors

### constructor

• **new MouseHandler**(`tableScope`): [`MouseHandler`](MouseHandler.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`MouseHandler`](MouseHandler.md)

#### Defined in

[src/lib/table/mouse-handler.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L39)

## Properties

### doubleClickDelay

• **doubleClickDelay**: `number` = `500`

Programmatic clicks (`element.click()`, `event.detail === 0`): two clicks on the same cell within this delay (ms)
count as a double click. Real mouse clicks use the click count of the browser (`event.detail`), i.e. the
double-click speed of the operating system.

#### Defined in

[src/lib/table/mouse-handler.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L25)

___

### geMouseEvent

• `Optional` **geMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L29)

___

### geMouseEventOld

• `Optional` **geMouseEventOld**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L30)

___

### mouseEvent

• `Optional` **mouseEvent**: `MouseEvent`

#### Defined in

[src/lib/table/mouse-handler.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L27)

___

### startMouseEvent

• `Optional` **startMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L28)

___

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/mouse-handler.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L40)
