[GuiExpert Table API](../README.md) / [Exports](../modules.md) / StructureEditIf

# Interface: StructureEditIf

Rows or columns inserted or deleted at a **physical** position (row number − 1, column letter index).

**`Since`**

1.1.99

## Table of contents

### Properties

- [at](StructureEditIf.md#at)
- [count](StructureEditIf.md#count)
- [kind](StructureEditIf.md#kind)

## Properties

### at

• `Readonly` **at**: `number`

#### Defined in

[src/lib/table/spreadsheet/structure-edit.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/structure-edit.ts#L20)

___

### count

• `Readonly` **count**: `number`

#### Defined in

[src/lib/table/spreadsheet/structure-edit.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/structure-edit.ts#L21)

___

### kind

• `Readonly` **kind**: ``"insertRows"`` \| ``"deleteRows"`` \| ``"insertColumns"`` \| ``"deleteColumns"``

#### Defined in

[src/lib/table/spreadsheet/structure-edit.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/structure-edit.ts#L19)
