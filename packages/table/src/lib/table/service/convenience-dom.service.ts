import { DomServiceIf } from "./dom-service.if";
import { DivScope } from "./../data/div-scope.type";
import { GeoData } from "./../data/geo-data";
import { TreeArrowType } from "../data/common/tree-arrow.type";
import { TreeOptionsIf } from "../data/options/tree-options.if";
import { TreeOptions } from "../data/options/tree-options";
import { AreaIdent } from "../data/tablemodel/area-ident.type";
import { IconIf } from "../data/options/icon.if";
import { TableOptionsIf } from "../data/options/table-options.if";
import { CheckedType } from "../data/common/checked-type";
import { SideIdent } from "../data/side-ident.type";
import { SortState } from "../data/common/sort-state.type";
import { SortedOptions } from "../data/options/sorted-options";
import { SortedOptionsIf } from "../data/options/sorted-options.if";
import { HtmlStyle } from "./data/html-style.type";
import { ResolvedTableDirection } from "../rtl/table-direction.type";


/** @category DOM */
export interface AddColumnDivPara {
  parent: HTMLDivElement;
  geo: GeoData;
  rowIndex: number;
  columnIndex: number;
  areaIdent: AreaIdent;
  sideIdent: SideIdent;
  text?: string;
  treeArrow?: TreeArrowType;
  tableOptions?: TableOptionsIf;
  checkedType?: CheckedType | undefined;
  sortState?: SortState;
  /** Accessible name of the row checkbox (`showCheckboxWihoutExtraColumn`), e.g. "Select row 5". @since 1.1.91 */
  checkboxAriaLabel?: string;
  /**
   * Index of the first data column – the column of the checkbox of `showCheckboxWihoutExtraColumn` and of the tree
   * label. 0, behind a {@link RowNumberColumnDef} 1. Default 0. @since 1.1.93
   */
  firstDataColumnIndex?: number;
}

/** @category DOM */
export class ConvenienceDomService {

  /** Width of the focus frame of a cell in px (WCAG 2.4.7: visible focus, not only a color). @since 1.1.91 */
  static focusBorderWidthInPx = 2;

  /** Right-to-left: `left` is written as `right` and vice versa (see {@link setDirection}). */
  private rtl = false;
  /** The physical CSS property of the inline start (`left`, right-to-left `right`). */
  private startKey = "left";
  /** The physical CSS property of the inline end (`right`, right-to-left `left`). */
  private endKey = "right";

  constructor(
    public readonly domService: DomServiceIf
  ) {
  }

  /**
   * Sets the writing direction of the table. All positions of the table are computed from the **start** of a row
   * (x = 0 is the first column); in right-to-left this service writes them as `right` instead of `left` – in
   * {@link setStyle}, {@link applyStyle}, {@link applyStyleInPx} and all `add…` methods – so that the whole table is
   * mirrored. Called once by the table before anything is positioned.
   *
   * @param {ResolvedTableDirection} direction - `"ltr"` or `"rtl"`
   *
   * @example
   * const dom = new ConvenienceDomService(new SimpleDomService());
   * dom.setDirection("rtl");
   * const div = document.createElement("div");
   * dom.setStyle(div, "left", "20px"); // div.style.right = "20px"
   *
   * @since 1.1.98
   */
  setDirection(direction: ResolvedTableDirection): void {
    this.rtl = direction === "rtl";
    this.startKey = this.rtl ? "right" : "left";
    this.endKey = this.rtl ? "left" : "right";
  }

  /**
   * The writing direction set with {@link setDirection} (default `"ltr"`).
   *
   * @returns {ResolvedTableDirection} `"ltr"` or `"rtl"`
   * @since 1.1.98
   */
  getDirection(): ResolvedTableDirection {
    return this.rtl ? "rtl" : "ltr";
  }

  /**
   * The physical CSS property for a logical position key: in right-to-left `left` ↔ `right`, everything else as is.
   *
   * @param {string} key - a CSS property
   * @returns {string} the property to write
   * @since 1.1.98
   */
  toPhysicalStyleKey(key: string): string {
    if (this.rtl) {
      if (key === "left") return "right";
      if (key === "right") return "left";
    }
    return key;
  }

  /**
   * The position of an element from the inline start in px, as written by this service (`style.left`, right-to-left
   * `style.right`); 0 if it has none.
   *
   * @param {HTMLElement} ele - an element positioned by this service
   * @returns {number} px
   * @since 1.1.98
   */
  getInlineStart(ele: HTMLElement): number {
    return parseFloat(ele.style.getPropertyValue(this.startKey)) || 0;
  }


  setStyle(el: any, style: string, value: any): any {
    this.domService.setStyle(el, this.toPhysicalStyleKey(style), value);
    return el;
  };


  applyStyle(ele: HTMLDivElement, style: HtmlStyle): HTMLDivElement {
    for (const key in style) {
      this.domService.setStyle(ele, this.toPhysicalStyleKey(key), style[key]);
    }
    return ele;
  }

  applyDisplayNoneStyle(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "display", "none");
    return ele;
  }

  applyDisplayBlockStyle(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "display", "block");
    return ele;
  }

  applyStyleInPx(ele: HTMLDivElement, geoData: GeoData): HTMLDivElement {
    Object.entries(geoData)
      .forEach(([key, value]) => this.domService.setStyle(ele, this.toPhysicalStyleKey(key), value + "px"));
    return ele;
  }

  applyStylePosistionRelative(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "position", "relative");
    this.domService.setStyle(ele, "overflow", "clip");
    return ele;
  }

  applyStylePosistionAbsolute(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "position", "absolute");
    return ele;
  }

  applyStyleFullSize(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "width", "100%");
    this.domService.setStyle(ele, "height", "100%");
    return ele;
  }

  applyStyleOverflowAuto(
    overflowX: "scroll" | "auto" = "auto",
    overflowY: "scroll" | "auto" = "auto",
    ele: HTMLDivElement
  ): HTMLDivElement {
    this.domService.setStyle(ele, "overflow-x", overflowX);
    this.domService.setStyle(ele, "overflow-y", overflowY);
    return ele;
  }

  applyStyleNoPadding(ele: HTMLDivElement): HTMLDivElement {
    this.domService.setStyle(ele, "padding", "0");
    this.domService.setStyle(ele, "margin", "0");
    this.domService.setStyle(ele, "border", "0");
    return ele;
  }

  appendRelativeChildDiv(parent: HTMLDivElement): DivScope {
    const child =
      this.applyStylePosistionRelative(
        this.applyStyleFullSize(
          this.applyStyleNoPadding(
            this.domService.createElement<HTMLDivElement>("div")
          )
        )
      );
    this.domService.appendChild(parent, child);
    this.applyStylePosistionAbsolute(parent);
    const cache = {};
    return { parent, child, cache };
  }

  appendText(parent: HTMLDivElement, text: string): HTMLElement {
    const div = this.domService.createText(text);
    this.domService.appendChild(parent, div);
    return div;
  }


  addClass(clazz: string, div: HTMLDivElement) {
    if (clazz.includes(" ")) {
      clazz.split(" ").forEach(c => this.domService.addClass(div, c));
    } else {
      this.domService.addClass(div, clazz);
    }
    return div;
  }

  removeClass(clazz: string, div: HTMLDivElement) {
    if (clazz.includes(" ")) {
      clazz.split(" ").forEach(c => this.domService.removeClass(div, c));
    } else {
      this.domService.removeClass(div, clazz);
    }
    return div;
  }

  addClasses(classes: string[] | undefined, div: HTMLDivElement) {
    if (classes) {
      for (const c of classes) {
        this.domService.addClass(div, c);
      }
    }
    return div;
  }

  setAttribute(div: HTMLDivElement, key: string, value: string) {
    if (key && value) {
      this.domService.setAttribute(div, key, value);
    }
    return div;
  }

  /**
   * Removes an attribute (via {@link DomServiceIf.removeAttribute} if the DOM service has it).
   *
   * @since 1.1.91
   */
  removeAttribute(ele: HTMLElement, key: string): HTMLElement {
    if (this.domService.removeAttribute) {
      this.domService.removeAttribute(ele, key);
    } else {
      ele.removeAttribute(key);
    }
    return ele;
  }

  /**
   * Hides a purely decorative element (border, hover, icon …) from screen readers: `aria-hidden="true"`.
   *
   * @since 1.1.91
   */
  setAriaHidden<T extends HTMLElement>(ele: T): T {
    this.domService.setAttribute(ele, "aria-hidden", "true");
    return ele;
  }


  createAreaDivWithClass(clazz: string, parent: HTMLDivElement, areaIdent: AreaIdent, sideIdent: SideIdent): HTMLDivElement {
    const div = this.domService.createElement<HTMLDivElement>("div");
    this.addClass(clazz, div);
    this.domService.setAttribute(div, "data-area", areaIdent);
    this.domService.setAttribute(div, "data-side", sideIdent);
    this.domService.appendChild(parent, div);
    return div;
  }

  createDivWithClass(clazz: string, parent: HTMLDivElement): HTMLDivElement {
    const div = this.domService.createElement<HTMLDivElement>("div");
    this.addClass(clazz, div);
    this.domService.appendChild(parent, div);
    return div;
  }


  addRowDiv(
    divScope: DivScope,
    geo: GeoData,
    rowIndex: number = -1,
    areaIdent: AreaIdent,
    sideIdent: SideIdent,
    text: string = ""
  ): HTMLDivElement {

    const cacheKey = geo.index ?? -1;
    const div = this.getDivOrCreateDiv(cacheKey, divScope);

    this.domService.addClass(div, "ge-table-row-div");
    this.domService.addClass(div, `ge-table-row-div-${geo.index}`);
    if (areaIdent === "body" && sideIdent === "center") {
      const oddEven = (geo?.index ?? 0) % 2 === 0 ? "even" : "odd";
      this.domService.addClass(div, `ge-table-row-${oddEven}`);
    }
    this.domService.setStyle(div, "display", "clip");
    this.domService.setStyle(div, "position", "absolute");

    this.domService.setStyle(div, this.startKey, `${geo.left}px`);
    this.domService.setStyle(div, "top", `${geo.top}px`);
    this.domService.setStyle(div, "width", `${geo.width}px`);
    this.domService.setStyle(div, "height", `${geo.height}px`);
    this.domService.setAttribute(div, "data-row-index", `${rowIndex}`);
    this.domService.setAttribute(div, "data-area", `${areaIdent}`);

    // debugging:
    if (text) {
      const textElement = this.domService.createText(text);
      this.domService.appendChild(div, textElement);
    }
    // -------------

    this.domService.appendChild(divScope.child, div);
    return div;
  }


  addColumnDiv(
    para: AddColumnDivPara
  ): HTMLDivElement {

    const {parent, geo, rowIndex=-1, columnIndex=-1, areaIdent, sideIdent, text="", treeArrow, tableOptions, checkedType=undefined, sortState, checkboxAriaLabel, firstDataColumnIndex=0} = para;
    const treeOptions = tableOptions?.treeOptions;
    const checkboxWithoutExtraColumn = tableOptions?.showCheckboxWihoutExtraColumn;

    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, "ge-table-col-div");
    if (checkboxWithoutExtraColumn) {
      this.domService.addClass(div, "ge-with-checkbox");
    }
    this.domService.addClass(div, `ge-table-col-div-${geo.index}`);
    this.domService.setAttribute(div, "data-col-index", `${geo.index}`);
    this.domService.setAttribute(div, "data-row-index", `${rowIndex}`);
    this.domService.setAttribute(div, "data-area", `${areaIdent}`);
    const oddEven = (geo?.index ?? 0) % 2 === 0 ? "even" : "odd";
    if (areaIdent === "body" && sideIdent === "center") {
      this.domService.addClass(div, `ge-table-column-${oddEven}`);
    }

    this.domService.setStyle(div, "display", "clip");
    this.domService.setStyle(div, "position", "absolute");
    this.domService.setStyle(div, this.startKey, `${geo.left}px`);
    this.domService.setStyle(div, "top", `${geo.top}px`);
    this.domService.setStyle(div, "width", `${geo.width}px`);
    this.domService.setStyle(div, "height", `${geo.height}px`);

    if (treeArrow && treeArrow !== "none") {
      this.domService.addClass(div, "ge-table-col-tree");
      this.addArrowDiv(div, treeArrow, treeOptions, rowIndex, columnIndex, areaIdent);
    }
    // if (toggleIcon && toggleIcon !== "none") {
    //   this.domService.addClass(div, "ge-table-col-toggle");
    //   this.addToggleDiv(div, toggleIcon, treeOptions, rowIndex, columnIndex, areaIdent);
    // }

    if (checkboxWithoutExtraColumn && columnIndex === firstDataColumnIndex && checkedType) {
      this.addCheckboxToDiv(div, checkedType, areaIdent, rowIndex, checkboxAriaLabel);

    }
    if (text) {
      const firstTreeColumn = (treeArrow !== "none" && columnIndex === firstDataColumnIndex);
      this.addLabelDiv(div, text, firstTreeColumn, rowIndex, columnIndex, areaIdent);
    }

    if (sortState) {
      this.addSortedIcon(div, sortState, tableOptions?.sortedOptions, columnIndex);
    }


    this.domService.appendChild(parent, div);
    return div;
  }


  addCheckboxToDiv(
    parent: HTMLDivElement,
    checkedType: CheckedType,
    areaIdent: AreaIdent,
    rowIndex: number,
    ariaLabel?: string): HTMLDivElement {

    const div = this.domService.createElement<HTMLDivElement>("div");
    // built with DOM methods (no HTML string): the accessible name may contain data (column labels, own texts)
    const input = this.domService.createElement<HTMLInputElement>("input");
    this.domService.setAttribute(input, "type", "checkbox");
    this.domService.setAttribute(input, "data-area", `${areaIdent}`);
    this.domService.setAttribute(input, "data-row-index", `${rowIndex}`);
    this.domService.setAttribute(input, "data-input-type", "checkbox");
    this.domService.setAttribute(input, "tabindex", "-1"); // the table is one tab stop (Enter toggles the focused row)
    if (checkedType === "full") {
      this.domService.setAttribute(input, "checked", "");
      input.checked = true;
    }
    if (checkedType === "semi") {
      input.indeterminate = true; // screen readers: "mixed" (aria-checked="mixed" of a native checkbox)
    }
    this.domService.addClass(input, "ge-table-row-checkbox");
    if (ariaLabel) {
      this.domService.setAttribute(input, "aria-label", ariaLabel);
    }
    this.domService.appendChild(div, input);
    this.domService.setStyle(div, "display", "inline");
    this.domService.setStyle(div, "width", "inherit");
    this.domService.setAttribute(div, "data-row-index", `${rowIndex}`);
    this.domService.appendChild(parent, div);
    return div;
  }


  addLabelDiv(
    parent: HTMLDivElement,
    text: string = "",
    firstTreeColumn: boolean = false,
    rowIndex: number = -1,
    columnIndex: number = -1,
    areaIdent: AreaIdent = "body"): HTMLDivElement {

    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, "ge-table-label-div");
    // this.domService.setStyle(div, 'display', 'inline');
    this.domService.setStyle(div, "position", "relative");
    this.domService.setStyle(div, "background", "transparent");
    this.domService.setStyle(div, "width", "100%");
    this.domService.setStyle(div, "height", "100%");
    this.domService.setAttribute(div, "data-row-index", `${rowIndex}`);
    this.domService.setAttribute(div, "data-col-index", `${columnIndex}`);
    this.domService.setAttribute(div, "data-area", `${areaIdent}`);

    if (text) {
      if (firstTreeColumn) {
        const textElement = this.domService.createText(text);
        this.domService.appendChild(div, textElement);
      } else {
        // normal cell:
        const div2 = this.domService.createElement<HTMLDivElement>("div");
        this.domService.appendChild(div, div2);
        const textElement = this.domService.createText(text);
        this.domService.addClass(div2, "ge-table-label");
        this.domService.appendChild(div2, textElement);
        this.domService.setAttribute(div2, "data-row-index", `${rowIndex}`);
        this.domService.setAttribute(div2, "data-col-index", `${columnIndex}`);
        this.domService.setAttribute(div2, "data-area", `${areaIdent}`);
      }
    }

    this.domService.appendChild(parent, div);
    return div;
  }

  addSortedIcon(
    parent: HTMLDivElement,
    sorted: SortState = "",
    sortedOptions: SortedOptionsIf = new SortedOptions(),
    columnIndex: number = -1
  ): HTMLDivElement {

    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, "ge-table-sorted-icon-div");
    this.setAriaHidden(div); // the sort state is aria-sort of the header cell
    this.domService.setStyle(div, "position", "absolute");
    this.domService.setStyle(div, "top", "0");
    this.domService.setStyle(div, this.endKey, "0");
    this.domService.setStyle(div, "width", "20px");
    this.domService.setStyle(div, "background", "transparent");
    this.domService.setStyle(div, "cursor", "pointer");
    this.domService.setAttribute(div, "data-col-index", `${columnIndex}`);
    this.domService.setAttribute(div, "data-area", "header");

    let treeOptionsArrow: IconIf;
    if (sorted === "asc") {
      treeOptionsArrow = sortedOptions.iconAsc;
    } else if (sorted === "desc") {
      treeOptionsArrow = sortedOptions.iconDesc;
    } else {
      treeOptionsArrow = sortedOptions.iconPlaceholder;
    }
    // Text:
    const content = treeOptionsArrow.content;
    const textElement = this.domService.createText(content);
    this.domService.appendChild(div, textElement);

    // Style:
    if (treeOptionsArrow.style) {
      this.applyStyleString(div, treeOptionsArrow.style);
    }

    // Classes:
    for (const clazz of treeOptionsArrow.classes) {
      this.domService.addClass(div, clazz);
    }

    this.domService.appendChild(parent, div);
    return div;
  }


  addArrowDiv(
    parent: HTMLDivElement,
    arrow: TreeArrowType = "none",
    treeOptions: TreeOptionsIf = new TreeOptions(),
    rowIndex: number = -1,
    columnIndex: number = -1,
    areaIdent: AreaIdent = "body"
  ): HTMLDivElement {
    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, "ge-table-tree-arrow-div");
    this.setAriaHidden(div); // aria-expanded of the row; keyboard: Enter
    this.domService.setStyle(div, "display", "inline-block");
    this.domService.setStyle(div, "position", "");
    this.domService.setStyle(div, "width", "20px");
    this.domService.setStyle(div, "background", "transparent");
    this.domService.setStyle(div, "cursor", "pointer");
    this.domService.setAttribute(div, "data-row-index", `${rowIndex}`);
    this.domService.setAttribute(div, "data-col-index", `${columnIndex}`);
    this.domService.setAttribute(div, "data-area", `${areaIdent}`);

    let treeOptionsArrow: IconIf;
    if (arrow === "expanded") {
      treeOptionsArrow = treeOptions.arrowExpanded;
    } else if (arrow === "collapsed") {
      treeOptionsArrow = treeOptions.arrowCollapsed;
    } else {
      treeOptionsArrow = treeOptions.arrowPlaceholder;
    }
    // Text:
    const content = treeOptionsArrow.content;
    const textElement = this.domService.createText(content);
    this.domService.appendChild(div, textElement);

    // Style:
    if (treeOptionsArrow.style) {
      this.applyStyleString(div, treeOptionsArrow.style);
    }

    // Classes:
    for (const clazz of treeOptionsArrow.classes) {
      this.domService.addClass(div, clazz);
    }

    this.domService.appendChild(parent, div);
    return div;
  }

  addColumnBorderDivs(
    tableOptions: TableOptionsIf,
    parent: HTMLDivElement,
    geo: GeoData,
    areaIdent: AreaIdent,
    sideIdent: SideIdent
  ): HTMLDivElement {
    if (tableOptions.verticalBorderVisible) {
      const clazz = `ge-table-${areaIdent}-${sideIdent}-vertical-border`;
      this.addVerticalBorder(geo, parent, clazz);
    }
    if (tableOptions.horizontalBorderVisible) {
      const clazz = `ge-table-${areaIdent}-${sideIdent}-horizontal-border`;
      this.addHorizontalBorder(geo, parent, clazz);
    }

    return parent;
  }


  addHorizontalBorder(
    geo: GeoData,
    parent: HTMLDivElement,
    clazz: string = "ge-table-body-center-horizontal-border"): HTMLDivElement {
    // Border south:
    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, clazz);
    this.setAriaHidden(div);
    this.domService.setStyle(div, "display", "clip");
    this.domService.setStyle(div, "position", "absolute");
    this.domService.setStyle(div, this.startKey, `${geo.left}px`);
    this.domService.setStyle(div, "top", `${(geo.top)}px`);
    this.domService.setStyle(div, "width", `${geo.width}px`);
    this.domService.setStyle(div, "height", `1px`);
    this.domService.appendChild(parent, div);
    return div;
  }

  /**
   * Draws the focus frame of a cell: four divs with the class `ge-table-focus-border` (2 px, color
   * `--ge-table-focus-outline-color` resp. `--ge-table-focus-border`). Hidden from screen readers – they get the
   * focus through `aria-activedescendant`.
   */
  addFocusBorderDivs(parent: HTMLDivElement, geo: GeoData, style: HtmlStyle): HTMLDivElement {
    geo = {...geo, width: geo.width+1, height: geo.height+1}; // we want draw on the right and bottom border
    const t = ConvenienceDomService.focusBorderWidthInPx;
    const sides: [number, number, number, number][] = [
      [geo.left, geo.top, t, geo.height],                         // west
      [geo.left + geo.width - t, geo.top, t, geo.height],         // east
      [geo.left, geo.top, geo.width, t],                          // north
      [geo.left, geo.top + geo.height - t, geo.width, t],         // south
    ];
    for (const [left, top, width, height] of sides) {
      const div = this.domService.createElement<HTMLDivElement>("div");
      this.domService.addClass(div, "ge-table-focus-border");
      this.setAriaHidden(div);
      this.domService.setStyle(div, "display", "clip");
      this.domService.setStyle(div, "position", "absolute");
      this.domService.setStyle(div, this.startKey, `${left}px`);
      this.domService.setStyle(div, "top", `${top}px`);
      this.domService.setStyle(div, "width", `${width}px`);
      this.domService.setStyle(div, "height", `${height}px`);
      this.domService.setStyle(div, "z-index", `9999`);
      this.applyStyle(div, style);
      this.domService.appendChild(parent, div);
    }
    return parent;
  }

  addVerticalBorder(
    geo: GeoData,
    parent: HTMLDivElement,
    clazz: string = "ge-table-body-center-vertical-border"
  ): HTMLDivElement {
    // Border east:
    const div = this.domService.createElement<HTMLDivElement>("div");
    this.domService.addClass(div, clazz);
    this.setAriaHidden(div);
    this.domService.setStyle(div, "display", "clip");
    this.domService.setStyle(div, "position", "absolute");
    this.domService.setStyle(div, this.startKey, `${geo.left}px`);
    this.domService.setStyle(div, "top", `${geo.top}px`);
    this.domService.setStyle(div, "width", `1px`);
    this.domService.setStyle(div, "height", `${geo.height}px`);
    this.domService.appendChild(parent, div);
    return div;
  }

  addDiv(parent: HTMLDivElement, geo: GeoData, clazz: string = ""): HTMLDivElement {
    const div = this.domService.createElement<HTMLDivElement>("div");
    if (clazz) {
      this.domService.addClass(div, clazz);
    }
    this.setAriaHidden(div); // decorative or mouse-only (e.g. the "expand/collapse all" icon)
    this.domService.setStyle(div, "display", "clip");
    this.domService.setStyle(div, "position", "absolute");
    this.domService.setStyle(div, this.startKey, `${geo.left}px`);
    this.domService.setStyle(div, "top", `${geo.top}px`);
    this.domService.setStyle(div, "width", `${geo.width}px`);
    this.domService.setStyle(div, "height", `${geo.height}px`);
    this.domService.appendChild(parent, div);
    return div;
  }

  applyStyleString(div: HTMLDivElement, style: string) {
    // transform: rotate(-90deg) translate(-100%, 0); transform-origin: left top; font-size: 1.5em;
    const cmds = style.split(";").map(s => s.trim()).filter(s => s);
    for (const cmd of cmds) {
      const [key, value] = cmd.split(":");
      this.domService.setStyle(div, key.trim(), value.trim());
    }
  }

  private getDivOrCreateDiv(cacheKey: number, divScope: DivScope): HTMLDivElement {
    let div = divScope.cache[cacheKey];
    if (div) {
      div.innerText = ""; // erst mal leer machen, später col-cache nutzen
      return div;
    }
    div = this.domService.createElement<HTMLDivElement>("div");
    divScope.cache[cacheKey] = div;
    return div;
  }
}
