import { describe, it, expect } from 'vitest';
import { ChunkData, RequestChunk } from '@guiexpert/table';

describe('RequestChunk', () => {
  it('stores the request parameters (field names with the public typo "emmit…")', () => {
    const r = new RequestChunk('data', 'cancel', 'q1', 'name=x', 'name ASC', 0, 99);
    expect(r).toEqual({
      emmitDataKey: 'data', emmitCancelKey: 'cancel', queryId: 'q1', filter: 'name=x', sorting: 'name ASC', startIndex: 0, endIndex: 99,
    });
  });
});

describe('ChunkData', () => {
  it('is a RequestChunk with rows', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const c = new ChunkData('data', 'cancel', 'q1', '', '', 10, 11, rows);
    expect(c).toBeInstanceOf(RequestChunk);
    expect(c.rows).toBe(rows);
    expect([c.emmitDataKey, c.startIndex, c.endIndex]).toEqual(['data', 10, 11]);
  });
});
