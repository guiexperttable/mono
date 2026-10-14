import { CrudOptions } from './crud-options';
import { CreateTableModelPara, TableFactory } from '../factory/table-factory';
import { SelectionModel } from '../selection/selection-model';
import { TableModelAndOptionsIf } from '../data/table-model-and-options.if';
import { TableModelAndOptions } from '../data/table-model-and-options';
import { TableOptions } from '../data/options/table-options';
import { ColumnDefIf } from '../data/tablemodel/column/column-def.if';
import { ColumnDef } from '../data/tablemodel/column/column-def';
import { px300 } from '../data/common/sizes';
import { CellRendererIf } from '../renderer/cell-render.if';
import { AreaObjectMap } from '../data/common/area-map';
import { ActionEventListenerIf } from '../renderer/action/action-event-listener.if';
import { ActionEventIf } from '../renderer/action/action-event.if';
import { ActionsCellRenderer } from '../renderer/action/actions-cell-renderer';
import { TableModelIf } from '../data/tablemodel/table-model.if';
import { TableOptionsIf } from '../data/options/table-options.if';
import {
  AreaModelObjectArrayWithColumndefs
} from '../data/tablemodel/areamodel/area-model-object-array-with-columndefs';
import { Size } from '../data/common/size';
import { CrudObjectView } from './crud-object-view';
import { CrudObjectEdit } from './crud-object-edit';
import { ActionEvent } from '../renderer/action/action-event';


/**
 * Builds a table for a REST resource: loads the list (`crudOptions.fetchList`), derives the columns from the first item
 * (nested objects flattened, e.g. `address.city`) and adds an "Actions" column (View / Edit / Clone / Delete) whose
 * links open the CRUD dialogs ({@link CrudTableModelFactory.onActionEvent}). The table shows the result of a save or
 * delete without reloading the list.
 *
 * @example
 * const factory = new CrudTableModelFactory();
 * factory.createTableModel(
 *   {
 *     ...new CrudOptions(),
 *     urls: {
 *       list: new UrlInfo('GET', '/api/customers'),
 *       read: new UrlInfo('GET', '/api/customers/{id}'),
 *       update: new UrlInfo('PUT', '/api/customers/{id}'),
 *       create: new UrlInfo('POST', '/api/customers'),
 *       delete: new UrlInfo('DELETE', '/api/customers/{id}'),
 *     },
 *     getEmptyItem: () => ({ name: '', vip: false }),
 *   },
 *   {},
 *   ({ tableModel, tableOptions }) => {
 *     const tableScope = new TableScope(hostDiv, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
 *     tableScope.firstInit();
 *   }
 * );
 * document.querySelector('#create')!.addEventListener('click', () => factory.openDialogForCreate());
 *
 * @category CRUD
 */
export class CrudTableModelFactory implements ActionEventListenerIf {

  public tableModel: TableModelIf | undefined;
  public bodyModel: AreaModelObjectArrayWithColumndefs<any> | undefined;
  public tableOptions: TableOptionsIf | undefined;
  public crudOptions: CrudOptions = new CrudOptions();

  public listenActionEvent: (actionEvent: ActionEventIf) => void = (_: ActionEventIf) => {
  };


  createTableModel<T>(
    crudOptions: CrudOptions,
    p: Partial<CreateTableModelPara>,
    callback: (tableModelAndOptions: TableModelAndOptionsIf) => void = (_: TableModelAndOptionsIf) => {
    },
    listenActionEvent: (actionEvent: ActionEventIf) => void = (_: ActionEventIf) => {
    }
  ): void {

    this.crudOptions = crudOptions;
    this.listenActionEvent = listenActionEvent;

    crudOptions.fetchList<T>(crudOptions).then(rows => {
      p.rows = rows;

      if (rows?.length) {
        const props: string[] = p.columnDefs?.length
          ? p.columnDefs.map(cd=>cd.property)
          : this.extractProperties(rows[0]);

        const selectionModel = new SelectionModel('row', 'multi');
        const getSelectionModel = () => selectionModel;

        this.tableOptions = {
          ...new TableOptions(),
          ...p.tableOptions,
          hoverColumnVisible: false,
          getSelectionModel
        };

        const widths: number[] = this.calcAutoColumnWidths<T>(rows, props);
        const columnDefs: ColumnDefIf[] = p.columnDefs?.length
          ? p.columnDefs
          : props.map(((p, i) => new ColumnDef(p, p.toUpperCase(), new Size(widths[i], 'px'))));

        if (crudOptions?.columnWidths?.autoCalc) {
          for (let i = 0; i < columnDefs.length; i++) {
            const columnDef = columnDefs[i];
            columnDef.width = new Size(widths[i], 'px');
          }
        }

        if (crudOptions.autoAddActionColumn) {
          // the cell value of the action column is the id of the row
          let columnDef = new ColumnDef(
            this.getIdKey(),
            'Actions',
            px300,
            new AreaObjectMap(['ge-table-text-align-left'], ['ge-table-text-align-left ge-table-actions-cell'], undefined)
          );
          columnDef.rendererMap = new AreaObjectMap<CellRendererIf>(
            undefined,
            new ActionsCellRenderer(this, crudOptions.singleRowActions),
            undefined
          );
          columnDefs.push(columnDef);
        }

        const fixedLeftColumnCount: number = 0;
        const fixedRightColumnCount: number = crudOptions.calcFixedRightColumnCount(columnDefs.length);

        this.tableModel = TableFactory.buildByTypedRowsParam<T>({
          rows,
          columnDefs,
          tableOptions: this.tableOptions,
          fixedLeftColumnCount,
          fixedRightColumnCount
        });
        this.tableModel.getSelectionModel = getSelectionModel;
        this.bodyModel = this.tableModel?.getBodyModel() as AreaModelObjectArrayWithColumndefs<T>;

        const mo = new TableModelAndOptions(this.tableModel, this.tableOptions);

        callback(mo);
      }
    }, error => this.logError('loading the list', error));
  }

  public openDialogForCreate() {
    if (this.bodyModel) {
      const evt = new ActionEvent('CREATE', "body", this.bodyModel, -1, -1, null)
      this.onActionEvent(evt);
    }
  }

  /**
   * Handles the actions of the action column (and `CREATE`): the listener of {@link createTableModel} is called first,
   * then
   * - `VIEW`: `fetchItem` → {@link CrudObjectView};
   * - `EDIT`: `fetchItem` → {@link CrudObjectEdit} → Save: `updateItem(id, item)`, the row shows the saved values
   *   (the response, if it is an item with id – otherwise the edited item);
   * - `CLONE` / `CREATE`: `fetchItem` resp. `getEmptyItem()` → {@link CrudObjectEdit} → Save: `createItem(item)` – without
   *   the id property, the server assigns it. If the response is an item with id, it is added as last row, otherwise the
   *   list is loaded again (`fetchList`);
   * - `DELETE`: `deleteItem(id)` → the row is removed.
   *
   * While a request runs, the table shows its loading overlay ({@link TableApi.showLoadingOverlay}, since 1.1.91).
   * A failed request is logged with `console.error`; the table stays unchanged.
   */
  onActionEvent(actionEvent: ActionEventIf): void {
    if (this.listenActionEvent) {
      this.listenActionEvent(actionEvent);
    }
    const options = this.crudOptions;
    const idKey = this.getIdKey();
    const action = actionEvent.action;
    const id = actionEvent.id;

    if (action === 'VIEW') {
      this.whileLoading(() => options.fetchItem<Record<string, any>>(options, id))
        .then(item => new CrudObjectView(item).openDialog())
        .catch(error => this.logError(action, error));

    } else if (action === 'EDIT') {
      this.whileLoading(() => options.fetchItem<Record<string, any>>(options, id))
        .then(item => new CrudObjectEdit(idKey, item).openDialog(updatedObject =>
          this.whileLoading(() => options.updateItem(options, id, updatedObject))
            .then(response => this.updateRow(id, this.isItemWithId(response) ? response : updatedObject))
            .catch(error => this.logError(action, error))))
        .catch(error => this.logError(action, error));

    } else if (action === 'CLONE') {
      this.whileLoading(() => options.fetchItem<Record<string, any>>(options, id))
        .then(item => new CrudObjectEdit(idKey, item, 'Clone Item')
          .openDialog(updatedObject => this.createItem(action, updatedObject)))
        .catch(error => this.logError(action, error));

    } else if (action === 'CREATE') {
      new CrudObjectEdit(idKey, options.getEmptyItem() ?? {}, 'Create Item')
        .openDialog(updatedObject => this.createItem(action, updatedObject));

    } else if (action === 'DELETE') {
      this.whileLoading(() => options.deleteItem(options, id))
        .then(() => {
          this.bodyModel?.filterRowsByPredict(row => !this.hasId(row, id));
          this.tableModel?.getTableScope()?.clearSelection(true);
          this.tableModel?.getTableScope()?.repaintHard();
        })
        .catch(error => this.logError(action, error));
    }
  }

  /** `createItem` without the id property (the server assigns it), then shows the new row. */
  private createItem(action: string, item: Record<string, any>): void {
    const options = this.crudOptions;
    const { [this.getIdKey()]: _ignoredId, ...itemWithoutId } = item;
    this.whileLoading(() => options.createItem(options, itemWithoutId)
      .then(response => this.isItemWithId(response) ? this.addRow(response) : this.reloadRows()))
      .catch(error => this.logError(action, error));
  }

  /** Copies the saved values into the row with the given id (rows, filter and sort order stay as they are). */
  private updateRow(id: unknown, item: Record<string, any>): void {
    const row = this.bodyModel?.getAllRows().find(r => this.hasId(r, id));
    if (row) {
      Object.assign(row, item);
      this.tableModel?.getTableScope()?.repaint();
    }
  }

  /** Appends a new row (shown as last row, also with an active filter or sort order). */
  private addRow(item: Record<string, any>): void {
    const bodyModel = this.bodyModel;
    if (bodyModel) {
      const allRows = bodyModel.getAllRows();
      const filteredRows = bodyModel.getFilteredRows();
      allRows.push(item);
      if (filteredRows !== allRows) {
        filteredRows.push(item);
      }
      this.tableModel?.getTableScope()?.repaintHard();
    }
  }

  /** Loads the list again (`fetchList`) – after a create whose response does not contain the new item. */
  private reloadRows(): Promise<void> {
    const options = this.crudOptions;
    return options.fetchList<any>(options).then(rows => {
      this.bodyModel?.setRows(rows ?? []);
      const tableScope = this.tableModel?.getTableScope();
      tableScope?.externalFilterChanged(false); // re-applies an external filter (if there is one)
      tableScope?.repaintHard();
    });
  }

  /**
   * Shows the loading overlay of the table while `request` runs (also when it fails). Before the table exists
   * (first `fetchList` in {@link createTableModel}) there is nothing to show it on.
   */
  private whileLoading<R>(request: () => Promise<R>): Promise<R> {
    const tableScope = this.tableModel?.getTableScope();
    tableScope?.showLoadingOverlay();
    const hide = () => tableScope?.hideOverlay();
    return request().then(result => {
      hide();
      return result;
    }, error => {
      hide();
      throw error;
    });
  }

  private getIdKey(): string {
    return this.crudOptions.getIdKey?.() ?? 'id';
  }

  /** The action column carries the id as text (data-id) – compare as strings. */
  private hasId(row: unknown, id: unknown): boolean {
    const rowId = this.getValueByT(row, this.getIdKey());
    return rowId !== undefined && rowId !== null && String(rowId) === String(id);
  }

  private isItemWithId(response: unknown): response is Record<string, any> {
    if (response === null || typeof response !== 'object' || Array.isArray(response)) {
      return false;
    }
    const id = this.getValueByT(response, this.getIdKey());
    return id !== undefined && id !== null;
  }

  private logError(what: string, error: unknown): void {
    console.error(`CrudTableModelFactory: ${what} failed`, error);
  }

  private calcAutoColumnWidths<T>(
    rows: T[],
    props: string[],
    labels: string[] = props
  ): number[] {
    const columnCount = props.length;

    if (!this.crudOptions.columnWidths?.autoCalc) {
      return new Array(columnCount).fill(200);
    }
    const rowCount = rows.length ?? 0;
    const characterLengthArr = new Array(columnCount).fill(0);
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < columnCount; c++) {
        const property = props[c];
        const value = this.getValueByT<T>(rows[r], property);
        const length = value?.toString().length || 0;
        if (length > characterLengthArr[c]) {
          characterLengthArr[c] = length;
        }
      }
    }
    if (this.crudOptions.columnWidths.takeHeaderLabelsIntoAccount) {
      for (let c = 0; c < columnCount; c++) {
        const length = labels[c].length || 0;
        if (length > characterLengthArr[c]) {
          characterLengthArr[c] = length;
        }
      }
    }
    const min = this.crudOptions.columnWidths.minWidth;
    const max = this.crudOptions.columnWidths.maxWidth;
    return characterLengthArr
      .map((charLen, _idx) =>
        Math.min(
          max,
          Math.max(
            this.crudOptions.columnWidths.charCountToWidth(charLen, _idx),
            min
          )));
  }

  private getValueByT<T>(t: T, property: string) {
    if (property.includes('.')) {
      return this.getPropertyValue(t, property.split('.'));
    }
    return t[property  as keyof typeof t];
  }

  private getPropertyValue(o: any, props: string[]): any {
    const prop = props.shift();
    const o2 = o[prop as keyof typeof o];
    if (o2 && props.length) {
      return this.getPropertyValue(o2, props);
    }
    return o2;
  }

  private extractProperties(obj: any, parentKey: string = '', result: string[] = []): string[] {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          this.extractProperties(obj[key], newKey, result);
        } else {
          result.push(newKey);
        }
      }
    }
    return result;
  }


}
