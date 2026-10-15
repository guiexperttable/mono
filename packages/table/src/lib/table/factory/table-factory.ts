import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { DefaultRowHeightsIf } from "../data/options/default-row-heights.if";
import { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { GetT } from "../data/common/get-t";
import { TableOptionsIf } from "../data/options/table-options.if";
import { TableModelIf } from "../data/tablemodel/table-model.if";
import { DefaultRowHeights } from "../data/options/default-row-heights";
import { ColumnDef } from "../data/tablemodel/column/column-def";
import { px200 } from "../data/common/sizes";
import { AreaModelArrayOfArrays } from "../data/tablemodel/areamodel/area-model-array-of-arrays";
import { AreaModelHidden } from "../data/tablemodel/areamodel/area-model-hidden";
import { TreeRow } from "../data/common/tree-row";
import { AreaModelTree } from "../data/tablemodel/areamodel/area-model-tree";
import { TreeCheckboxModel } from "../checkbox/tree-checkbox-model";
import { TableModel } from "../data/tablemodel/table-model";
import { SelectionModelIf } from "../selection/selection-model.if";
import {
  AreaModelObjectArrayWithColumndefs
} from "../data/tablemodel/areamodel/area-model-object-array-with-columndefs";
import { TableOptions } from "../data/options/table-options";
import { isRowNumberColumnDef, isTreeRow } from "../instanceof-workaround";
import { RowNumberColumnDef } from "../data/common/row-number-column-def";
import { RowNumberOptionsIf } from "../data/common/row-number-options.if";
import { getLeadingRowNumberColumnCount } from "../data/common/row-number-columns";
import { AreaModelAggregateFooter } from "../data/tablemodel/areamodel/area-model-aggregate-footer";
import type { AggregateFooterConfig } from "../data/tablemodel/areamodel/aggregate-footer-options.if";


/**
 * Parameters of {@link TableFactory.createTableModel} – pass any subset (`Partial<CreateTableModelPara>`).
 *
 * Three typical combinations:
 *
 * | You have … | Pass | Training |
 * |---|---|---|
 * | an array of objects | `rows` (+ `properties` or `columnDefs`) | [chapter 12](https://gui.expert/training/array-to-table-model/), [13](https://gui.expert/training/column-definitions/) |
 * | rows of values (CSV, matrix) | `headerData`, `bodyData`, `footerData`, `columnSizes` | [chapter 14](https://gui.expert/training/array-of-arrays/) |
 * | own area models | `headerAreaModel`, `bodyAreaModel`, `footerAreaModel` + `columnDefs` | [chapter 15–17](https://gui.expert/training/custom-area-model/) |
 *
 * Everything not given is derived: column definitions from `properties` or the keys of the first row
 * (header label = key in upper case, width 200 px), area models from the data, row heights from
 * `tableOptions.defaultRowHeights`.
 *
 * @example
 * const tableModel = TableFactory.createTableModel({
 *   rows: orders,                                   // Order[]
 *   columnDefs: [new ColumnDef("id", "ID", px80, allRight), new ColumnDef("customer", "Customer", px180)],
 *   fixedLeftColumnCount: 1,
 *   tableOptions
 * });
 *
 * @category Table model
 */
export interface CreateTableModelPara {
  /** Model of the header. Default: one header row from the `headerLabel`s of `columnDefs`, or `headerData`. */
  headerAreaModel: AreaModelIf;
  /** Model of the body. Default: built from `rows` (objects or tree rows) or `bodyData`. See {@link AreaModel} for own models. */
  bodyAreaModel: AreaModelIf;
  /** Model of the footer. Default: `footerAggregates`, `footerData`, otherwise no footer. */
  footerAreaModel: AreaModelIf;
  /**
   * A footer with totals that follow filter and sorting ({@link AreaModelAggregateFooter}): `{ total: "sum" }` (one
   * row – the key is the property of the column), `[{ label, aggregates }, …]` (several rows) or full
   * {@link AggregateFooterOptionsIf}. Row height: `defaultRowHeights.footer`. Ignored with an own `footerAreaModel`
   * (warning); `footerData` is ignored with it (warning).
   *
   * @example
   * const tableModel = TableFactory.createTableModel({
   *   rows: orders,
   *   columnDefs,
   *   footerAggregates: { quantity: "sum", total: "sum" }       // footer: "100,000 rows" | … | 549,812 | 27,481,033.5
   * });
   *
   * @since 1.1.94
   */
  footerAggregates: AggregateFooterConfig;
  /** Number of columns fixed on the left (side "west"). Default 0. */
  fixedLeftColumnCount: number;
  /** Number of columns fixed on the right (side "east"). Default 0. */
  fixedRightColumnCount: number;
  /** Show a checkbox column for every row. Default false. */
  rowCheckboxVisible: boolean;
  /**
   * Row numbers (1, 2, 3 …) in a column in front of all others, fixed on the left: `true` or options
   * ({@link RowNumberOptionsIf}). Puts a {@link RowNumberColumnDef} in front of `columnDefs` and adds 1 to
   * `fixedLeftColumnCount`; `headerData`/`footerData` get an empty cell in front. Default false.
   *
   * The column is a real column: the indices of all other columns are one higher – use properties where you can
   * ({@link TableApi.getColumnIndex}). With `bodyData` or own area models the flag is ignored (with a warning), because
   * their columns would shift – put a `RowNumberColumnDef` into the column definitions of your models yourself.
   *
   * @example
   * const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, rowNumbersVisible: true });
   *
   * @since 1.1.93
   */
  rowNumbersVisible: boolean | Partial<RowNumberOptionsIf>;
  /** Row heights of header, body and footer in px. Default: `tableOptions.defaultRowHeights`, otherwise 34 / 34 / 34. */
  defaultRowHeights: DefaultRowHeightsIf;
  /** The columns: property, header label, width, classes, renderers, sorting, editing. See {@link ColumnDef}. */
  columnDefs: ColumnDefIf[];
  /** Column widths in px – the simple alternative to `columnDefs` (e.g. with `bodyData`). */
  columnSizes: number[];
  /** A width in px for all columns; -1 (default) = use the column definitions. */
  overridingColumnWidth: number;
  /** Number of columns. Default: derived from `columnDefs`, `headerData` or `columnSizes`. */
  columnCount: number;
  /** Width of the parent element in px, used for percentage column widths before the first render (default 400). */
  parentSize: number;
  /** Selection model factory. Default: `tableOptions.getSelectionModel`. */
  getSelectionModel: GetT<SelectionModelIf>;
  /** The rows as objects (`T[]`) or tree rows from {@link TreeFactory.buildTreeRows}. */
  rows: any[];
  /** Which properties of `rows` become columns, in this order (ignored if `columnDefs` is given). */
  properties: string[];
  /** The body as rows of values (`any[][]`). */
  bodyData: any[][];
  /** Header rows as values – several rows are possible. */
  headerData: string[][];
  /** Footer rows as values (static – they don't follow filter or edits). */
  footerData: string[][];
  /** Options of the table; the factory reads `defaultRowHeights`, `getSelectionModel` and `showCheckboxWihoutExtraColumn`. */
  tableOptions: TableOptionsIf;
}

/**
 * Creates {@link TableModelIf table models} from data – the usual way to start a table.
 *
 * - {@link createTableModel} – the universal entry point with named parameters ({@link CreateTableModelPara}).
 * - {@link buildByTypedRows} – rows + column definitions (+ options, fixed columns).
 * - {@link createByObjectArray} – rows + header/footer rows as data.
 * - {@link createByAreaModels} – three area models of your own.
 *
 * Trees: build the rows with {@link TreeFactory.buildTreeRows} first, then pass them as `rows`.
 *
 * @example
 * // all keys of the first row become columns
 * const simple = TableFactory.createTableModel({ rows: orders });
 *
 * // choose and order the columns – typed
 * const properties: (keyof Order)[] = ["id", "date", "customer", "total"];
 * const selected = TableFactory.createTableModel({ rows: orders, properties });
 *
 * // rows of values with a header and a footer row
 * const csv = TableFactory.createTableModel({
 *   headerData: [["ID", "City"]],
 *   bodyData: [[1, "Berlin"], [2, "Paris"]],
 *   footerData: [["", "2 rows"]],
 *   columnSizes: [80, 160]
 * });
 *
 * @see Training: [Array&lt;T&gt; → TableModel](https://gui.expert/training/array-to-table-model/),
 *   [Array of arrays](https://gui.expert/training/array-of-arrays/)
 *
 * @category Table model
 */
export class TableFactory {

  /**
   * Creates a table model from any subset of {@link CreateTableModelPara}.
   * Missing parts are derived (see {@link CreateTableModelPara}).
   *
   * @param p - rows, column definitions, area models, fixed columns, options …
   * @returns the table model for `new TableScope(host, tableModel, …)` or the `tableModel` input of a framework wrapper
   *
   * @example
   * const tableModel = TableFactory.createTableModel({
   *   rows: orders,
   *   columnDefs,
   *   fixedLeftColumnCount: 1,
   *   footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel())
   * });
   */
  public static createTableModel(p: Partial<CreateTableModelPara>): TableModelIf {

    if (p.defaultRowHeights === undefined) {
      if (p.tableOptions?.defaultRowHeights) {
        p.defaultRowHeights = p.tableOptions.defaultRowHeights;
      } else {
        p.defaultRowHeights = new DefaultRowHeights();

        if (p.headerAreaModel && "defaultRowHeight" in p.headerAreaModel) {
          const dh = p.headerAreaModel.defaultRowHeight as number;
          if (dh > -1) {
            p.defaultRowHeights.header = dh;
          }
        }

        if (p.bodyAreaModel && "defaultRowHeight" in p.bodyAreaModel) {
          const dh = p.bodyAreaModel.defaultRowHeight as number;
          if (dh > -1) {
            p.defaultRowHeights.body = dh;
          }
        }

        if (p.footerAreaModel && "defaultRowHeight" in p.footerAreaModel) {
          const dh = p.footerAreaModel.defaultRowHeight as number;
          if (dh > -1) {
            p.defaultRowHeights.footer = dh;
          }
        }
      }
    }

    if (p.columnDefs === undefined) {
      if (p.properties?.length) {
        p.columnDefs = p.properties.map(p => new ColumnDef(p, p.toUpperCase(), px200));
      } else if (p.rows?.length) {
        p.columnDefs = Object.keys(p.rows[0]).map(p => new ColumnDef(p, p.toUpperCase(), px200));
      } else {
        p.columnDefs = [];
      }
    }

    TableFactory.addRowNumberColumn(p);

    if (p.columnCount === undefined) {
      if (p.columnDefs?.length) {
        p.columnCount = p.columnDefs.length;
      } else if (p.headerData?.length) {
        p.columnCount = p.headerData[0].length;
      } else if (p.columnSizes?.length) {
        p.columnCount = p.columnSizes?.length;
      } else {
        console.warn("Property \"columnCount\" is missing and cannot be derived from other properties.");
      }
    }


    if (!p.headerAreaModel) {
      if (p.headerData?.length) {
        p.headerAreaModel = new AreaModelArrayOfArrays<string>(
          "header",
          p.headerData,
          p.defaultRowHeights.header,
          p.columnDefs
        );
      } else if (p.columnDefs?.length) {
        p.headerAreaModel = new AreaModelArrayOfArrays<string>(
          "header",
          [p.columnDefs.map(def => def.headerLabel)],
          p.defaultRowHeights.header,
          p.columnDefs
        );
      } else {
        p.headerAreaModel = new AreaModelHidden("header");
      }
    }
    const footerAggregates = TableFactory.checkFooterAggregates(p);
    if (!p.footerAreaModel && !footerAggregates) {
      if (p.footerData?.length) {
        p.footerAreaModel = new AreaModelArrayOfArrays<string>(
          "footer",
          p.footerData,
          p.defaultRowHeights.footer,
          p.columnDefs
        );
      } else {
        p.footerAreaModel = new AreaModelHidden("footer");
      }
    }
    if (!p.bodyAreaModel) {
      if (p.rows) {

        if (p.rows?.length && isTreeRow(p.rows[0])) {
          // Tree:
          const treeRows = p.rows as TreeRow<any>[];
          p.bodyAreaModel = new AreaModelTree(
            "body",
            treeRows,
            p.defaultRowHeights.body,
            p.columnDefs
          );
          // the checkbox column is the first one – behind a RowNumberColumnDef the second one
          const checkboxExtraColumnVisible =
            p.columnDefs[getLeadingRowNumberColumnCount(p.columnDefs)]?.property === "CheckboxColumn";
          if (checkboxExtraColumnVisible || p.tableOptions?.showCheckboxWihoutExtraColumn) {
            p.bodyAreaModel.rowSelectionModel = new TreeCheckboxModel(treeRows);
          }
        } else {
          p.bodyAreaModel = new AreaModelObjectArrayWithColumndefs<any>(
            "body", p.rows, p.columnDefs, p.defaultRowHeights.body
          );
        }

      } else if (p.bodyData) {
        p.bodyAreaModel = new AreaModelArrayOfArrays<any>(
          "body", p.bodyData, p.defaultRowHeights.body
        );
      } else {
        p.bodyAreaModel = new AreaModelHidden("body");
      }
    }

    if (footerAggregates) {
      const options = AreaModelAggregateFooter.toOptions(footerAggregates);
      p.footerAreaModel = new AreaModelAggregateFooter(p.bodyAreaModel!, p.columnDefs ?? [], // the body is built above
        { ...options, rowHeight: options.rowHeight ?? p.defaultRowHeights.footer });
    }

    if (p.fixedLeftColumnCount === undefined) {
      p.fixedLeftColumnCount = 0;
    }
    if (p.fixedRightColumnCount === undefined) {
      p.fixedRightColumnCount = 0;
    }
    if (p.rowCheckboxVisible === undefined) {
      p.rowCheckboxVisible = false;
    }
    if (p.overridingColumnWidth === undefined) {
      p.overridingColumnWidth = -1;
    }

    if (!p.getSelectionModel && p.tableOptions?.getSelectionModel) {
      p.getSelectionModel = p.tableOptions?.getSelectionModel;
    }

    // Flat table:
    return new TableModel(
      p.headerAreaModel,
      p.bodyAreaModel,
      p.footerAreaModel ?? new AreaModelHidden("footer"),
      p.fixedLeftColumnCount,
      p.fixedRightColumnCount,
      p.rowCheckboxVisible,
      p.defaultRowHeights,
      p.columnDefs,
      p.columnSizes,
      p.overridingColumnWidth,
      p.columnCount,
      p.parentSize,
      p.getSelectionModel
    );
  }


  /**
   * `footerAggregates`: returns the configuration if the factory builds an aggregate footer (after the body model),
   * `undefined` if there is none or an own `footerAreaModel` wins.
   */
  private static checkFooterAggregates(p: Partial<CreateTableModelPara>): AggregateFooterConfig | undefined {
    if (!p.footerAggregates) {
      return undefined;
    }
    if (p.footerAreaModel) {
      console.warn("TableFactory.createTableModel: footerAggregates is ignored – an own footerAreaModel is given.");
      return undefined;
    }
    if (p.footerData?.length) {
      console.warn("TableFactory.createTableModel: footerData is ignored – footerAggregates builds the footer.");
    }
    return p.footerAggregates;
  }

  /**
   * `rowNumbersVisible`: puts a RowNumberColumnDef in front of the column definitions (and an empty cell in front of
   * `headerData`/`footerData`) and fixes it on the left. Only where the factory builds the models from the column
   * definitions – with `bodyData` or own area models every column would shift by one.
   */
  private static addRowNumberColumn(p: Partial<CreateTableModelPara>): void {
    if (!p.rowNumbersVisible) {
      return;
    }
    if (p.bodyData || p.headerAreaModel || p.bodyAreaModel || p.footerAreaModel) {
      console.warn("TableFactory.createTableModel: rowNumbersVisible is ignored with bodyData or own area models " +
        "(their columns would shift) – put a RowNumberColumnDef into the column definitions yourself.");
      return;
    }
    const columnDefs = p.columnDefs ?? [];
    if (isRowNumberColumnDef(columnDefs[0])) {
      return; // already there
    }
    const options = p.rowNumbersVisible === true ? {} : p.rowNumbersVisible;
    const rowNumberColumnDef = new RowNumberColumnDef(options);
    p.columnDefs = [rowNumberColumnDef, ...columnDefs]; // a new array: the caller's array stays as it is
    p.fixedLeftColumnCount = (p.fixedLeftColumnCount ?? 0) + 1;
    if (p.columnCount !== undefined) {
      p.columnCount++;
    }
    if (p.headerData?.length) {
      const last = p.headerData.length - 1;
      p.headerData = p.headerData.map((row, i) => [i === last ? rowNumberColumnDef.headerLabel : "", ...row]);
    }
    if (p.footerData?.length) {
      p.footerData = p.footerData.map(row => ["", ...row]);
    }
  }


  /**
   * Constructs a table model (an instance of `TableModelIf`) by using provided parameters.
   *
   * @template T The generic parameter that represents the datatype of rows.
   *
   * @param {Object} param The parameter object.
   * @param {T[]} param.rows The rows data to be used in the table model.
   * @param {ColumnDefIf[]} param.columnDefs The definition of columns that are to be used in the table model.
   * @param {TableOptionsIf} [param.tableOptions=new TableOptions()] Optional table options that may override default table settings. Defaults to `new TableOptions()`.
   * @param {number} [param.fixedLeftColumnCount=0] Optional parameter that specifies the count of fixed (non-scrollable) columns from the left. Defaults to `0`.
   * @param {number} [param.fixedRightColumnCount=0] Optional parameter that specifies the count of fixed (non-scrollable) columns from the right. Defaults to `0`.
   *
   * @returns {TableModelIf} The newly constructed table model.
   *
   * @static
   * @method
   */
  static buildByTypedRowsParam<T>(param: {
    rows: T[],
    columnDefs: ColumnDefIf[],
    tableOptions?: TableOptionsIf,
    fixedLeftColumnCount?: number,
    fixedRightColumnCount?: number
  }): TableModelIf {

    return TableFactory.buildByTypedRows<T>(
      param.rows ?? [],
      param.columnDefs,
      param.tableOptions ?? new TableOptions(),
      param.fixedLeftColumnCount ?? 0,
      param.fixedRightColumnCount ?? 0
    );
  }


  /**
   * Static method that helps to build a table model object. It takes in tabular data and options and constructs a suitable
   * model for rendering as a table. This method is capable of handling both 'Flat' and 'Tree' data structures.
   *
   * @typeparam T - The type of the data in the rows.
   *
   * @param rows - An array of the data rows. The type of these rows could be anything which is defined by the generic type parameter T.
   *
   * @param columnDefs - An array of objects that define the columns of the table. Each object represents one column.
   *
   * @param tableOptions - A configuration object that allows you to customize how the table is displayed and behaves.
   * This is optional, and if not provided it defaults to a new instance of TableOptions.
   *
   * @param fixedLeftColumnCount - Optional parameter that specifies the number of columns that should remain fixed from the left
   * side of the table while scrolling horizontally. It defaults to 0 if not provided.
   *
   * @param fixedRightColumnCount - Optional parameter that specifies the number of columns that should remain fixed from the right
   * side of the table while scrolling horizontally. It defaults to 0 if not provided.
   *
   * @returns A TableModelIf object which can be used to render the table. The TableModelIf defines the structure of the table and
   * contains all its data and state.
   *
   * @usageNotes
   *
   * Here is an example of using this static method to build a table model:
   *
   * ```typescript
   * const tableModel = TableFactory.buildByTypedRows<User>(users, [{ property: 'name', headerLabel: 'Name' }, { property: 'email', headerLabel: 'Email' }]);
   * ```
   *
   * This will build a table with two columns 'Name' and 'Email', each row representing a 'User' object from the 'users' array.
   *
   * **Warning:** This function assumes that the first columnDef provided represents a checkbox column if the property of the first
   * columnDef is "CheckboxColumn". If the first column is not a checkbox column, ensure that the first columnDef does not have "CheckboxColumn"
   * as its property.
   */
  static buildByTypedRows<T>(
    rows: T[],
    columnDefs: ColumnDefIf[],
    tableOptions: TableOptionsIf = new TableOptions(),
    fixedLeftColumnCount: number = 0,
    fixedRightColumnCount: number = 0
  ): TableModelIf {

    const defaultRowHeights = tableOptions.defaultRowHeights;
    const checkboxExtraColumnVisible =
      columnDefs[getLeadingRowNumberColumnCount(columnDefs)]?.property === "CheckboxColumn";

    if (rows?.length && isTreeRow(rows[0])) {
      // Tree:
      const treeRows = rows as TreeRow<T>[];
      const bodyareaModel = new AreaModelTree(
        "body",
        treeRows,
        defaultRowHeights.body,
        columnDefs
      );
      if (checkboxExtraColumnVisible || tableOptions.showCheckboxWihoutExtraColumn) {
        bodyareaModel.rowSelectionModel = new TreeCheckboxModel(treeRows);
      }
      return TableFactory.createByAreaModelsParam({
        headerAreaModel: new AreaModelArrayOfArrays<string>("header", [columnDefs.map(def => def.headerLabel)], defaultRowHeights.header),
        bodyAreaModel: bodyareaModel,
        footerAreaModel: new AreaModelArrayOfArrays<string>("footer", [], defaultRowHeights.footer),
        columnDefs,
        fixedLeftColumnCount,
        fixedRightColumnCount,
        defaultRowHeights: tableOptions.defaultRowHeights,
        rowCheckboxVisible: false,
        columnSizes: [],
        columnCount: columnDefs.length,
        overridingColumnWidth: -1
      });
    }

    // Flat table:
    let tableModel = TableFactory.createByObjectArrayParam({
      rows,
      columnDefs,
      fixedLeftColumnCount,
      fixedRightColumnCount,
      defaultRowHeights: tableOptions.defaultRowHeights,
    });
    return tableModel;

  }



  /**
   * The `createByObjectArrayParam` static method is used to create a `TableFactory` object with the data contained in the `param` object.
   * This method would call the `createByObjectArray` static method, which actually constructs the `TableModel` object with the provided data.
   *
   * @template T - Defines the type of the items contained in the rows.
   *
   * @param {Object} param - Method parameter as an object that carries several properties described below:
   * @param {T[]} param.rows - Array of table row data that can be of any type.
   * @param {string[][]} [param.header] - Optional array of arrays with the table header data.
   * @param {string[][]} [param.footer] - Optional array of arrays with the table footer data.
   * @param {number} [param.fixedLeftColumnCount] - Optional number detailing how many of the beginning columns are sticky to the left.
   * @param {number} [param.fixedRightColumnCount] - Optional number detailing how many of the ending columns are sticky to the right.
   * @param {boolean} [param.rowCheckboxVisible] - Optional flag that indicates whether checkboxes are visible in the rows.
   * @param {DefaultRowHeightsIf} [param.defaultRowHeights] - Optional object defining default heights of rows in different sections of the table. Defaults to new `DefaultRowHeights()`.
   * @param {ColumnDefIf[]} [param.columnDefs] - Optional array of column definitions, each is an object conforming to `ColumnDefIf` interface.
   * @param {number[]} [param.columnSizes] - Optional array of numbers providing the specific sizes for columns.
   *
   * @returns A `TableFactory` object created by the `createByObjectArray` method.
   *
   * @example
   * let param = {
   *   rows: [{name: 'John', age: 30}, {name: 'Doe', age: 40}],
   *   header: [['Name', 'Age']],
   *   footer: [['Avg', '35']],
   *   fixedLeftColumnCount: 1,
   *   fixedRightColumnCount: 0,
   *   rowCheckboxVisible: true,
   *   defaultRowHeights: new DefaultRowHeights(40, 50, 40),
   *   columnDefs: [
   *     new ColumnDef('name', 'Name', px100),
   *     new ColumnDef('age', 'Age', px50)
   *   ],
   *   columnSizes: [100, 50]
   * };
   * const tableModel = TableFactory.createByObjectArrayParam(param);
   */
  public static createByObjectArrayParam<T>(param: {
    rows: T[],
    header?: string[][],
    footer?: string[][],
    fixedLeftColumnCount?: number,
    fixedRightColumnCount?: number,
    rowCheckboxVisible?: boolean,
    defaultRowHeights?: DefaultRowHeightsIf,
    columnDefs?: ColumnDefIf[],
    columnSizes?: number[]
  }) {
    const rowCheckboxVisible = param.rowCheckboxVisible !== undefined ? param.rowCheckboxVisible : false;
    return TableFactory.createByObjectArray<T>(
      param.rows,
      param.header ?? [],
      param.footer ?? [],
      param.fixedLeftColumnCount ?? 0,
      param.fixedRightColumnCount ?? 0,
      rowCheckboxVisible,
      param.defaultRowHeights ?? new DefaultRowHeights(),
      param.columnDefs ?? [],
      param.columnSizes ?? []
    );
  }


  /**
   * This public static factory method creates a `TableModel` instance using the provided parameters.
   * Each parameter has a default value allowing for great flexibility in creating table models.
   * The main parameters are the AreaModel instances for different table sections:
   *
   * @param headerAreaModel - This parameter of type `AreaModelIf` represents the header area of the table.
   * The default value is a new instance of `AreaModelHidden`, indicating an invisible header.
   *
   * @param bodyAreaModel - This parameter of type `AreaModelIf` represents the body area of the table and is required.
   * It needs to be passed as it contains all the row data that will be displayed in the table.
   *
   * @param footerAreaModel - This `AreaModelIf` type parameter represents the footer area of the table.
   * Similar to `headerAreaModel`, the default value is a new instance of `AreaModelHidden`, indicating an invisible footer.
   *
   * Also, the method receives parameters for fixed columns, row checkbox visibility, default row heights, column definitions, column sizes, overriding column width, and column count:
   *
   * @param fixedLeftColumnCount - This value indicates the number of fixed columns on the left side of the table.
   * The default value is `0`, no fixed column by default.
   *
   * @param fixedRightColumnCount - This value indicates the number of fixed columns on the right side of the table.
   * Similarly to `fixedLeftColumnCount`, its default value is `0`.
   *
   * @param rowCheckboxVisible - This is a boolean that determines whether a checkbox will be visible for each row.
   * The default value is `false`, indicating that checkboxes will not be displayed unless otherwise specified.
   *
   * @param defaultRowHeights - This object of type `DefaultRowHeightsIf` allows setting of the default row heights for the table sections.
   * By default, it creates a new `DefaultRowHeights` instance with values of `34` for header, body and footer.
   *
   * @param columnDefs - Here, an array of `ColumnDefIf[]` needs to be passed to specify the column definitions.
   *
   * @param columnSizes - This is an array of `number[]` providing custom column sizes.
   * If not defined, an empty array `[]` is used.
   *
   * @param overridingColumnWidth - This number sets a uniform width for all columns, overriding individual column sizes.
   * Default value is `-1`, indicating that this feature is disabled by default.
   *
   * @param columnCount - This is the total column count.
   *
   * @return A new instance of `TableModel` is created using the provided parameters.
   * If a parameter isn't provided, the default value is used.
   */
  public static createByAreaModels(
    headerAreaModel: AreaModelIf = new AreaModelHidden(),
    bodyAreaModel: AreaModelIf,
    footerAreaModel: AreaModelIf = new AreaModelHidden(),
    fixedLeftColumnCount: number = 0,
    fixedRightColumnCount: number = 0,
    rowCheckboxVisible: boolean = false,
    defaultRowHeights: DefaultRowHeightsIf = new DefaultRowHeights(),
    columnDefs: ColumnDefIf[],
    columnSizes: number[] = [],
    overridingColumnWidth: number = -1,
    columnCount: number
  ) {
    return new TableModel(
      headerAreaModel,
      bodyAreaModel,
      footerAreaModel,
      fixedLeftColumnCount,
      fixedRightColumnCount,
      rowCheckboxVisible,
      defaultRowHeights,
      columnDefs,
      columnSizes,
      overridingColumnWidth,
      columnCount
    );
  }


  /**
   * `TableFactory.createByAreaModelsParam` is a static method in the `TableFactory` class that creates a table model by area models and other optional parameters.
   * This method allows more flexibility and control over table building by providing the option to decide the visibility and nature of the header, body, footer, columns, and rows in the table.
   *
   * @param `param` is an object that holds the configuration settings for creating the table model. Below are the properties that this object can have:
   *   - `headerAreaModel`: Optional. An instance of `AreaModelIf` class to be used for creating the header of the table. If not provided, a new `AreaModelHidden` is created by default.
   *   - `bodyAreaModel`: Mandatory. An instance of `AreaModelIf` class for body of the table.
   *   - `footerAreaModel`: Optional. An instance of `AreaModelIf` class for table footer. If not provided, a new `AreaModelHidden` is created by default.
   *   - `fixedLeftColumnCount`: Optional. Number of fixed columns on the left side of the table. Default is 0.
   *   - `fixedRightColumnCount`: Optional. Number of fixed columns on the right side of the table. Default is 0.
   *   - `rowCheckboxVisible`: Optional. Boolean that decides if the row checkboxes are visible or not. Defaults to `false`.
   *   - `defaultRowHeights`: Optional. An instance of `DefaultRowHeightsIf` interface that specifies default row heights. No default value.
   *   - `columnDefs`: Optional. Array of instance(s) of `ColumnDefIf` interface to define column properties. Defaults to an empty array.
   *   - `columnSizes`: Optional. Array of numbers setting the sizes of the columns. Defaults to an empty array.
   *   - `overridingColumnWidth`: Optional. Overrides the width of all columns with this value. Defaults to `-1` which means no width override.
   *   - `columnCount`: Optional. Number setting the total count of columns. Defaults to 0.
   *
   * @returns a new instance of `TableModelIf` created by the `createByAreaModels` method of `TableFactory` using the provided parameters.
   *
   * Note: The area models (`headerAreaModel`, `bodyAreaModel`, `footerAreaModel`) should be initialized before being passed to this method. If not initialized, they might need to call their `init` method to ensure proper functioning.
   *
   * @example
   * const tableModel = TableFactory.createByAreaModelsParam({
   *    headerAreaModel: myHeaderModel,
   *    bodyAreaModel: myBodyModel,
   *    footerAreaModel: myFooterModel,
   *    fixedLeftColumnCount: 2,
   *    fixedRightColumnCount: 1,
   *    rowCheckboxVisible: true,
   *    defaultRowHeights: myDefaultHeights,
   *    columnDefs: myColumnDefs,
   *    columnSizes: [100, 100, 200],
   *    overridingColumnWidth: 150,
   *    columnCount: 3
   * });
   */
  public static createByAreaModelsParam(param: {
    headerAreaModel?: AreaModelIf,
    bodyAreaModel: AreaModelIf,
    footerAreaModel?: AreaModelIf,
    fixedLeftColumnCount?: number,
    fixedRightColumnCount?: number,
    rowCheckboxVisible?: boolean,
    defaultRowHeights?: DefaultRowHeightsIf,
    columnDefs?: ColumnDefIf[],
    columnSizes?: number[],
    overridingColumnWidth?: number,
    columnCount?: number
  }) {
    return TableFactory.createByAreaModels(
      param.headerAreaModel ?? new AreaModelHidden(),
      param.bodyAreaModel,
      param.footerAreaModel ?? new AreaModelHidden(),
      param.fixedLeftColumnCount ?? 0,
      param.fixedRightColumnCount ?? 0,
      param.rowCheckboxVisible === undefined ? false : param.rowCheckboxVisible,
      param.defaultRowHeights,
      param.columnDefs ?? [],
      param.columnSizes ?? [],
      param.overridingColumnWidth ?? -1,
      param.columnCount ?? 0
    );
  }


  /**
   * Class method `createByObjectArray` of the `TableFactory` class.
   *
   * This public, static method is intended to create a table model by an array of objects.
   * This method is particularly useful when you are aiming to build a table from a set of data rows, header and footer information.
   * The table can include both fixed and flexible columns and optional checkboxes for each row.
   * The table layout can further be customized using the default row heights, column definitions, and column sizes parameters.
   *
   * @generic `T` - The generic type parameter for data rows.
   *
   * @param `rows` - This parameter is an array of typed data rows (type `T`) for the table body.
   *
   * @param `header` - This optional parameter is a two-dimensional string array. It defines the table header data. The default value is an empty array.
   *
   * @param `footer` - This optional parameter is a two-dimensional string array. It defines the table footer data. The default value is an empty array.
   *
   * @param `fixedLeftColumnCount` - This optional parameter specifies the count of fixed (non-scrollable) columns on the left side of the table. The default value is 0.
   *
   * @param `fixedRightColumnCount` - This optional parameter specifies the count of fixed (non-scrollable) columns on the right side of the table. The default value is 0.
   *
   * @param `rowCheckboxVisible` - This optional boolean parameter tells whether to display checkboxes for each row in the table. The default value is false.
   *
   * @param `defaultRowHeights` - This optional parameter is an instance of `DefaultRowHeightsIf` interface. It sets the default row heights for the header, body, and footer areas of the table.
   *
   * @param `columnDefs` - This optional parameter is an array of column definitions (`ColumnDefIf[]`). It helps to define the settings and properties of individual columns.
   *
   * @param `columnSizes` - This optional parameter is a number array. It helps to define the column widths. The default value is an empty array.
   *
   * The method further processes the header, footer, and body data to create respective models (`AreaModelIf`), and ultimately it creates and returns a new instance of `TableModel` containing all those prepared models, options, and properties.
   *
   * @returns It returns an instance of `TableModel` with all the provided/processed parameters.
   *
   * Note: You need to import the `AreaModelArrayOfArrays` and `AreaModelHidden` classes from the respective package/module before using this method.
   *
   * Simpler with named parameters: {@link createTableModel}.
   *
   * @example
   * const rows = [{ field1: "data11", field2: "data12" }, { field1: "data21", field2: "data22" }];
   * const columnDefs: ColumnDefIf[] = [new ColumnDef("field1", "Field 1"), new ColumnDef("field2", "Field 2")];
   * const tableModel = TableFactory.createByObjectArray(rows, undefined, undefined, 0, 0, false, new DefaultRowHeights(), columnDefs);
   */
  public static createByObjectArray<T>(
    rows: T[],
    header: string[][] = [],
    footer: string[][] = [],
    fixedLeftColumnCount: number = 0,
    fixedRightColumnCount: number = 0,
    rowCheckboxVisible: boolean = false,
    defaultRowHeights: DefaultRowHeightsIf = new DefaultRowHeights(),
    columnDefs: ColumnDefIf[],
    columnSizes: number[] = []
  ) {
    let headerAreaModel: AreaModelIf;
    if (header?.length) {
      headerAreaModel = new AreaModelArrayOfArrays<string>("header", header, defaultRowHeights.header, columnDefs);
    } else if (columnDefs?.length) {
      headerAreaModel = new AreaModelArrayOfArrays<string>("header", [columnDefs.map(def => def.headerLabel)], defaultRowHeights.header, columnDefs);
    } else {
      headerAreaModel = new AreaModelHidden();
    }
    const footerAreaModel = footer ? new AreaModelArrayOfArrays<string>("footer", footer, defaultRowHeights.footer, columnDefs) : new AreaModelHidden();
    const bodyAreaModel = new AreaModelObjectArrayWithColumndefs<T>("body", rows, columnDefs, defaultRowHeights.body);

    return new TableModel(
      headerAreaModel,
      bodyAreaModel,
      footerAreaModel,
      fixedLeftColumnCount,
      fixedRightColumnCount,
      rowCheckboxVisible,
      defaultRowHeights,
      columnDefs,
      columnSizes
    );
  }
}
