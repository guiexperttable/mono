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
