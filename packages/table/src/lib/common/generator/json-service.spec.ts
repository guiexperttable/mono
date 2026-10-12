import { describe, expect, it } from 'vitest';
import { JsonService } from '@guiexpert/table';

describe('JsonService.fixJSON', () => {
  const fix = (s: string) => new JsonService().fixJSON(s);

  it('returns valid JSON unchanged', () => {
    const json = '{"a":[1,2,{"b":"c"}],"d":null}';
    expect(fix(json)).toBe(json);
  });

  it('returns "" for ""', () => {
    expect(fix('')).toBe('');
  });

  it('appends the missing closing brackets in the right order', () => {
    expect(fix('[{"a":1')).toBe('[{"a":1}]');
    expect(fix('{"a":[1,{"b":2')).toBe('{"a":[1,{"b":2}]}');
    expect(JSON.parse(fix('[{"id":1,"tags":["x","y"]},{"id":2,"tags":["z"'))).toEqual([
      { id: 1, tags: ['x', 'y'] },
      { id: 2, tags: ['z'] },
    ]);
  });

  it('ignores brackets inside strings', () => {
    expect(fix('{"a":"[{","b":"}]"')).toBe('{"a":"[{","b":"}]"}');
  });

  it('does not end a string at an escaped quote', () => {
    const fixed = fix('{"a":"x\\"[y","b":[1');
    expect(fixed).toBe('{"a":"x\\"[y","b":[1]}');
    expect(JSON.parse(fixed)).toEqual({ a: 'x"[y', b: [1] });
  });

  it('handles an escaped backslash before a closing quote', () => {
    const fixed = fix('{"a":"x\\\\","b":{"c":1');
    expect(JSON.parse(fixed)).toEqual({ a: 'x\\', b: { c: 1 } });
  });

  it('throws for mismatched brackets', () => {
    expect(() => fix('[}')).toThrow('Invalid JSON structure detected.');
    expect(() => fix('{"a":[1}')).toThrow('Invalid JSON structure detected.');
  });

  it('throws for a closing bracket without an opening one', () => {
    expect(() => fix('[]]')).toThrow('Invalid JSON structure detected.');
  });

  it('appends the brackets inside an unterminated string', () => {
    // NOTE: the open string is not closed first, so the result is still invalid JSON.
    expect(fix('{"a":"abc')).toBe('{"a":"abc}');
  });

  it('keeps a trailing comma', () => {
    // NOTE: '[1,2,' becomes '[1,2,]' – still invalid JSON.
    expect(fix('[1,2,')).toBe('[1,2,]');
  });

  it('balances the JS-like (unquoted keys, single quotes) input of its JSDoc, which is still no JSON', () => {
    // NOTE: the JSDoc example uses unquoted keys and single quotes; single quotes are not treated as strings.
    const fixed = fix("[{id: 1, name: 'Alice'");
    expect(fixed).toBe("[{id: 1, name: 'Alice'}]");
    expect(() => JSON.parse(fixed)).toThrow();
  });
});
