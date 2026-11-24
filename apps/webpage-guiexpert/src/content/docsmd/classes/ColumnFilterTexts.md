[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterTexts

# Class: ColumnFilterTexts

Default English UI texts of [TableOptionsIf.columnFilterTexts](../interfaces/TableOptionsIf.md#columnfiltertexts).

**`Example`**

```ts
const texts = ColumnFilterTexts.create({ ok: "Übernehmen", cancel: "Abbrechen" });
```

**`Since`**

1.1.114

## Implements

- [`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)

## Table of contents

### Constructors

- [constructor](ColumnFilterTexts.md#constructor)

### Properties

- [andLabel](ColumnFilterTexts.md#andlabel)
- [blanks](ColumnFilterTexts.md#blanks)
- [cancel](ColumnFilterTexts.md#cancel)
- [clear](ColumnFilterTexts.md#clear)
- [columnsTitle](ColumnFilterTexts.md#columnstitle)
- [noValues](ColumnFilterTexts.md#novalues)
- [ok](ColumnFilterTexts.md#ok)
- [operators](ColumnFilterTexts.md#operators)
- [searchColumnsPlaceholder](ColumnFilterTexts.md#searchcolumnsplaceholder)
- [searchPlaceholder](ColumnFilterTexts.md#searchplaceholder)
- [searchValuesPlaceholder](ColumnFilterTexts.md#searchvaluesplaceholder)
- [selectAll](ColumnFilterTexts.md#selectall)

### Methods

- [selectedValuesCount](ColumnFilterTexts.md#selectedvaluescount)
- [valuesTruncated](ColumnFilterTexts.md#valuestruncated)
- [create](ColumnFilterTexts.md#create)

## Constructors

### constructor

• **new ColumnFilterTexts**(): [`ColumnFilterTexts`](ColumnFilterTexts.md)

#### Returns

[`ColumnFilterTexts`](ColumnFilterTexts.md)

## Properties

### andLabel

• **andLabel**: `string` = `"and"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[andLabel](../interfaces/ColumnFilterTextsIf.md#andlabel)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L127)

___

### blanks

• **blanks**: `string` = `"(Blanks)"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[blanks](../interfaces/ColumnFilterTextsIf.md#blanks)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L123)

___

### cancel

• **cancel**: `string` = `"Cancel"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[cancel](../interfaces/ColumnFilterTextsIf.md#cancel)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L125)

___

### clear

• **clear**: `string` = `"Clear"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[clear](../interfaces/ColumnFilterTextsIf.md#clear)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L126)

___

### columnsTitle

• **columnsTitle**: `string` = `"Columns"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[columnsTitle](../interfaces/ColumnFilterTextsIf.md#columnstitle)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L129)

___

### noValues

• **noValues**: `string` = `"No values"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[noValues](../interfaces/ColumnFilterTextsIf.md#novalues)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L128)

___

### ok

• **ok**: `string` = `"OK"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[ok](../interfaces/ColumnFilterTextsIf.md#ok)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L124)

___

### operators

• **operators**: `Record`\<[`ColumnFilterOperator`](../modules.md#columnfilteroperator), `string`\>

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[operators](../interfaces/ColumnFilterTextsIf.md#operators)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L131)

___

### searchColumnsPlaceholder

• **searchColumnsPlaceholder**: `string` = `"Search columns…"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[searchColumnsPlaceholder](../interfaces/ColumnFilterTextsIf.md#searchcolumnsplaceholder)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L130)

___

### searchPlaceholder

• **searchPlaceholder**: `string` = `"Search"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[searchPlaceholder](../interfaces/ColumnFilterTextsIf.md#searchplaceholder)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L120)

___

### searchValuesPlaceholder

• **searchValuesPlaceholder**: `string` = `"Search values…"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[searchValuesPlaceholder](../interfaces/ColumnFilterTextsIf.md#searchvaluesplaceholder)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:121](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L121)

___

### selectAll

• **selectAll**: `string` = `"(Select all)"`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[selectAll](../interfaces/ColumnFilterTextsIf.md#selectall)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L122)

## Methods

### selectedValuesCount

▸ **selectedValuesCount**(`count`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `count` | `number` |

#### Returns

`string`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[selectedValuesCount](../interfaces/ColumnFilterTextsIf.md#selectedvaluescount)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L146)

___

### valuesTruncated

▸ **valuesTruncated**(`max`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `max` | `number` |

#### Returns

`string`

#### Implementation of

[ColumnFilterTextsIf](../interfaces/ColumnFilterTextsIf.md).[valuesTruncated](../interfaces/ColumnFilterTextsIf.md#valuestruncated)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L150)

___

### create

▸ **create**(`partial?`): [`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `partial?` | `Partial`\<[`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)\> |

#### Returns

[`ColumnFilterTextsIf`](../interfaces/ColumnFilterTextsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:154](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L154)
