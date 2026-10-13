[GuiExpert Table API](../README.md) / [Exports](../modules.md) / HeaderGroupOptionsIf

# Interface: HeaderGroupOptionsIf

The `HeaderGroupOptionsIf` interface is part of the TypeScript project,
and it's used as a type definition for the options of a header group component.
It includes the specifications for both the expanded and collapsed states of the said header group component.

This interface contains two properties:
- `iconExpanded`: An `IconIf` interface definition for the icon shown when the header group is expanded.
- `iconCollapsed`: An `IconIf` interface definition for the icon shown when the header group is collapsed.

Each of these properties, `iconExpanded` and `iconCollapsed`, is an object that adheres to the `IconIf` interface.
Therefore, they should include:
- `content`: (type `string`) which represents the HTML content of the icon.
- `style`: (type `string`) a string containing the CSS style to be applied to the icon.
- `classes`: (type `string[]`) which is an array of CSS classes to be applied to the icon.

**`See`**

[IconIf](IconIf.md)

**`Example`**

```ts
const HeaderGroupOptions: HeaderGroupOptionsIf = {
  iconExpanded: {
    content: "<i class='my-expanded-icon'></i>",
    style: "color: green;",
    classes: ["my-expanded-icon-class"]
  },
  iconCollapsed: {
    content: "<i class='my-collapsed-icon'></i>",
    style: "color: red;",
    classes: ["my-collapsed-icon-class"]
  }
};
```

## Implemented by

- [`HeaderGroupOptions`](../classes/HeaderGroupOptions.md)

## Table of contents

### Properties

- [iconCollapsed](HeaderGroupOptionsIf.md#iconcollapsed)
- [iconExpanded](HeaderGroupOptionsIf.md#iconexpanded)

## Properties

### iconCollapsed

• **iconCollapsed**: [`IconIf`](IconIf.md)

#### Defined in

[src/lib/table/data/options/header-group-options.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/header-group-options.if.ts#L41)

___

### iconExpanded

• **iconExpanded**: [`IconIf`](IconIf.md)

#### Defined in

[src/lib/table/data/options/header-group-options.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/options/header-group-options.if.ts#L40)
