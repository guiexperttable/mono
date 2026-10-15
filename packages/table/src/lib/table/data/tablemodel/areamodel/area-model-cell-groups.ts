import { AreaIdent } from '../area-ident.type';
import { ColumnDefIf } from '../column/column-def.if';
import { AreaModelIf } from './area-model.if';
import { CellGroupIf } from '../cellgroup/cell-group.if';
import { CheckboxModelIf } from '../../../checkbox/checkbox-model.if';
import { SortItem } from '../../common/sort-item';
import { FilterFunction } from '../../common/filter-function';
import { CellRendererIf } from '../../../renderer/cell-render.if';
import { CheckedType } from '../../common/checked-type';
import { CellgroupFactory } from '../cellgroup/cellgroup-factory';
import { CellGroupExt } from '../cellgroup/cell-group-ext';
import { CellGroupExtCellRenderer } from '../../../renderer/cell-group-ext-cell-renderer';
import { MouseTargetData } from '../../event/mouse-target-data';
import { HeaderGroupOptionsIf } from '../../options/header-group-options.if';
import { HeaderGroupOptions } from '../../options/header-group-options';
import { setGroupColumnVisibility } from '../column/column-visibility';
import { TableHeaderGroupStateIf } from '../../../state/table-state.if';

// TODO next steps:   fix this model
/** @category Header groups */
export class AreaModelCellGroups implements AreaModelIf {

  public gammaCells = true;

  public rowSelectionModel: CheckboxModelIf<any> | undefined;
  public arr: (CellGroupExt | null | undefined)[][] = [];

  private groupExts: CellGroupExt[] = [];
  private cellGroupExtCellRenderer;

  constructor(
    public readonly areaIdent: AreaIdent = 'header',
    readonly groups: CellGroupIf[],
    public columnDefs: ColumnDefIf[] = [],
    public readonly defaultRowHeight: number,
    private headerGroupOptions: HeaderGroupOptionsIf = new HeaderGroupOptions()
  ) {
    this.cellGroupExtCellRenderer = new CellGroupExtCellRenderer(this.headerGroupOptions);
    this.groupExts = CellgroupFactory.buildGroupExts(groups);
    this.init();
  }

  sort<T>(_compareFn?: (a: T, b: T) => number): void {
      //
  }

  init(){
    this.arr = this.buildArray();

    if (!this.columnDefs?.length && this.areaIdent === 'header') {
      this.columnDefs = CellgroupFactory.buildColumnDefs(this.groups);
      // the group decides the visibility together with setColumnVisible()
      this.columnDefs.forEach(def => setGroupColumnVisibility(def, def.isVisible));
    }
  }

  getAllLeafs(): CellGroupExt[] {
    const flatten = CellgroupFactory.flattenGroupExts(this.groupExts);
    return flatten.filter(ge => !ge.children);
  }

  getMaxRowCount(): number {
    const allLeafs = this.getAllLeafs();
    if (allLeafs?.length) {
      return 1 + Math.max(...allLeafs.map(c => c.getParentCount(c)));
    }
    return 0;
  }

  buildArray(): (CellGroupExt | null | undefined)[][] {
    // // console.info('');
    const flatten = CellgroupFactory.flattenGroupExts(this.groupExts);
    // // console.info("flat", flatten);

    // const maxCol = flatten.length;
    const maxRow = 1 + Math.max(...flatten.map(c => c.rowIndex));
    // console.info('max  row/col:', maxRow + '/' + maxCol);

    const sb: string[] = [];
    CellgroupFactory.iterateThrowColumns(sb, this.groupExts);
    // console.info(sb);

    const arrs = Array.from(Array(maxRow).keys()).map((_r) => []);
    const ret = CellgroupFactory.buildArrayOfArrays(flatten, arrs);

    /*

Gold                                                Hohenwarte
Gold AB              Gold CD                        HOH AB                      HOH CD
Gold A     Gold B    Gold C   Gold D    Gold Sum    HOH Loc    HOH A    HOH B   HOH C    HOH D

*/
    return ret;
  }

  changeColumnOrder(_sourceColumnIndex: number, _targetColumnIndex: number): void {
    // skip
  }

  doSort(_sortItems: SortItem[]): boolean {
    return false;
  }

  externalFilterChanged<T>(_predictFn: FilterFunction<T>): void {
    // skip
  }

  getCellRenderer(_rowIndex: number, _columnIndex: number): CellRendererIf | undefined {
    return this.cellGroupExtCellRenderer;
  }

  getColspanAt(rowIndex: number, columnIndex: number): number {
    // let ret = 1;
    //
    // if (this.getValueAt(rowIndex, columnIndex)){
    //   const maxCol = this.arr[0].length;
    //   while (ret< maxCol && this.getValueAt(rowIndex, columnIndex + ret)===null){
    //     ret++;
    //   }
    // }
    // return ret;

    const val = this.getValueAt(rowIndex, columnIndex);
    if (val) {
      return val.getColumnCount();
    }
    return 0;
  }

  getCustomClassesAt(_rowIndex: number, _columnIndex: number): string[] {
    return [];
  }

  getCustomStyleAt(_rowIndex: number, _columnIndex: number): { [p: string]: string } | undefined {
    return undefined;
  }

  getMaxColspan(): number {
    return 12;
  }

  getMaxRowspan(): number {
    return 12;
  }

  getRowByIndex(_rowIndex: number): any {
    return undefined;
  }

  getRowCount(): number {
    if (this.arr) {
      return this.arr.length;
    }
    return 0;
  }


  getRowspanAt(rowIndex: number, columnIndex: number): number {
    // TODO
    const cge: CellGroupExt | null | undefined = this.getValueAt(rowIndex, columnIndex);
    if (cge) {
      const maxRowCount = this.getRowCount();
      return cge.getRowSpan(cge, maxRowCount);
    }
    return 0;
  }

  getTooltipAt(_rowIndex: number, _columnIndex: number): any {
    // TODO
    return '';
  }

  getValueAt(rowIndex: number, columnIndex: number): any {
    return this.arr[rowIndex][columnIndex];
  }

  getTextValueAt(rowIndex: number, columnIndex: number): string {
    return '' + this.getValueAt(rowIndex, columnIndex);
  }

  getYPosByRowIndex(_rowIndex: number): number {
    // TODO
    return 0;
  }


  getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  isEditable(_rowIndex: number, _columnIndex: number): boolean {
    return false;
  }

  isFilterable(): boolean {
    return false;
  }

  isRowCheckable(_rowIndex: number): boolean {
    return false;
  }

  isRowChecked(_rowIndex: number): CheckedType | undefined {
    return undefined;
  }

  isSelectable(_rowIndex: number, _columnIndex: number): boolean {
    return false;
  }

  setRowChecked(_rowIndex: number, _checked: boolean): void {
    // skipped
  }

  setValue(_rowIndex: number, _columnIndex: number, _value: any): boolean {
    return false;
  }

  toggleHeaderGroup(mouseTargetData: MouseTargetData) {
    const cellGroup: (CellGroupExt | null | undefined) = this.arr[mouseTargetData.rowIdx][mouseTargetData.colIdx];
    if (cellGroup?.toggle && cellGroup.visibility !== 'always') {
      cellGroup.closed = !cellGroup.closed;
      this.init();
    }
    return this.mergeColumnDefs();
  }

  /**
   * The header groups the user can collapse (`toggle: true`, not `visibility: "always"`) with their id
   * ({@link CellGroupIf.id}, otherwise the path of the labels, e.g. `"Customer"` or `"2026/Q1"`; a second group with
   * the same path gets `#2`) and their state.
   *
   * @returns {TableHeaderGroupStateIf[]} id and `closed` per group, in header order
   * @example
   * const header = tableApi.getTableModel().getAreaModel("header") as AreaModelCellGroups;
   * console.log(header.getToggleGroupStates());   // [{ id: "Customer", closed: false }]
   * @since 1.1.92
   */
  getToggleGroupStates(): TableHeaderGroupStateIf[] {
    return Array.from(this.getToggleGroups(), ([id, group]) => ({ id, closed: !!group.closed }));
  }

  /**
   * Collapses or expands a header group by its id (see {@link getToggleGroupStates}) and returns the column
   * definitions to use from now on – like a click on its toggle. {@link TableApi.setHeaderGroupCollapsed} does this
   * and repaints.
   *
   * @param {string} id - the id of the group
   * @param {boolean} closed - true = collapse
   * @returns {ColumnDefIf[] | undefined} the merged column definitions, `undefined` if there is no such group
   * @since 1.1.92
   */
  setGroupClosed(id: string, closed: boolean): ColumnDefIf[] | undefined {
    const group = this.getToggleGroups().get(id);
    if (!group) {
      return undefined;
    }
    if (!!group.closed !== closed) {
      group.closed = closed;
      this.init();
    }
    return this.mergeColumnDefs();
  }

  /** The toggleable groups by id (header order). */
  private getToggleGroups(): Map<string, CellGroupExt> {
    const ret = new Map<string, CellGroupExt>();
    const walk = (groups: CellGroupExt[] | undefined, path: string) => {
      for (const group of groups ?? []) {
        const own = path ? path + '/' + String(group.data) : String(group.data);
        if (group.children?.length) {
          if (group.toggle && group.visibility !== 'always') {
            let id = group.id ?? own;
            for (let n = 2; ret.has(id); n++) {
              id = (group.id ?? own) + '#' + n;
            }
            ret.set(id, group);
          }
          walk(group.children, own);
        }
      }
    };
    walk(this.groupExts, '');
    return ret;
  }

  /**
   * Keep the existing ColumnDef objects (width, classes, renderers, sorting …) – only their visibility
   * comes from the rebuilt groups. Fresh defs would reset every width to the default (100 px).
   */
  private mergeColumnDefs(): ColumnDefIf[] {
    const fresh = CellgroupFactory.buildColumnDefs(this.groupExts);
    const previous = new Map(this.columnDefs.map(def => [def.property, def]));
    const merged = fresh.map(def => {
      const old = previous.get(def.property);
      if (!old) {
        setGroupColumnVisibility(def, def.isVisible);
        return def;
      }
      // the group decides together with setColumnVisible() (before, the group overwrote a column hidden by the API)
      setGroupColumnVisibility(old, def.isVisible);
      return old;
    });
    this.columnDefs = merged;
    return merged;
  }
}
