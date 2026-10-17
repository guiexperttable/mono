[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SheetDate

# Class: SheetDate

A date in a cell formula: the Excel serial number (1900 date system: 1 = 1900-01-01, with Excel's 1900-02-29;
the fraction is the time of day). It counts as a number (arithmetic, `ISNUMBER`) and stays a date through `=A2`,
`IF`, lookups and date ± number; `MIN`/`MAX` and other arithmetic give a number (like Excel's values). The table
shows it as `Date`.

**`Example`**

```ts
dateToSerial(new Date(2026, 9, 16));   // 46311
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](SheetDate.md#constructor)

### Properties

- [serial](SheetDate.md#serial)
- [type](SheetDate.md#type)

### Methods

- [toDate](SheetDate.md#todate)

## Constructors

### constructor

• **new SheetDate**(`serial`): [`SheetDate`](SheetDate.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serial` | `number` | the Excel serial number |

#### Returns

[`SheetDate`](SheetDate.md)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L20)

## Properties

### serial

• `Readonly` **serial**: `number`

the Excel serial number

#### Defined in

[src/lib/table/sheet/sheet-values.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L20)

___

### type

• `Readonly` **type**: ``"SheetDate"``

Marker (works across copies of the core).

#### Defined in

[src/lib/table/sheet/sheet-values.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L17)

## Methods

### toDate

▸ **toDate**(): `Date`

#### Returns

`Date`

the date (local time)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L24)
