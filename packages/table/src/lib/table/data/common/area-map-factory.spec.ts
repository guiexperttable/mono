import { describe, it, expect } from 'vitest';
import { AreaMapFactory, AreaObjectMap } from '@guiexpert/table';
import type { CellRendererIf } from '@guiexpert/table';

describe('AreaMapFactory', () => {
  it('body() creates an AreaObjectMap with only a body renderer', () => {
    const renderer: CellRendererIf = { render: () => undefined };
    const map = AreaMapFactory.body(renderer);
    expect(map).toBeInstanceOf(AreaObjectMap);
    expect(map.header).toBeUndefined();
    expect(map.body).toBe(renderer);
    expect(map.footer).toBeUndefined();
  });
});

describe('AreaObjectMap', () => {
  it('holds one value per area', () => {
    const map = new AreaObjectMap<string[]>(['h'], ['b'], ['f']);
    expect(map.header).toEqual(['h']);
    expect(map.body).toEqual(['b']);
    expect(map.footer).toEqual(['f']);
  });

  it('is empty by default', () => {
    const map = new AreaObjectMap<number>();
    expect(map.header).toBeUndefined();
    expect(map.body).toBeUndefined();
    expect(map.footer).toBeUndefined();
  });
});
