import { describe, expect, it } from 'vitest';
import { ColumnDefGenerator, NumberPropertyType, PropertyTypeService } from '@guiexpert/table';
import { generatorDemoRows } from '../../../../test-utils/generator-demo-data';

const generate = (rows: unknown, allowCustomRenderer = true) =>
  new ColumnDefGenerator().renderColumnDefs(new PropertyTypeService().object2PropertyType(rows as object, 'Rows'), allowCustomRenderer);

/** The generated `ColumnDef.create({...})` block for one property, as one string. */
function columnBlock(lines: string[], property: string): string | undefined {
  const code = lines.join('\n');
  const blocks = code.split('    ColumnDef.create({').slice(1).map(b => b.split('    }),')[0]);
  return blocks.find(b => b.includes(`property: "${property}",`));
}

const properties = (lines: string[]) => [...lines.join('\n').matchAll(/property: "([^"]+)"/g)].map(m => m[1]);

describe('ColumnDefGenerator', () => {

  it('wraps the column defs in a "const columnDefs: ColumnDefIf[]" array', () => {
    const lines = generate([{ a: 'x' }]);
    expect(lines[0]).toBe('  const columnDefs: ColumnDefIf[] = [');
    expect(lines[lines.length - 1]).toBe('  ];');
  });

  it('renders a text column: left aligned, 100 px, no renderer', () => {
    const lines = generate([{ name: 'x' }]);
    expect(lines).toEqual([
      '  const columnDefs: ColumnDefIf[] = [',
      '    ColumnDef.create({\n'
      + '      property: "name",\n'
      + '      headerLabel: "Name",\n'
      + '      width: new Size(100, "px"),\n'
      + '      bodyClasses: ["ge-table-text-align-left"],\n'
      + '      headerClasses: ["ge-table-text-align-left"],',
      '    }),',
      '  ];',
    ]);
  });

  it('renders a number column: right aligned with NumberCellRenderer', () => {
    const block = columnBlock(generate([{ total: 1 }]), 'total')!;
    expect(block).toContain('width: new Size(100, "px")');
    expect(block).toContain('bodyClasses: ["ge-table-text-align-right"]');
    expect(block).toContain('headerClasses: ["ge-table-text-align-right"]');
    expect(block).toContain('bodyRenderer: new NumberCellRenderer(),');
  });

  it('renders a boolean column: centered, 80 px, TrueFalseCellRenderer', () => {
    const block = columnBlock(generate([{ isActive: true }]), 'isActive')!;
    expect(block).toContain('headerLabel: "Is Active"');
    expect(block).toContain('width: new Size(80, "px")');
    expect(block).toContain('bodyClasses: ["ge-table-text-align-center"]');
    expect(block).toContain('bodyRenderer: new TrueFalseCellRenderer(),');
  });

  it('renders an array of primitives with SimpleArrayCellRenderer, 250 px', () => {
    const block = columnBlock(generate([{ tags: ['a'] }]), 'tags')!;
    expect(block).toContain('width: new Size(250, "px")');
    expect(block).toContain('bodyRenderer: new SimpleArrayCellRenderer(),');
  });

  it('flattens nested objects into dotted properties with combined labels', () => {
    const lines = generate([{ profile: { age: 30, homeCity: 'Rome' } }]);
    expect(properties(lines)).toEqual(['profile.age', 'profile.homeCity']);
    expect(columnBlock(lines, 'profile.homeCity')).toContain('headerLabel: "Profile Home City"');
  });

  it('ignores null/undefined when choosing the column type (nullable number → number column)', () => {
    expect(columnBlock(generate([{ id: 1 }, { id: null }, {}]), 'id')).toContain('bodyRenderer: new NumberCellRenderer(),');
  });

  it('leaves out properties with more than one real type or only null values', () => {
    // NOTE: "mixed" (number|string) and "nothing" (always null) silently get no column.
    const lines = generate([{ a: 'x', mixed: 1, nothing: null }, { a: 'y', mixed: 'z', nothing: null }]);
    expect(properties(lines)).toEqual(['a']);
  });

  it.each([
    ['id', 'ID'],
    ['name', 'Name'],
    ['firstName', 'First Name'],
    ['of', 'of'],
    ['userId', 'User Id'],
    ['myURLValue', 'My URLValue'],
  ])('turns property "%s" into header label "%s"', (property, label) => {
    // NOTE: the word mappings (Id → ID, Of → of …) apply to a whole path segment only – "userId" stays "User Id".
    expect(columnBlock(generate([{ [property]: 'x' }]), property)).toContain(`headerLabel: "${label}",`);
  });

  describe('arrays of objects', () => {

    it('with allowCustomRenderer (default): uses a generated <Entity>ArrayCellRenderer and appends its source', () => {
      const lines = generate([{ preferences: [{ key: 'k', value: 'v' }] }]);
      const block = columnBlock(lines, 'preferences')!;
      expect(block).toContain('bodyRenderer: new PreferenceEntityArrayCellRenderer(),');
      expect(block).toContain('bodyClasses: [""]');
      const source = lines.slice(lines.indexOf('  ];') + 1).join('\n');
      expect(source).toContain('export class PreferenceEntityArrayCellRenderer implements CellRendererIf {');
      expect(source).toContain('cellValue: PreferenceEntity[],');
      expect(source).toContain('// TODO  import { PreferenceEntity } from "...";');
    });

    it('without allowCustomRenderer: uses SimpleArrayCellRenderer and appends nothing', () => {
      const lines = generate([{ preferences: [{ key: 'k', value: 'v' }] }], false);
      expect(columnBlock(lines, 'preferences')).toContain('bodyRenderer: new SimpleArrayCellRenderer(),');
      expect(lines[lines.length - 1]).toBe('  ];');
    });

    it('does not keep the generated renderers of a previous call', () => {
      const generator = new ColumnDefGenerator();
      const pts = new PropertyTypeService();
      generator.renderColumnDefs(pts.object2PropertyType([{ preferences: [{ key: 'k' }] }], 'Rows'));
      const lines = generator.renderColumnDefs(pts.object2PropertyType([{ a: 1 }], 'Rows'));
      expect(lines.join('\n')).not.toContain('ArrayCellRenderer');
    });
  });

  it('renders the demo rows as one column per (flattened) property, sorted by name', () => {
    expect(properties(generate(generatorDemoRows))).toEqual([
      'description', 'id', 'isActive', 'name', 'preferences', 'profile.age', 'profile.location', 'scripts', 'tags',
    ]);
  });

  it('renders nothing for a root that is not an array of objects', () => {
    // NOTE: a single object (not wrapped in an array) gives no column defs at all.
    const pts = new PropertyTypeService();
    expect(new ColumnDefGenerator().renderColumnDefs(pts.object2PropertyType({ a: 1 }, 'One'))).toEqual([]);
    expect(new ColumnDefGenerator().renderColumnDefs(pts.object2PropertyType([1, 2], 'Nums'))).toEqual([]);
    expect(new ColumnDefGenerator().renderColumnDefs(new NumberPropertyType('n'))).toEqual([]);
  });

  it('remembers the root property type', () => {
    const generator = new ColumnDefGenerator();
    const root = new PropertyTypeService().object2PropertyType([{ a: 1 }], 'R');
    generator.renderColumnDefs(root);
    expect(generator.rootPropertyType).toBe(root);
  });
});
