import { ConvenienceDomService } from "./service/convenience-dom.service";
import { DivScope } from "./data/div-scope.type";
import { TableModelIf } from "./data/tablemodel/table-model.if";
import { TableOptionsIf } from "./data/options/table-options.if";
import { GeoData } from "./data/geo-data";
import { AriaIds } from "./aria/aria-ids";
import { AreaIdent } from "./data/tablemodel/area-ident.type";
import { SideIdent } from "./data/side-ident.type";
import { isAreaModelTree } from "./instanceof-workaround";
import { TableOverlay } from "./overlay/table-overlay";


/**
 * Represents a store for HTML elements.
 * @class
 *
 * @category Internals
 */
export class EleScope {

  /**
   * Maximum height (px) of the scrollable content wrapper. Taller tables are scrolled proportionally
   * (rendering is based on the scroll factor anyway): browsers clamp element heights (Chrome ~33.5 million px)
   * and GPU rasterization loses precision long before (1px borders disappear and text jitters beyond
   * ~16.7 million px). 8 million px keep sub-pixel precision.
   */
  static maxScrollHeightInPx = 8_000_000;

  public scrollViewport: HTMLDivElement;

  protected contentWrapperDiv: HTMLDivElement; // the big one. height: sum of rows height == tableModel.getContentHeightInPixel()
  protected contentDiv: HTMLDivElement;

  protected areaHeaderCenter: DivScope;
  protected areaHeaderWest: DivScope;
  protected areaHeaderEast: DivScope;

  protected areaBodyCenter: DivScope;
  protected areaBodyWest: DivScope;
  protected areaBodyEast: DivScope;


  protected areaFooterCenter: DivScope;
  protected areaFooterWest: DivScope;
  protected areaFooterEast: DivScope;

  protected borderHeaderBottom: HTMLDivElement;
  protected borderFooterTop: HTMLDivElement;
  protected borderFixedWest: HTMLDivElement;
  protected borderFixedEast: HTMLDivElement;

  protected hoverRow: HTMLDivElement;
  protected hoverColumn: HTMLDivElement;
  protected draggingColumn: HTMLDivElement;

  protected scrollTop = 0;

  protected areaBodyWestGeo: GeoData = new GeoData();
  protected areaBodyCenterGeo: GeoData = new GeoData();
  protected areaBodyEastGeo: GeoData = new GeoData();

  /** The IDs this table uses for ARIA references (prefix from the host id). @since 1.1.91 */
  readonly ariaIds: AriaIds;

  /** The overlay layer over the body ("Loading…", "No rows to show"). @since 1.1.91 */
  readonly tableOverlay: TableOverlay;


  constructor(
    readonly hostElement: HTMLDivElement,
    readonly tableModel: TableModelIf,
    protected readonly dom: ConvenienceDomService,
    readonly tableOptions: TableOptionsIf
  ) {
    const hostEle = this.hostElement;

    hostEle.innerText = ""; // clear
    this.dom.setAttribute(hostEle, "tabindex", "0"); // needed for getting key events
    this.ariaIds = new AriaIds(AriaIds.createPrefix(hostEle.id));
    this.initHostAria();

    this.dom.setStyle(
      this.dom.addClass("ge-table", hostEle)
      , "position", "relative");


    this.hoverRow =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-hover-row", hostEle));
    this.hoverColumn =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-hover-column", hostEle));
    this.draggingColumn =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-dragging-column", hostEle));

    this.areaHeaderWest = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-header ge-table-header-west", hostEle, "header", "west")));
    this.areaHeaderCenter = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-header ge-table-header-center", hostEle, "header", "center")));
    this.areaHeaderEast = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-header ge-table-header-east", hostEle, "header", "east")));

    this.areaBodyWest = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-body ge-table-body-west", hostEle, "body", "west")));

    this.areaBodyEast = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-body ge-table-body-east", hostEle, "body", "east")));

    this.areaFooterWest = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-footer ge-table-footer-west", hostEle, "footer", "west")));

    this.areaFooterCenter = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-footer ge-table-footer-center", hostEle, "footer", "center")));

    this.areaFooterEast = dom.appendRelativeChildDiv(
      dom.applyStylePosistionAbsolute(
        dom.createAreaDivWithClass("ge-table-footer ge-table-footer-east", hostEle, "footer", "east")));

    this.scrollViewport =
      dom.applyStyleOverflowAuto(
        this.tableOptions.overflowX ?? "auto",
        this.tableOptions.overflowY ?? "auto",
        dom.applyStyleNoPadding(
          dom.applyStylePosistionAbsolute(
            dom.createAreaDivWithClass("ge-table-scroll-viewport", hostEle, "body", "center")
          )
        )
      );

    this.contentWrapperDiv = dom.applyStyleNoPadding(
      dom.applyStylePosistionRelative(
        dom.createDivWithClass("ge-table-scroll-content-wrapper", this.scrollViewport)));
    this.contentDiv = dom.applyStyleNoPadding(
      dom.applyStylePosistionRelative(
        dom.createDivWithClass("ge-table-scroll-content", this.contentWrapperDiv)));

    this.areaBodyCenter = dom.appendRelativeChildDiv(
      dom.createDivWithClass("ge-table-body-center", this.contentDiv));

    this.borderHeaderBottom =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-header-border", hostEle));

    this.borderFixedWest =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-west-fixed-column-border", hostEle));

    this.borderFixedEast =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-east-fixed-column-border", hostEle));

    this.borderFooterTop =
      dom.applyStylePosistionAbsolute(
        dom.createDivWithClass("ge-table-footer-border", hostEle));

    // Screen readers: decoration is hidden, the nine row containers are row groups in the logical order
    // header → body → footer (in the DOM the body center comes last, inside the scroll viewport).
    [this.hoverRow, this.hoverColumn, this.draggingColumn,
      this.borderHeaderBottom, this.borderFixedWest, this.borderFixedEast, this.borderFooterTop]
      .forEach(div => dom.setAriaHidden(div));
    // Chrome makes a scroll container without focusable children a tab stop of its own – the table is ONE tab
    // stop (the host, keyboard navigation inside).
    if (!tableOptions?.shortcutActionsDisabled) {
      // without the table's keyboard handling the viewport stays focusable: keyboard users scroll it natively
      dom.setAttribute(this.scrollViewport, "tabindex", "-1");
    }
    // generic layout containers: no meaning for screen readers (the row groups inside carry it)
    [this.areaHeaderWest, this.areaHeaderCenter, this.areaHeaderEast, this.areaBodyWest, this.areaBodyEast,
      this.areaFooterWest, this.areaFooterCenter, this.areaFooterEast, this.areaBodyCenter]
      .forEach(scope => dom.setAttribute(scope.parent, "role", "presentation"));
    dom.setAttribute(this.contentWrapperDiv, "role", "presentation");
    dom.setAttribute(this.contentDiv, "role", "presentation");
    const owned: string[] = [];
    for (const area of ["header", "body", "footer"] as AreaIdent[]) {
      for (const side of ["west", "center", "east"] as SideIdent[]) {
        const id = this.ariaIds.rowGroup(area, side);
        const child = this.getAreaChild(area, side);
        dom.setAttribute(child, "id", id);
        dom.setAttribute(child, "role", "presentation"); // "rowgroup" as soon as it has rows (RenderScope)
        owned.push(id);
      }
    }
    this.setHostAriaAttribute("aria-owns", owned.join(" "));

    // above everything else of the body (z-index in CSS), positioned in adjustContainersAndRows()
    this.tableOverlay = new TableOverlay(hostEle, dom, tableOptions?.overlayOptions, () => this.updateOverlay());
  }

  /**
   * Shows the overlay that fits the current state (requested by the API, or "no rows" for an empty body).
   * Overwritten in {@link RenderScope}.
   *
   * @since 1.1.91
   */
  protected updateOverlay(): void {
    // must be overwritten
  }

  /** The values of the host attributes before the table changed them (restored by {@link removeHostAria}). */
  private readonly hostAttributesBefore = new Map<string, string | null>();

  /**
   * Sets (or with `undefined` removes) an ARIA attribute of the host and remembers the app's own value the first
   * time, so that {@link removeHostAria} can restore it (e.g. an `aria-label` the app set on an Angular host).
   *
   * @since 1.1.91
   */
  protected setHostAriaAttribute(key: string, value: string | undefined): void {
    const host = this.hostElement;
    if (!this.hostAttributesBefore.has(key)) {
      this.hostAttributesBefore.set(key, host.getAttribute(key));
    }
    if (value === undefined) {
      if (host.hasAttribute(key)) {
        this.dom.removeAttribute(host, key);
      }
    } else if (host.getAttribute(key) !== value) {
      this.dom.setAttribute(host, key, value);
    }
  }

  /**
   * Removes the ARIA attributes the table has set on the host element (see {@link initHostAria}).
   *
   * @since 1.1.91
   */
  protected removeHostAria(): void {
    this.hostAttributesBefore.forEach((before, key) => {
      if (before === null) {
        this.dom.removeAttribute(this.hostElement, key);
      } else {
        this.dom.setAttribute(this.hostElement, key, before);
      }
    });
    this.hostAttributesBefore.clear();
  }

  /**
   * Sets the static ARIA attributes of the host element: `role="grid"` (a tree body: `"treegrid"`) and its name
   * and description from the table options. Counts and the active cell follow with every render pass.
   *
   * @since 1.1.91
   */
  protected initHostAria(): void {
    const opts = this.tableOptions;
    const tree = isAreaModelTree(this.tableModel.getAreaModel("body"));
    this.setHostAriaAttribute("role", tree ? "treegrid" : "grid");
    if (opts?.ariaLabelledBy) {
      this.setHostAriaAttribute("aria-labelledby", opts.ariaLabelledBy);
    } else if (opts?.ariaLabel) {
      this.setHostAriaAttribute("aria-label", opts.ariaLabel);
    }
    if (opts?.ariaDescribedBy) {
      this.setHostAriaAttribute("aria-describedby", opts.ariaDescribedBy);
    }
  }

  /** The element that holds the rows of an area (`DivScope.child`). */
  protected getAreaChild(area: AreaIdent, side: SideIdent): HTMLDivElement {
    const map: { [key: string]: DivScope } = {
      "header-west": this.areaHeaderWest, "header-center": this.areaHeaderCenter, "header-east": this.areaHeaderEast,
      "body-west": this.areaBodyWest, "body-center": this.areaBodyCenter, "body-east": this.areaBodyEast,
      "footer-west": this.areaFooterWest, "footer-center": this.areaFooterCenter, "footer-east": this.areaFooterEast,
    };
    return map[`${area}-${side}`].child;
  }


  /**
   * Adjusts the containers and rows of the table based on the current state.
   *
   * @return {void}
   */
  adjustContainersAndRows() {
    const padding = this.tableModel.getPadding();
    const w = this.hostElement.clientWidth;
    const h = this.hostElement.clientHeight;
    this.dom.applyStyle(this.scrollViewport, {
      width: `${(w - padding.left)}px`,
      height: `${(h - padding.top)}px`,
      top: `${padding.top}px`,
      left: `${padding.left}px`
    });

    this.scrollTop = this.scrollViewport.scrollTop;

    // Content:
    this.dom.applyStyle(this.contentDiv, {
      width: `${this.scrollViewport.clientWidth}px`,
      height: `${this.scrollViewport.clientHeight}px`,
      top: `${this.scrollTop}px`,
      left: `${this.scrollViewport.scrollLeft}px`
    });

    // Body:
    // Body/West:
    this.areaBodyWestGeo.width = padding.left;
    this.areaBodyWestGeo.height = (h - padding.top - padding.bottom);
    this.areaBodyWestGeo.top = padding.top;
    this.areaBodyWestGeo.left = 0;
    this.dom.applyStyleInPx(this.areaBodyWest.parent, this.areaBodyWestGeo);
    if (this.tableOptions.fixedWestSeparatorBorderVisible &&
      this.tableModel.getFixedLeftColumnCount()) {
      this.dom.applyDisplayBlockStyle(
        this.dom.applyStyle(this.borderFixedWest, {
          width: `1px`,
          height: `${this.areaBodyWestGeo.height}px`,
          top: `${this.areaBodyWestGeo.top}px`,
          left: `${this.areaBodyWestGeo.width}px`
        })
      );
    } else {
      this.dom.applyDisplayNoneStyle(this.borderFixedWest);
    }

    // Body/East:
    this.areaBodyEastGeo.width = padding.right;
    this.areaBodyEastGeo.height = (h - padding.top - padding.bottom);
    this.areaBodyEastGeo.top = padding.top;
    this.areaBodyEastGeo.left = w - padding.right;
    this.dom.applyStyleInPx(this.areaBodyEast.parent, this.areaBodyEastGeo);

    if (this.tableOptions.fixedEastSeparatorBorderVisible &&
      this.tableModel.getFixedRightColumnCount()) {
      this.dom.applyDisplayBlockStyle(
        this.dom.applyStyle(this.borderFixedEast, {
          width: `1px`,
          height: `${this.areaBodyEastGeo.height}px`,
          top: `${this.areaBodyEastGeo.top}px`,
          left: `${this.areaBodyEastGeo.left}px`
        }));
    } else {
      this.dom.applyDisplayNoneStyle(this.borderFixedEast);
    }

    // Body/Center:
    this.areaBodyCenterGeo.width = (w - padding.left - padding.right);
    this.areaBodyCenterGeo.height = (h - padding.top - padding.bottom);
    this.areaBodyCenterGeo.top = 0;
    this.areaBodyCenterGeo.left = 0;
    this.dom.applyStyleInPx(this.areaBodyCenter.parent, this.areaBodyCenterGeo);


    // Header:
    this.dom.applyStyle(this.areaHeaderCenter.parent, {
      width: `${w - padding.left - padding.right}px`,
      height: `${padding.top}px`,
      top: "0",
      left: `${padding.left}px`
    });
    this.dom.applyStyle(this.areaHeaderWest.parent, {
      width: `${padding.left}px`,
      height: `${padding.top}px`,
      top: "0",
      left: "0"
    });
    this.dom.applyStyle(this.areaHeaderEast.parent, {
      width: `${padding.right}px`,
      height: `${padding.top}px`,
      top: "0",
      left: `${w - padding.right}px`
    });
    if (this.tableOptions.headerSeparatorBorderVisible &&
      this.tableModel.isHeaderVisibe()) {
      this.dom.applyDisplayBlockStyle(
        this.dom.applyStyle(this.borderHeaderBottom, {
          width: `${w}px`,
          height: "1px",
          top: `${padding.top}px`,
          left: "0px"
        }));
    } else {
      this.dom.applyDisplayNoneStyle(this.borderHeaderBottom);
    }

    // Footer:
    this.dom.applyStyle(this.areaFooterWest.parent, {
      width: `${padding.left}px`,
      height: `${padding.bottom}px`,
      top: `${h - padding.bottom}px`,
      left: "0"
    });
    this.dom.applyStyle(this.areaFooterCenter.parent, {
      width: `${w - padding.left - padding.right}px`,
      height: `${padding.bottom}px`,
      top: `${h - padding.bottom}px`,
      left: `${padding.left}px`
    });
    this.dom.applyStyle(this.areaFooterEast.parent, {
      width: `${padding.right}px`,
      height: `${padding.bottom}px`,
      top: `${h - padding.bottom}px`,
      left: `${w - padding.right}px`
    });
    if (this.tableOptions.footerSeparatorBorderVisible &&
      this.tableModel.isFooterVisibe()) {
      this.dom.applyDisplayBlockStyle(
        this.dom.applyStyle(this.borderFooterTop, {
          width: `${w}px`,
          height: "1px",
          top: `${h - padding.bottom}px`,
          left: "0px"
        }));
    } else {
      this.dom.applyDisplayNoneStyle(this.borderFooterTop);
    }

    // Overlay: the visible body (below the header, above the footer, without the vertical scroll bar)
    this.tableOverlay.setBounds(
      0,
      padding.top,
      Math.min(w, padding.left + this.scrollViewport.clientWidth),
      h - padding.top - padding.bottom);

    this.adjustAfterScrolling();
  }

  /**
   * Adjusts the position or appearance of elements after scrolling.
   * This method must be overwritten in child classes.
   *
   * @return {void}
   */
  adjustAfterScrolling() {
    // must be overwritten
  }

  /**
   * Resets the size of the wrapper div based on the content dimensions.
   *
   * @protected
   *
   * @returns {void} Returns nothing.
   */
  protected resetSizeOfWrapperDiv() {
    const w = `${this.tableModel.getContentWidthInPixel()}px`;
    const contentHeight = this.tableModel.getContentHeightInPixel() + 1; // + 1, we want to see the last horizontal border
    const h = `${Math.min(contentHeight, EleScope.maxScrollHeightInPx)}px`;
    this.dom.setStyle(this.contentWrapperDiv, "width", w);
    this.dom.setStyle(this.contentWrapperDiv, "height", h);
  }

}
