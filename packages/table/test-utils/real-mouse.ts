// Browser side of the real-mouse commands (test-utils/browser-commands.ts): REAL input through the browser engine
// (Playwright `page.mouse`), not synthetic events. Use it where the browser decides something on its own – e.g.
// whether a `click` follows a `mousedown`/`mouseup` (prompt 018).
//
//   await realMouse.moveTo(cell);          // centre of an element
//   await realMouse.down();
//   api.repaint();                         // render while the button is held
//   await realMouse.up();
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    geMouseMove: (x: number, y: number, steps?: number) => Promise<void>;
    geMouseDown: (clickCount?: number) => Promise<void>;
    geMouseUp: (clickCount?: number) => Promise<void>;
  }
}

export const realMouse = {
  /** Moves the mouse to (x, y) in client coordinates of the test document. */
  move(x: number, y: number, steps = 1): Promise<void> {
    return commands.geMouseMove(x, y, steps);
  },
  /** Moves the mouse to the centre of an element (plus an offset). */
  moveTo(element: Element, dx = 0, dy = 0): Promise<void> {
    const rect = element.getBoundingClientRect();
    return commands.geMouseMove(rect.left + rect.width / 2 + dx, rect.top + rect.height / 2 + dy);
  },
  /** Presses the left button; `clickCount` 2 for the second press of a double click. */
  down(clickCount = 1): Promise<void> {
    return commands.geMouseDown(clickCount);
  },
  /** Releases the left button. */
  up(clickCount = 1): Promise<void> {
    return commands.geMouseUp(clickCount);
  },
  /** A complete click (down + up) at the current position. */
  async click(clickCount = 1): Promise<void> {
    await commands.geMouseDown(clickCount);
    await commands.geMouseUp(clickCount);
  },
};
