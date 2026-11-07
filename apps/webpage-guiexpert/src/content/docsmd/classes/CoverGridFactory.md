[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridFactory

# Class: CoverGridFactory

Creates cover grids: a flat array of items shown as tiles (book covers, photos, products) – as many per row as fit
into the width of the table (`floor(width / coverWidth)`), without header and footer. Only the visible rows are
rendered, like in every GuiExpert Table; filter (`externalFilterFunction`), `sort()` and the scroll position work as
usual. Guide: instructions.md 5.10, showcase https://gui.expert/showcase/covergrid/run.

**`Example`**

```ts
interface Book { title: string; }
declare const books: Book[];

const renderer: CellRendererIf = {
  render(cellDiv: HTMLDivElement, _r: number, _c: number, _a: AreaIdent, _m: AreaModelIf, book: any) {
    if (book) cellDiv.textContent = (book as Book).title;   // the item of this tile (undefined after the last one)
    return undefined;
  }
};
const gridModel = CoverGridFactory.createCoverGridModel(books, renderer, 160, 240);
const gridOptions = CoverGridFactory.createCoverGrisDefaultOptions(240, () => "books");
const gridApi = new TableScope(host, gridModel, new SimpleDomService(), gridOptions, new EventAdapter())
  .firstInit()
  .getApi();
```

## Table of contents

### Constructors

- [constructor](CoverGridFactory.md#constructor)

### Methods

- [createCoverGridModel](CoverGridFactory.md#createcovergridmodel)
- [createCoverGrisDefaultOptions](CoverGridFactory.md#createcovergrisdefaultoptions)

## Constructors

### constructor

• **new CoverGridFactory**(): [`CoverGridFactory`](CoverGridFactory.md)

#### Returns

[`CoverGridFactory`](CoverGridFactory.md)

## Methods

### createCoverGridModel

▸ **createCoverGridModel**\<`T`\>(`items`, `cellRenderer`, `coverWidth?`, `coverHeight?`, `width?`, `firstRowPaddingTop?`): [`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

Creates the model of a cover grid.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `items` | `T`[] | `undefined` | the items, one per tile (the renderer gets the item as `cellValue`) |
| `cellRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | `undefined` | draws one tile into the cell `<div>` |
| `coverWidth` | `number` | `200` | width of a tile in px (default 200) – change it later via `bodyModel.coverWidth` + `repaintHard()` |
| `coverHeight` | `number` | `300` | height of a tile in px (default 300) |
| `width` | `number` | `0` | initial width of the grid; the table sets the width of its host on start and after a resize |
| `firstRowPaddingTop` | `number` | `0` | extra height of the first row in px (room above the first tiles, e.g. for a toolbar) |

#### Returns

[`CoverGridTableModel`](CoverGridTableModel.md)\<`T`\>

the table model; `tableModel.bodyModel` holds `items`, `filteredItems`, `coverWidth`, `coverHeight`

**`Example`**

```ts
declare const renderer: CellRendererIf;
const gridModel = CoverGridFactory.createCoverGridModel(["a.jpg", "b.jpg", "c.jpg"], renderer, 120, 180);
// bigger tiles – no new model:
gridModel.bodyModel.coverWidth = 200;
gridModel.bodyModel.coverHeight = 300;
tableApi.repaintHard();
```

#### Defined in

[src/lib/table/factory/cover-grid-factory.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/cover-grid-factory.ts#L60)

___

### createCoverGrisDefaultOptions

▸ **createCoverGrisDefaultOptions**(`defaultRowHeight`, `getStorageKeyFn?`): [`TableOptionsIf`](../interfaces/TableOptionsIf.md)

Options for a cover grid: no borders and separators, no row or column hover, header and footer height 0, and the
scroll position restored under the key of `getStorageKeyFn` (`localStorage`). (The name has a typo – kept for
compatibility.)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `defaultRowHeight` | `number` | the height of a tile (`coverHeight`) |
| `getStorageKeyFn` | () => `string` | storage key of the scroll position (default `"CoverGrid"`) |

#### Returns

[`TableOptionsIf`](../interfaces/TableOptionsIf.md)

new options – add your own fields with a spread

**`Example`**

```ts
let photoFilter = "";
const gridOptions: TableOptionsIf = {
  ...CoverGridFactory.createCoverGrisDefaultOptions(240, () => "photos"),
  externalFilterFunction: (photo: { name: string }) => photo.name.includes(photoFilter),
  shortcutActionsDisabled: true
};
```

#### Defined in

[src/lib/table/factory/cover-grid-factory.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/cover-grid-factory.ts#L95)
