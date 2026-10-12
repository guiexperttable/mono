import { describe, expect, it } from 'vitest';
import {
  NumberPropertyType,
  ObjectPropertyType,
  PropertyItem,
  PropertyTypeService,
  SchemeGenerator,
  StringPropertyType,
} from '@guiexpert/table';
import { generatorDemoInterfaces, generatorDemoRows } from '../../../../test-utils/generator-demo-data';

const render = (data: unknown, rootName: string, generator = new SchemeGenerator()) =>
  generator.renderTypeScriptInterfaces(new PropertyTypeService().object2PropertyType(data as object, rootName));

describe('SchemeGenerator', () => {

  it('renders the interfaces promised in its JSDoc for the demo rows', () => {
    expect(render(generatorDemoRows, 'XyzRows')).toEqual(generatorDemoInterfaces);
  });

  it('renders "?" for properties missing in some rows', () => {
    expect(render([{ a: 1, b: 'x' }, { a: 2 }], 'Items')).toEqual([
      'export interface ItemEntity {',
      '  a: number;',
      '  b?: string;',
      '}',
      '',
    ]);
  });

  it('renders unions with "|" and puts null/undefined/any last', () => {
    expect(render([{ a: 1 }, { a: null }, { a: 'x' }], 'R')).toContain('  a: number|string|null;');
  });

  it('uses a configurable or-operator', () => {
    const generator = new SchemeGenerator();
    generator.orOperator = ' | ';
    expect(render([{ a: 1 }, { a: null }], 'R', generator)).toContain('  a: number | null;');
  });

  it('renders "any[]" for arrays that were always empty', () => {
    expect(render([{ scripts: [] }], 'R')).toContain('  scripts: any[];');
  });

  it('renders "(a|b)[]" for arrays with mixed item types', () => {
    expect(render([{ v: [1, 'a'] }], 'R')).toContain('  v: (string|number)[];');
  });

  it('renders "null" for a property that is always null', () => {
    expect(render([{ a: null }], 'R')).toContain('  a: null;');
  });

  it('renders one interface per nested object type (breadth first)', () => {
    expect(render([{ p: { x: 1, q: { z: true } } }], 'R')).toEqual([
      'export interface REntity {',
      '  p: PEntity;',
      '}',
      '',
      'export interface PEntity {',
      '  q: QEntity;',
      '  x: number;',
      '}',
      '',
      'export interface QEntity {',
      '  z: boolean;',
      '}',
      '',
    ]);
  });

  it('renders an interface with the same class name only once (the first one wins)', () => {
    // NOTE: two different "list" item types both get the class name "Entity"; the second one is lost.
    const lines = render([{ list: [{ k: 1 }], b: { list: [{ k: 'x' }] } }], 'Dup');
    expect(lines.filter(l => l === 'export interface Entity {')).toHaveLength(1);
    expect(lines).toContain('  k: number;');
    expect(lines).not.toContain('  k: string;');
  });

  it('renders a single object root', () => {
    expect(render({ a: 1 }, 'One')).toEqual(['export interface OneEntity {', '  a: number;', '}', '']);
  });

  it('renders nothing for a primitive root or an array of primitives', () => {
    expect(new SchemeGenerator().renderTypeScriptInterfaces(new NumberPropertyType('n'))).toEqual([]);
    expect(render([1, 2], 'Nums')).toEqual([]);
  });

  it('renders "any" for a property item without types', () => {
    const root = new ObjectPropertyType('r', 'MyEntity', [new PropertyItem('x', []), new PropertyItem('s', [new StringPropertyType('s')])]);
    expect(new SchemeGenerator().renderTypeScriptInterfaces(root)).toEqual(['export interface MyEntity {', '  x: any;', '  s: string;', '}', '']);
  });

  it('remembers the root property type', () => {
    const generator = new SchemeGenerator();
    const root = new PropertyTypeService().object2PropertyType([{ a: 1 }], 'R');
    generator.renderTypeScriptInterfaces(root);
    expect(generator.rootPropertyType).toBe(root);
  });

  // BUG: the list of already rendered class names (renderTypeScriptInterfacesDone) is never reset,
  // so a second call on the same instance renders nothing.
  it.fails('renders the same result when called twice on the same instance', () => {
    const generator = new SchemeGenerator();
    const root = new PropertyTypeService().object2PropertyType([{ a: 1 }], 'R');
    const first = generator.renderTypeScriptInterfaces(root);
    expect(generator.renderTypeScriptInterfaces(root)).toEqual(first);
  });
});
