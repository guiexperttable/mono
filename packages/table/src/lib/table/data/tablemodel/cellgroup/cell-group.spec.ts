import { describe, it, expect } from 'vitest';
import { CellGroup } from '@guiexpert/table';

describe('CellGroup', () => {
  it('has sensible defaults', () => {
    const g = new CellGroup('Label');
    expect(g.impl).toBe('CellGroup');
    expect(g.data).toBe('Label');
    expect(g.property).toBeUndefined();
    expect(g.toggle).toBeUndefined();
    expect(g.closed).toBe(false);
    expect(g.visibility).toBe('normal');
    expect(g.children).toBeUndefined();
  });

  it('stores all constructor arguments', () => {
    const child = new CellGroup('Child', 'child');
    const g = new CellGroup('G', 'g', true, true, 'inverted', [child]);
    expect([g.data, g.property, g.toggle, g.closed, g.visibility]).toEqual(['G', 'g', true, true, 'inverted']);
    expect(g.children).toEqual([child]);
  });
});
