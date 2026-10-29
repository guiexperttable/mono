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
    const k = (i * 97) % titles;   // 97 and 288 are coprime: every title once per 288 books, in a mixed order
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

/**
 * Draws one book as a tile of the cover grid: a generated cover (gradient, genre, title, author) and a caption.
 * Plain DOM, no framework. The book data is set as text (`textContent`), never as HTML.
 * The tile fills the cell, so it follows `bodyModel.coverWidth` / `coverHeight`.
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
    const coverWidth = (areaModel as { coverWidth?: number }).coverWidth ?? 160;
    const small = coverWidth < 120;

    const tile = doc.createElement("div");
    tile.className = "ge-demo-book";
    tile.title = `${book.title} – ${book.author} (${book.year})`;
    Object.assign(tile.style, {
      boxSizing: "border-box", width: "100%", height: "100%", padding: small ? "5px" : "10px",
      display: "flex", flexDirection: "column", gap: "6px", cursor: "pointer"
    });

    const cover = doc.createElement("div");
    Object.assign(cover.style, {
      position: "relative", flex: "1", minHeight: "0", overflow: "hidden", boxSizing: "border-box",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: small ? "8px 6px 8px 10px" : "14px 12px 14px 18px",
      borderRadius: "3px 8px 8px 3px",
      borderLeft: "6px solid rgba(0,0,0,0.28)",
      background: `linear-gradient(160deg, hsl(${book.hue} 62% 52%), hsl(${(book.hue + 40) % 360} 68% 24%))`,
      color: "#fff", fontSize: `${Math.max(9, Math.round(coverWidth / 11))}px`, lineHeight: "1.2",
      boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
      outline: this.ctx.isSelected?.(book) ? "3px solid #2b7de9" : "none", outlineOffset: "3px"
    });

    const genre = doc.createElement("div");
    genre.textContent = book.genre.toUpperCase();
    Object.assign(genre.style, { fontSize: "0.6em", letterSpacing: "0.12em", opacity: "0.85" });

    const title = doc.createElement("div");
    title.textContent = book.title;
    Object.assign(title.style, { fontSize: "1.2em", fontWeight: "700", overflowWrap: "anywhere" });

    const author = doc.createElement("div");
    author.textContent = book.author;
    Object.assign(author.style, { fontSize: "0.75em", opacity: "0.9" });

    cover.append(genre, title);
    if (!small) cover.append(author);
    tile.append(cover);

    if (!small) {
      const caption = doc.createElement("div");
      caption.textContent = `${book.year} · ${book.pages} pages`;
      Object.assign(caption.style, {
        fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: "0.75"
      });
      tile.append(caption);
    }
    cellDiv.append(tile);
    return undefined;
  }
}

/** Result of {@link createCoverGridModelAndOptions}. */
export interface CoverGridModelAndOptionsIf {
  tableModel: CoverGridTableModel<BookIf>;
  tableOptions: TableOptionsIf;
}

/**
 * Cover grid demo: books as tiles in a grid that fills the width of the table. The number of columns follows the
 * width (`floor(width / coverWidth)`); only the visible rows are in the DOM.
 *
 * - filter: `filter` becomes `externalFilterFunction` – call `tableApi.externalFilterChanged()` after a change
 * - sort: `tableApi.sort(BOOK_SORTS.title)`
 * - size: `tableModel.bodyModel.coverWidth/coverHeight = …` + `tableApi.repaintHard()`
 *
 * @param books - the items (default: {@link generateBooks})
 * @param coverWidth - width of a tile in px (default 160)
 * @param coverHeight - height of a tile in px (default 260)
 * @param ctx - `filter` (which books are shown) and `isSelected` (frame)
 */
export function createCoverGridModelAndOptions(
  books: BookIf[] = generateBooks(),
  coverWidth = 160,
  coverHeight = 260,
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
