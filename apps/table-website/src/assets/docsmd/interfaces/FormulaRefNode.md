[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaRefNode

# Interface: FormulaRefNode

A cell reference of a cell formula: row and column 0-based (`B3` = row 2, column 1), `$` = absolute. In a range a
whole column (`A:A`) has `row: -1`, a whole row (`3:3`) has `col: -1`.

**`Example`**

```ts
const ref: FormulaRefNode = { kind: "ref", row: 2, col: 1, absRow: true, absCol: false };   // B$3
```

**`Since`**

1.1.99

## Table of contents

### Properties

- [absCol](FormulaRefNode.md#abscol)
- [absRow](FormulaRefNode.md#absrow)
- [col](FormulaRefNode.md#col)
- [kind](FormulaRefNode.md#kind)
- [row](FormulaRefNode.md#row)

## Properties

### absCol

• `Readonly` **absCol**: `boolean`

#### Defined in

[src/lib/table/formula/formula-ast.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-ast.if.ts#L41)

___

### absRow

• `Readonly` **absRow**: `boolean`

#### Defined in

[src/lib/table/formula/formula-ast.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-ast.if.ts#L40)

___

### col

• `Readonly` **col**: `number`

#### Defined in

[src/lib/table/formula/formula-ast.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-ast.if.ts#L39)

___

### kind

• `Readonly` **kind**: ``"ref"``

#### Defined in

[src/lib/table/formula/formula-ast.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-ast.if.ts#L37)

___

### row

• `Readonly` **row**: `number`

#### Defined in

[src/lib/table/formula/formula-ast.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-ast.if.ts#L38)
