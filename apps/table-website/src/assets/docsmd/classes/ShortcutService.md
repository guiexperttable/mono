[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ShortcutService

# Class: ShortcutService

Represents a service for managing shortcuts and triggering actions based on keyboard events.

## Table of contents

### Constructors

- [constructor](ShortcutService.md#constructor)

### Properties

- [tableScope](ShortcutService.md#tablescope)

### Methods

- [addListener](ShortcutService.md#addlistener)
- [getShortcutActionMapping](ShortcutService.md#getshortcutactionmapping)
- [init](ShortcutService.md#init)

## Constructors

### constructor

• **new ShortcutService**(`tableScope`): [`ShortcutService`](ShortcutService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`ShortcutService`](ShortcutService.md)

#### Defined in

[src/lib/table/action/shortcut.service.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/shortcut.service.ts#L25)

## Properties

### tableScope

• `Protected` **tableScope**: [`TableScope`](TableScope.md)

#### Defined in

[src/lib/table/action/shortcut.service.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/shortcut.service.ts#L26)

## Methods

### addListener

▸ **addListener**(`listener`): `void`

Adds a listener to the list of listeners.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `listener` | [`OnActionTriggeredIf`](../interfaces/OnActionTriggeredIf.md) | The listener to be added. |

#### Returns

`void`

#### Defined in

[src/lib/table/action/shortcut.service.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/shortcut.service.ts#L39)

___

### getShortcutActionMapping

▸ **getShortcutActionMapping**(): [`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

Retrieves the shortcut action mapping object.

#### Returns

[`ShortcutActionIdMapping`](../modules.md#shortcutactionidmapping)

- The shortcut action mapping object.

#### Defined in

[src/lib/table/action/shortcut.service.ts:221](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/shortcut.service.ts#L221)

___

### init

▸ **init**(): `void`

Initializes the ShortcutService by assigning shortcut action id mappings based on the current operating system.
Also adds key down event listener to the table host element.

#### Returns

`void`

#### Defined in

[src/lib/table/action/shortcut.service.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/action/shortcut.service.ts#L49)
