import { describe, expect, it } from 'vitest';
import { actionIds } from '@guiexpert/table';
import type { ActionId } from '@guiexpert/table';

describe('actionIds', () => {

  it('lists the supported actions in this order', () => {
    expect(actionIds).toEqual([
      'COPY_2_CLIPBOARD',
      'START_EDITING',
      'TOGGLE_SELECTION',
      'SELECT_ALL',
      'DESELECT_ALL',
      'NAVIGATE_LEFT',
      'NAVIGATE_RIGHT',
      'NAVIGATE_UP',
      'NAVIGATE_DOWN',
      'NAVIGATE_ROW_START',
      'NAVIGATE_ROW_END',
      'NAVIGATE_FIRST_CELL',
      'NAVIGATE_LAST_CELL',
      'NAVIGATE_PAGE_UP',
      'NAVIGATE_PAGE_DOWN',
      'ACTIVATE_CELL',
      'MOVE_ROW_UP',
      'MOVE_ROW_DOWN',
      'FILL_DOWN',
      'FILL_RIGHT',
      // since 1.1.99 (Excel-style editing)
      'NAVIGATE_NEXT_CELL',
      'NAVIGATE_PREVIOUS_CELL',
      'EXTEND_SELECTION_UP',
      'EXTEND_SELECTION_DOWN',
      'EXTEND_SELECTION_LEFT',
      'EXTEND_SELECTION_RIGHT',
      'EXTEND_SELECTION_ROW_START',
      'EXTEND_SELECTION_ROW_END',
      'EXTEND_SELECTION_PAGE_UP',
      'EXTEND_SELECTION_PAGE_DOWN',
      'NAVIGATE_DATA_EDGE_UP',
      'NAVIGATE_DATA_EDGE_DOWN',
      'NAVIGATE_DATA_EDGE_LEFT',
      'NAVIGATE_DATA_EDGE_RIGHT',
      'EXTEND_TO_DATA_EDGE_UP',
      'EXTEND_TO_DATA_EDGE_DOWN',
      'EXTEND_TO_DATA_EDGE_LEFT',
      'EXTEND_TO_DATA_EDGE_RIGHT',
      'SELECT_ROW',
      'SELECT_COLUMN',
      'CLEAR_CELLS',
      'CLEAR_AND_EDIT',
      'CUT_2_CLIPBOARD',
      'PASTE_FROM_CLIPBOARD',
    ]);
  });

  it('has no duplicates', () => {
    expect(new Set(actionIds).size).toBe(actionIds.length);
  });

  it('ActionId is the union of the array values (compile-time check)', () => {
    const id: ActionId = actionIds[0];
    expect(id).toBe('COPY_2_CLIPBOARD');
  });
});
