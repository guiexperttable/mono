import { describe, expect, it } from 'vitest';
import { entitySuffix, firstLetterUppercase, getEntityName, trimArraySuffixes } from '@guiexpert/table';

describe('entitySuffix', () => {
  it('is "Entity"', () => {
    expect(entitySuffix).toBe('Entity');
  });
});

describe('firstLetterUppercase', () => {

  it('upper-cases only the first letter', () => {
    expect(firstLetterUppercase('userName')).toBe('UserName');
    expect(firstLetterUppercase('a')).toBe('A');
    expect(firstLetterUppercase('äpfel')).toBe('Äpfel');
  });

  it('leaves an already capitalized or non-letter start unchanged', () => {
    expect(firstLetterUppercase('Abc')).toBe('Abc');
    expect(firstLetterUppercase('1abc')).toBe('1abc');
  });

  it('returns "" for empty or missing input', () => {
    expect(firstLetterUppercase('')).toBe('');
    expect(firstLetterUppercase(undefined as unknown as string)).toBe('');
    expect(firstLetterUppercase(null as unknown as string)).toBe('');
  });
});

describe('trimArraySuffixes', () => {

  it.each([
    ['userArray', 'user'],
    ['userArr', 'user'],
    ['userList', 'user'],
    ['users', 'user'],
    ['user', 'user'],
  ])('trims "%s" to "%s"', (input, expected) => {
    expect(trimArraySuffixes(input)).toBe(expected);
  });

  it('removes only the first matching suffix (order Array, Arr, List, s)', () => {
    expect(trimArraySuffixes('itemsList')).toBe('items');
    expect(trimArraySuffixes('userArrays')).toBe('userArray');
  });

  it('is case-sensitive', () => {
    expect(trimArraySuffixes('userARRAY')).toBe('userARRAY');
    expect(trimArraySuffixes('USERS')).toBe('USERS');
  });

  it('removes a trailing "s" even when it is not a plural', () => {
    // NOTE: naive singularization – "address" → "addres", "status" → "statu".
    expect(trimArraySuffixes('address')).toBe('addres');
    expect(trimArraySuffixes('status')).toBe('statu');
  });

  it('returns empty or missing input unchanged', () => {
    expect(trimArraySuffixes('')).toBe('');
    expect(trimArraySuffixes(undefined as unknown as string)).toBeUndefined();
  });
});

describe('getEntityName', () => {

  it.each([
    ['users', 'UserEntity'],
    ['preferences', 'PreferenceEntity'],
    ['XyzRows', 'XyzRowEntity'],
    ['orderList', 'OrderEntity'],
    ['profile', 'ProfileEntity'],
  ])('turns "%s" into "%s"', (input, expected) => {
    expect(getEntityName(input)).toBe(expected);
  });

  it('does not append the suffix twice', () => {
    expect(getEntityName('UserEntity')).toBe('UserEntity');
  });

  it('does not append the suffix when "Entity" appears anywhere in the name', () => {
    // NOTE: `includes`, not `endsWith` – "EntityType" stays "EntityType".
    expect(getEntityName('EntityType')).toBe('EntityType');
  });

  it('singularizes "Entities" to "Entitie" and appends the suffix again', () => {
    // NOTE: naive singularization → "userEntities" becomes "UserEntitieEntity".
    expect(getEntityName('userEntities')).toBe('UserEntitieEntity');
  });

  it('returns just "Entity" for "" and for "list"/"array" (the whole name is a suffix)', () => {
    // NOTE: a property called "list" gives the class name "Entity" – collisions are likely.
    expect(getEntityName('')).toBe('Entity');
    expect(getEntityName('list')).toBe('Entity');
    expect(getEntityName('array')).toBe('Entity');
  });

  it('trims the suffix after upper-casing the first letter ("s" → "S" is kept)', () => {
    expect(getEntityName('s')).toBe('SEntity');
  });
});
