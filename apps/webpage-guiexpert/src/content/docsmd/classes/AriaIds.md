[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AriaIds

# Class: AriaIds

Builds the element IDs the table needs for ARIA references (`aria-activedescendant`, `aria-owns`).

All IDs of one table start with the same prefix: `ge-` + the `id` of the host element, or `ge-t<n>`
(a running number) if the host has no id. Several tables on one page therefore never clash, and with a host id
the IDs stay the same when the table is rebuilt.

Only the focused cell carries an ID (see [cell](AriaIds.md#cell)); the other cells have none (performance).

**`Example`**

```ts
const ids = new AriaIds(AriaIds.createPrefix("orders"));
ids.cell("body", 5, 2);           // "ge-orders-body-r5-c2"
ids.rowGroup("header", "center"); // "ge-orders-rg-header-center"
ids.liveRegion();                 // "ge-orders-live"
```

**`Since`**

1.1.91

## Table of contents

### Constructors

- [constructor](AriaIds.md#constructor)

### Properties

- [prefix](AriaIds.md#prefix)

### Methods

- [cell](AriaIds.md#cell)
- [liveRegion](AriaIds.md#liveregion)
- [rowGroup](AriaIds.md#rowgroup)
- [createPrefix](AriaIds.md#createprefix)

## Constructors

### constructor

• **new AriaIds**(`prefix`): [`AriaIds`](AriaIds.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `prefix` | `string` |

#### Returns

[`AriaIds`](AriaIds.md)

#### Defined in

[src/lib/table/aria/aria-ids.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L26)

## Properties

### prefix

• `Readonly` **prefix**: `string`

#### Defined in

[src/lib/table/aria/aria-ids.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L27)

## Methods

### cell

▸ **cell**(`area`, `rowIndex`, `columnIndex`): `string`

The ID of a cell (set on the focused cell, referenced by `aria-activedescendant`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) | header, body or footer |
| `rowIndex` | `number` | row index in the area |
| `columnIndex` | `number` | model column index (west + center + east) |

#### Returns

`string`

e.g. `"ge-t1-body-r5-c2"`

#### Defined in

[src/lib/table/aria/aria-ids.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L54)

___

### liveRegion

▸ **liveRegion**(): `string`

The ID of the live region (the element that speaks announcements, see [LiveAnnouncer](LiveAnnouncer.md)).

#### Returns

`string`

e.g. `"ge-t1-live"`

#### Defined in

[src/lib/table/aria/aria-ids.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L74)

___

### rowGroup

▸ **rowGroup**(`area`, `side`): `string`

The ID of one of the nine row groups (`role="rowgroup"`), referenced by `aria-owns` of the host.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) | header, body or footer |
| `side` | [`SideIdent`](../modules.md#sideident) | west, center or east |

#### Returns

`string`

e.g. `"ge-t1-rg-body-center"`

#### Defined in

[src/lib/table/aria/aria-ids.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L65)

___

### createPrefix

▸ **createPrefix**(`hostId?`): `string`

The ID prefix of a table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `hostId?` | `string` | the `id` of the host element (may be empty) |

#### Returns

`string`

`"ge-" + hostId`, or `"ge-t" + n` with a number that is unique on the page

#### Defined in

[src/lib/table/aria/aria-ids.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-ids.ts#L37)
