[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaBar

# Class: FormulaBar

The formula bar of a spreadsheet: an address box (`B3`) and the input of the active cell (the formula text, not
its result). Typing there and Enter/Tab writes the cell (`TableApi.setCellInput`) and moves like the table, Escape
restores it; while the cell editor is open the bar shows its text live. Plain DOM, no dependency – works with every
wrapper (pass the `TableApi` of `tableReady`). Colors: `--ge-table-formula-bar-*`.

**`Example`**

```ts
const bar = new FormulaBar(document.querySelector<HTMLElement>(".formula-bar")!, tableApi);
// later: bar.destroy();
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](FormulaBar.md#constructor)

### Properties

- [addressInput](FormulaBar.md#addressinput)
- [element](FormulaBar.md#element)
- [input](FormulaBar.md#input)

### Methods

- [destroy](FormulaBar.md#destroy)
- [show](FormulaBar.md#show)

## Constructors

### constructor

• **new FormulaBar**(`container`, `api`, `options?`): [`FormulaBar`](FormulaBar.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLElement` |
| `api` | [`TableApi`](TableApi.md) |
| `options` | `Partial`\<[`FormulaBarOptionsIf`](../interfaces/FormulaBarOptionsIf.md)\> |

#### Returns

[`FormulaBar`](FormulaBar.md)

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L45)

## Properties

### addressInput

• `Readonly` **addressInput**: `HTMLInputElement`

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L36)

___

### element

• `Readonly` **element**: `HTMLDivElement`

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L35)

___

### input

• `Readonly` **input**: `HTMLInputElement`

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L37)

## Methods

### destroy

▸ **destroy**(): `void`

Removes the bar and its listeners.

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L88)

___

### show

▸ **show**(): `void`

Shows the active cell: its address and input (not while typing in the bar).

#### Returns

`void`

#### Defined in

[src/lib/table/spreadsheet/formula-bar.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/formula-bar.ts#L95)
