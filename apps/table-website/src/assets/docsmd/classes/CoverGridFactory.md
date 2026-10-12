[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridFactory

# Class: CoverGridFactory

## Table of contents

### Constructors

- [constructor](CoverGridFactory.md#constructor)

### Methods

- [createCoverGridModel](CoverGridFactory.md#createcovergridmodel)
- [createCoverGrisDefaultOptions](CoverGridFactory.md#createcovergrisdefaultoptions)

## Constructors

### constructor

• **new CoverGridFactory**(): [`CoverGridFactory`](CoverGridFactory.md)

#### Returns

[`CoverGridFactory`](CoverGridFactory.md)

## Methods

### createCoverGridModel

▸ **createCoverGridModel**\<`T`\>(`items`, `cellRenderer`, `coverWidth?`, `coverHeight?`, `width?`, `firstRowPaddingTop?`): [`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `items` | `T`[] | `undefined` |
| `cellRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | `undefined` |
| `coverWidth` | `number` | `200` |
| `coverHeight` | `number` | `300` |
| `width` | `number` | `0` |
| `firstRowPaddingTop` | `number` | `0` |

#### Returns

[`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

#### Defined in

[src/lib/table/factory/cover-grid-factory.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/cover-grid-factory.ts#L14)

___

### createCoverGrisDefaultOptions

▸ **createCoverGrisDefaultOptions**(`defaultRowHeight`, `getStorageKeyFn?`): [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `defaultRowHeight` | `number` |
| `getStorageKeyFn` | () => `string` |

#### Returns

[`TableOptionsIf`](../interfaces/TableOptionsIf.md)

#### Defined in

[src/lib/table/factory/cover-grid-factory.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/cover-grid-factory.ts#L30)
