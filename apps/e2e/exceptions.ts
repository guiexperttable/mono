// Every exception of the E2E smoke tests in one place (prompt 026, decision E7) – each with a reason.
// A new entry needs a reason a reviewer can check; an exception that is no longer needed should be removed.

export type ExceptionKind =
  /** The page is a placeholder ("Simple demo", CLAUDE.md §6): only "loads without errors", no table assertions. */
  | 'placeholder'
  /** The page/demo deliberately shows no GuiExpert table (its own HTML table, text only). */
  | 'noTable'
  /** The generic interaction (wheel → other rows, click → focus) does not fit the page. */
  | 'noInteraction'
  /** The page needs something the test run does not have (an external server) – the test is skipped. */
  | 'skip';

export interface ExceptionIf {
  /** Target id as printed in the test title, e.g. `showcase sorting1`, `training-demo naive-table`. */
  target: string;
  kind: ExceptionKind;
  reason: string;
}

const placeholder = (name: string): ExceptionIf => ({
  target: `showcase ${name}`, kind: 'placeholder',
  reason: 'placeholder showcase ("Simple demo", content "Dies ist ein Test") – CLAUDE.md §6, not linked yet',
});

export const EXCEPTIONS: ExceptionIf[] = [
  ...['sorting1', 'inputfilter', 'sliderfilter', 'renderer1', 'rowspan', 'nobel'].map(placeholder),
  { target: 'training-demo naive-table', kind: 'noTable', reason: 'chapter 1 shows why a plain <table> freezes – its own HTML table on purpose' },
  { target: 'app angular-table-demo', kind: 'noTable', reason: 'welcome page: the menu of the demos, each demo route has its own test' },
  { target: 'app vue3-multi-demo', kind: 'noTable', reason: 'home page with the menu, each route of src/router/demos.ts has its own test' },
  { target: 'app vue3-multi-demo /overview', kind: 'noTable', reason: 'overview page: cards with links to the demos' },
  {
    target: 'app angular-table-demo /demo/chunksocket', kind: 'skip',
    reason: 'needs the socket.io server on localhost:3334 (chunked data over a web socket) – not part of the repository',
  },
  {
    target: 'showcase masterdetail', kind: 'noInteraction',
    reason: 'the middle of the viewport is an open detail with its own table – the wheel scrolls the inner table (by design)',
  },
  {
    target: 'table-demo master-detail.html', kind: 'noInteraction',
    reason: 'the middle of the viewport is an open detail with its own table – the wheel scrolls the inner table (by design)',
  },
  { target: 'training-demo virtual-scroll', kind: 'noTable', reason: 'chapter 2 explains virtual scrolling with a hand-written mini scroller, no GuiExpert table' },
];

/**
 * Console warnings that are allowed. Each one is a regular expression on the message text plus the targets it is
 * allowed for (`*` = everywhere). Keep this list short: a warning in a demo is usually a bug (cf. G10 of prompt 025).
 */
export const ALLOWED_WARNINGS: { target: string; message: RegExp; reason: string }[] = [
  {
    target: 'app angular-table-demo /demo/covergrid', message: /the body model has no row objects/,
    reason: 'angular-table-demo uses the npm packages 1.1.105 (design B2, TODO.md); the warning is gone since 1.1.116 (prompt 025)',
  },
];

/**
 * Requests to foreign hosts that are allowed (all others are aborted and fail the test). Only where the page shows
 * external content on purpose; a demo must never load code or CSS from a CDN.
 */
export const ALLOWED_FOREIGN_HOSTS: { target: string; host: string; reason: string }[] = [
  { target: 'showcase crypto', host: 's2.coinmarketcap.com', reason: 'coin icons of the crypto ticker (CoinIconRenderer, demo-table-models)' },
];

/**
 * Foreign REST APIs a demo talks to on purpose – the test answers them itself (`route.fulfill`), so the table really
 * shows rows and the run does not depend on the internet. Every other foreign request is aborted and red.
 */
export const FOREIGN_MOCKS: { host: string; reason: string; respond(url: URL, method: string): unknown }[] = [
  {
    host: 'jsonplaceholder.typicode.com',
    reason: 'vue3-multi-demo /crud, /crud2, /crud3: CrudTableModelFactory against the public JSONPlaceholder REST API',
    respond(url, method) {
      const row = (id: number) => ({
        id, userId: 1, title: `Item ${id}`, completed: id % 2 === 0, name: `Name ${id}`, username: `user${id}`,
        email: `user${id}@example.com`, body: `Text ${id}`,
      });
      const id = url.pathname.match(/\/(\d+)$/)?.[1];
      if (method === 'DELETE') return {};
      if (id || method !== 'GET') return row(Number(id ?? 101));
      return Array.from({ length: 25 }, (_, i) => row(i + 1));
    },
  },
];

export function exceptionOf(target: string, kind: ExceptionKind): ExceptionIf | undefined {
  return EXCEPTIONS.find(e => e.target === target && e.kind === kind);
}

export const isPlaceholder = (target: string) => !!exceptionOf(target, 'placeholder');
export const hasNoTable = (target: string) => !!exceptionOf(target, 'noTable');
export const isSkipped = (target: string) => !!exceptionOf(target, 'skip');
export const hasNoInteraction = (target: string) => !!exceptionOf(target, 'noInteraction');
