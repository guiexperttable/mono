[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FillHandleService

# Class: FillHandleService

The fill handle of one table (`tableScope.fillHandleService`): the square at the bottom right corner of the selected
range, the pointer drag with preview and auto-scroll, Escape. The values come from [TableScope.fillRange](TableScope.md#fillrange).
Use [TableApi.fillRange](TableApi.md#fillrange), [TableApi.isFilling](TableApi.md#isfilling) and [TableApi.cancelFill](TableApi.md#cancelfill) instead.

Pointer Events (mouse, touch, pen) only on the handle; its `pointerdown` is prevented, so the mouse handler of the
table (range selection, column drag) never sees it.

**`Since`**

1.1.96

## Table of contents

### Constructors

- [constructor](FillHandleService.md#constructor)

### Methods

- [cancel](FillHandleService.md#cancel)
- [destroy](FillHandleService.md#destroy)
- [isFilling](FillHandleService.md#isfilling)
- [update](FillHandleService.md#update)

## Constructors

### constructor

• **new FillHandleService**(`tableScope`): [`FillHandleService`](FillHandleService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`FillHandleService`](FillHandleService.md)

#### Defined in

[src/lib/table/fill/fill-handle-service.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-service.ts#L53)

## Methods

### cancel

▸ **cancel**(): `void`

Cancels a running fill (Escape, `pointercancel`, [TableApi.cancelFill](TableApi.md#cancelfill)): nothing is changed.

#### Returns

`void`

#### Defined in

[src/lib/table/fill/fill-handle-service.ts:355](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-service.ts#L355)

___

### destroy

▸ **destroy**(): `void`

Releases everything (TableScope.destroy).

#### Returns

`void`

#### Defined in

[src/lib/table/fill/fill-handle-service.ts:378](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-service.ts#L378)

___

### isFilling

▸ **isFilling**(): `boolean`

true while the handle is dragged.

#### Returns

`boolean`

#### Defined in

[src/lib/table/fill/fill-handle-service.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-service.ts#L71)

___

### update

▸ **update**(): `void`

Places the handle at the bottom right corner of the last selected range (called after every render pass) – or
hides it: no fill handle option, no range, the corner scrolled out, an open editor, a blocking overlay.

#### Returns

`void`

#### Defined in

[src/lib/table/fill/fill-handle-service.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-handle-service.ts#L79)
