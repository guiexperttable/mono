[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeFactoryOptions

# Interface: TreeFactoryOptions\<T\>

Options for [TreeFactory.buildTreeRows](../classes/TreeFactory.md#buildtreerows).

**`Example`**

```ts
// start with every node collapsed
TreeFactory.buildTreeRows(data, { childrenProperty: "children", expanded: false });
```

**`Example`**

```ts
// open the first level only
TreeFactory.buildTreeRows(data, { expanded: (_row, deep) => deep === 0 });
```

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [childrenProperty](TreeFactoryOptions.md#childrenproperty)
- [deepMaxLimit](TreeFactoryOptions.md#deepmaxlimit)
- [expanded](TreeFactoryOptions.md#expanded)

## Properties

### childrenProperty

• `Optional` **childrenProperty**: `string`

Property that holds the child objects. Default: "children".

#### Defined in

[src/lib/table/factory/tree-factory.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/tree-factory.ts#L27)

___

### deepMaxLimit

• `Optional` **deepMaxLimit**: `number`

Maximum depth of a row (0 = top level only); deeper children are skipped with a console warning. Default: 12.

#### Defined in

[src/lib/table/factory/tree-factory.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/tree-factory.ts#L31)

___

### expanded

• `Optional` **expanded**: `boolean` \| [`TreeRowExpandedFn`](../modules.md#treerowexpandedfn)\<`T`\>

Expanded state of the rows. Default: true (everything open, as before).

#### Defined in

[src/lib/table/factory/tree-factory.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/tree-factory.ts#L29)
