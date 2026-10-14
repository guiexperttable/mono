import { describe, expect, it } from 'vitest';
import { AriaIds } from '@guiexpert/table';

describe('AriaIds', () => {

  it('uses the host id as prefix', () => {
    expect(AriaIds.createPrefix('orders')).toBe('ge-orders');
    expect(AriaIds.createPrefix('  orders  ')).toBe('ge-orders');
    expect(AriaIds.createPrefix('my orders')).toBe('ge-my_orders'); // an id must not contain spaces
  });

  it('numbers tables without a host id (unique on the page)', () => {
    const a = AriaIds.createPrefix();
    const b = AriaIds.createPrefix('');
    expect(a).toMatch(/^ge-t\d+$/);
    expect(b).toMatch(/^ge-t\d+$/);
    expect(a).not.toBe(b);
  });

  it('builds the ids of cells, row groups and the live region', () => {
    const ids = new AriaIds('ge-orders');
    expect(ids.cell('body', 5, 2)).toBe('ge-orders-body-r5-c2');
    expect(ids.cell('header', 0, 12)).toBe('ge-orders-header-r0-c12');
    expect(ids.rowGroup('footer', 'east')).toBe('ge-orders-rg-footer-east');
    expect(ids.liveRegion()).toBe('ge-orders-live');
  });

  it('two tables never share an id', () => {
    const a = new AriaIds(AriaIds.createPrefix());
    const b = new AriaIds(AriaIds.createPrefix());
    expect(a.cell('body', 0, 0)).not.toBe(b.cell('body', 0, 0));
    expect(a.liveRegion()).not.toBe(b.liveRegion());
  });
});
