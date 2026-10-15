[GuiExpert Table API](../README.md) / [Exports](../modules.md) / DerivedValuesChangeIf

# Interface: DerivedValuesChangeIf

What changed when the table calls [AreaModelIf.invalidateDerivedValues](AreaModelIf.md#invalidatederivedvalues) after an edit or
[TableApi.updateCells](../classes/TableApi.md#updatecells): the area and the displayed rows. A model may use it to recompute only what depends on
these rows (a row grouping recomputes the path of the changed row only). Without it everything may have changed.

**`Example`**

```ts
class MyModel extends AreaModel {
  private readonly dirtyRows = new Set<number>();
  private allDirty = true;

  invalidateDerivedValues(change?: DerivedValuesChangeIf): void {
    if (change?.area === "body") {
      change.rowIndices.forEach(r => this.dirtyRows.add(r));   // only these rows
    } else {
      this.allDirty = true;                                      // anything may have changed
    }
  }
}
```

**`Since`**

1.1.94

## Table of contents

### Properties

- [area](DerivedValuesChangeIf.md#area)
- [rowIndices](DerivedValuesChangeIf.md#rowindices)

## Properties

### area

• **area**: [`AreaIdent`](../modules.md#areaident)

The area whose values changed.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/derived-values-change.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/derived-values-change.if.ts#L27)

___

### rowIndices

• **rowIndices**: `number`[]

The changed rows (indices of the displayed rows at the time of the change).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/derived-values-change.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/derived-values-change.if.ts#L29)
