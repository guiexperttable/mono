// The sample rows from the JSDoc of PropertyTypeService / SchemeGenerator (and the *.demo.ts files),
// shared by the generator tests. Lives outside src/ on purpose: it must not end up in the npm package.

export const generatorDemoRows = [
  {
    id: 1,
    name: 'Alice',
    description: 'Lorem ipsum dolor',
    isActive: true,
    tags: ['typescript', 'javascript'],
    scripts: [],
    profile: { age: 30, location: 'Berlin' },
    preferences: [{ key: 'theme', value: 'dark' }],
  },
  {
    id: 2,
    name: 'Marc',
    description: 'Lorem ipsum dolor 2',
    isActive: false,
    tags: ['java', 'javascript'],
    scripts: [],
    profile: { age: 55, location: 'Frankfurt' },
    preferences: [{ key: 'theme', value: 'light' }],
  },
  {
    id: null,
    name: 'Bob',
    isActive: false,
    tags: null,
    scripts: [],
    profile: { age: 25, location: 'Frankfurt' },
    preferences: [{ key: 'language', value: 'de' }],
  },
];

/** The TypeScript interfaces the JSDoc of SchemeGenerator promises for {@link generatorDemoRows} (root name "XyzRows"). */
export const generatorDemoInterfaces = [
  'export interface XyzRowEntity {',
  '  description?: string;',
  '  id: number|null;',
  '  isActive: boolean;',
  '  name: string;',
  '  preferences: PreferenceEntity[];',
  '  profile: ProfileEntity;',
  '  scripts: any[];',
  '  tags: string[]|null;',
  '}',
  '',
  'export interface PreferenceEntity {',
  '  key: string;',
  '  value: string;',
  '}',
  '',
  'export interface ProfileEntity {',
  '  age: number;',
  '  location: string;',
  '}',
  '',
];
