[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AreaMapFactory

# Class: AreaMapFactory

## Table of contents

### Constructors

- [constructor](AreaMapFactory.md#constructor)

### Methods

- [body](AreaMapFactory.md#body)

## Constructors

### constructor

• **new AreaMapFactory**(): [`AreaMapFactory`](AreaMapFactory.md)

#### Returns

[`AreaMapFactory`](AreaMapFactory.md)

## Methods

### body

▸ **body**(`bodyRenderer`): [`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

A factory that creates a new AreaObjectMap with the given body renderer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bodyRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | The renderer for the body of the map. |

#### Returns

[`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

The newly created AreaObjectMap.

#### Defined in

[src/lib/table/data/common/area-map-factory.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/area-map-factory.ts#L13)
