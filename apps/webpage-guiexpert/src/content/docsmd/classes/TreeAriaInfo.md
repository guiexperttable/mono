[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TreeAriaInfo

# Class: TreeAriaInfo

Computes `aria-level`, `aria-setsize`, `aria-posinset` and `aria-expanded` of the rows of a tree body
([AreaModelTree](AreaModelTree.md)). Sizes and positions count the **displayed** siblings, i.e. with an active filter only
the matching ones. The positions of a group of siblings are computed once and cached until the displayed rows
change (expand, collapse, filter, sort) – so the cost per rendered row is O(1), also with a million siblings.

**`Example`**

```ts
const info = new TreeAriaInfo();
const attrs = info.get(tableModel.getBodyModel() as AreaModelTree<OrderNode>, 0);
// → { level: 1, setSize: 3, posInSet: 1, expanded: true }
```

**`Since`**

1.1.91

## Table of contents

### Constructors

- [constructor](TreeAriaInfo.md#constructor)

### Methods

- [get](TreeAriaInfo.md#get)

## Constructors

### constructor

• **new TreeAriaInfo**(): [`TreeAriaInfo`](TreeAriaInfo.md)

#### Returns

[`TreeAriaInfo`](TreeAriaInfo.md)

## Methods

### get

▸ **get**(`model`, `rowIndex`): `undefined` \| [`TreeAriaRowInfo`](../interfaces/TreeAriaRowInfo.md)

The ARIA attributes of a displayed row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `model` | [`TreeAriaModel`](../interfaces/TreeAriaModel.md) | the tree body model (an [AreaModelTree](AreaModelTree.md)) |
| `rowIndex` | `number` | index of the displayed row |

#### Returns

`undefined` \| [`TreeAriaRowInfo`](../interfaces/TreeAriaRowInfo.md)

undefined if there is no such row

#### Defined in

[src/lib/table/aria/tree-aria-info.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/tree-aria-info.ts#L61)
