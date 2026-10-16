[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FillValueContextIf

# Interface: FillValueContextIf

What an own fill function ([FillHandleOptionsIf.fillValue](FillHandleOptionsIf.md#fillvalue)) gets for each filled cell.

**`Example`**

```ts
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fillValue = (ctx: FillValueContextIf) => {
  const last = ctx.sourceValues[ctx.sourceValues.length - 1];
  const i = weekdays.indexOf(String(last));
  return i < 0 || ctx.copy ? undefined : weekdays[(((i + ctx.step) % 7) + 7) % 7];   // undefined = default
};
```

**`Since`**

1.1.96

## Table of contents

### Properties

- [columnIndex](FillValueContextIf.md#columnindex)
- [copy](FillValueContextIf.md#copy)
- [defaultValue](FillValueContextIf.md#defaultvalue)
- [direction](FillValueContextIf.md#direction)
- [property](FillValueContextIf.md#property)
- [row](FillValueContextIf.md#row)
- [rowIndex](FillValueContextIf.md#rowindex)
- [sourceValues](FillValueContextIf.md#sourcevalues)
- [step](FillValueContextIf.md#step)

## Properties

### columnIndex

• **columnIndex**: `number`

Model index of the filled cell's column.

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L27)

___

### copy

• **copy**: `boolean`

`true` if the values are copied (⌥/Alt on a series, Ctrl/⌘+D, Ctrl/⌘+R).

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L35)

___

### defaultValue

• **defaultValue**: `unknown`

The value the table would use (series or copy).

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L33)

___

### direction

• **direction**: [`FillDirection`](../modules.md#filldirection)

The direction of the fill.

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L23)

___

### property

• **property**: `string`

The property of the column (`""` without a column definition).

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L29)

___

### row

• **row**: `unknown`

The row object of the filled cell (`undefined` for own area models without row objects).

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L31)

___

### rowIndex

• **rowIndex**: `number`

Display index of the filled cell's row.

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L25)

___

### sourceValues

• **sourceValues**: `unknown`[]

The values of the source line (the column when filling down/up, the row when filling right/left), as shown.

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L19)

___

### step

• **step**: `number`

1, 2, 3 … after the source (down/right), −1, −2 … in front of it (up/left).

#### Defined in

[src/lib/table/fill/fill-value-context.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/fill/fill-value-context.if.ts#L21)
