// Prompt 027: cover grid in the full width – the DOM-free kernel and the model.
import { describe, expect, it } from 'vitest';
import { computeCoverGridFill, CoverGridBodyModel, CoverGridFactory, isCoverGridBodyModel } from '@guiexpert/table';
import type { CellRendererIf } from '@guiexpert/table';

const renderer: CellRendererIf = { render: () => undefined };
const items = (n: number) => Array.from({ length: n }, (_, i) => 'item-' + i);

describe('computeCoverGridFill', () => {

  it('960 / 165 → 5 columns of 192 px, flush (5 × 192 = 960)', () => {
    expect(computeCoverGridFill(960, { tileWidth: 165 }, 220)).toEqual({ columns: 5, baseWidth: 192, rest: 0, tileHeight: 220 });
  });

  it('961 px: the rest pixel goes to the first column', () => {
    expect(computeCoverGridFill(961, { tileWidth: 165 }, 220)).toEqual({ columns: 5, baseWidth: 192, rest: 1, tileHeight: 220 });
  });

  it('620 / 165 → 3 columns 207, 207, 206', () => {
    expect(computeCoverGridFill(620, { tileWidth: 165 }, 220)).toMatchObject({ columns: 3, baseWidth: 206, rest: 2 });
  });

  it('narrower than one tile → 1 column with the whole width', () => {
    expect(computeCoverGridFill(100, { tileWidth: 165 }, 220)).toMatchObject({ columns: 1, baseWidth: 100, rest: 0 });
  });

  it.each([0, -5, NaN])('width %s → 1 column of tileWidth, no division by 0', width => {
    expect(computeCoverGridFill(width, { tileWidth: 165 }, 220)).toEqual({ columns: 1, baseWidth: 165, rest: 0, tileHeight: 220 });
  });

  it('a fractional width is floored (no column wider than the room)', () => {
    expect(computeCoverGridFill(960.7, { tileWidth: 165 }, 220)).toMatchObject({ columns: 5, baseWidth: 192, rest: 0 });
  });

  it('aspectRatio + extraHeight → height = round(width × ratio) + extra', () => {
    expect(computeCoverGridFill(960, { tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 }, 1).tileHeight)
      .toBe(Math.round(192 * 220 / 165) + 44);   // 256 + 44 = 300
  });

  it('without aspectRatio the height stays coverHeight (extraHeight is not added)', () => {
    expect(computeCoverGridFill(960, { tileWidth: 165, extraHeight: 44 }, 220).tileHeight).toBe(220);
  });

  it('a tile width ≤ 0 → one column', () => {
    expect(computeCoverGridFill(960, { tileWidth: 0 }, 220)).toMatchObject({ columns: 1, baseWidth: 960 });
  });

  it.each([NaN, -10, Infinity])('a tile width of %s → one column of the whole width', tileWidth => {
    expect(computeCoverGridFill(960, { tileWidth }, 220)).toMatchObject({ columns: 1, baseWidth: 960, rest: 0 });
  });

  it('invalid aspectRatio / extraHeight: no NaN height, at least 1 px', () => {
    expect(computeCoverGridFill(960, { tileWidth: 165, aspectRatio: NaN, extraHeight: 44 }, 220).tileHeight).toBe(220);
    expect(computeCoverGridFill(960, { tileWidth: 165, aspectRatio: 1, extraHeight: NaN }, 220).tileHeight).toBe(192);
    expect(computeCoverGridFill(960, { tileWidth: 165, aspectRatio: 1, extraHeight: -500 }, 220).tileHeight).toBe(1);
  });
});

describe('CoverGridBodyModel with fill', () => {

  const create = (width = 960) => new CoverGridBodyModel<string>(items(100), renderer, 165, 220, width);

  it('without fill: everything as before', () => {
    const m = create(961);
    expect(m.getFill()).toBeUndefined();
    expect(m.getColumnCount()).toBe(5);
    expect([m.getTileWidthAt(0), m.getTileWidthAt(4)]).toEqual([165, 165]);
    expect(m.getTileLeftAt(3)).toBe(3 * 165);
    expect(m.getTileRowWidth()).toBe(5 * 165);
    expect([m.coverWidth, m.coverHeight]).toEqual([165, 220]);
  });

  it('setFill(true): tileWidth = coverWidth, the tiles stretch, the height stays', () => {
    const m = create(961);
    m.setFill(true);
    expect(m.getFill()).toEqual({ tileWidth: 165 });
    expect(m.getColumnCount()).toBe(5);
    expect([0, 1, 2, 3, 4].map(i => m.getTileWidthAt(i))).toEqual([193, 192, 192, 192, 192]);
    expect([0, 1, 2, 3, 4, 5].map(i => m.getTileLeftAt(i))).toEqual([0, 193, 385, 577, 769, 961]);
    expect(m.getTileRowWidth()).toBe(961);
    expect([m.coverWidth, m.coverHeight]).toEqual([192, 220]);
  });

  it('aspectRatio: coverHeight follows the width', () => {
    const m = create(960);
    m.setFill({ tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 });
    expect([m.coverWidth, m.coverHeight]).toEqual([192, 300]);
    expect(m.getRowHeight(3)).toBe(300);
    expect(m.getYPosByRowIndex(2)).toBe(600);
  });

  it('the column count comes from tileWidth (99 px / 10 px → 9 tiles of 11 px)', () => {
    const m = new CoverGridBodyModel<string>(items(100), renderer, 10, 10, 99);
    m.setFill({ tileWidth: 10 });
    expect(m.coverWidth).toBe(11);
    expect(m.getColumnCount()).toBe(9);
    expect(m.getTilesPerRow()).toBe(9);
    expect(m.getTileRowWidth()).toBe(99);
  });

  it('follows setParentWidth and a direct width change', () => {
    const m = create(960);
    m.setFill({ tileWidth: 165 });
    m.setParentWidth(620);
    expect(m.getColumnCount()).toBe(3);
    expect(m.getTileRowWidth()).toBe(620);
    m.width = 400;   // public property (e.g. set by an app)
    expect(m.getColumnCount()).toBe(2);
    expect(m.coverWidth).toBe(200);
  });

  it('a partial change keeps the rest', () => {
    const m = create(960);
    m.setFill({ tileWidth: 165, aspectRatio: 1.5 });
    m.setFill({ tileWidth: 300 });
    expect(m.getFill()).toEqual({ tileWidth: 300, aspectRatio: 1.5 });
    expect(m.getColumnCount()).toBe(3);
    expect([m.coverWidth, m.coverHeight]).toEqual([320, 480]);
  });

  it('setFill(false): back to tiles of tileWidth (height from the ratio), the old column count', () => {
    const m = create(961);
    m.setFill({ tileWidth: 180, aspectRatio: 1.5, extraHeight: 10 });
    m.setFill(false);
    expect(m.getFill()).toBeUndefined();
    expect([m.coverWidth, m.coverHeight]).toEqual([180, 280]);
    expect(m.getColumnCount()).toBe(5);
    expect(m.getTileRowWidth()).toBe(900);
  });

  it('setFill(false) without ratio keeps the height; without fill it does nothing', () => {
    const m = create(961);
    m.setFill(false);
    expect([m.coverWidth, m.coverHeight]).toEqual([165, 220]);
    m.setFill({ tileWidth: 200 });
    m.setFill(false);
    expect([m.coverWidth, m.coverHeight]).toEqual([200, 220]);
  });

  it('replace: the parts are the whole settings (tileWidth stays if not given)', () => {
    const m = create(960);
    m.setFill({ tileWidth: 200, aspectRatio: 1.5, extraHeight: 10 });
    m.setFill({ aspectRatio: 2 }, true);
    expect(m.getFill()).toEqual({ tileWidth: 200, aspectRatio: 2 });
    m.setFill(true, true);
    expect(m.getFill()).toEqual({ tileWidth: 200 });
  });

  it('a width that is NaN does not recompute on every call', () => {
    const m = create(960);
    m.setFill({ tileWidth: 165 });
    m.width = NaN;
    expect(m.getColumnCount()).toBe(1);
    const before = m.coverWidth;
    m.coverWidth = 7;   // an app write – kept until the width changes (no recompute per call)
    expect(m.getTileWidthAt(0)).toBe(before);
    expect(m.coverWidth).toBe(7);
  });

  it('getFill() returns a copy', () => {
    const m = create();
    m.setFill({ tileWidth: 165 });
    m.getFill()!.tileWidth = 1;
    expect(m.getFill()!.tileWidth).toBe(165);
  });

  it('width 0 (hidden host): one column of tileWidth', () => {
    const m = create(0);
    m.setFill({ tileWidth: 150 });
    expect(m.getColumnCount()).toBe(1);
    expect(m.coverWidth).toBe(150);
    expect(m.getRowCount()).toBe(100);
  });

  it('the table model sums the widths', () => {
    const grid = CoverGridFactory.createCoverGridModel(items(100), renderer, 165, 220, 961);
    grid.bodyModel.setFill(true);
    expect(grid.getColumnCount()).toBe(5);
    expect([grid.getColumnWidth(0), grid.getColumnWidth(1)]).toEqual([193, 192]);
    expect(grid.getXPosByColumnIndex(2)).toBe(385);
    expect(grid.getContentWidthInPixel()).toBe(961);
    grid.setParentWidth(620);
    expect(grid.getContentWidthInPixel()).toBe(620);
    expect(grid.getColumnCount()).toBe(3);
  });

  it('a subclass with own row heights or spans keeps the old behaviour (no constant height, spans up to 31)', () => {
    class Banner<T> extends CoverGridBodyModel<T> {
      override getColspanAt(rowIndex: number, columnIndex: number): number {
        return rowIndex === 0 && columnIndex === 0 ? 2 : 0;
      }
    }
    class Tall<T> extends CoverGridBodyModel<T> {
      override getRowHeight(rowIndex: number): number {
        return rowIndex === 0 ? 400 : this.coverHeight;
      }
    }
    const banner = new Banner<string>(items(10), renderer, 165, 220, 960);
    expect([banner.getMaxColspan(), banner.getMaxRowspan(), banner.getConstantRowHeight()]).toEqual([31, 31, 220]);
    const tall = new Tall<string>(items(10), renderer, 165, 220, 960);
    expect([tall.getMaxColspan(), tall.getConstantRowHeight()]).toEqual([1, undefined]);
  });

  it('isCoverGridBodyModel', () => {
    expect(isCoverGridBodyModel(create())).toBe(true);
    expect(isCoverGridBodyModel({})).toBe(false);
    expect(isCoverGridBodyModel(undefined)).toBe(false);
  });
});
