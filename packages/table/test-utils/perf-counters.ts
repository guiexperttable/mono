// Counters for performance invariants (prompt 021, stage 1): count WORK, not time – the numbers are the same on every
// machine, so they can guard the release in `test:browser` without flaky tests.
//
//   const renders = countRenders(scope);
//   const cells = countCellBuilds(host);
//   api.repaintHard();
//   expect(renders.count()).toBe(1);
//   expect(cells.count()).toBeLessThanOrEqual(visibleCells);
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import { expect, vi } from 'vitest';
import type { TableScope } from '@guiexpert/table';

export interface Counter {
  /** The number counted since the start (or the last {@link Counter.reset}). */
  count(): number;
  /** Starts counting from 0 again. */
  reset(): void;
  /** Stops counting (restores a spied method / disconnects an observer). */
  stop(): void;
}

/** Counts calls of a method of an object (a spy that calls through). */
export function countCalls<T extends object>(obj: T, method: keyof T & string): Counter {
  const spy = vi.spyOn(obj as any, method as any);
  let offset = 0;
  return {
    count: () => spy.mock.calls.length - offset,
    reset: () => { offset = spy.mock.calls.length; },
    stop: () => spy.mockRestore(),
  };
}

/**
 * Counts the render passes of a table: `RenderScope.adjustAfterScrolling()` – one call = the visible rows and cells of
 * all nine areas are built (pattern of `repaint-count.browser.spec.ts`).
 */
export function countRenders(scope: TableScope): Counter {
  return countCalls(scope, 'adjustAfterScrolling');
}

/**
 * Counts the cell divs (`.ge-table-col-div`) inserted into the table – how many cells a step rebuilt. A
 * `MutationObserver` on the host (independent of internals: whatever path builds a cell, it is counted).
 * `count()` reads the pending records synchronously, no waiting needed.
 */
export function countCellBuilds(host: HTMLElement): Counter {
  // a Set: a cell appended to a row div that is inserted in the same task appears twice in the records
  let built = new Set<Element>();
  const add = (records: MutationRecord[]) => {
    for (const record of records) {
      record.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.classList.contains('ge-table-col-div')) built.add(node);
        node.querySelectorAll('.ge-table-col-div').forEach(cell => built.add(cell)); // a row div with its cells
      });
    }
  };
  const observer = new MutationObserver(add);
  observer.observe(host, { childList: true, subtree: true });
  const flush = () => add(observer.takeRecords());
  return {
    count: () => { flush(); return built.size; },
    reset: () => { flush(); built = new Set(); },
    stop: () => { flush(); observer.disconnect(); },
  };
}

/**
 * Counts the rebuilds of the body row positions (`RowLayout.setRows` – O(1) for a constant row height, O(n) prefix
 * sums for variable heights).
 */
export function countRowLayoutBuilds(scope: TableScope): Counter {
  // build it once, so the spy sits on the instance the table keeps
  const layout = scope.getBodyRowLayout();
  return countCalls(layout, 'setRows');
}

/** Number of body cell divs currently in the DOM (all three sides) – "the visible cells". */
export function visibleBodyCells(host: HTMLElement): number {
  return host.querySelectorAll('.ge-table-body-west .ge-table-col-div, .ge-table-body-center .ge-table-col-div, '
    + '.ge-table-body-east .ge-table-col-div').length;
}

/** Identity instead of a copy: the array after a step is the same object as before. */
export function expectSameArray(before: unknown[], after: unknown[], what = 'array'): void {
  expect(after === before, `${what} is the same array (no copy)`).toBe(true);
}
