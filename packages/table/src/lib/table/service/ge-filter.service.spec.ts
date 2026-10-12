import { describe, expect, it } from 'vitest';
import { GeFilterService } from '@guiexpert/table';

interface Person {
  name: string;
  city: string;
  age: number;
}

const ann: Person = { name: 'Ann', city: 'Berlin', age: 31 };
const bob: Person = { name: 'Bob', city: 'Paris', age: 42 };
const cid: Person = { name: 'Cid', city: 'Berlin-Mitte', age: 7 };
const people = [ann, bob, cid];

describe('GeFilterService', () => {
  const service = new GeFilterService();

  describe('objectToString', () => {

    it('joins the values (not the keys) with spaces, lower-cased', () => {
      expect(service.objectToString(ann)).toBe('ann berlin 31');
    });

    it('returns "" for falsy values', () => {
      expect(service.objectToString(null)).toBe('');
      expect(service.objectToString(undefined)).toBe('');
      expect(service.objectToString(0)).toBe('');
      expect(service.objectToString('')).toBe('');
    });

    it('writes null/undefined values as empty strings (Array.join)', () => {
      expect(service.objectToString({ a: 'X', b: null, c: undefined, d: 'Y' })).toBe('x   y');
    });

    it('does not look into nested objects', () => {
      // NOTE: nested objects become "[object object]" – their values are not searchable.
      expect(service.objectToString({ a: 'X', nested: { city: 'Rome' } })).toBe('x [object object]');
    });

    it('joins arrays with commas', () => {
      expect(service.objectToString({ tags: ['A', 'B'] })).toBe('a,b');
    });

    it('treats a string as an object of characters', () => {
      expect(service.objectToString('Hi')).toBe('h i');
    });
  });

  describe('filterPredict', () => {

    it('returns true for an empty filter', () => {
      expect(service.filterPredict(ann, '')).toBe(true);
    });

    it('returns false for a falsy item, even with an empty filter', () => {
      expect(service.filterPredict(null, '')).toBe(false);
      expect(service.filterPredict(undefined, 'x')).toBe(false);
    });

    it('matches a substring of any value, case-insensitive', () => {
      expect(service.filterPredict(ann, 'BERL')).toBe(true);
      expect(service.filterPredict(ann, 'par')).toBe(false);
    });

    it('matches numbers as text', () => {
      expect(service.filterPredict(bob, '42')).toBe(true);
      expect(service.filterPredict(bob, '43')).toBe(false);
    });

    it('does not match property names (only values)', () => {
      expect(service.filterPredict(ann, 'city')).toBe(false);
    });

    it('combines plain words with OR', () => {
      expect(service.filterPredict(ann, 'paris ann')).toBe(true);
      expect(service.filterPredict(bob, 'paris ann')).toBe(true);
      expect(service.filterPredict(cid, 'paris ann')).toBe(false);
    });

    it('requires every "+word" (AND)', () => {
      expect(service.filterPredict(ann, '+berlin +ann')).toBe(true);
      expect(service.filterPredict(cid, '+berlin +ann')).toBe(false);
    });

    it('excludes every "-word" (NOT)', () => {
      expect(service.filterPredict(ann, 'berlin -mitte')).toBe(true);
      expect(service.filterPredict(cid, 'berlin -mitte')).toBe(false);
    });

    it('needs at least one OR word to match before checking +/- words', () => {
      expect(service.filterPredict(ann, 'paris +berlin')).toBe(false);
      expect(service.filterPredict(ann, 'ann +berlin')).toBe(true);
    });

    it('a filter of only "-words" keeps everything else', () => {
      expect(service.filterPredict(ann, '-paris')).toBe(true);
      expect(service.filterPredict(bob, '-paris')).toBe(false);
    });

    it('ignores lone "+" and "-" and repeated spaces', () => {
      expect(service.filterPredict(ann, '  +  -   ann  ')).toBe(true);
    });

    it('removes ALL "-" from a NOT word, so hyphenated words cannot be excluded', () => {
      // NOTE: "-berlin-mitte" becomes "berlinmitte", which never matches "berlin-mitte".
      expect(service.filterPredict(cid, '-berlin-mitte')).toBe(true);
    });

    it('removes ALL "+" from a MUST word', () => {
      // NOTE: "+c++" becomes "c".
      expect(service.filterPredict(cid, '+c++')).toBe(true);
    });

    it('keeps hyphens inside OR words', () => {
      expect(service.filterPredict(cid, 'berlin-mitte')).toBe(true);
      expect(service.filterPredict(ann, 'berlin-mitte')).toBe(false);
    });

    it('uses a custom toString function (which must lower-case itself)', () => {
      const byName = (p: Person) => p.name.toLowerCase();
      expect(service.filterPredict(ann, 'ann', byName)).toBe(true);
      expect(service.filterPredict(ann, 'berlin', byName)).toBe(false);
      // the filter string is lower-cased, the custom text is not:
      expect(service.filterPredict(ann, 'Ann', (p: Person) => p.name)).toBe(false);
    });
  });

  describe('filterRows', () => {

    it('returns a copy of all rows for an empty filter', () => {
      const result = service.filterRows(people, '');
      expect(result).toEqual(people);
      expect(result).not.toBe(people);
    });

    it('returns [] for missing rows', () => {
      expect(service.filterRows(undefined as unknown as Person[], 'x')).toEqual([]);
    });

    it('filters with OR, +AND and -NOT words, case-insensitive', () => {
      expect(service.filterRows(people, 'BERLIN')).toEqual([ann, cid]);
      expect(service.filterRows(people, 'berlin -mitte')).toEqual([ann]);
      expect(service.filterRows(people, 'paris ann')).toEqual([ann, bob]);
      expect(service.filterRows(people, '+berlin +cid')).toEqual([cid]);
    });

    it('keeps the order of the rows', () => {
      expect(service.filterRows([cid, bob, ann], 'berlin')).toEqual([cid, ann]);
    });

    it('searches the JSON of a row by default – property names match, too', () => {
      // NOTE: unlike filterPredict (values only), the default here is JSON.stringify → "name" matches every row.
      expect(service.filterRows(people, 'name')).toEqual(people);
      expect(service.filterPredict(ann, 'name')).toBe(false);
    });

    it('uses a custom toString function', () => {
      const byCity = (p: Person) => p.city.toLowerCase();
      expect(service.filterRows(people, 'i', byCity)).toEqual([ann, bob, cid]);
      expect(service.filterRows(people, 'mitte', byCity)).toEqual([cid]);
    });
  });
});
