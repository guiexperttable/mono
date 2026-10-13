import { describe, it, expect, vi } from 'vitest';
import { CellRange, FocusModel, GeMouseEvent, SelectionModel, SelectionService } from '@guiexpert/table';
import type { ExtendedSelectionType, SelectionMode, TableScope } from '@guiexpert/table';

/**
 * SelectionService only needs a few members of TableScope – a hand-written fake keeps the test DOM-free.
 * Like TableScope, the fake listens to the focus model (that is how onFocusChanged reaches the user).
 */
function setup(type: ExtendedSelectionType = 'range', mode: SelectionMode = 'multi') {
  const sm = new SelectionModel(type, mode);
  const fm = new FocusModel('cell');
  const scope = {
    selectionModel: () => sm,
    focusModel: () => fm,
    onFocusChanged: vi.fn(),
    onSelectionChanged: vi.fn(),
    repaint: vi.fn(),
    holdSelectionEvents: (fn: () => void) => fn(),
  };
  fm.addEventFocusChangedListener(scope);
  const service = new SelectionService(scope as unknown as TableScope);
  return { sm, fm, scope, service };
}

interface Keys {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

function mouse(rowIndex: number, columnIndex: number, keys: Keys = {}, areaIdent: 'header' | 'body' | 'footer' = 'body'): GeMouseEvent {
  const originalEvent = { shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, ...keys } as MouseEvent;
  return new GeMouseEvent(rowIndex, 0, columnIndex, 0, areaIdent, 'center', originalEvent);
}

describe('SelectionService', () => {

  describe('constructor', () => {
    it('reads selection and focus model from the table scope', () => {
      const { sm, fm, service } = setup();
      expect(service.getSelectionModel?.()).toBe(sm);
      expect(service.getFocusModel?.()).toBe(fm);
    });
  });

  describe('onMouseClicked – plain click', () => {
    it('moves the focus to the clicked cell and reports it', () => {
      const { fm, scope, service } = setup();
      const dirty = service.onMouseClicked(mouse(2, 3), undefined);
      expect(dirty).toBe(true);
      expect(fm.getFocus()).toEqual([2, 3]);
      expect(scope.onFocusChanged).toHaveBeenCalledWith(fm);
    });

    // Regression: setFocus() already fires via the focus model listener, the service called onFocusChanged again.
    it('reports a focus change exactly once per click', () => {
      const { scope, service } = setup();
      service.onMouseClicked(mouse(2, 3), undefined);
      expect(scope.onFocusChanged).toHaveBeenCalledTimes(1);
      service.onMouseClicked(mouse(4, 1, { ctrlKey: true }), undefined);
      expect(scope.onFocusChanged).toHaveBeenCalledTimes(2);
    });

    it('does not report a focus change when the cell already has the focus', () => {
      const { fm, scope, service } = setup();
      fm.setFocus(2, 3);
      scope.onFocusChanged.mockClear();
      service.onMouseClicked(mouse(2, 3), undefined);
      expect(scope.onFocusChanged).not.toHaveBeenCalled();
    });

    it('replaces an existing selection with the clicked cell', () => {
      const { sm, service } = setup('range');
      sm.addSelection(new CellRange(0, 0, 1, 1));
      service.onMouseClicked(mouse(5, 5), undefined);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(5, 5)]);
    });

    it('selects the clicked row for selection type "row"', () => {
      const { sm, scope, service } = setup('row', 'single');
      service.onMouseClicked(mouse(4, 1), undefined);
      expect(sm.isSelected(4, 99)).toBe(true);
      expect(scope.onSelectionChanged).toHaveBeenCalledWith(sm);
    });

    it('selects the clicked column for selection type "column"', () => {
      const { sm, service } = setup('column', 'single');
      service.onMouseClicked(mouse(4, 1), undefined);
      expect(sm.isSelected(999, 1)).toBe(true);
    });

    // Regression: a plain click selected nothing for type "cell" (only the focus moved).
    it('selects the clicked cell for selection type "cell"', () => {
      const { sm, fm, service } = setup('cell', 'single');
      service.onMouseClicked(mouse(4, 1), undefined);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(4, 1)]);
      expect(fm.hasFocus(4, 1)).toBe(true);
    });

    // Regression: header/footer clicks cleared the selection and focused the body cell with the same indices.
    it.each(['header', 'footer'] as const)('ignores a click in the %s', (area) => {
      const { sm, fm, scope, service } = setup('cell', 'multi');
      service.onMouseClicked(mouse(2, 2), undefined);
      scope.onSelectionChanged.mockClear();
      expect(service.onMouseClicked(mouse(0, 1, {}, area), undefined)).toBe(false);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(2, 2)]);
      expect(fm.getFocus()).toEqual([2, 2]);
      expect(scope.onSelectionChanged).not.toHaveBeenCalled();
    });

    it('ignores the double click (clickCount 2) – the first click did the work', () => {
      const { sm, service } = setup('cell', 'multi');
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      const dbl = mouse(2, 2, { ctrlKey: true });
      dbl.clickCount = 2;
      expect(service.onMouseClicked(dbl, undefined)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(true);
    });

    it('all changes of one click are reported in one batch', () => {
      const { service, scope } = setup('row', 'multi');
      const hold = vi.fn((fn: () => void) => fn());
      scope.holdSelectionEvents = hold;
      service.onMouseClicked(mouse(1, 1), undefined);
      expect(hold).toHaveBeenCalledTimes(1);
    });
  });

  describe('onMouseClicked – with modifier keys', () => {
    it('shift-click selects the range between the previous click and this one (normalised)', () => {
      const { sm, service } = setup('range');
      service.onMouseClicked(mouse(3, 4), undefined);
      service.onMouseClicked(mouse(1, 2, { shiftKey: true }), undefined);
      expect(sm.getRanges()).toEqual([new CellRange(1, 2, 3, 4)]);
      expect(sm.isSelected(2, 3)).toBe(true);
    });

    it('shift-click keeps the existing selection', () => {
      const { sm, service } = setup('range');
      service.onMouseClicked(mouse(0, 0), undefined);
      sm.addSelection(new CellRange(9, 9, 9, 9));
      service.onMouseClicked(mouse(1, 1, { shiftKey: true }), undefined);
      expect(sm.isSelected(9, 9)).toBe(true);
      expect(sm.isSelected(1, 1)).toBe(true);
    });

    it('shift-click keeps the anchor: the next shift-click replaces the rectangle', () => {
      const { sm, service } = setup('range');
      service.onMouseClicked(mouse(0, 0), undefined);
      service.onMouseClicked(mouse(1, 1, { shiftKey: true }), undefined);
      service.onMouseClicked(mouse(5, 5, { shiftKey: true }), undefined);
      expect(sm.getRanges()).toEqual([new CellRange(0, 0, 5, 5)]);
      service.onMouseClicked(mouse(2, 0, { shiftKey: true }), undefined);
      expect(sm.getRanges()).toEqual([new CellRange(0, 0, 2, 0)]);
    });

    it('ctrl-click selects the clicked cell', () => {
      const { sm, service } = setup('range');
      const dirty = service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      expect(dirty).toBe(true);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(2, 2)]);
    });

    it('meta-click (macOS) behaves like ctrl-click', () => {
      const { sm, service } = setup('range');
      service.onMouseClicked(mouse(2, 2, { metaKey: true }), undefined);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(2, 2)]);
    });

    // Regression: every click without shift cleared the selection first, so ctrl/meta-click could never add to an
    // existing selection (and ctrl+alt-click "remove this cell" always worked on an empty selection).
    it('ctrl-click adds the cell to the existing selection', () => {
      const { sm, service } = setup('range', 'multi');
      sm.addSelection(CellRange.singleCell(0, 0));
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      expect(sm.isSelected(0, 0)).toBe(true);
      expect(sm.isSelected(2, 2)).toBe(true);
    });

    it('ctrl-clicks on several cells select all of them', () => {
      const { sm, service } = setup('cell', 'multi');
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true }), undefined);
      service.onMouseClicked(mouse(3, 0, { metaKey: true }), undefined);
      service.onMouseClicked(mouse(5, 2, { ctrlKey: true }), undefined);
      expect([sm.isSelected(1, 1), sm.isSelected(3, 0), sm.isSelected(5, 2)]).toEqual([true, true, true]);
    });

    it('ctrl-click on a selected cell deselects it and keeps the rest', () => {
      const { sm, service } = setup('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 2));
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(0, 0)).toBe(true);
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(true);
    });

    it('ctrl+alt-click records the clicked cell as removed', () => {
      const { sm, service } = setup('range');
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true, altKey: true }), undefined);
      expect(sm.isInNegativeRange(2, 2)).toBe(true);
    });

    it('ctrl+alt-click removes the clicked cell from the existing selection', () => {
      const { sm, service } = setup('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 2, 2));
      service.onMouseClicked(mouse(1, 1, { metaKey: true, altKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(true);
      // never adds: a second ctrl+alt-click keeps it removed
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true, altKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(false);
    });

    it('ctrl-click adds and removes whole rows for selection type "row"', () => {
      const { sm, service } = setup('row', 'multi');
      service.onMouseClicked(mouse(1, 0), undefined);
      service.onMouseClicked(mouse(4, 2, { ctrlKey: true }), undefined);
      expect(sm.getMergedRowIndices()).toEqual([1, 4]);
      service.onMouseClicked(mouse(1, 2, { ctrlKey: true }), undefined);
      expect(sm.getMergedRowIndices()).toEqual([4]);
    });

    it('single mode: ctrl-click replaces the selection with the clicked cell (the model keeps one range)', () => {
      const { sm, service } = setup('cell', 'single');
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true }), undefined);
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(false);
      expect(sm.isSelected(2, 2)).toBe(true);
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      expect(sm.isSelected(2, 2)).toBe(false);
    });

    it('a plain click after ctrl-clicks starts a new selection', () => {
      const { sm, service } = setup('cell', 'multi');
      service.onMouseClicked(mouse(1, 1, { ctrlKey: true }), undefined);
      service.onMouseClicked(mouse(2, 2, { ctrlKey: true }), undefined);
      service.onMouseClicked(mouse(3, 3), undefined);
      expect(sm.getRanges()).toEqual([CellRange.singleCell(3, 3)]);
    });

    it('a ctrl-click is the anchor of the next shift-click', () => {
      const { sm, service } = setup('range', 'multi');
      service.onMouseClicked(mouse(0, 0), undefined);
      service.onMouseClicked(mouse(5, 5, { ctrlKey: true }), undefined);
      service.onMouseClicked(mouse(6, 7, { shiftKey: true }), undefined);
      expect(sm.getRanges()).toContainEqual(new CellRange(5, 5, 6, 7));
      expect(sm.isSelected(5, 5)).toBe(true);
    });

    it('shift-click without anchor keeps the selection (like before)', () => {
      const { sm, service } = setup('range', 'multi');
      sm.addSelection(new CellRange(0, 0, 1, 1));
      service.onMouseClicked(mouse(4, 4, { shiftKey: true }), undefined);
      expect(sm.isSelected(1, 1)).toBe(true);
    });
  });

  describe('onMouseDragging', () => {
    it('selects the dragged rectangle for selection type "range"', () => {
      const { sm, fm, scope, service } = setup('range');
      const changed = service.onMouseDragging(mouse(1, 1), mouse(3, 4));
      expect(changed).toBe(true);
      expect(sm.getRanges()).toEqual([new CellRange(1, 1, 3, 4)]);
      expect(fm.getFocus()).toEqual([3, 4]); // the anchor (drag start) gets the focus
      expect(scope.onFocusChanged).toHaveBeenCalledTimes(1);
      expect(scope.onFocusChanged).toHaveBeenCalledWith(fm);
      expect(scope.onSelectionChanged).toHaveBeenCalledWith(sm);
    });

    it('replaces the previous drag rectangle', () => {
      const { sm, service } = setup('range');
      const start = mouse(0, 0);
      service.onMouseDragging(mouse(5, 5), start);
      service.onMouseDragging(mouse(1, 1), start);
      expect(sm.getRanges()).toEqual([new CellRange(0, 0, 1, 1)]);
    });

    it('swallows the click that ends a drag on another cell', () => {
      const { service } = setup('range');
      service.onMouseDragging(mouse(2, 2), mouse(0, 0));
      expect(service.onMouseClicked(mouse(2, 2), undefined)).toBe(false);
      // only the first click is swallowed
      expect(service.onMouseClicked(mouse(2, 2), undefined)).toBe(true);
    });

    it('does not swallow the click when the drag stayed on the start cell', () => {
      const { service } = setup('range');
      service.onMouseDragging(mouse(0, 0), mouse(0, 0));
      expect(service.onMouseClicked(mouse(0, 0), undefined)).toBe(true);
    });

    it('onMouseDown() resets the swallow flag', () => {
      const { service } = setup('range');
      service.onMouseDragging(mouse(2, 2), mouse(0, 0));
      service.onMouseDown();
      expect(service.onMouseClicked(mouse(2, 2), undefined)).toBe(true);
    });

    it('a shift-click after a drag extends from the drag start', () => {
      const { sm, service } = setup('range');
      service.onMouseDragging(mouse(1, 1), mouse(0, 0));
      service.onMouseDown();
      service.onMouseClicked(mouse(4, 4, { shiftKey: true }), undefined);
      expect(sm.isSelected(4, 4)).toBe(true);
      expect(sm.getRanges()).toContainEqual(new CellRange(0, 0, 4, 4));
    });

    it.each<[string, () => [GeMouseEvent, GeMouseEvent | undefined]]>([
      ['no start event', () => [mouse(1, 1), undefined]],
      ['the start event has an action (e.g. tree arrow)', () => {
        const start = mouse(0, 0);
        start.action = 'toggleExpandCollapseAll';
        return [mouse(1, 1), start];
      }],
      ['the drag started in the header', () => [mouse(1, 1), mouse(0, 0, {}, 'header')]],
      ['the mouse is over the footer', () => [mouse(1, 1, {}, 'footer'), mouse(0, 0)]],
      ['a negative row index', () => [mouse(-1, 1), mouse(0, 0)]],
      ['a negative column index', () => [mouse(1, 1), mouse(0, -1)]],
    ])('does nothing when %s', (_label, events) => {
      const { sm, scope, service } = setup('range');
      const [evt, start] = events();
      expect(service.onMouseDragging(evt, start)).toBe(false);
      expect(sm.hasSelection()).toBe(false);
      expect(scope.onSelectionChanged).not.toHaveBeenCalled();
    });

    it.each<ExtendedSelectionType>(['none', 'cell', 'row', 'column'])('does nothing for selection type "%s"', (type) => {
      const { sm, service } = setup(type);
      expect(service.onMouseDragging(mouse(1, 1), mouse(0, 0))).toBe(false);
      expect(sm.hasSelection()).toBe(false);
    });
  });

  describe('onActionTriggered', () => {
    it('SELECT_ALL selects everything and repaints', () => {
      const { sm, scope, service } = setup('cell');
      expect(service.onActionTriggered('SELECT_ALL')).toBe(true);
      expect(sm.isAllSelected()).toBe(true);
      expect(scope.repaint).toHaveBeenCalledTimes(1);
    });

    it('DESELECT_ALL clears the selection and repaints', () => {
      const { sm, scope, service } = setup('cell');
      sm.selectAll();
      expect(service.onActionTriggered('DESELECT_ALL')).toBe(true);
      expect(sm.hasSelection()).toBe(false);
      expect(scope.repaint).toHaveBeenCalledTimes(1);
    });

    it('TOGGLE_SELECTION toggles the focused cell', () => {
      const { sm, fm, service } = setup('cell', 'multi');
      fm.setFocus(1, 2);
      expect(service.onActionTriggered('TOGGLE_SELECTION')).toBe(true);
      expect(sm.isSelected(1, 2)).toBe(true);
      service.onActionTriggered('TOGGLE_SELECTION');
      expect(sm.isSelected(1, 2)).toBe(false);
    });

    it('returns false for actions it does not handle', () => {
      const { scope, service } = setup('cell');
      expect(service.onActionTriggered('COPY_2_CLIPBOARD')).toBe(false);
      expect(scope.repaint).not.toHaveBeenCalled();
    });
  });
});
