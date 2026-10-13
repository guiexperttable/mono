[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeKeyEvent

# Class: GeKeyEvent

Represents a keyboard event.

## Table of contents

### Constructors

- [constructor](GeKeyEvent.md#constructor)

### Properties

- [originalEvent](GeKeyEvent.md#originalevent)
- [status](GeKeyEvent.md#status)

## Constructors

### constructor

• **new GeKeyEvent**(`status?`, `originalEvent?`): [`GeKeyEvent`](GeKeyEvent.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `status` | ``"up"`` \| ``"down"`` | `"down"` |
| `originalEvent?` | `KeyboardEvent` | `undefined` |

#### Returns

[`GeKeyEvent`](GeKeyEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-key-event.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-key-event.ts#L10)

## Properties

### originalEvent

• `Optional` **originalEvent**: `KeyboardEvent`

#### Defined in

[src/lib/table/data/common/event/ge-key-event.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-key-event.ts#L12)

___

### status

• **status**: ``"up"`` \| ``"down"`` = `"down"`

#### Defined in

[src/lib/table/data/common/event/ge-key-event.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-key-event.ts#L11)
