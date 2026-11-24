import {
  AreaIdent,
  AreaModelIf,
  CellRendererIf,
  CoverGridFactory,
  CoverGridTableModel,
  RendererCleanupFnType,
  TableOptionsIf
} from "@guiexpert/table";
import { BookIf } from "../model/book.if";

const ADJECTIVES = [
  "Silent", "Crimson", "Hidden", "Last", "Golden", "Broken", "Northern", "Electric", "Paper", "Midnight",
  "Glass", "Wandering", "Forgotten", "Burning", "Little", "Endless"
];
const NOUNS = [
  "Garden", "Engine", "Harbour", "Archive", "Comet", "Lighthouse", "Orchard", "Kingdom", "Signal", "River",
  "Atlas", "Clockwork", "Island", "Library", "Mountain", "Storm", "Machine", "Letters"
];
const FIRST_NAMES = ["Ada", "Jonas", "Mira", "Theo", "Lena", "Omar", "Ines", "Kai", "Nora", "Felix", "Yuki", "Elif"];
const LAST_NAMES = ["Berger", "Okafor", "Lindqvist", "Moreau", "Kowalski", "Santos", "Tanaka", "Hart", "Novak", "Reyes"];
const GENRES = ["Fantasy", "Sci-Fi", "Crime", "Romance", "History", "Poetry", "Travel", "Cooking"];

/**
 * A fixed book collection for cover grid demos: `count` books with title, author, genre, year, pages and a cover hue.
 * The same count gives the same books (no randomness) – titles repeat with a volume number after 288 books.
 *
 * @param count - number of books (default 10,000)
 */
export function generateBooks(count = 10_000): BookIf[] {
  const titles = ADJECTIVES.length * NOUNS.length;
  return Array.from({ length: count }, (_, i) => {
    const k = (i * 115) % titles;   // 115 and 288 are coprime: every title once per 288 books, in a mixed order
    const adjective = ADJECTIVES[k % ADJECTIVES.length];
    const noun = NOUNS[Math.floor(k / ADJECTIVES.length)];
    const volume = Math.floor(i / titles);
    return {
      id: i + 1,
      title: `The ${adjective} ${noun}${volume ? ` ${volume + 1}` : ""}`,
      author: `${FIRST_NAMES[(i * 11) % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3 + Math.floor(i / 12)) % LAST_NAMES.length]}`,
      genre: GENRES[(i * 13 + Math.floor(i / titles)) % GENRES.length],
      year: 1950 + ((i * 37) % 76),
      pages: 120 + ((i * 53) % 600),
      hue: (i * 47) % 360
    };
  });
}

const collator = new Intl.Collator("en", { numeric: true });   // "Archive 2" before "Archive 10"

/** Sort orders of the cover grid demo – for `tableApi.sort(compareFn)`. */
export const BOOK_SORTS: Record<"title" | "author" | "year" | "id", (a: BookIf, b: BookIf) => number> = {
  id: (a, b) => a.id - b.id,
  title: (a, b) => collator.compare(a.title, b.title) || a.id - b.id,
  author: (a, b) => collator.compare(a.author, b.author) || collator.compare(a.title, b.title),
  year: (a, b) => b.year - a.year || collator.compare(a.title, b.title)
};

/** What {@link BookCoverRenderer} asks the page. */
export interface BookCoverContextIf {
  /** The selected book gets a frame. */
  isSelected?(book: BookIf): boolean;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December"];

/** Cover lines by genre – every cover takes two of them. */
const COVER_LINES: Record<string, string[]> = {
  "Fantasy": ["Maps of places that never were", "Dragons, revisited", "The last wizard interview", "Swords: a buyer's guide"],
  "Sci-Fi": ["Life at light speed", "Robots who write poetry", "Mars, one year later", "The quiet machines"],
  "Crime": ["The alibi that almost held", "Cold case, warm trail", "Nine clues, one night", "Who locked the door?"],
  "Romance": ["Letters never sent", "Love at second sight", "A summer in three acts", "The long way home"],
  "History": ["The year that changed the map", "Lost cities, found", "Voices from the archive", "An empire in ten objects"],
  "Poetry": ["Forty lines on rain", "New voices, old forms", "The sonnet strikes back", "Verses for a slow morning"],
  "Travel": ["48 hours in Lisbon", "The slow train north", "Islands without airports", "Coast roads worth the detour"],
  "Cooking": ["Bread, butter, fire", "Twelve soups for winter", "The perfect tomato", "One pan, six dinners"]
};
const DEFAULT_COVER_LINES = ["Inside: the big interview", "Ten pages of pictures", "What comes next", "The essay"];

/** Typefaces of the mastheads: font stack, weight, letter spacing (em), width of a capital letter (em). */
const MASTHEAD_FONTS: [string, string, number, number][] = [
  ["Impact, 'Arial Narrow Bold', 'Helvetica Neue', sans-serif", "400", 0.01, 0.56],
  ["Georgia, 'Times New Roman', serif", "700", -0.02, 0.78],
  ["'Avenir Next', Futura, 'Century Gothic', 'Helvetica Neue', Arial, sans-serif", "800", -0.03, 0.78],
  ["'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif", "400", 0.02, 0.78],
  ["'Helvetica Neue', Helvetica, Arial, sans-serif", "900", -0.05, 0.8],
  ["'Courier New', Courier, monospace", "700", -0.04, 0.66]
];

interface CoverPaletteIf {
  background: string;
  a1: string;
  a2: string;
  dark: string;
  ink: string;
  masthead: string;
  /** Color of the soft bands behind the texts (as `r, g, b`). */
  shade: string;
}

/** Four color schemes around the hue of the book: vivid, night, paper, pop. */
function paletteOf(hue: number, scheme: number): CoverPaletteIf {
  const h = (d: number) => (hue + d) % 360;
  switch (scheme) {
    case 0:
      return {
        background: `linear-gradient(160deg, hsl(${hue} 70% 52%), hsl(${h(35)} 72% 30%))`,
        a1: `hsl(${h(180)} 85% 64%)`, a2: `hsl(${h(40)} 90% 72%)`, dark: `hsl(${hue} 50% 12%)`,
        ink: "#fff", masthead: "#fff", shade: "0, 0, 0"
      };
    case 1:
      return {
        background: `linear-gradient(200deg, hsl(${h(30)} 50% 24%), hsl(${hue} 45% 10%))`,
        a1: `hsl(${hue} 88% 62%)`, a2: `hsl(${h(150)} 80% 62%)`, dark: `hsl(${hue} 40% 5%)`,
        ink: "#fff", masthead: `hsl(${hue} 95% 72%)`, shade: "0, 0, 0"
      };
    case 2:
      return {
        background: `linear-gradient(180deg, hsl(${hue} 40% 92%), hsl(${hue} 38% 80%))`,
        a1: `hsl(${hue} 72% 46%)`, a2: `hsl(${h(160)} 60% 42%)`, dark: `hsl(${hue} 45% 16%)`,
        ink: `hsl(${hue} 45% 12%)`, masthead: `hsl(${hue} 78% 34%)`, shade: "255, 255, 255"
      };
    default:
      return {
        background: `hsl(${h(50)} 92% 60%)`,
        a1: `hsl(${hue} 82% 46%)`, a2: `hsl(${h(200)} 75% 36%)`, dark: "#141414",
        ink: "#141414", masthead: "#141414", shade: "255, 255, 255"
      };
  }
}

/** Splits "The Silent Garden 2" into the magazine name ("Garden"), its theme ("Silent") and the volume ("2"). */
function splitTitle(title: string): { name: string; theme: string; volume: string } {
  const m = /^(?:the\s+)?(.*?)(?:\s+(\d+))?$/i.exec(title.trim());
  const words = (m?.[1] || title).split(/\s+/).filter(Boolean);
  const name = words.pop() ?? title;
  return { name, theme: words.join(" "), volume: m?.[2] ?? "" };
}

/**
 * Draws one book as a tile of the cover grid: an invented magazine cover – masthead (the last word of the title),
 * issue line, a drawn picture (ten motifs, four color schemes), cover lines and a bar code. The cover fills the
 * whole cell: no gap between the tiles and no caption below them. Plain DOM and inline SVG, no framework, no
 * images to load. The book data is set as text (`textContent`), never as HTML.
 * The tile follows `bodyModel.coverWidth` / `coverHeight`; a cover is about 3 : 4.
 */
export class BookCoverRenderer implements CellRendererIf {

  constructor(private readonly ctx: BookCoverContextIf = {}) {
  }

  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    areaModel: AreaModelIf,
    cellValue: unknown
  ): RendererCleanupFnType | undefined {
    const book = cellValue as BookIf | undefined;
    if (!book) return undefined;   // the empty cells after the last book
    const doc = cellDiv.ownerDocument;
    const coverWidth = (areaModel as { coverWidth?: number }).coverWidth ?? 165;
    const small = coverWidth < 120;
    const seed = Math.abs(Math.floor(book.id)) || 1;
    const rnd = (n: number) => {   // 0 … 1, fixed per book and n (integer hash: neighbours get different covers)
      let x = Math.imul(seed + Math.imul(n + 1, 0x9e3779b1), 0x85ebca6b);
      x ^= x >>> 15;
      x = Math.imul(x, 0xc2b2ae35);
      x ^= x >>> 13;
      return (x >>> 0) / 4294967296;
    };
    const palette = paletteOf(((book.hue % 360) + 360) % 360, Math.floor(rnd(4) * 4));
    const { name, theme, volume } = splitTitle(book.title);
    const centered = rnd(5) < 0.3;

    const el = (style: Partial<CSSStyleDeclaration>, text?: string) => {
      const div = doc.createElement("div");
      Object.assign(div.style, style);
      if (text !== undefined) div.textContent = text;
      return div;
    };

    const tile = el({
      position: "relative", boxSizing: "border-box", width: "100%", height: "100%", overflow: "hidden",
      cursor: "pointer", background: palette.background, color: palette.ink,
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: `${coverWidth / 16}px`, lineHeight: "1.15", textAlign: centered ? "center" : "left"
    });
    tile.className = "ge-demo-book";
    tile.title = `${book.title} – ${book.author} (${book.year})`;

    tile.append(this.createPicture(doc, palette, Math.floor(rnd(1) * 10), rnd));

    // soft bands behind the texts
    tile.append(el({
      position: "absolute", inset: "0", pointerEvents: "none",
      background: `linear-gradient(180deg, rgba(${palette.shade}, 0.5) 0%, rgba(${palette.shade}, 0) 30%, ` +
        `rgba(${palette.shade}, 0) 52%, rgba(${palette.shade}, 0.72) 100%)`
    }));

    const texts = el({
      position: "absolute", inset: "0", boxSizing: "border-box", padding: "0.75em 0.8em 0.8em",
      display: "flex", flexDirection: "column"
    });
    if (!small) {
      const issue = `No. ${volume ? `${volume}/` : ""}${book.id} · ${MONTHS[seed % 12]} ${book.year}`;
      texts.append(el({ fontSize: "0.52em", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: "600" }, issue));
    }
    const [fontFamily, fontWeight, letterSpacing, capWidth] = MASTHEAD_FONTS[Math.floor(rnd(2) * MASTHEAD_FONTS.length)];
    const mastheadSize = Math.min(4.4, 14.2 / (Math.max(3, name.length) * (capWidth + letterSpacing)));
    texts.append(el({
      fontFamily, fontWeight, letterSpacing: `${letterSpacing}em`, fontSize: `${mastheadSize.toFixed(2)}em`,
      lineHeight: "0.95", textTransform: "uppercase", whiteSpace: "nowrap", color: palette.masthead,
      marginTop: small ? "0" : "0.08em"
    }, name));

    texts.append(el({ flex: "1" }));

    const lines = el({ paddingRight: small || centered ? "0" : "3.3em" });
    if (!small) {
      lines.append(el({
        display: "inline-block", padding: "0.15em 0.5em", marginBottom: "0.5em", fontSize: "0.5em",
        letterSpacing: "0.14em", fontWeight: "700", textTransform: "uppercase",
        background: palette.a1, color: palette.dark
      }, book.genre));
    }
    lines.append(el(
      { fontSize: small ? "1.5em" : "1.4em", fontWeight: "800", letterSpacing: "-0.01em", overflowWrap: "anywhere" },
      theme ? `The ${theme} Issue` : `The ${book.genre} Issue`));
    if (!small) {
      const pool = COVER_LINES[book.genre] ?? DEFAULT_COVER_LINES;
      const first = Math.floor(rnd(3) * pool.length);
      lines.append(el({ fontSize: "0.62em", marginTop: "0.45em", fontWeight: "600" }, pool[first]));
      lines.append(el({ fontSize: "0.62em", marginTop: "0.2em", opacity: "0.85" },
        `${pool[(first + 1 + seed % (pool.length - 1)) % pool.length]} · by ${book.author}`));
    }
    texts.append(lines);
    tile.append(texts);

    if (!small && !centered) {   // bar code with the page count as price tag
      const code = el({
        position: "absolute", right: "0.7em", bottom: "0.8em", width: "2.5em", boxSizing: "border-box",
        padding: "0.15em 0.2em 0.1em", background: "#fff", color: "#000", fontSize: "1em"
      });
      code.setAttribute("aria-hidden", "true");
      code.append(el({
        height: "1.15em",
        background: "repeating-linear-gradient(90deg, #000 0 1px, #fff 1px 2px, #000 2px 4px, #fff 4px 5px, #000 5px 6px, #fff 6px 9px)"
      }));
      code.append(el({ fontSize: "0.36em", textAlign: "center", letterSpacing: "0.08em" }, `${book.pages} p.`));
      tile.append(code);
    }

    if (this.ctx.isSelected?.(book)) {   // the frame lies inside the tile – there is no gap around it
      tile.append(el({
        position: "absolute", inset: "0", pointerEvents: "none",
        boxShadow: "inset 0 0 0 4px #2b7de9, inset 0 0 0 5px #fff"
      }));
    }
    cellDiv.append(tile);
    return undefined;
  }

  /** The picture of the cover: one of ten motifs, drawn into a 100 × 133 box that covers the tile. */
  private createPicture(doc: Document, p: CoverPaletteIf, motif: number, rnd: (n: number) => number): SVGElement {
    const svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 133");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    Object.assign(svg.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });
    const add = (name: string, attrs: Record<string, string | number>, parent: Element = svg) => {
      const node = doc.createElementNS(SVG_NS, name);
      Object.keys(attrs).forEach(key => node.setAttribute(key, String(attrs[key])));
      parent.append(node);
      return node;
    };
    const r = (n: number, from: number, to: number) => from + rnd(n + 10) * (to - from);

    switch (motif) {
      case 0: {   // sun over the sea
        add("circle", { cx: r(0, 30, 70), cy: 62, r: r(1, 20, 28), fill: p.a2 });
        for (let i = 0; i < 6; i++) add("rect", { x: 0, y: 76 + i * 10, width: 100, height: 4 + i, fill: p.a1, opacity: 0.35 + i * 0.1 });
        break;
      }
      case 1: {   // mountains
        add("circle", { cx: r(0, 20, 80), cy: r(1, 38, 52), r: 8, fill: p.a2 });
        add("polygon", { points: "0,133 0,84 24,56 44,80 68,46 100,88 100,133", fill: p.a1, opacity: 0.75 });
        add("polygon", { points: "0,133 0,104 30,76 54,100 80,80 100,96 100,133", fill: p.dark });
        break;
      }
      case 2: {   // waves
        for (let i = 0; i < 7; i++) {
          const y = 44 + i * 14;
          add("path", {
            d: `M0 ${y} Q 12.5 ${y - 8} 25 ${y} T 50 ${y} T 75 ${y} T 100 ${y} V133 H0Z`,
            fill: i % 2 ? p.a2 : p.a1, opacity: 0.3 + i * 0.09
          });
        }
        break;
      }
      case 3: {   // rings
        const cx = r(0, 25, 75), cy = r(1, 50, 80);
        for (let i = 1; i < 7; i++) add("circle", { cx, cy, r: i * 10, fill: "none", stroke: i % 2 ? p.a1 : p.a2, "stroke-width": 4, opacity: 0.9 - i * 0.08 });
        add("circle", { cx, cy, r: 4, fill: p.dark });
        break;
      }
      case 4: {   // halftone dots
        const phase = r(0, 0, 6);
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 7; x++) {
            const size = 1 + 4.5 * Math.abs(Math.sin(phase + x * 0.55 + y * 0.4));
            add("circle", { cx: 8 + x * 14, cy: 40 + y * 12, r: size.toFixed(1), fill: (x + y) % 3 ? p.a1 : p.a2 });
          }
        }
        break;
      }
      case 5: {   // diagonal bands
        const g = add("g", { transform: `rotate(${r(0, -40, -20).toFixed(0)} 50 66)` });
        for (let i = 0; i < 7; i++) add("rect", { x: -60, y: 10 + i * 22, width: 220, height: 11, fill: i % 2 ? p.a2 : p.a1, opacity: 0.85 }, g);
        break;
      }
      case 6: {   // blocks, circle and quarter
        add("rect", { x: 10, y: 40, width: 42, height: 42, fill: p.a1 });
        add("circle", { cx: 70, cy: 62, r: 20, fill: p.a2 });
        add("path", { d: "M10 126 A44 44 0 0 1 54 82 V126Z", fill: p.dark });
        add("rect", { x: 54, y: 86, width: 36, height: 40, fill: p.a1, opacity: 0.6 });
        break;
      }
      case 7: {   // portrait
        add("circle", { cx: 50, cy: 66, r: 34, fill: p.a1, opacity: 0.55 });
        add("path", { d: "M10 133 C10 92 90 92 90 133Z", fill: p.dark });
        add("circle", { cx: 50, cy: 66, r: 19, fill: p.a2 });
        add("path", { d: "M31 62 C33 40 67 40 69 62 C60 54 40 54 31 62Z", fill: p.dark });
        break;
      }
      case 8: {   // skyline
        add("circle", { cx: r(0, 25, 75), cy: 56, r: 16, fill: p.a2 });
        for (let i = 0; i < 9; i++) {
          const height = r(i + 1, 22, 62);
          add("rect", { x: i * 11.2, y: 133 - height, width: 10, height, fill: i % 3 ? p.dark : p.a1 });
        }
        break;
      }
      default: {   // flower
        for (let i = 0; i < 10; i++) {
          add("ellipse", { cx: 50, cy: 46, rx: 8, ry: 26, fill: i % 2 ? p.a1 : p.a2, opacity: 0.8, transform: `rotate(${i * 36} 50 72)` });
        }
        add("circle", { cx: 50, cy: 72, r: 7, fill: p.dark });
      }
    }
    return svg;
  }
}

/** Result of {@link createCoverGridModelAndOptions}. */
export interface CoverGridModelAndOptionsIf {
  tableModel: CoverGridTableModel<BookIf>;
  tableOptions: TableOptionsIf;
}

/**
 * Cover grid demo: books as tiles (magazine covers, edge to edge) in a grid that fills the width of the table. The number of columns follows the
 * width (`floor(width / coverWidth)`); only the visible rows are in the DOM.
 *
 * - filter: `filter` becomes `externalFilterFunction` – call `tableApi.externalFilterChanged()` after a change
 * - sort: `tableApi.sort(BOOK_SORTS.title)`
 * - size: `tableModel.bodyModel.coverWidth/coverHeight = …` + `tableApi.repaintHard()`
 *
 * @param books - the items (default: {@link generateBooks})
 * @param coverWidth - width of a tile in px (default 165)
 * @param coverHeight - height of a tile in px (default 220)
 * @param ctx - `filter` (which books are shown) and `isSelected` (frame)
 */
export function createCoverGridModelAndOptions(
  books: BookIf[] = generateBooks(),
  coverWidth = 165,
  coverHeight = 220,
  ctx: BookCoverContextIf & { filter?: (book: BookIf) => boolean } = {}
): CoverGridModelAndOptionsIf {
  const tableModel = CoverGridFactory.createCoverGridModel<BookIf>(
    books, new BookCoverRenderer(ctx), coverWidth, coverHeight);
  const tableOptions: TableOptionsIf = {
    ...CoverGridFactory.createCoverGrisDefaultOptions(coverHeight, () => "coverGridDemo"),
    externalFilterFunction: ctx.filter,
    shortcutActionsDisabled: true,       // the table's cell navigation does not apply to tiles
    overflowY: "scroll",   // a classic scroll bar is always there: the number of columns does not jump
    ariaLabel: "Books"
  };
  return { tableModel, tableOptions };
}

/**
 * Stretches the tiles so that the columns fill the width of the grid (no gap on the right). The number of columns
 * stays `floor(width / baseWidth)`, the height grows with the width (same aspect ratio). Call it after the width of
 * the table changed (e.g. `tableApi.recalcColumnWidths()` from your own `ResizeObserver`), then `tableApi.repaintHard()`.
 *
 * @param tableModel - the cover grid model (its `bodyModel.width` is the width the table set)
 * @param baseWidth - the wanted (minimal) tile width
 * @param baseHeight - the tile height at `baseWidth`
 * @returns `true` if the tile size changed
 */
export function fitCoversToWidth(tableModel: CoverGridTableModel<unknown>, baseWidth: number, baseHeight: number): boolean {
  const body = tableModel.bodyModel;
  if (!body.width) return false;
  const columns = Math.max(1, Math.floor(body.width / baseWidth));
  const coverWidth = Math.floor(body.width / columns);   // narrower than baseWidth only if the grid is
  const coverHeight = Math.round(baseHeight * coverWidth / baseWidth);
  if (coverWidth === body.coverWidth && coverHeight === body.coverHeight) return false;
  body.coverWidth = coverWidth;
  body.coverHeight = coverHeight;
  return true;
}
