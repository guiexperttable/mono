/**
 * A built-in function of cell formulas: name, signature and a short English description – for function suggestions
 * and help texts.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface FormulaFunctionInfoIf {
  readonly name: string;
  /** e.g. `"SUM(number1, [number2], …)"` */
  readonly signature: string;
  readonly description: string;
  readonly group: "Math" | "Conditional" | "Logic" | "Lookup" | "Text" | "Date" | "Info";
}

const f = (group: FormulaFunctionInfoIf["group"], name: string, args: string, description: string): FormulaFunctionInfoIf =>
  Object.freeze({ name, signature: `${name}(${args})`, description, group });

/**
 * The built-in functions of cell formulas (Excel signatures and semantics), sorted by name.
 *
 * @example
 * FORMULA_FUNCTION_INFO.filter(i => i.name.startsWith("SU")).map(i => i.signature);
 * // ["SUBSTITUTE(text, old_text, new_text, [instance])", "SUM(number1, [number2], …)", …]
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export const FORMULA_FUNCTION_INFO: readonly FormulaFunctionInfoIf[] = Object.freeze([
  f("Math", "ABS", "number", "The absolute value"),
  f("Logic", "AND", "logical1, [logical2], …", "TRUE if all arguments are TRUE"),
  f("Math", "AVERAGE", "number1, [number2], …", "The average of the numbers"),
  f("Conditional", "AVERAGEIF", "range, criteria, [average_range]", "The average of the cells that match a criterion"),
  f("Conditional", "AVERAGEIFS", "average_range, criteria_range1, criteria1, …", "The average of the cells that match all criteria"),
  f("Math", "CEILING", "number, significance", "Rounds up to a multiple of significance"),
  f("Text", "CONCAT", "text1, [text2], …", "Joins texts and ranges"),
  f("Math", "COUNT", "value1, [value2], …", "Counts the numbers"),
  f("Math", "COUNTA", "value1, [value2], …", "Counts the non-empty cells"),
  f("Math", "COUNTBLANK", "range", "Counts the empty cells"),
  f("Conditional", "COUNTIF", "range, criteria", "Counts the cells that match a criterion"),
  f("Conditional", "COUNTIFS", "criteria_range1, criteria1, …", "Counts the cells that match all criteria"),
  f("Date", "DATE", "year, month, day", "A date"),
  f("Date", "DATEDIF", "start_date, end_date, unit", "Days (\"d\"), months (\"m\") or years (\"y\") between two dates"),
  f("Date", "DAY", "date", "The day of a date (1–31)"),
  f("Date", "EOMONTH", "start_date, months", "The last day of the month, months before or after"),
  f("Text", "FIND", "find_text, within_text, [start_num]", "The position of a text (case-sensitive)"),
  f("Math", "FLOOR", "number, significance", "Rounds down to a multiple of significance"),
  f("Lookup", "HLOOKUP", "lookup_value, table_array, row_index_num, [range_lookup]", "Looks up in the first row of a table"),
  f("Logic", "IF", "logical_test, value_if_true, [value_if_false]", "One value or another"),
  f("Logic", "IFERROR", "value, value_if_error", "The value, or another one if it is an error"),
  f("Logic", "IFNA", "value, value_if_na", "The value, or another one if it is #N/A"),
  f("Logic", "IFS", "logical_test1, value1, …", "The value of the first true condition"),
  f("Lookup", "INDEX", "array, row_num, [column_num]", "The value at a position of a range"),
  f("Math", "INT", "number", "Rounds down to an integer"),
  f("Info", "ISBLANK", "value", "TRUE for an empty cell"),
  f("Info", "ISERROR", "value", "TRUE for an error value"),
  f("Info", "ISNA", "value", "TRUE for #N/A"),
  f("Info", "ISNUMBER", "value", "TRUE for a number or date"),
  f("Info", "ISTEXT", "value", "TRUE for a text"),
  f("Text", "LEFT", "text, [num_chars]", "The first characters"),
  f("Text", "LEN", "text", "The number of characters"),
  f("Text", "LOWER", "text", "Lower case"),
  f("Lookup", "MATCH", "lookup_value, lookup_array, [match_type]", "The position of a value in a range"),
  f("Math", "MAX", "number1, [number2], …", "The largest number"),
  f("Text", "MID", "text, start_num, num_chars", "Characters from the middle"),
  f("Math", "MIN", "number1, [number2], …", "The smallest number"),
  f("Math", "MOD", "number, divisor", "The remainder (sign of the divisor)"),
  f("Date", "MONTH", "date", "The month of a date (1–12)"),
  f("Info", "NA", "", "The error #N/A"),
  f("Logic", "NOT", "logical", "The opposite"),
  f("Date", "NOW", "", "Date and time now (recalculated)"),
  f("Logic", "OR", "logical1, [logical2], …", "TRUE if any argument is TRUE"),
  f("Math", "POWER", "number, power", "A number to a power"),
  f("Math", "PRODUCT", "number1, [number2], …", "The product of the numbers"),
  f("Math", "RAND", "", "A random number 0 … 1 (recalculated)"),
  f("Math", "RANDBETWEEN", "bottom, top", "A random integer (recalculated)"),
  f("Text", "RIGHT", "text, [num_chars]", "The last characters"),
  f("Math", "ROUND", "number, num_digits", "Rounds half away from zero"),
  f("Math", "ROUNDDOWN", "number, num_digits", "Rounds toward zero"),
  f("Math", "ROUNDUP", "number, num_digits", "Rounds away from zero"),
  f("Text", "SEARCH", "find_text, within_text, [start_num]", "The position of a text (case-insensitive, * and ?)"),
  f("Math", "SQRT", "number", "The square root"),
  f("Text", "SUBSTITUTE", "text, old_text, new_text, [instance_num]", "Replaces text"),
  f("Math", "SUM", "number1, [number2], …", "The sum of the numbers"),
  f("Conditional", "SUMIF", "range, criteria, [sum_range]", "The sum of the cells that match a criterion"),
  f("Conditional", "SUMIFS", "sum_range, criteria_range1, criteria1, …", "The sum of the cells that match all criteria"),
  f("Math", "SUMPRODUCT", "array1, [array2], …", "The sum of the products of ranges"),
  f("Logic", "SWITCH", "expression, value1, result1, …, [default]", "The result of the matching value"),
  f("Text", "TEXT", "value, format_text", "A number or date as text (0, 0.00, #,##0, 0%, yyyy-mm-dd, dd.mm.yyyy)"),
  f("Text", "TEXTJOIN", "delimiter, ignore_empty, text1, …", "Joins texts with a delimiter"),
  f("Date", "TODAY", "", "Today's date (recalculated)"),
  f("Text", "TRIM", "text", "Removes extra spaces"),
  f("Text", "UPPER", "text", "Upper case"),
  f("Text", "VALUE", "text", "A text as number"),
  f("Lookup", "VLOOKUP", "lookup_value, table_array, col_index_num, [range_lookup]", "Looks up in the first column of a table"),
  f("Date", "WEEKDAY", "date, [return_type]", "The day of the week"),
  f("Lookup", "XLOOKUP", "lookup_value, lookup_array, return_array, [if_not_found]", "Looks up a value and returns the matching one"),
  f("Logic", "XOR", "logical1, [logical2], …", "TRUE if an odd number of arguments is TRUE"),
  f("Date", "YEAR", "date", "The year of a date"),
]);
