// ConvenienceDomService writes all positions from the start of a row; in right-to-left as "right" (since 1.1.98).
import { describe, expect, it } from 'vitest';
import { ConvenienceDomService } from '@guiexpert/table';
import type { DomServiceIf } from '@guiexpert/table';

/** A DOM service that records setStyle calls on plain objects (no DOM in the unit project). */
function recordingDom() {
  const calls: [string, string][] = [];
  const domService = {
    setStyle: (_el: unknown, key: string, value: string) => { calls.push([key, value]); },
  } as unknown as DomServiceIf;
  return { dom: new ConvenienceDomService(domService), calls };
}

describe('ConvenienceDomService – writing direction', () => {

  it('left-to-right (default): keys as given', () => {
    const { dom, calls } = recordingDom();
    expect(dom.getDirection()).toBe('ltr');
    dom.setStyle({}, 'left', '10px');
    dom.applyStyle({} as HTMLDivElement, { right: '0', top: '1px' });
    dom.applyStyleInPx({} as HTMLDivElement, { left: 5, top: 6, width: 7, height: 8 });
    expect(calls).toEqual([
      ['left', '10px'], ['right', '0'], ['top', '1px'],
      ['left', '5px'], ['top', '6px'], ['width', '7px'], ['height', '8px'],
    ]);
  });

  it('right-to-left: left ↔ right, everything else as given', () => {
    const { dom, calls } = recordingDom();
    dom.setDirection('rtl');
    expect(dom.getDirection()).toBe('rtl');
    dom.setStyle({}, 'left', '10px');
    dom.applyStyle({} as HTMLDivElement, { right: '0', top: '1px', 'padding-left': '2px' });
    dom.applyStyleInPx({} as HTMLDivElement, { left: 5, top: 6, width: 7, height: 8 });
    expect(calls).toEqual([
      ['right', '10px'], ['left', '0'], ['top', '1px'], ['padding-left', '2px'],
      ['right', '5px'], ['top', '6px'], ['width', '7px'], ['height', '8px'],
    ]);
    expect(dom.toPhysicalStyleKey('width')).toBe('width');
    dom.setDirection('ltr');
    expect(dom.toPhysicalStyleKey('left')).toBe('left');
  });

  it('getInlineStart reads the start position as written', () => {
    const { dom } = recordingDom();
    const style = new Map<string, string>([['left', '12px'], ['right', '30px']]);
    const el = { style: { getPropertyValue: (k: string) => style.get(k) ?? '' } } as unknown as HTMLElement;
    expect(dom.getInlineStart(el)).toBe(12);
    dom.setDirection('rtl');
    expect(dom.getInlineStart(el)).toBe(30);
    expect(dom.getInlineStart({ style: { getPropertyValue: () => '' } } as unknown as HTMLElement)).toBe(0);
  });
});
