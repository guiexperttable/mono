[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MouseHandler

# Class: MouseHandler

Class representing a MouseHandler.

## Table of contents

### Constructors

- [constructor](MouseHandler.md#constructor)

### Properties

- [clickMoveTolerance](MouseHandler.md#clickmovetolerance)
- [doubleClickDelay](MouseHandler.md#doubleclickdelay)
- [geMouseEvent](MouseHandler.md#gemouseevent)
- [geMouseEventOld](MouseHandler.md#gemouseeventold)
- [mouseEvent](MouseHandler.md#mouseevent)
- [startMouseEvent](MouseHandler.md#startmouseevent)
- [tableScope](MouseHandler.md#tablescope)

### Methods

- [isButtonDown](MouseHandler.md#isbuttondown)

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

[src/lib/table/mouse-handler.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L89)

## Properties

### clickMoveTolerance

• **clickMoveTolerance**: `number` = `4`

A render between mousedown and mouseup replaces the pressed cell, and the browser sends no "click" (both must hit
the same element). The handler then reports the click itself for the pressed cell – if the mouse moved at most
this many pixels (screen coordinates) between mousedown and mouseup. Since 1.1.108.

#### Defined in

[src/lib/table/mouse-handler.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L64)

___

### doubleClickDelay

• **doubleClickDelay**: `number` = `500`

Programmatic clicks (`element.click()`, `event.detail === 0`): two clicks on the same cell within this delay (ms)
count as a double click. Real mouse clicks use the click count of the browser (`event.detail`), i.e. the
double-click speed of the operating system.

#### Defined in

[src/lib/table/mouse-handler.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L55)

___

### geMouseEvent

• `Optional` **geMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L68)

___

### geMouseEventOld

• `Optional` **geMouseEventOld**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L69)

___

### mouseEvent

• `Optional` **mouseEvent**: `MouseEvent`

#### Defined in

[src/lib/table/mouse-handler.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L66)

___

### startMouseEvent

• `Optional` **startMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L67)

___

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/mouse-handler.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L90)

## Methods

### isButtonDown

▸ **isButtonDown**(): `boolean`

True while the mouse button is held in the table (a click or a drag in progress) – live data does not jump to
the end then (`tableApi.appendRows({ follow: "auto" })`, since 1.1.108).

#### Returns

`boolean`

true between mousedown and mouseup

#### Defined in

[src/lib/table/mouse-handler.ts:606](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L606)
