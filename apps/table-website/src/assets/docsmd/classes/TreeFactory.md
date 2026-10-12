[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeFactory

# Class: TreeFactory

Turns hierarchical data into [tree rows](TreeRow.md) for a tree table. Pass the result as `rows`
to [TableFactory.createTableModel](TableFactory.md#createtablemodel) – the factory then creates an [AreaModelTree](AreaModelTree.md); the first
column shows the arrows.

**`Example`**

```ts
interface Node { label: string; total: number; children?: Node[] }

const rows = TreeFactory.buildTreeRows<Node>(nodes, {
  childrenProperty: "children",
  expanded: (row, deep) => deep === 0          // open only the first level
});
const tableModel = TableFactory.createTableModel({
  rows,
  columnDefs: [new ColumnDef("label", "Name", px300, bodyLeft), new ColumnDef("total", "Total", px120, allRight)]
});
```

**`See`**

Training: [Tree table with checkboxes](https://gui.expert/training/tree-table/)

## Table of contents

### Constructors

- [constructor](TreeFactory.md#constructor)

### Methods

- [buildTreeRow](TreeFactory.md#buildtreerow)
- [buildTreeRows](TreeFactory.md#buildtreerows)

## Constructors

### constructor

• **new TreeFactory**(): [`TreeFactory`](TreeFactory.md)

#### Returns

[`TreeFactory`](TreeFactory.md)

## Methods

### buildTreeRow

▸ **buildTreeRow**\<`T`\>(`data`, `childrenProperty?`, `parent?`, `deep?`, `deepMaxLimit?`, `expanded?`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `data` | `T` | `undefined` |
| `childrenProperty` | `string` | `"children"` |
| `parent` | [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\> | `undefined` |
| `deep` | `number` | `0` |
| `deepMaxLimit` | `number` | `12` |
| `expanded` | `boolean` \| [`TreeRowExpandedFn`](../modules.md#treerowexpandedfn)\<`T`\> | `true` |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>

#### Defined in

[src/lib/table/factory/tree-factory.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/tree-factory.ts#L90)

___

### buildTreeRows

▸ **buildTreeRows**\<`T`\>(`data`, `childrenPropertyOrOptions?`, `deepMaxLimit?`, `expanded?`): [`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[]

Builds tree rows (input for `TableFactory.createTableModel({ rows })`) from nested objects.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `data` | `T`[] | `undefined` | the top-level objects |
| `childrenPropertyOrOptions` | `string` \| [`TreeFactoryOptions`](../interfaces/TreeFactoryOptions.md)\<`T`\> | `"children"` | name of the children property (default "children") or [TreeFactoryOptions](../interfaces/TreeFactoryOptions.md) |
| `deepMaxLimit` | `number` | `12` | maximum depth (default 12; ignored when options are passed) |
| `expanded` | `boolean` \| [`TreeRowExpandedFn`](../modules.md#treerowexpandedfn)\<`T`\> | `true` | expanded state of the rows (default true; ignored when options are passed) |

#### Returns

[`TreeRowIf`](../interfaces/TreeRowIf.md)\<`T`\>[]

**`Example`**

```ts
const rows = TreeFactory.buildTreeRows<OrderNode>(data, { childrenProperty: "children", expanded: false });
```

#### Defined in

[src/lib/table/factory/tree-factory.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/tree-factory.ts#L68)
