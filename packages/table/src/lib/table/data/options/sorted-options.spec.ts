import { describe, it, expect } from 'vitest';
import { Icon, SortedOptions } from '@guiexpert/table';

describe('SortedOptions', () => {

  describe('defaults', () => {
    const options = new SortedOptions();

    it('ascending icon: "↑" with class ge-header-sorted-asc', () => {
      expect(options.iconAsc).toEqual(new Icon('↑', '', ['ge-header-sorted-asc']));
    });

    it('descending icon: "↓" with class ge-header-sorted-desc', () => {
      expect(options.iconDesc).toEqual(new Icon('↓', '', ['ge-header-sorted-desc']));
    });

    it('placeholder icon: a transparent "↑" without classes (keeps the header width stable)', () => {
      expect(options.iconPlaceholder).toEqual(new Icon('↑', 'color:transparent;', []));
    });
  });

  it('accepts custom icons', () => {
    const asc = new Icon('A', 'color:green;', ['a']);
    const desc = new Icon('D', '', ['d']);
    const placeholder = new Icon('', '', []);
    const options = new SortedOptions(asc, desc, placeholder);
    expect(options.iconAsc).toBe(asc);
    expect(options.iconDesc).toBe(desc);
    expect(options.iconPlaceholder).toBe(placeholder);
  });

  it('can be spread into a plain SortedOptionsIf object', () => {
    const custom = { ...new SortedOptions(), iconAsc: new Icon('▲') };
    expect(custom.iconAsc.content).toBe('▲');
    expect(custom.iconDesc.content).toBe('↓');
  });

  it('creates new icon instances per options object', () => {
    expect(new SortedOptions().iconAsc).not.toBe(new SortedOptions().iconAsc);
  });
});
