// SimpleDomService is a thin wrapper around the DOM. Here it gets minimal fakes for the elements and `document`
// (stubbed per test); real DOM behaviour is covered by the browser tests.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SimpleDomService } from '@guiexpert/table';

function fakeDiv() {
  const classes = new Set<string>();
  return {
    style: {} as Record<string, unknown>,
    classList: {
      add: vi.fn((c: string) => void classes.add(c)),
      remove: vi.fn((c: string) => void classes.delete(c)),
    },
    classes,
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SimpleDomService', () => {
  const dom = new SimpleDomService();

  it('setStyle sets el.style[name] and returns the element', () => {
    const div = fakeDiv();
    expect(dom.setStyle(div, 'width', '20px')).toBe(div);
    expect(div.style['width']).toBe('20px');
  });

  it('addClass adds one class', () => {
    const div = fakeDiv();
    dom.addClass(div as unknown as HTMLDivElement, 'a');
    expect([...div.classes]).toEqual(['a']);
  });

  it('addClass splits space separated class names', () => {
    const div = fakeDiv();
    expect(dom.addClass(div as unknown as HTMLDivElement, 'a b c')).toBe(div);
    expect([...div.classes]).toEqual(['a', 'b', 'c']);
  });

  it('addClass passes empty tokens of double spaces to classList.add', () => {
    // NOTE: "a  b" → classList.add("") – a real DOMTokenList throws a SyntaxError for an empty token.
    const div = fakeDiv();
    dom.addClass(div as unknown as HTMLDivElement, 'a  b');
    expect(div.classList.add).toHaveBeenCalledWith('');
  });

  it('removeClass removes one or several (space separated) classes', () => {
    const div = fakeDiv();
    dom.addClass(div as unknown as HTMLDivElement, 'a b c');
    expect(dom.removeClass(div as unknown as HTMLDivElement, 'a c')).toBe(div);
    expect([...div.classes]).toEqual(['b']);
    dom.removeClass(div as unknown as HTMLDivElement, 'b');
    expect([...div.classes]).toEqual([]);
  });

  it('appendChild and setAttribute delegate to the element', () => {
    const parent = fakeDiv();
    const child = fakeDiv();
    dom.appendChild(parent as unknown as HTMLElement, child as unknown as HTMLElement);
    expect(parent.appendChild).toHaveBeenCalledWith(child);
    dom.setAttribute(parent as unknown as HTMLElement, 'title', 'x');
    expect(parent.setAttribute).toHaveBeenCalledWith('title', 'x');
  });

  it('createElement / createText / appendText use the global document', () => {
    const created = fakeDiv();
    const text = { nodeValue: 'hi' };
    const doc = { createElement: vi.fn(() => created), createTextNode: vi.fn(() => text) };
    vi.stubGlobal('document', doc);

    expect(dom.createElement<HTMLDivElement>('div')).toBe(created);
    expect(doc.createElement).toHaveBeenCalledWith('div');
    expect(dom.createText('hi')).toBe(text);

    const parent = fakeDiv();
    expect(dom.appendText(parent as unknown as HTMLDivElement, 'hi')).toBe(text);
    expect(parent.appendChild).toHaveBeenCalledWith(text);
  });
});
