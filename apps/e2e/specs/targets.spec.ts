// Control tests of the generated target list (E6): nothing silently drops out.
import { test, expect } from '@playwright/test';
import { APPS, NOT_E2E_APPS } from '../apps.mjs';
import { appsWithBuildScript, chapterSlugs, frameworkTargets, showcaseTargets, tableDemoTargets, trainingTargets, angularDemoRoutes, vueMultiDemoRoutes } from '../targets.ts';
import { EXCEPTIONS } from '../exceptions.ts';

test.skip(({ browserName }) => browserName !== 'chromium', 'checks files only – once is enough');

test('every app under apps/ with a build script is opened by a test (apps.mjs) or listed in NOT_E2E_APPS', () => {
  const known = new Set([...APPS.map(a => a.name), ...NOT_E2E_APPS]);
  expect(appsWithBuildScript().filter(a => !known.has(a))).toEqual([]);
});

test('every chapter of chapters.ts has a training page', () => {
  const pages = new Set(trainingTargets().map(t => t.slug));
  expect(chapterSlugs().filter(s => !pages.has(s))).toEqual([]);
});

test('the lists are not empty', () => {
  expect(showcaseTargets('run').length).toBeGreaterThanOrEqual(30);
  expect(trainingTargets().length).toBeGreaterThanOrEqual(40);
  expect(tableDemoTargets().length).toBeGreaterThanOrEqual(20);
  expect(angularDemoRoutes().length).toBeGreaterThanOrEqual(15);
  expect(vueMultiDemoRoutes().length).toBeGreaterThanOrEqual(10);
});

test('every exception names an existing target', () => {
  const ids = new Set([...showcaseTargets('run'), ...tableDemoTargets(), ...frameworkTargets()].map(t => t.id));
  const missing = EXCEPTIONS.filter(e => !e.target.startsWith('training-demo ') && !ids.has(e.target));
  expect(missing).toEqual([]);
});
