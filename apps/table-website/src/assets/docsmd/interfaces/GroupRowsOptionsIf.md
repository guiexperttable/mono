[GuiExpert Table API](../README.md) / [Exports](../modules.md) / GroupRowsOptionsIf

# Interface: GroupRowsOptionsIf

Options of [groupRows](../modules.md#grouprows).

**`Example`**

```ts
const groups = groupRows(orders, ["country"], { emptyLabel: "(no country)" });
```

**`Since`**

1.1.94

## Table of contents

### Properties

- [emptyLabel](GroupRowsOptionsIf.md#emptylabel)

## Properties

### emptyLabel

• `Optional` **emptyLabel**: `string`

The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`.

#### Defined in

[src/lib/table/rowgroup/group-rows-options.if.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/group-rows-options.if.ts#L12)
