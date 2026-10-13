import { CheckedType } from "../data/common/checked-type";
import { CheckboxModelIf } from "./checkbox-model.if";
import { TreeRowIf } from "../data/common/tree-row-if";


/** @category Tree & checkboxes */
export class TreeCheckboxModel<T extends TreeRowIf<any>> implements CheckboxModelIf<T> {


  constructor(
    protected allRootNodes: T[] = []
  ) {
  }

  checkRow(row: T, sel: boolean): void {
    row.checked = sel;
    if (row.children) {
      for (const child of row.children) {
        this.checkRow(child as T, sel);
      }
    }
    this.autoCheckParent(row.parent as T);
  }

  /**
   * Unchecks the given rows and all their descendants – despite its name, like {@link CheckboxModel.checkAll}
   * (which clears all checked rows). The parents of the given rows are updated ("semi" or "none").
   *
   * @param arr - the rows to uncheck together with their descendants; default: the root nodes (whole tree)
   *
   * @example
   * const checkboxModel = new TreeCheckboxModel(TreeFactory.buildTreeRows<OrderNode>(nodes));
   * checkboxModel.checkAll(); // uncheck every row of the tree
   */
  checkAll(arr: T[] = this.allRootNodes): void {
    for (const node of arr) {
      this.uncheckRecursive(node);
    }
    for (const node of arr) {
      this.autoCheckParent(node.parent as T);
    }
  }

  getCheckedRows(): T[] {
    const ret: T[] = [];
    this.addSelectedRecursive(this.allRootNodes, ret);
    return ret;
  }

  isRowChecked(row: T): CheckedType {
    if (row.checked) {
      return "full";
    }
    const b1 = this.areAllChildrenChecked(row as T);
    const b2 = this.areAllChildrenUnchecked(row as T);
    if (!b1 && !b2) {
      return "semi";
    }
    return "none";
  }

  setCheckedRows(rows: T[]): void {
    this.addCheckedRows(rows);
  }


  addCheckedRows(rows: T[]): void {
    for (const t of rows) {
      t.checked = true;
    }
  }

  private autoCheckParent(parent: T | undefined): void {
    if (parent) {
      const b1 = this.areAllChildrenChecked(parent as T);
      const b2 = this.areAllChildrenUnchecked(parent as T);
      if (b1) {
        parent.checked = true;
      } else if (b2) {
        parent.checked = false;
      } else {
        // nur semi:
        parent.checked = false;
      }
      this.autoCheckParent(parent.parent as T);
    }
  }

  private areAllChildrenChecked(row: T): boolean {
    if (row.children?.length) {
      for (const child of row.children) {
        if (!child.checked) {
          return false;
        }
        if (child.children?.length) {
          const b = this.areAllChildrenChecked(child as T);
          if (!b) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private areAllChildrenUnchecked(row: T): boolean {
    if (row.children?.length) {
      for (const child of row.children) {
        if (child.checked) {
          return false;
        }
        if (child.children?.length) {
          const b = this.areAllChildrenUnchecked(child as T);
          if (!b) {
            return false;
          }
        }
      }
    }
    return true;
  }


  private uncheckRecursive(row: T): void {
    row.checked = false;
    if (row.children) {
      for (const child of row.children) {
        this.uncheckRecursive(child as T);
      }
    }
  }

  private addSelectedRecursive(nodes: T[], ret: T[]) {
    for (const n of nodes) {
      if (n.checked) {
        ret.push(n);
      }
      if (n.children) {
        this.addSelectedRecursive(n.children as T[], ret);
      }
    }
  }
}
