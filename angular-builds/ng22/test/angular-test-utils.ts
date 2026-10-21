// Helpers for the Angular wrapper tests: a real application (createApplication) per test, no TestBed.
// JIT compiler: loaded by test/setup-jit.ts (setupFiles) before any Angular package
import { ApplicationRef, ComponentRef, createComponent, EnvironmentProviders, Provider, Type } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createHost, removeHosts } from '../../../packages/table/test-utils/wrapper-test-utils';

export interface Mounted<T> {
  host: HTMLDivElement;
  ref: ComponentRef<T>;
  appRef: ApplicationRef;
  cmp: T;
  /** runs change detection and waits until the application is stable */
  stable(): Promise<void>;
}

const apps: ApplicationRef[] = [];

/**
 * Bootstraps `component` into a fixed-size host (600 × 300 px). `providers` decide zoneless
 * (`provideZonelessChangeDetection()`) or Zone.js (`provideZoneChangeDetection()`).
 */
export async function mount<T>(component: Type<T>, providers: (Provider | EnvironmentProviders)[]): Promise<Mounted<T>> {
  const host = createHost();
  const appRef = await createApplication({ providers });
  apps.push(appRef);
  const ref = createComponent(component, { environmentInjector: appRef.injector, hostElement: host });
  appRef.attachView(ref.hostView);
  const stable = async () => {
    appRef.tick();
    await appRef.whenStable();
  };
  await stable();
  return { host, ref, appRef, cmp: ref.instance, stable };
}

/** Use as `afterEach(destroyApps)`. */
export function destroyApps(): void {
  while (apps.length) {
    apps.pop()!.destroy();
  }
  removeHosts();
}
