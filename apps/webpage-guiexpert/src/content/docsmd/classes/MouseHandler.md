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

- [adjustForRowChanges](MouseHandler.md#adjustforrowchanges)
- [isButtonDown](MouseHandler.md#isbuttondown)
- [releaseMouse](MouseHandler.md#releasemouse)

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

[src/lib/table/mouse-handler.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L96)

## Properties

### clickMoveTolerance

• **clickMoveTolerance**: `number` = `4`

A render between mousedown and mouseup replaces the pressed cell, and the browser sends no "click" (both must hit
the same element). The handler then reports the click itself for the pressed cell – if the mouse moved at most
this many pixels (screen coordinates) between mousedown and mouseup. Since 1.1.108.

#### Defined in

[src/lib/table/mouse-handler.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L65)

___

### doubleClickDelay

• **doubleClickDelay**: `number` = `500`

Programmatic clicks (`element.click()`, `event.detail === 0`): two clicks on the same cell within this delay (ms)
count as a double click. Real mouse clicks use the click count of the browser (`event.detail`), i.e. the
double-click speed of the operating system.

#### Defined in

[src/lib/table/mouse-handler.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L56)

___

### geMouseEvent

• `Optional` **geMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L69)

___

### geMouseEventOld

• `Optional` **geMouseEventOld**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L70)

___

### mouseEvent

• `Optional` **mouseEvent**: `MouseEvent`

#### Defined in

[src/lib/table/mouse-handler.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L67)

___

### startMouseEvent

• `Optional` **startMouseEvent**: [`GeMouseEvent`](GeMouseEvent.md)

#### Defined in

[src/lib/table/mouse-handler.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L68)

___

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/mouse-handler.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L97)

## Methods

### adjustForRowChanges

▸ **adjustForRowChanges**(`shift`): `void`

Live data (since 1.1.108): a drag in progress (range selection) keeps its start row when rows were removed at the
start or inserted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`RowIndexShift`](RowIndexShift.md) | how the display indices move |

#### Returns

`void`

#### Defined in

[src/lib/table/mouse-handler.ts:653](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L653)

___

### isButtonDown

▸ **isButtonDown**(): `boolean`

True while the mouse button is held in the table (a click or a drag in progress) – live data does not jump to
the end then (`tableApi.appendRows({ follow: "auto" })`, since 1.1.108).

Since 1.1.119 a press also ends without a mouseup, as soon as the table notices that the button is not held any
more (see [releaseMouse](MouseHandler.md#releasemouse)).

#### Returns

`boolean`

true between mousedown and mouseup

#### Defined in

[src/lib/table/mouse-handler.ts:875](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L875)

___

### releaseMouse

▸ **releaseMouse**(`originalEvent?`): `boolean`

Ends the press without a mouseup ([TableApi.releaseMouse](TableApi.md#releasemouse)): the table is not pressed any more. Nothing is
dropped – a running column resize or move is cancelled like with Escape (old width resp. order, end with type
`"cancel"`), a range selection stays as it is, no click is reported. `onMouseDraggingEnd` is called once if
`onMouseDragging` was (with the last position of the press). Without a press nothing happens.

Called by the table itself as soon as it notices that the button is not held any more: a mouse movement in the
document without the button, `pointercancel`, an HTML5 `dragstart` that is not prevented, the window losing the
focus, the next mousedown of that button.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `originalEvent?` | `Event` | the event that told it (passed on to the column event) |

#### Returns

`boolean`

true if a press was ended

**`Since`**

1.1.119

#### Defined in

[src/lib/table/mouse-handler.ts:617](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/mouse-handler.ts#L617)
