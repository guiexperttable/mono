[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeScrollEvent

# Class: GeScrollEvent

Scroll event containing position and size information.

## Table of contents

### Constructors

- [constructor](GeScrollEvent.md#constructor)

### Properties

- [clientHeight](GeScrollEvent.md#clientheight)
- [clientWidth](GeScrollEvent.md#clientwidth)
- [scrollFactorX](GeScrollEvent.md#scrollfactorx)
- [scrollFactorY](GeScrollEvent.md#scrollfactory)
- [scrollHeight](GeScrollEvent.md#scrollheight)
- [scrollLeft](GeScrollEvent.md#scrollleft)
- [scrollTop](GeScrollEvent.md#scrolltop)
- [scrollWidth](GeScrollEvent.md#scrollwidth)

## Constructors

### constructor

• **new GeScrollEvent**(`scrollTop`, `scrollLeft`, `scrollHeight`, `scrollWidth`, `clientHeight`, `clientWidth`, `scrollFactorY`, `scrollFactorX`): [`GeScrollEvent`](GeScrollEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `scrollTop` | `number` | Vertical scroll position of the viewport in px. |
| `scrollLeft` | `number` | Horizontal scroll position of the viewport in px. |
| `scrollHeight` | `number` | Height of the whole (virtual) content in px. |
| `scrollWidth` | `number` | Width of the whole content in px. |
| `clientHeight` | `number` | Visible height in px. |
| `clientWidth` | `number` | Visible width in px. |
| `scrollFactorY` | `number` | Vertical position as factor 0 (top) … 1 (bottom). |
| `scrollFactorX` | `number` | Horizontal position as factor 0 (left) … 1 (right). |

#### Returns

[`GeScrollEvent`](GeScrollEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L8)

## Properties

### clientHeight

• **clientHeight**: `number`

Visible height in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L18)

___

### clientWidth

• **clientWidth**: `number`

Visible width in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L20)

___

### scrollFactorX

• **scrollFactorX**: `number`

Horizontal position as factor 0 (left) … 1 (right).

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L24)

___

### scrollFactorY

• **scrollFactorY**: `number`

Vertical position as factor 0 (top) … 1 (bottom).

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L22)

___

### scrollHeight

• **scrollHeight**: `number`

Height of the whole (virtual) content in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L14)

___

### scrollLeft

• **scrollLeft**: `number`

Horizontal scroll position of the viewport in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L12)

___

### scrollTop

• **scrollTop**: `number`

Vertical scroll position of the viewport in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L10)

___

### scrollWidth

• **scrollWidth**: `number`

Width of the whole content in px.

#### Defined in

[src/lib/table/data/common/event/ge-scroll-event.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-scroll-event.ts#L16)
