import { describe, it, expect } from 'vitest';
import { allCenter, allLeft, allRight, bodyCenter, bodyLeft, bodyRight } from '@guiexpert/table';

describe('alignment class constants (aligns.ts)', () => {
  it('body* constants only set body classes', () => {
    expect(bodyLeft).toEqual({ body: ['ge-table-text-align-left'] });
    expect(bodyCenter).toEqual({ body: ['ge-table-text-align-center'] });
    expect(bodyRight).toEqual({ body: ['ge-table-text-align-right'] });
  });

  it('all* constants set header, body and footer classes', () => {
    for (const [map, align] of [[allLeft, 'left'], [allCenter, 'center'], [allRight, 'right']] as const) {
      const cls = [`ge-table-text-align-${align}`];
      expect(map).toEqual({ header: cls, body: cls, footer: cls });
    }
  });
});
