// Prelude for check-doc-examples.mjs: every export of the core + the names the examples use without declaring them.
import {
  AbstractAreaModel, AriaGridInfo, AriaIds, AriaTexts, AriaTextsIf, LiveAnnouncer, TreeAriaInfo, TreeAriaModel, TreeAriaRowInfo, ActionEvent, ActionEventIf, ActionEventListenerIf, ActionId, ActionsCellRenderer, AddColumnDivPara, AnyPropertyType, AreaIdent, AreaMapFactory, AreaModel, AreaModelArrayOfArrays, AreaModelCellGroups, AreaModelHidden, AreaModelIf, AreaModelObjectArray, AreaModelObjectArrayWithColumndefs, AreaModelTree, AreaObjectMap, AreaObjectMapType, ArgsAdjustColumnsToRowParentParams, ArgsRenderCellDiv, ArrayPropertyType, AutoRestoreOptions, AutoRestoreOptionsIf, AvoidDoubleExecution, BooleanFunction, BooleanPropertyType, CellGroup, CellGroupExt, CellGroupExtCellRenderer, CellGroupIf, CellRange, CellRendererIf, CellgroupFactory, CheckboxBooleanPropertyCellRenderer, CheckboxCellRenderer, CheckboxColumnDef, CheckboxModel, CheckboxModelIf, CheckedType, ChunkData, ChunkDataIf, ColAndRowspanModel, CollapsedExpandedData, ColorRgb, ColorRgbIf, ColumnDef, ColumnDefGenerator, ColumnDefIf, ColumnWidths, ColumnWidthsIf, ConvenienceDomService, CopyService, CopyServiceIf, CoverGridBodyModel, CoverGridFactory, CoverGridTableModel, CrudAction, CrudObjectEdit, CrudObjectView, CrudOptions, CrudOptionsIf, CrudTableModelFactory, CssVars, DateToIntlDDMMYYYYCellRenderer, DateToIsoCellRenderer, DateToLocaleDateCellRenderer, DateToTecCellRenderer, DefaultRowHeights, DefaultRowHeightsIf, DivScope, DomServiceIf, EleScope, EventAdapter, EventCheckboxChangedHandler, EventFocusChangedListenerIf, EventListenerIf, EventSelectionChangedListenerIf, ExcelService, ExtendedSelectionType, FalseFn, FilterFunction, FocusModel, FocusModelIf, FocusType, GeCellIndices, GeCssColorUtil, GeFilterService, GeKeyEvent, GeModelChangeEvent, GeMouseEvent, GeScrollEvent, GeoData, GetEditRenderer, GetRowIdFn, GetStorageKeyFn, GetT, HasDefaultRowHeightIf, HeaderGroupOptions, HeaderGroupOptionsIf, HtmlStyle, Icon, IconIf, IndexAndPx, InputCellRenderer, InputHandler, IsSameFn, JsonService, LicenseManager, MaleFemaleToIconCellRenderer, MouseHandler, MouseTargetData, MultiRowsSelectionModel, NullPropertyType, NumberCellProgressBarCellRenderer, NumberCellRenderer, NumberPropertyType, ObjectArrayHolderIf, ObjectPropertyType, OnActionTriggeredIf, OsxShortcutActionIdMapping, PROPERTY_TYPE_KEY_ANY, PROPERTY_TYPE_KEY_ARRAY, PROPERTY_TYPE_KEY_BOOLEAN, PROPERTY_TYPE_KEY_NULL, PROPERTY_TYPE_KEY_NUMBER, PROPERTY_TYPE_KEY_OBJECT, PROPERTY_TYPE_KEY_STRING, PROPERTY_TYPE_KEY_UNDEFINED, Padding, PositiveAndNegativeNumberRenderer, ProgressBarCellRenderer, PropertyItem, PropertyType, PropertyTypeService, RenderScope, Renderer, RendererCleanupFnType, RequestChunk, RequestChunkIf, ResizeHandler, SchemeGenerator, SelectCellRenderer, SelectionMode, SelectionModel, SelectionModelIf, SelectionService, SelectionType, ShortcutActionIdMapping, ShortcutService, SideIdent, SimpleArrayCellRenderer, SimpleDomService, Size, SizeIf, SizeUnitType, SortItem, SortState, SortedOptions, SortedOptionsIf, StarRatingCellRenderer, StoreStateCollapsedExpandService, StoreStateScrollPosService, StoreStateSortingService, StringPropertyType, TableApi, TableCellUpdateEvent, TableCellUpdateEventIf, TableFactory, TableModel, TableModelAndOptions, TableModelAndOptionsIf, TableModelIf, TableOptions, TableOptionsIf, TableScope, ThreeColorGradientArg, ThreeColorGradientArgIf, TreeArrowType, TreeCheckboxModel, TreeFactory, TreeFactoryOptions, TreeOptions, TreeOptionsIf, TreeRow, TreeRowExpandedFn, TreeRowIf, TreeRowService, TrueFalseCellRenderer, TrueFn, TwoColorGradientArg, TwoColorGradientArgIf, UNIMPORTANT_TYPES, UndefinedPropertyType, UrlInfo, UrlInfoIf, UrlsIf, ValueInfo, ValueLabel, ValueLabelIf, ValueRowSortComparator, WindowsShortcutActionIdMapping, actionIds, allCenter, allLeft, allRight, bodyCenter, bodyLeft, bodyRight, createHarmonizedShortcutByKeyboardEvent, debounce, editInputPipe, editInputPipeForNumber, entitySuffix, escapeHtml, firstLetterUppercase, getAreaIdentByString, getEntityName, harmonizeShortcut, isAreaModelTree, isCheckboxCellRenderer, isCheckboxColumnDef, isTreeRow, px0, px10, px100, px110, px120, px130, px140, px150, px160, px170, px180, px190, px20, px200, px210, px220, px230, px240, px250, px260, px270, px280, px290, px30, px300, px40, px400, px50, px500, px60, px70, px80, px90, throttle, trimArraySuffixes, CreateTableModelPara
} from "__CORE__";

interface Order { id: number; date: string; customer: string; country: string; city: string; product: string;
  category: string; quantity: number; price: number; total: number; status: "open" | "paid" | "shipped" | "cancelled"; }
interface OrderNode { id: string; label: string; orders: number; total: number; children?: OrderNode[] }
declare const tableApi: TableApi;
declare const tableModel: TableModelIf;
declare const tableScope: TableScope;
declare const tableOptions: TableOptionsIf;
declare const orders: Order[];
declare const newOrders: Order[];
declare const host: HTMLDivElement;
declare const hostDiv: HTMLDivElement;
declare const columnDefs: ColumnDefIf[];
declare const column: ColumnDefIf;
declare const nodes: any[];
declare const data: any[];
declare const matrix: any[][];
declare const row: number, price: number, up: boolean, volume: number;
declare const STATUS_ORDER: string[];
declare class EuroRenderer implements CellRendererIf { render(...a: any[]): undefined }
declare class OrderTotalsFooterModel extends AreaModel { constructor(getBody: () => AreaModelIf) }
declare function showMyMenu(x: number, y: number, row: number): void;
declare const newModel: TableModelIf;
type MyRowType = any;
declare const newData: any[];
declare const newDataSet: any[];
declare const searchText: string;
declare const myTableScope: TableScope;
declare const rowIndex: number;
declare const columnIndex: number;
declare const selectionModel: SelectionModel;
declare const searchInput: HTMLInputElement;
declare const bodyAreaModel: AreaModelObjectArray<any>;
declare const areaModel: AreaModelIf;
declare const rows: any[];
declare const domService: DomServiceIf;
declare const cellDiv: HTMLDivElement;
interface Person { id: number; name: string; age: number; city?: string }
declare const newTableModel: TableModelIf;
declare const myHeaderModel: AreaModelIf, myBodyModel: AreaModelIf, myFooterModel: AreaModelIf;
declare const myDefaultHeights: DefaultRowHeightsIf;
declare const myColumnDefs: ColumnDefIf[];
declare class StatusBadgeRenderer implements CellRendererIf { render(...a: any[]): undefined }
declare const eventTarget: EventTarget;
declare const headerAreaModel: AreaModelIf;
declare function fetchDataFromServer(): any[];
declare const focusModel: FocusModelIf;
declare class MyFocusChangeListener implements EventFocusChangedListenerIf { onFocusChanged(m: FocusModelIf): void }
declare const dom: DomServiceIf; declare const cellValue: any;
