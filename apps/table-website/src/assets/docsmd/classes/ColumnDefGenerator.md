[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnDefGenerator

# Class: ColumnDefGenerator

## Table of contents

### Constructors

- [constructor](ColumnDefGenerator.md#constructor)

### Properties

- [rootPropertyType](ColumnDefGenerator.md#rootpropertytype)

### Methods

- [renderColumnDefs](ColumnDefGenerator.md#rendercolumndefs)

## Constructors

### constructor

• **new ColumnDefGenerator**(): [`ColumnDefGenerator`](ColumnDefGenerator.md)

#### Returns

[`ColumnDefGenerator`](ColumnDefGenerator.md)

## Properties

### rootPropertyType

• **rootPropertyType**: ``null`` \| [`PropertyType`](../interfaces/PropertyType.md) = `null`

#### Defined in

[src/lib/common/generator/column-def-generator-service.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/column-def-generator-service.ts#L17)

## Methods

### renderColumnDefs

▸ **renderColumnDefs**(`rootPropertyType`, `allowCustomRenderer?`): `string`[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `rootPropertyType` | [`PropertyType`](../interfaces/PropertyType.md) | `undefined` |
| `allowCustomRenderer` | `boolean` | `true` |

#### Returns

`string`[]

#### Defined in

[src/lib/common/generator/column-def-generator-service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/column-def-generator-service.ts#L21)
