[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DefaultRowHeights

# Class: DefaultRowHeights

Row heights of header, body and footer in px – default 34 each. Used in [TableOptionsIf.defaultRowHeights](../interfaces/TableOptionsIf.md#defaultrowheights)
and [CreateTableModelPara.defaultRowHeights](../interfaces/CreateTableModelPara.md#defaultrowheights).

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), defaultRowHeights: new DefaultRowHeights(40, 30, 36) };
```

## Implements

- [`DefaultRowHeightsIf`](../interfaces/DefaultRowHeightsIf.md)

## Table of contents

### Constructors

- [constructor](DefaultRowHeights.md#constructor)

### Properties

- [body](DefaultRowHeights.md#body)
- [footer](DefaultRowHeights.md#footer)
- [header](DefaultRowHeights.md#header)

## Constructors

### constructor

• **new DefaultRowHeights**(`header?`, `body?`, `footer?`): [`DefaultRowHeights`](DefaultRowHeights.md)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `header` | `number` | `34` | Height of header rows in px. |
| `body` | `number` | `34` | Height of body rows in px. |
| `footer` | `number` | `34` | Height of footer rows in px. |

#### Returns

[`DefaultRowHeights`](DefaultRowHeights.md)

#### Defined in

[src/lib/table/data/options/default-row-heights.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/default-row-heights.ts#L13)

## Properties

### body

• **body**: `number` = `34`

Height of body rows in px.

#### Implementation of

[DefaultRowHeightsIf](../interfaces/DefaultRowHeightsIf.md).[body](../interfaces/DefaultRowHeightsIf.md#body)

#### Defined in

[src/lib/table/data/options/default-row-heights.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/default-row-heights.ts#L17)

___

### footer

• **footer**: `number` = `34`

Height of footer rows in px.

#### Implementation of

[DefaultRowHeightsIf](../interfaces/DefaultRowHeightsIf.md).[footer](../interfaces/DefaultRowHeightsIf.md#footer)

#### Defined in

[src/lib/table/data/options/default-row-heights.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/default-row-heights.ts#L19)

___

### header

• **header**: `number` = `34`

Height of header rows in px.

#### Implementation of

[DefaultRowHeightsIf](../interfaces/DefaultRowHeightsIf.md).[header](../interfaces/DefaultRowHeightsIf.md#header)

#### Defined in

[src/lib/table/data/options/default-row-heights.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/default-row-heights.ts#L15)
