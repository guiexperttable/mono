[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SchemeGenerator

# Class: SchemeGenerator

Converts a json or object structure like this:
 [
  {
    id: 1,
    name: 'Alice',
    description: 'Lorem ipsum dolor',
    isActive: true,
    tags: ['typescript', 'javascript'],
    scripts: [],
    profile: { age: 30, location: 'Berlin' },
    preferences: [{ key: 'theme', value: 'dark' }]
  },
  {
    id: 2,
    name: 'Marc',
    description: 'Lorem ipsum dolor',
    isActive: false,
    tags: ['java', 'javascript'],
    scripts: [],
    profile: { age: 55, location: 'Frankfurt' },
    preferences: [{ key: 'theme', value: 'light' }]
  },
  {
    id: null,
    name: 'Bob',
    isActive: false,
    tags: null,
    scripts: [],
    profile: { age: 25, location: 'Frankfurt' },
    preferences: [{ key: 'language', value: 'de' }]
  }
]

 into a TypeScript interface definitions:

export interface XyzRowEntity {
  description?: string;
  id: number|null;
  isActive: boolean;
  name: string;
  preferences: PreferenceEntity[];
  profile: ProfileEntity;
  scripts: any[];
  tags: string[]|null;
}

export interface PreferenceEntity {
  key: string;
  value: string;
}

export interface ProfileEntity {
  age: number;
  location: string;
}

const json = JSON.stringify(demoData);
const rootPropertyType: PropertyType = new PropertyTypeService().object2PropertyType(demoData, 'XyzRows');
console.log(new SchemeGenerator().renderTypeScriptInterfaces(rootPropertyType).join('\n'));

## Table of contents

### Constructors

- [constructor](SchemeGenerator.md#constructor)

### Properties

- [orOperator](SchemeGenerator.md#oroperator)
- [rootPropertyType](SchemeGenerator.md#rootpropertytype)

### Methods

- [renderTypeScriptInterfaces](SchemeGenerator.md#rendertypescriptinterfaces)

## Constructors

### constructor

• **new SchemeGenerator**(): [`SchemeGenerator`](SchemeGenerator.md)

#### Returns

[`SchemeGenerator`](SchemeGenerator.md)

## Properties

### orOperator

• **orOperator**: `string` = `'|'`

#### Defined in

[src/lib/common/generator/scheme-generator-service.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/scheme-generator-service.ts#L78)

___

### rootPropertyType

• **rootPropertyType**: ``null`` \| [`PropertyType`](../interfaces/PropertyType.md) = `null`

#### Defined in

[src/lib/common/generator/scheme-generator-service.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/scheme-generator-service.ts#L79)

## Methods

### renderTypeScriptInterfaces

▸ **renderTypeScriptInterfaces**(`rootPropertyType`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `rootPropertyType` | [`PropertyType`](../interfaces/PropertyType.md) |

#### Returns

`string`[]

#### Defined in

[src/lib/common/generator/scheme-generator-service.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/scheme-generator-service.ts#L86)
