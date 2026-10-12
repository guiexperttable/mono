[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RequestChunk

# Class: RequestChunk

## Hierarchy

- **`RequestChunk`**

  ↳ [`ChunkData`](ChunkData.md)

## Implements

- [`RequestChunkIf`](../interfaces/RequestChunkIf.md)

## Table of contents

### Constructors

- [constructor](RequestChunk.md#constructor)

### Properties

- [emmitCancelKey](RequestChunk.md#emmitcancelkey)
- [emmitDataKey](RequestChunk.md#emmitdatakey)
- [endIndex](RequestChunk.md#endindex)
- [filter](RequestChunk.md#filter)
- [queryId](RequestChunk.md#queryid)
- [sorting](RequestChunk.md#sorting)
- [startIndex](RequestChunk.md#startindex)

## Constructors

### constructor

• **new RequestChunk**(`emmitDataKey`, `emmitCancelKey`, `queryId`, `filter`, `sorting`, `startIndex`, `endIndex`): [`RequestChunk`](RequestChunk.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `emmitDataKey` | `string` |
| `emmitCancelKey` | `string` |
| `queryId` | `string` |
| `filter` | `string` |
| `sorting` | `string` |
| `startIndex` | `number` |
| `endIndex` | `number` |

#### Returns

[`RequestChunk`](RequestChunk.md)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:6](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L6)

## Properties

### emmitCancelKey

• **emmitCancelKey**: `string`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[emmitCancelKey](../interfaces/RequestChunkIf.md#emmitcancelkey)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:8](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L8)

___

### emmitDataKey

• **emmitDataKey**: `string`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[emmitDataKey](../interfaces/RequestChunkIf.md#emmitdatakey)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:7](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L7)

___

### endIndex

• **endIndex**: `number`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[endIndex](../interfaces/RequestChunkIf.md#endindex)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L13)

___

### filter

• **filter**: `string`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[filter](../interfaces/RequestChunkIf.md#filter)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L10)

___

### queryId

• **queryId**: `string`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[queryId](../interfaces/RequestChunkIf.md#queryid)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L9)

___

### sorting

• **sorting**: `string`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[sorting](../interfaces/RequestChunkIf.md#sorting)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L11)

___

### startIndex

• **startIndex**: `number`

#### Implementation of

[RequestChunkIf](../interfaces/RequestChunkIf.md).[startIndex](../interfaces/RequestChunkIf.md#startindex)

#### Defined in

[src/lib/table/data/chunk/request-chunk.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/chunk/request-chunk.ts#L12)
