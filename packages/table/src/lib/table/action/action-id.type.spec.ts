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
