import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ArrayPropertyType,
  NumberPropertyType,
  ObjectPropertyType,
  PropertyTypeService,
} from '@guiexpert/table';
import type { PropertyItem, PropertyType } from '@guiexpert/table';
import { generatorDemoRows } from '../../../../test-utils/generator-demo-data';

const typesOf = (item: PropertyItem | undefined) => item?.types.map(t => t.type);

/** The properties of the row entity of an array root. */
function rowEntity(pt: PropertyType): ObjectPropertyType {
  expect(pt).toBeInstanceOf(ArrayPropertyType);
  const item = (pt as ArrayPropertyType).items[0];
  expect(item).toBeInstanceOf(ObjectPropertyType);
  return item as ObjectPropertyType;
}

const prop = (o: ObjectPropertyType, name: string) => o.properties.find(p => p.propertyName === name);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PropertyTypeService', () => {
  const service = new PropertyTypeService();

  describe('object2PropertyType', () => {

    it('returns an ArrayPropertyType with one ObjectPropertyType item for an array of objects', () => {
      const pt = service.object2PropertyType([{ a: 1, b: 'x' }], 'Items');
      expect(pt).toBeInstanceOf(ArrayPropertyType);
      expect(pt.type).toBe('Array');
      expect(pt.propertyName).toBe('Items');
      const entity = rowEntity(pt);
      expect((pt as ArrayPropertyType).items).toHaveLength(1);
      expect(entity.className).toBe('ItemEntity');
      expect(entity.propertyName).toBe('Items');
    });

    it('detects string, number and boolean properties, sorted by name', () => {
      const entity = rowEntity(service.object2PropertyType([{ s: 'x', n: 1, b: true }], 'R'));
      expect(entity.properties.map(p => [p.propertyName, typesOf(p)])).toEqual([
        ['b', ['boolean']],
        ['n', ['number']],
        ['s', ['string']],
      ]);
    });

    it('adds "undefined" to properties missing in some rows', () => {
      const entity = rowEntity(service.object2PropertyType([{ a: 1, b: 'x' }, { a: 2 }], 'R'));
      expect(typesOf(prop(entity, 'a'))).toEqual(['number']);
      expect(typesOf(prop(entity, 'b'))).toEqual(['string', 'undefined']);
    });

    it('collects all types of a property (the type of the LAST row first)', () => {
      expect(typesOf(prop(rowEntity(service.object2PropertyType([{ a: 1 }, { a: null }], 'R')), 'a'))).toEqual(['null', 'number']);
      expect(typesOf(prop(rowEntity(service.object2PropertyType([{ a: 1 }, { a: 'x' }], 'R')), 'a'))).toEqual(['string', 'number']);
    });

    it('lists each type only once', () => {
      const entity = rowEntity(service.object2PropertyType([{ a: 1 }, { a: 2 }, { a: 3 }], 'R'));
      expect(typesOf(prop(entity, 'a'))).toEqual(['number']);
    });

    it('types NaN as "undefined"', () => {
      // NOTE: NaN is not a "number" here – the property becomes optional.
      const entity = rowEntity(service.object2PropertyType([{ a: NaN }], 'R'));
      expect(typesOf(prop(entity, 'a'))).toEqual(['undefined']);
    });

    it('creates an ObjectPropertyType with an entity class name for nested objects', () => {
      const entity = rowEntity(service.object2PropertyType([{ profile: { age: 30, city: 'Rome' } }], 'R'));
      const profile = prop(entity, 'profile')!.types[0] as ObjectPropertyType;
      expect(profile).toBeInstanceOf(ObjectPropertyType);
      expect(profile.className).toBe('ProfileEntity');
      expect(profile.properties.map(p => [p.propertyName, typesOf(p)])).toEqual([['age', ['number']], ['city', ['string']]]);
    });

    it('merges the properties of nested objects of all rows, but does not mark them optional', () => {
      // NOTE: optional detection only works one level below an array – "y" is missing in row 1 but not optional.
      const entity = rowEntity(service.object2PropertyType([{ p: { x: 1 } }, { p: { x: 2, y: 'q' } }], 'R'));
      const p = prop(entity, 'p')!.types[0] as ObjectPropertyType;
      expect(p.properties.map(i => [i.propertyName, typesOf(i)])).toEqual([['x', ['number']], ['y', ['string']]]);
    });

    it('collects the item types of primitive arrays', () => {
      const entity = rowEntity(service.object2PropertyType([{ tags: ['a', 'b'] }, { tags: ['c'] }], 'R'));
      const tags = prop(entity, 'tags')!.types[0] as ArrayPropertyType;
      expect(tags).toBeInstanceOf(ArrayPropertyType);
      expect(tags.items.map(t => t.type)).toEqual(['string']);
    });

    it('collects mixed item types of arrays', () => {
      const entity = rowEntity(service.object2PropertyType([{ v: [1, 'a'] }], 'R'));
      const v = prop(entity, 'v')!.types[0] as ArrayPropertyType;
      expect(v.items.map(t => t.type)).toEqual(['string', 'number']);
    });

    it('gives empty arrays no item types', () => {
      const entity = rowEntity(service.object2PropertyType([{ scripts: [] }], 'R'));
      expect((prop(entity, 'scripts')!.types[0] as ArrayPropertyType).items).toEqual([]);
    });

    it('creates an entity class for objects in arrays', () => {
      const entity = rowEntity(service.object2PropertyType([{ preferences: [{ key: 'k', value: 'v' }] }], 'R'));
      const prefs = prop(entity, 'preferences')!.types[0] as ArrayPropertyType;
      const item = prefs.items[0] as ObjectPropertyType;
      expect(item).toBeInstanceOf(ObjectPropertyType);
      expect(item.className).toBe('PreferenceEntity');
      expect(item.properties.map(p => p.propertyName)).toEqual(['key', 'value']);
    });

    it('gives different object types with the same property name the same class name', () => {
      // NOTE: "list" → class name "Entity" (getEntityName trims "List"); both lists share it although k differs.
      const entity = rowEntity(service.object2PropertyType([{ list: [{ k: 1 }], b: { list: [{ k: 'x' }] } }], 'R'));
      const outer = (prop(entity, 'list')!.types[0] as ArrayPropertyType).items[0] as ObjectPropertyType;
      const b = prop(entity, 'b')!.types[0] as ObjectPropertyType;
      const inner = (b.properties[0].types[0] as ArrayPropertyType).items[0] as ObjectPropertyType;
      expect(outer.className).toBe('Entity');
      expect(inner.className).toBe('Entity');
    });

    it('returns an ObjectPropertyType for a single object', () => {
      const pt = service.object2PropertyType({ a: 1 }, 'One');
      expect(pt).toBeInstanceOf(ObjectPropertyType);
      expect((pt as ObjectPropertyType).className).toBe('OneEntity');
      expect((pt as ObjectPropertyType).properties.map(p => p.propertyName)).toEqual(['a']);
    });

    it('returns an ArrayPropertyType without items for an empty array', () => {
      const pt = service.object2PropertyType([], 'X');
      expect(pt).toBeInstanceOf(ArrayPropertyType);
      expect((pt as ArrayPropertyType).items).toEqual([]);
    });

    it('returns the primitive type for a primitive root', () => {
      const pt = service.object2PropertyType(5, 'Five');
      expect(pt).toBeInstanceOf(NumberPropertyType);
      expect(pt.propertyName).toBe('Five');
    });

    it('nests arrays of arrays', () => {
      const pt = service.object2PropertyType([[1, 2], [3]], 'M') as ArrayPropertyType;
      const inner = pt.items[0] as ArrayPropertyType;
      expect(inner).toBeInstanceOf(ArrayPropertyType);
      expect(inner.items.map(t => t.type)).toEqual(['number']);
    });

    it('uses "Entity" as class name with the default root name ""', () => {
      expect(rowEntity(service.object2PropertyType([{ a: 1 }])).className).toBe('Entity');
    });

    it('analyses the JSDoc demo rows as documented', () => {
      const entity = rowEntity(service.object2PropertyType(generatorDemoRows, 'XyzRows'));
      expect(entity.className).toBe('XyzRowEntity');
      expect(entity.properties.map(p => [p.propertyName, typesOf(p)])).toEqual([
        ['description', ['string', 'undefined']],
        ['id', ['null', 'number']],
        ['isActive', ['boolean']],
        ['name', ['string']],
        ['preferences', ['Array']],
        ['profile', ['object']],
        ['scripts', ['Array']],
        ['tags', ['null', 'Array']],
      ]);
    });

    it('logs the value infos with console.info when debugging is on', () => {
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      const debugService = new PropertyTypeService();
      debugService.debugging = true;
      const pt = debugService.object2PropertyType([{ a: 1 }], 'R');
      expect(info).toHaveBeenCalled();
      expect(info.mock.calls[0][0]).toMatch(/^00\) root -> : PropertyItem\(propertyName: R, types: \[Array]\)/);
      expect(rowEntity(pt).properties.map(p => p.propertyName)).toEqual(['a']);
    });

    it('does not log by default', () => {
      const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      new PropertyTypeService().object2PropertyType([{ a: 1 }], 'R');
      expect(info).not.toHaveBeenCalled();
    });
  });

  describe('json2PropertyType', () => {

    it('parses a JSON string', () => {
      const entity = rowEntity(service.json2PropertyType('[{"a":1,"b":"x"}]', 'Rows'));
      expect(entity.className).toBe('RowEntity');
      expect(entity.properties.map(p => [p.propertyName, typesOf(p)])).toEqual([['a', ['number']], ['b', ['string']]]);
    });

    it('repairs truncated JSON (missing closing brackets) first', () => {
      const entity = rowEntity(service.json2PropertyType('[{"a":1,"b":"x"', 'Rows'));
      expect(entity.properties.map(p => p.propertyName)).toEqual(['a', 'b']);
    });

    it('accepts an object instead of a string', () => {
      expect(service.json2PropertyType([{ a: 1 }], 'Rows')).toEqual(service.object2PropertyType([{ a: 1 }], 'Rows'));
    });

    it('throws a SyntaxError for invalid JSON', () => {
      expect(() => service.json2PropertyType('[{a:1}]')).toThrow(SyntaxError);
    });
  });

  describe('object2ValueInfos / json2ValueInfos', () => {

    it('returns one merged value info per path, sorted by path', () => {
      const infos = service.object2ValueInfos([{ a: 1 }, { a: 'x' }], 'R');
      expect(infos.map(v => [v.path, v.property, v.propertyItem.propertyName, typesOf(v.propertyItem)])).toEqual([
        ['root', 'R', 'R', ['Array']],
        ['root/[]', 'R', 'R', ['object']],
        ['root/[]/a', 'a', 'a', ['string', 'number']],
      ]);
    });

    it('json2ValueInfos parses (and repairs) a JSON string', () => {
      const infos = service.json2ValueInfos('[{"a":1', 'R');
      expect(infos.map(v => v.path)).toEqual(['root', 'root/[]', 'root/[]/a']);
    });

    it('json2ValueInfos accepts an object', () => {
      expect(service.json2ValueInfos({ a: 1 }, 'R').map(v => v.path)).toEqual(['root', 'root/a']);
    });

    it('ValueInfo.toString shows path and property item', () => {
      const infos = service.object2ValueInfos([{ a: 1 }], 'R');
      expect(infos[2].toString()).toBe('root/[]/a -> : PropertyItem(propertyName: a, types: [number])');
    });
  });

  describe('getParentPath', () => {

    it('returns everything before the last "/"', () => {
      expect(service.getParentPath('root/[]/a')).toBe('root/[]');
      expect(service.getParentPath('root/a')).toBe('root');
    });

    it('returns "" for a path without "/"', () => {
      expect(service.getParentPath('root')).toBe('');
      expect(service.getParentPath('')).toBe('');
    });
  });
});
