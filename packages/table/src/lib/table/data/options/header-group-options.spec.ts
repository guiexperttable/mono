import { describe, it, expect } from 'vitest';
import { HeaderGroupOptions, Icon } from '@guiexpert/table';

describe('HeaderGroupOptions', () => {
  const o = new HeaderGroupOptions();

  it('uses "❯" for both icons, rotated when collapsed', () => {
    expect(o.iconExpanded.content).toBe('❯');
    expect(o.iconCollapsed.content).toBe('❯');
    expect(o.iconExpanded.style).toBe('');
    expect(o.iconCollapsed.style).toContain('rotate(180deg)');
  });

  it('marks the icons with CSS classes', () => {
    // NOTE: the expanded icon uses the prefix "gt-" instead of the "ge-table-" convention (no CSS uses either class).
    expect(o.iconExpanded.classes).toEqual(['gt-table-icon-expanded']);
    expect(o.iconCollapsed.classes).toEqual(['ge-table-icon-collapsed']);
  });

  it('accepts own icons', () => {
    const plus = new Icon('+');
    const minus = new Icon('-');
    const custom = new HeaderGroupOptions(minus, plus);
    expect(custom.iconExpanded).toBe(minus);
    expect(custom.iconCollapsed).toBe(plus);
  });
});
