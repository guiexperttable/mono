import { describe, it, expect } from 'vitest';
import { CheckboxCellRenderer, CheckboxColumnDef, Size, isCheckboxColumnDef } from '@guiexpert/table';

describe('CheckboxColumnDef', () => {
  const def = new CheckboxColumnDef();

  it('is recognized by isCheckboxColumnDef (type marker)', () => {
    expect(def.type).toBe('CheckboxColumnDef');
    expect(isCheckboxColumnDef(def)).toBe(true);
    expect(isCheckboxColumnDef({ property: 'CheckboxColumn' })).toBe(false);
    expect(isCheckboxColumnDef(undefined)).toBeFalsy();
  });

  it('has the property "CheckboxColumn" and an empty header label', () => {
    expect(def.property).toBe('CheckboxColumn');
    expect(def.headerLabel).toBe('');
  });

  it('is 50px wide (min 50px, max 100px)', () => {
    expect(def.width).toEqual(new Size(50, 'px'));
    expect(def.minWidth).toEqual(new Size(50, 'px'));
    expect(def.maxWidth).toEqual(new Size(100, 'px'));
  });

  it('renders checkboxes in header and body, nothing in the footer', () => {
    expect(def.rendererMap.header).toBeInstanceOf(CheckboxCellRenderer);
    expect(def.rendererMap.body).toBeInstanceOf(CheckboxCellRenderer);
    expect(def.rendererMap.footer).toBeUndefined();
  });

  it('aligns the body cells left', () => {
    expect(def.classes).toEqual({ header: [], body: ['ge-table-text-align-left'], footer: [] });
  });

  it('creates new renderer instances per column definition', () => {
    expect(new CheckboxColumnDef().rendererMap.body).not.toBe(def.rendererMap.body);
  });
});
