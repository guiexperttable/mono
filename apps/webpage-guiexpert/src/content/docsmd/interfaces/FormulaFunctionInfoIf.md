[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaFunctionInfoIf

# Interface: FormulaFunctionInfoIf

A built-in function of cell formulas: name, signature and a short English description – for function suggestions
and help texts.

**`Since`**

1.1.99

## Table of contents

### Properties

- [description](FormulaFunctionInfoIf.md#description)
- [group](FormulaFunctionInfoIf.md#group)
- [name](FormulaFunctionInfoIf.md#name)
- [signature](FormulaFunctionInfoIf.md#signature)

## Properties

### description

• `Readonly` **description**: `string`

#### Defined in

[src/lib/table/sheet/sheet-function-info.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-function-info.ts#L12)

___

### group

• `Readonly` **group**: ``"Math"`` \| ``"Conditional"`` \| ``"Logic"`` \| ``"Lookup"`` \| ``"Text"`` \| ``"Date"`` \| ``"Info"``

#### Defined in

[src/lib/table/sheet/sheet-function-info.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-function-info.ts#L13)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/lib/table/sheet/sheet-function-info.ts:9](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-function-info.ts#L9)

___

### signature

• `Readonly` **signature**: `string`

e.g. `"SUM(number1, [number2], …)"`

#### Defined in

[src/lib/table/sheet/sheet-function-info.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-function-info.ts#L11)
