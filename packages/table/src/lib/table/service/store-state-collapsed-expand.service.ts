import { AbstractStoreStateService } from "./abstract-store-state.service";
import { CollapsedExpandedData } from "./data/collapsed-expanded.data";
import { GetStorageKeyFn } from "../data/options/auto-restore-options.if";


/** @category Internals */
export class StoreStateCollapsedExpandService extends AbstractStoreStateService {

  private readonly COLLAPSED_EXPANDED_STATE = "collapsedExpandedState";
  private collapsedExpandedState: CollapsedExpandedData = new CollapsedExpandedData();


  constructor(
    fn: GetStorageKeyFn | undefined) {
    super(fn);
    this.load();
  }


  /** true once a state was loaded from or written to the storage – without one there is nothing to restore */
  private stored = false;

  hasStoredState(): boolean {
    return this.stored;
  }

  /**
   * The first toggle defines what the stored ids mean: a table that starts collapsed stores the expanded rows,
   * a table that starts expanded stores the collapsed ones.
   */
  initModeIfEmpty(mode: "collapsed" | "expanded") {
    if (!this.stored && !this.collapsedExpandedState.rowIds.length) {
      this.collapsedExpandedState.mode = mode;
    }
  }

  collapsedExpandedStateGet(): CollapsedExpandedData {
    return this.collapsedExpandedState;
  }

  collapsedExpandedStateIncludes(rowId: (string | number)): boolean {
    return this.collapsedExpandedState.rowIds.includes(rowId);
  }


  collapsedStateIdsPush(id: (string | number)) {
    if (!this.collapsedExpandedState.rowIds.includes(id)) {
      this.collapsedExpandedState.rowIds.push(id);
      this.collapsedExpandedState.allCollapsed = false;
      this.collapsedExpandedState.allExpanded = false;
      this.persist();
    }
  }

  collapsedStateIdsRemove(id: (string | number)) {
    const idx = this.collapsedExpandedState.rowIds.indexOf(id);
    if (idx !== -1) {
      this.collapsedExpandedState.rowIds.splice(idx, 1);
      this.collapsedExpandedState.allCollapsed = false;
      this.collapsedExpandedState.allExpanded = false;
      this.persist();
    }
  }


  collapsedStateAll(expand: boolean) {
    this.collapsedExpandedState.rowIds = [];
    this.collapsedExpandedState.mode = expand ? "collapsed" : "expanded"; // if all expanded, rowids are the collapsed ones
    this.collapsedExpandedState.allCollapsed = !expand;
    this.collapsedExpandedState.allExpanded = expand;
    this.persist();
  }


  protected override load() {
    const fn = this.getStorageKeyFn;
    if (fn) {
      const key = fn();
      if (key) {
        const subKey2 = key + this.COLLAPSED_EXPANDED_STATE;
        const data = this.loadFromLocalStorage<CollapsedExpandedData>(subKey2);
        if (data) {
          this.collapsedExpandedState = data;
          this.stored = true;
        }
      }
    }
  }

  private persist() {
    this.stored = true;
    this.checkAndPersistItem(this.COLLAPSED_EXPANDED_STATE, this.collapsedExpandedState);
  }


}
