import { describe, expect, it } from 'vitest';
import { parseTsv, toTsv } from './tsv';

describe('toTsv', () => {
  it.each([
    [[['a', 'b'], ['1', '2']], 'a\tb\n1\t2'],
    [[['tab\there']], '"tab\there"'],
    [[['line\nbreak']], '"line\nbreak"'],
    [[['cr\rx']], '"cr\rx"'],
    [[['say "hi"']], '"say ""hi"""'],
    [[['']], '\n'],                      // an empty last row keeps a line break (else it vanishes)
    [[['', '']], '\t\n'],
    [[['a'], ['']], 'a\n\n'],
    [[], ''],
  ])('%j → %j', (matrix, text) => {
    expect(toTsv(matrix)).toBe(text);
  });
});

describe('parseTsv', () => {
  it.each([
    ['', []],
    ['\n', [['']]],
    ['a', [['a']]],
    ['a\tb\n1\t2', [['a', 'b'], ['1', '2']]],
    ['a\tb\r\n1\t2\r\n', [['a', 'b'], ['1', '2']]],          // Excel: CRLF and a line break at the end
    ['a\rb', [['a'], ['b']]],                                // old Mac
    ['﻿a\tb', [['a', 'b']]],                            // byte order mark
    ['a\t', [['a', '']]],
    ['a\t\tc', [['a', '', 'c']]],
    ['a\n\nb', [['a'], [''], ['b']]],
    ['a\tb\nc', [['a', 'b'], ['c', '']]],                    // shorter rows are filled
    ['"x\ny"\tz', [['x\ny', 'z']]],                         // Excel: a cell with a line break
    ['"tab\there"', [['tab\there']]],
    ['"say ""hi"""', [['say "hi"']]],
    ['a"b', [['a"b']]],                                      // a quotation mark inside is no quoting
    ['"open', [['open']]],                                   // not closed: up to the end
    ['"x"y\tz', [['xy', 'z']]],                              // text after the closing mark is kept
    ['""', [['']]],
    ['Google\tSheets\n\t\n1\t', [['Google', 'Sheets'], ['', ''], ['1', '']]], // empty cells
  ])('%j', (text, matrix) => {
    expect(parseTsv(text)).toEqual(matrix);
  });

  it('round trip: toTsv → parseTsv gives the same cells', () => {
    const matrices = [
      [['a', 'tab\tx', 'q"uote', ''], ['multi\nline', '"', '\r\n', 'end']],
      [['a'], ['']], [['']], [['', '']], [['x', ''], ['', '']], [['"start'], ['end"']],
    ];
    for (const matrix of matrices) {
      expect(parseTsv(toTsv(matrix))).toEqual(matrix);
    }
  });

  it('a real Excel clipboard text (two rows, a number with comma, a cell with a line break)', () => {
    const excel = 'Name\tPreis\tNotiz\r\nApfel\t1,25\t"rot\ngrün"\r\nBirne\t0,99\t\r\n';
    expect(parseTsv(excel)).toEqual([['Name', 'Preis', 'Notiz'], ['Apfel', '1,25', 'rot\ngrün'], ['Birne', '0,99', '']]);
  });

  it('100 000 cells in well under a second', () => {
    const row = Array.from({ length: 10 }, (_, i) => `v${i}`).join('\t');
    const text = Array.from({ length: 10_000 }, () => row).join('\r\n');
    const t0 = performance.now();
    const m = parseTsv(text);
    expect(m.length).toBe(10_000);
    expect(performance.now() - t0).toBeLessThan(1000);
  });
});
