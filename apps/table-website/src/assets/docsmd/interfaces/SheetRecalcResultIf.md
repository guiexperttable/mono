[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SheetRecalcResultIf

# Interface: SheetRecalcResultIf

What a (re)calculation did.

**`Since`**

1.1.99

## Table of contents

### Properties

- [changedCells](SheetRecalcResultIf.md#changedcells)
- [evaluated](SheetRecalcResultIf.md#evaluated)

## Properties

### changedCells

• `Readonly` **changedCells**: readonly readonly [`number`, `number`][]

Formula cells whose result changed (row, column).

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L49)

___

### evaluated

• `Readonly` **evaluated**: `number`

Formula cells evaluated.

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L51)
