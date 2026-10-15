[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GeStateChangeEvent

# Class: GeStateChangeEvent

The state of a table changed ([EventListenerIf.onStateChanged](../interfaces/EventListenerIf.md#onstatechanged)): a column was resized, moved, hidden,
the table was sorted, scrolled, a node expanded, a row checked or selected … Reported once after the changes
settled ([TableOptionsIf.stateChangedDebounceDelay](../interfaces/TableOptionsIf.md#statechangeddebouncedelay), default 300 ms) and only if a part really changed;
not while the table is built.

**`Example`**

```ts
const listener = new EventAdapter();
listener.onStateChanged = (evt: GeStateChangeEvent) => {
  if (!evt.changedParts.includes("scroll")) {               // e.g. ignore pure scrolling
    void fetch("/api/prefs/orders", { method: "PUT", body: JSON.stringify(evt.state) });
  }
};
```

**`Since`**

1.1.92

## Table of contents

### Constructors

- [constructor](GeStateChangeEvent.md#constructor)

### Properties

- [changedParts](GeStateChangeEvent.md#changedparts)
- [state](GeStateChangeEvent.md#state)

## Constructors

### constructor

• **new GeStateChangeEvent**(`state`, `changedParts`): [`GeStateChangeEvent`](GeStateChangeEvent.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`TableStateIf`](../interfaces/TableStateIf.md) | The whole state of the table now (all parts). |
| `changedParts` | [`TableStatePart`](../modules.md#tablestatepart)[] | The parts that changed since the last event. |

#### Returns

[`GeStateChangeEvent`](GeStateChangeEvent.md)

#### Defined in

[src/lib/table/data/common/event/ge-state-change-event.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-state-change-event.ts#L22)

## Properties

### changedParts

• `Readonly` **changedParts**: [`TableStatePart`](../modules.md#tablestatepart)[]

The parts that changed since the last event.

#### Defined in

[src/lib/table/data/common/event/ge-state-change-event.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-state-change-event.ts#L26)

___

### state

• `Readonly` **state**: [`TableStateIf`](../interfaces/TableStateIf.md)

The whole state of the table now (all parts).

#### Defined in

[src/lib/table/data/common/event/ge-state-change-event.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/ge-state-change-event.ts#L24)
