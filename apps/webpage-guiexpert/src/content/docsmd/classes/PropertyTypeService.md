[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PropertyTypeService

# Class: PropertyTypeService

## Table of contents

### Constructors

- [constructor](PropertyTypeService.md#constructor)

### Properties

- [debugging](PropertyTypeService.md#debugging)

### Methods

- [getParentPath](PropertyTypeService.md#getparentpath)
- [json2Object](PropertyTypeService.md#json2object)
- [json2PropertyType](PropertyTypeService.md#json2propertytype)
- [json2ValueInfos](PropertyTypeService.md#json2valueinfos)
- [object2PropertyType](PropertyTypeService.md#object2propertytype)
- [object2ValueInfos](PropertyTypeService.md#object2valueinfos)

## Constructors

### constructor

• **new PropertyTypeService**(): [`PropertyTypeService`](PropertyTypeService.md)

#### Returns

[`PropertyTypeService`](PropertyTypeService.md)

## Properties

### debugging

• **debugging**: `boolean` = `false`

#### Defined in

[src/lib/common/generator/property-type.service.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L27)

## Methods

### getParentPath

▸ **getParentPath**(`path`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`string`

#### Defined in

[src/lib/common/generator/property-type.service.ts:268](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L268)

___

### json2Object

▸ **json2Object**(`json`): `object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `string` |

#### Returns

`object`

#### Defined in

[src/lib/common/generator/property-type.service.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L123)

___

### json2PropertyType

▸ **json2PropertyType**(`json`, `rootName?`): [`PropertyType`](../interfaces/PropertyType.md)

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

 into a PropertyTape tree structure like this:

    return new ArrayPropertyType(
      [
        new ObjectPropertyType('XyzRowEntity', [
          new PropertyItem('id', [new NumberPropertyType(), new NullPropertyType()]),
          new PropertyItem('name', [new StringPropertyType()]),
          new PropertyItem('description', [new StringPropertyType(), new UndefinedPropertyType()]),
          new PropertyItem('isActive', [new BooleanPropertyType()]),
          new PropertyItem('tags', [
            new ArrayPropertyType(
              [new StringPropertyType()]
            ),
            new NullPropertyType()
          ]),
          new PropertyItem('scripts', [
            new ArrayPropertyType(
              [new AnyPropertyType()]
            ),
          ]),
          new PropertyItem('profile', [
            new ObjectPropertyType('profile', [
              new PropertyItem('age', [new NumberPropertyType()]),
              new PropertyItem('location', [new StringPropertyType()])
            ])
          ]),
          new PropertyItem('preferences', [
            new ArrayPropertyType(
              [
                new ObjectPropertyType('preference', [
                  new PropertyItem('key', [new StringPropertyType()]),
                  new PropertyItem('value', [new StringPropertyType()])
                ])
              ])
          ])
        ])
      ]);

const json = JSON.stringify(demoData);
const rootPropertyType: PropertyType = new PropertyTypeService().json2PropertyType(json, 'XyzRows');

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `json` | `string` \| `object` | `undefined` |
| `rootName` | `string` | `''` |

#### Returns

[`PropertyType`](../interfaces/PropertyType.md)

#### Defined in

[src/lib/common/generator/property-type.service.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L109)

___

### json2ValueInfos

▸ **json2ValueInfos**(`json`, `rootName?`): [`ValueInfo`](ValueInfo.md)[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `json` | `string` \| `object` | `undefined` |
| `rootName` | `string` | `''` |

#### Returns

[`ValueInfo`](ValueInfo.md)[]

#### Defined in

[src/lib/common/generator/property-type.service.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L240)

___

### object2PropertyType

▸ **object2PropertyType**(`parsedObject`, `rootName?`): [`PropertyType`](../interfaces/PropertyType.md)

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
];

into a PropertyTape tree structure like this:

    return new ArrayPropertyType(
      [
        new ObjectPropertyType('XyzRowEntity', [
          new PropertyItem('id', [new NumberPropertyType(), new NullPropertyType()]),
          new PropertyItem('name', [new StringPropertyType()]),
          new PropertyItem('description', [new StringPropertyType(), new UndefinedPropertyType()]),
          new PropertyItem('isActive', [new BooleanPropertyType()]),
          new PropertyItem('tags', [
            new ArrayPropertyType(
              [new StringPropertyType()]
            ),
            new NullPropertyType()
          ]),
          new PropertyItem('scripts', [
            new ArrayPropertyType(
              [new AnyPropertyType()]
            ),
          ]),
          new PropertyItem('profile', [
            new ObjectPropertyType('profile', [
              new PropertyItem('age', [new NumberPropertyType()]),
              new PropertyItem('location', [new StringPropertyType()])
            ])
          ]),
          new PropertyItem('preferences', [
            new ArrayPropertyType(
              [
                new ObjectPropertyType('preference', [
                  new PropertyItem('key', [new StringPropertyType()]),
                  new PropertyItem('value', [new StringPropertyType()])
                ])
              ])
          ])
        ])
      ]);

The PropertyTape tree structure can be rendered as TypeScript interface definitions with the SchemeGenerator:

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

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parsedObject` | `Object` | `undefined` |
| `rootName` | `string` | `''` |

#### Returns

[`PropertyType`](../interfaces/PropertyType.md)

#### Defined in

[src/lib/common/generator/property-type.service.ts:226](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L226)

___

### object2ValueInfos

▸ **object2ValueInfos**(`parsedObject`, `rootName?`): [`ValueInfo`](ValueInfo.md)[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `parsedObject` | `Object` | `undefined` |
| `rootName` | `string` | `''` |

#### Returns

[`ValueInfo`](ValueInfo.md)[]

#### Defined in

[src/lib/common/generator/property-type.service.ts:254](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/common/generator/property-type.service.ts#L254)
