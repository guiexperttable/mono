[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ObjectPropertyType

# Class: ObjectPropertyType

## Implements

- [`PropertyType`](../interfaces/PropertyType.md)

## Table of contents

### Constructors

- [constructor](ObjectPropertyType.md#constructor)

### Properties

- [className](ObjectPropertyType.md#classname)
- [properties](ObjectPropertyType.md#properties)
- [propertyName](ObjectPropertyType.md#propertyname)
- [type](ObjectPropertyType.md#type)

## Constructors

### constructor

• **new ObjectPropertyType**(`propertyName`, `className`, `properties?`): [`ObjectPropertyType`](ObjectPropertyType.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `propertyName` | `string` | `undefined` |
| `className` | `string` | `undefined` |
| `properties` | [`PropertyItem`](PropertyItem.md)[] | `[]` |

#### Returns

[`ObjectPropertyType`](ObjectPropertyType.md)

#### Defined in

[src/lib/common/generator/domain/property-type.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/domain/property-type.ts#L93)

## Properties

### className

• **className**: `string`

#### Defined in

[src/lib/common/generator/domain/property-type.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/domain/property-type.ts#L95)

___

### properties

• **properties**: [`PropertyItem`](PropertyItem.md)[] = `[]`

#### Defined in

[src/lib/common/generator/domain/property-type.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/domain/property-type.ts#L96)

___

### propertyName

• **propertyName**: `string`

#### Implementation of

[PropertyType](../interfaces/PropertyType.md).[propertyName](../interfaces/PropertyType.md#propertyname)

#### Defined in

[src/lib/common/generator/domain/property-type.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/domain/property-type.ts#L94)

___

### type

• **type**: `string` = `PROPERTY_TYPE_KEY_OBJECT`

#### Implementation of

[PropertyType](../interfaces/PropertyType.md).[type](../interfaces/PropertyType.md#type)

#### Defined in

[src/lib/common/generator/domain/property-type.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/domain/property-type.ts#L91)
