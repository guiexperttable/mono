[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeRowService

# Class: TreeRowService

## Table of contents

### Constructors

- [constructor](TreeRowService.md#constructor)

### Methods

- [flattenTree](TreeRowService.md#flattentree)
- [isVisible](TreeRowService.md#isvisible)

## Constructors

### constructor

• **new TreeRowService**(): [`TreeRowService`](TreeRowService.md)

#### Returns

[`TreeRowService`](TreeRowService.md)

## Methods

### flattenTree

▸ **flattenTree**\<`T`\>(`rows`, `ret?`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[]

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `rows` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[] | `undefined` |
| `ret` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[] | `[]` |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[]

#### Defined in

[src/lib/table/service/tree-row.service.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/tree-row.service.ts#L7)

___

### isVisible

▸ **isVisible**(`row`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`any`\> |

#### Returns

`boolean`

#### Defined in

[src/lib/table/service/tree-row.service.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/tree-row.service.ts#L23)
