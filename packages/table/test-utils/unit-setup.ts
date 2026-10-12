// Setup for the "unit" project (see vitest.config.ts). Spec files run without isolation (shared module state per
// worker), so nothing a test changes globally may leak into the next one.
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
