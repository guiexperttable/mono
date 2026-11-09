// Vitest browser commands (run in Node, registered in vitest.config.ts): REAL mouse input via Playwright `page.mouse`.
//
//   import { realMouse } from '../../test-utils/real-mouse';   // the browser side of these commands
//   await realMouse.move(x, y);   // client coordinates of the test document
//   await realMouse.down();
//   api.repaint();                // the app renders while the button is held
//   await realMouse.up();
//
// Synthetic events (`element.click()`, `dispatchEvent`) bypass what the browser decides on its own, e.g. "no click
// when mousedown and mouseup hit different elements" (prompt 018). These commands go through the input pipeline of
// the browser: hit testing, click count and the native click/dblclick come from the engine.
//
// Coordinates: the test runs in an iframe of the Vitest page – a position in the test document is moved by the
// iframe's offset (and scaled, should Vitest scale the iframe down).
//
// Lives outside src/ on purpose: it must not end up in the npm package.
import type { BrowserCommand } from 'vitest/node';

async function toPagePoint(ctx: Parameters<BrowserCommand<[]>>[0], x: number, y: number): Promise<{ x: number; y: number }> {
  const frame = await ctx.frame();
  const frameElement = await frame.frameElement();
  const box = await frameElement.boundingBox();
  if (!box) {
    return { x, y };
  }
  const innerWidth = await frame.evaluate(() => window.innerWidth);
  const scale = innerWidth > 0 ? box.width / innerWidth : 1;
  return { x: box.x + x * scale, y: box.y + y * scale };
}

/** Moves the real mouse to (x, y) – client coordinates of the test document. */
export const geMouseMove: BrowserCommand<[x: number, y: number, steps?: number]> = async (ctx, x, y, steps = 1) => {
  const point = await toPagePoint(ctx, x, y);
  await ctx.page.mouse.move(point.x, point.y, { steps });
};

/** Presses the real (left) mouse button at the current position. `clickCount` 2 = second press of a double click. */
export const geMouseDown: BrowserCommand<[clickCount?: number]> = async (ctx, clickCount = 1) => {
  await ctx.page.mouse.down({ clickCount });
};

/** Releases the real (left) mouse button at the current position. */
export const geMouseUp: BrowserCommand<[clickCount?: number]> = async (ctx, clickCount = 1) => {
  await ctx.page.mouse.up({ clickCount });
};

export const browserCommands = { geMouseMove, geMouseDown, geMouseUp };
