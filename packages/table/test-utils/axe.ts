// axe-core for browser tests (*.browser.spec.ts): accessibility check of a mounted table.
//
//   const violations = await axeViolations(host);
//   expect(violations).toEqual([]);
//
// Lives outside src/ on purpose: axe-core is a devDependency and must not end up in the npm package.
import axe from 'axe-core';

/** The WCAG levels of the prompt (WCAG 2.1 AA / EN 301 549) plus axe's best practices. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

export interface AxeViolationSummary {
  id: string;
  impact: string | null | undefined;
  help: string;
  targets: string[];
}

/**
 * The two findings that come from the scroll viewport of the virtual scrolling (design 001 § 2.4):
 * it is a scroll container with `tabindex="-1"` inside the grid. Without the tabindex Chrome (≥ 130) makes every
 * scroller without focusable content a tab stop of its own – a second, useless tab stop next to the grid. The
 * viewport is operated through the keyboard model of the grid (arrows, Page Up/Down, Home/End move the focus cell
 * and scroll), and when it gets the focus by a click it passes it on to the grid. axe cannot see either:
 * - "scrollable-region-focusable" on `.ge-table-scroll-viewport` and
 * - "aria-required-children" on the grid, reporting exactly the focusable `div[tabindex]` (the viewport).
 * Every other node of these rules still counts.
 */
function isKnownScrollViewportFinding(ruleId: string, node: axe.NodeResult): boolean {
  const target = node.target.join(' ');
  if (ruleId === 'scrollable-region-focusable') {
    // with a nested table (master/detail) axe adds attribute selectors to keep the selector unique
    return /\.ge-table-scroll-viewport(\[[^\]]*\])*$/.test(target);
  }
  if (ruleId === 'aria-required-children') {
    const messages = node.any.concat(node.all, node.none).map(c => c.message).join(' ');
    if (/children which are not allowed: div\[tabindex\]$/.test(messages.trim())) {
      return true;
    }
    // Excel-style editing (since 1.1.99): the editor above the cell (input/select in .ge-table-cell-editor) is owned
    // by the edited gridcell (aria-owns) – browsers put it into the cell in the accessibility tree, axe's rule
    // looks at the DOM children only. Accepted only if the gridcell really owns it.
    const m = /children which are not allowed: (.*)$/.exec(messages.trim());
    if (m) {
      const allowed = ['div[tabindex]', 'input[aria-label]', 'select[aria-label]'];
      const editor = document.querySelector<HTMLElement>('.ge-table-cell-editor input, .ge-table-cell-editor select');
      const owned = !!editor?.id && !!document.querySelector(`[role="gridcell"][aria-owns="${editor.id}"]`);
      return owned && m[1].split(',').map(x => x.trim()).every(x => allowed.includes(x));
    }
  }
  return false;
}

/**
 * Runs axe on an element and returns the violations in a short, readable form (rule id, impact, help, targets).
 *
 * Page-level rules that a table cannot fulfil on its own are switched off: "region" (content outside landmarks),
 * "page-has-heading-one" and "landmark-one-main" – the test page has no landmarks.
 */
export async function axeViolations(context: Element): Promise<AxeViolationSummary[]> {
  const result = await axe.run(context, {
    runOnly: { type: 'tag', values: TAGS },
    rules: {
      'region': { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
    },
    resultTypes: ['violations'],
  });
  return result.violations
    .map(v => ({ ...v, nodes: v.nodes.filter(n => !isKnownScrollViewportFinding(v.id, n)) }))
    .filter(v => v.nodes.length)
    .map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map(n => `${n.target.join(' ')} – ${n.failureSummary ?? ''}`),
  }));
}
