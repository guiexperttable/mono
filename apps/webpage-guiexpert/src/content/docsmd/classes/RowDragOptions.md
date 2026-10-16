[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowDragOptions

# Class: RowDragOptions

The defaults of [RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).

**`Example`**

```ts
const options = RowDragOptions.create({ managed: false });
options.autoScrollZoneInPx;   // 40
```

**`Since`**

1.1.95

## Implements

- [`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)

## Table of contents

### Constructors

- [constructor](RowDragOptions.md#constructor)

### Properties

- [autoScrollMaxSpeedInPx](RowDragOptions.md#autoscrollmaxspeedinpx)
- [autoScrollZoneInPx](RowDragOptions.md#autoscrollzoneinpx)
- [dragThresholdInPx](RowDragOptions.md#dragthresholdinpx)
- [ghostText](RowDragOptions.md#ghosttext)
- [managed](RowDragOptions.md#managed)
- [multiRow](RowDragOptions.md#multirow)
- [treeDropInside](RowDragOptions.md#treedropinside)

### Methods

- [create](RowDragOptions.md#create)

## Constructors

### constructor

• **new RowDragOptions**(): [`RowDragOptions`](RowDragOptions.md)

#### Returns

[`RowDragOptions`](RowDragOptions.md)

## Properties

### autoScrollMaxSpeedInPx

• **autoScrollMaxSpeedInPx**: `number` = `24`

Maximum auto-scroll speed in px per animation frame (default 24).

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[autoScrollMaxSpeedInPx](../interfaces/RowDragOptionsIf.md#autoscrollmaxspeedinpx)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L19)

___

### autoScrollZoneInPx

• **autoScrollZoneInPx**: `number` = `40`

Height in px of the zone at the top and bottom edge of the body that scrolls automatically (default 40).

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[autoScrollZoneInPx](../interfaces/RowDragOptionsIf.md#autoscrollzoneinpx)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L18)

___

### dragThresholdInPx

• **dragThresholdInPx**: `number` = `4`

Distance in px the pointer has to move before a drag starts (default 4) – below it is a click on the handle.

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[dragThresholdInPx](../interfaces/RowDragOptionsIf.md#dragthresholdinpx)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L17)

___

### ghostText

• `Optional` **ghostText**: (`rows`: `any`[]) => `string` = `undefined`

#### Type declaration

▸ (`rows`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `rows` | `any`[] |

##### Returns

`string`

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[ghostText](../interfaces/RowDragOptionsIf.md#ghosttext)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L20)

___

### managed

• **managed**: `boolean` = `true`

`true` (default): the table moves the rows itself (`AreaModelIf.moveRows`) – only while the table is neither
sorted (a column with sort state asc/desc) nor filtered. `false`: the table only reports the drag
(`onRowDragStart/Move/End`), the app moves the rows (e.g. after the server confirmed), always allowed.

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[managed](../interfaces/RowDragOptionsIf.md#managed)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L14)

___

### multiRow

• **multiRow**: `boolean` = `true`

`true` (default): grabbing a selected row drags all rows with a selection (their order stays).

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[multiRow](../interfaces/RowDragOptionsIf.md#multirow)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L15)

___

### treeDropInside

• **treeDropInside**: `boolean` = `true`

`true` (default): tree – dropping on the middle of a row makes the rows its children.

#### Implementation of

[RowDragOptionsIf](../interfaces/RowDragOptionsIf.md).[treeDropInside](../interfaces/RowDragOptionsIf.md#treedropinside)

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L16)

## Methods

### create

▸ **create**(`options?`): [`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)

The defaults, overridden by the given values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | `Partial`\<[`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)\> | e.g. `tableOptions.rowDragOptions` |

#### Returns

[`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)

complete options

#### Defined in

[src/lib/table/row-drag/row-drag-options.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.ts#L28)
