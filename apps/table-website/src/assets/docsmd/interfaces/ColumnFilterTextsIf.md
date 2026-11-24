[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterTextsIf

# Interface: ColumnFilterTextsIf

Localizable UI labels of the filter row, filter menu and column chooser ([TableOptionsIf.columnFilterTexts](TableOptionsIf.md#columnfiltertexts)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  columnFilterTexts: { searchPlaceholder: "Suchen", ok: "Übernehmen", cancel: "Abbrechen", clear: "Zurücksetzen" }
};
```

**`Since`**

1.1.114

## Implemented by

- [`ColumnFilterTexts`](../classes/ColumnFilterTexts.md)

## Table of contents

### Properties

- [andLabel](ColumnFilterTextsIf.md#andlabel)
- [blanks](ColumnFilterTextsIf.md#blanks)
- [cancel](ColumnFilterTextsIf.md#cancel)
- [clear](ColumnFilterTextsIf.md#clear)
- [columnsTitle](ColumnFilterTextsIf.md#columnstitle)
- [noValues](ColumnFilterTextsIf.md#novalues)
- [ok](ColumnFilterTextsIf.md#ok)
- [operators](ColumnFilterTextsIf.md#operators)
- [searchColumnsPlaceholder](ColumnFilterTextsIf.md#searchcolumnsplaceholder)
- [searchPlaceholder](ColumnFilterTextsIf.md#searchplaceholder)
- [searchValuesPlaceholder](ColumnFilterTextsIf.md#searchvaluesplaceholder)
- [selectAll](ColumnFilterTextsIf.md#selectall)
- [selectedValuesCount](ColumnFilterTextsIf.md#selectedvaluescount)
- [valuesTruncated](ColumnFilterTextsIf.md#valuestruncated)

## Properties

### andLabel

• **andLabel**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L174)

___

### blanks

• **blanks**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:170](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L170)

___

### cancel

• **cancel**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:172](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L172)

___

### clear

• **clear**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:173](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L173)

___

### columnsTitle

• **columnsTitle**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L178)

___

### noValues

• **noValues**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:177](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L177)

___

### ok

• **ok**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L171)

___

### operators

• **operators**: `Record`\<[`ColumnFilterOperator`](../modules.md#columnfilteroperator), `string`\>

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L180)

___

### searchColumnsPlaceholder

• **searchColumnsPlaceholder**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:179](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L179)

___

### searchPlaceholder

• **searchPlaceholder**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:167](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L167)

___

### searchValuesPlaceholder

• **searchValuesPlaceholder**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L168)

___

### selectAll

• **selectAll**: `string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:169](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L169)

___

### selectedValuesCount

• **selectedValuesCount**: (`count`: `number`) => `string`

#### Type declaration

▸ (`count`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `count` | `number` |

##### Returns

`string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:175](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L175)

___

### valuesTruncated

• **valuesTruncated**: (`max`: `number`) => `string`

#### Type declaration

▸ (`max`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `max` | `number` |

##### Returns

`string`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L176)
