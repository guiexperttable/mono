import type { ColumnFilterOperator } from "./column-filter-operator.type";
import type {
  ColumnFilterMenuOptionsIf,
  ColumnFilterOptionsIf,
  ColumnFilterTextsIf,
  FilterRowOptionsIf,
} from "./column-filter-options.if";

/**
 * Default options of the per-column filter menu ({@link TableOptionsIf.columnFilterMenu}).
 *
 * @example
 * const opts = ColumnFilterMenuOptions.create({ applyOnChange: true });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export class ColumnFilterMenuOptions implements ColumnFilterMenuOptionsIf {
  showCondition = true;
  showValues = true;
  applyOnChange = false;
  maxValues = 10_000;

  static create(
    option?: boolean | Partial<ColumnFilterMenuOptionsIf>,
    defaultMaxValues?: number,
  ): ColumnFilterMenuOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const def = new ColumnFilterMenuOptions();
    const fallbackMax = defaultMaxValues !== undefined && defaultMaxValues > 0 ? defaultMaxValues : def.maxValues;
    if (option === true) {
      return { ...def, maxValues: fallbackMax };
    }
    return {
      showCondition: option.showCondition ?? def.showCondition,
      showValues: option.showValues ?? def.showValues,
      applyOnChange: option.applyOnChange ?? def.applyOnChange,
      maxValues: Math.max(1, option.maxValues ?? fallbackMax),
    };
  }
}

/**
 * Default options of the persistent filter row ({@link TableOptionsIf.filterRow}).
 *
 * @example
 * const opts = FilterRowOptions.create({ debounce: 100 });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export class FilterRowOptions implements FilterRowOptionsIf {
  visible = true;
  debounce = 200;
  placeholder?: string = undefined;
  height = 34;
  clearButtonVisible = true;
  minInputWidthInPx = 44;

  static create(option?: boolean | Partial<FilterRowOptionsIf>): FilterRowOptionsIf | undefined {
    if (!option) {
      return undefined;
    }
    const def = new FilterRowOptions();
    if (option === true) {
      return def;
    }
    return {
      visible: option.visible ?? def.visible,
      debounce: Math.max(0, option.debounce ?? def.debounce),
      placeholder: option.placeholder ?? def.placeholder,
      height: Math.max(20, option.height ?? def.height),
      clearButtonVisible: option.clearButtonVisible ?? def.clearButtonVisible,
      minInputWidthInPx: Math.max(20, option.minInputWidthInPx ?? def.minInputWidthInPx),
    };
  }
}

/**
 * Default global options of {@link TableOptionsIf.columnFilter}.
 *
 * @example
 * const opts = ColumnFilterOptions.create({ caseSensitive: true });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export class ColumnFilterOptions implements ColumnFilterOptionsIf {
  managed = true;
  caseSensitive = false;
  locale?: string = undefined;
  maxValues = 10_000;

  static create(partial?: Partial<ColumnFilterOptionsIf>): ColumnFilterOptionsIf {
    const def = new ColumnFilterOptions();
    if (!partial) {
      return def;
    }
    return {
      managed: partial.managed ?? def.managed,
      caseSensitive: partial.caseSensitive ?? def.caseSensitive,
      locale: partial.locale ?? def.locale,
      maxValues: partial.maxValues ?? def.maxValues,
    };
  }
}

/**
 * Default English UI texts of {@link TableOptionsIf.columnFilterTexts}.
 *
 * @example
 * const texts = ColumnFilterTexts.create({ ok: "Übernehmen", cancel: "Abbrechen" });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export class ColumnFilterTexts implements ColumnFilterTextsIf {
  searchPlaceholder = "Search";
  searchValuesPlaceholder = "Search values…";
  selectAll = "(Select all)";
  blanks = "(Blanks)";
  ok = "OK";
  cancel = "Cancel";
  clear = "Clear";
  andLabel = "and";
  noValues = "No values";
  columnsTitle = "Columns";
  searchColumnsPlaceholder = "Search columns…";
  operators: Record<ColumnFilterOperator, string> = {
    contains: "Contains",
    startsWith: "Starts with",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Does not equal",
    lessThan: "Less than",
    lessOrEqual: "Less than or equal",
    greaterThan: "Greater than",
    greaterOrEqual: "Greater than or equal",
    between: "Between",
    blank: "Blank",
    notBlank: "Not blank",
  };

  selectedValuesCount(count: number): string {
    return count === 1 ? "(1 value)" : `(${count} values)`;
  }

  valuesTruncated(max: number): string {
    return `Showing first ${max.toLocaleString("en-US")} values – refine your search`;
  }

  static create(partial?: Partial<ColumnFilterTextsIf>): ColumnFilterTextsIf {
    const def = new ColumnFilterTexts();
    if (!partial) {
      return def;
    }
    return {
      searchPlaceholder: partial.searchPlaceholder ?? def.searchPlaceholder,
      searchValuesPlaceholder: partial.searchValuesPlaceholder ?? def.searchValuesPlaceholder,
      selectAll: partial.selectAll ?? def.selectAll,
      blanks: partial.blanks ?? def.blanks,
      ok: partial.ok ?? def.ok,
      cancel: partial.cancel ?? def.cancel,
      clear: partial.clear ?? def.clear,
      andLabel: partial.andLabel ?? def.andLabel,
      selectedValuesCount: partial.selectedValuesCount ?? def.selectedValuesCount.bind(def),
      valuesTruncated: partial.valuesTruncated ?? def.valuesTruncated.bind(def),
      noValues: partial.noValues ?? def.noValues,
      columnsTitle: partial.columnsTitle ?? def.columnsTitle,
      searchColumnsPlaceholder: partial.searchColumnsPlaceholder ?? def.searchColumnsPlaceholder,
      operators: { ...def.operators, ...(partial.operators ?? {}) },
    };
  }
}
