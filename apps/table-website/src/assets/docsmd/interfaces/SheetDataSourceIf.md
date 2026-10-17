[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SheetDataSourceIf

# Interface: SheetDataSourceIf

The data a [SheetEngine](../classes/SheetEngine.md) computes on: inputs by **physical** row and column (0-based) – values or formula texts
(`"=B2*C2"`). The table has adapters for its models; `SheetEngine.fromArrays` uses a 2-D array.

**`Example`**

```ts
const source: SheetDataSourceIf = {
  getRowCount: () => data.length,
  getColumnCount: () => 4,
  getInput: (row, col) => data[row][col],
};
```

**`Since`**

1.1.99

## Table of contents

### Methods

- [forEachInput](SheetDataSourceIf.md#foreachinput)
- [getColumnCount](SheetDataSourceIf.md#getcolumncount)
- [getFieldColumn](SheetDataSourceIf.md#getfieldcolumn)
- [getInput](SheetDataSourceIf.md#getinput)
- [getRowCount](SheetDataSourceIf.md#getrowcount)
- [isFormulaColumn](SheetDataSourceIf.md#isformulacolumn)

## Methods

### forEachInput

▸ **forEachInput**(`fn`): `void`

Optional, for sparse data (a sheet with a million empty rows): calls `fn` for every cell that may hold an input –
`rebuild()` then reads only these instead of rows × columns.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`row`: `number`, `col`: `number`, `input`: `unknown`) => `void` |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L38)

___

### getColumnCount

▸ **getColumnCount**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L27)

___

### getFieldColumn

▸ **getFieldColumn**(`field`): `number`

The column of a data field for `[field]` in a cell formula, -1 if it is none.

#### Parameters

| Name | Type |
| :------ | :------ |
| `field` | `string` |

#### Returns

`number`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L33)

___

### getInput

▸ **getInput**(`row`, `col`): `unknown`

The input of a cell: a value or a formula text with `=`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `number` |
| `col` | `number` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L29)

___

### getRowCount

▸ **getRowCount**(): `number`

#### Returns

`number`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L26)

___

### isFormulaColumn

▸ **isFormulaColumn**(`col`): `boolean`

False for a column whose `=…` texts are plain text (`ColumnDef.cellFormulas: false`). Default: true.

#### Parameters

| Name | Type |
| :------ | :------ |
| `col` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L31)
