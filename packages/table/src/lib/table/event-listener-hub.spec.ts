import { describe, expect, it, vi } from 'vitest';
import { createEventListenerHub } from './event-listener-hub';
import { EventAdapter } from './event-adapter';
import type { EventListenerIf } from './event-listener.if';

describe('createEventListenerHub', () => {

  it('without subscribers returns the original handlers', () => {
    const main = new EventAdapter();
    const hub = createEventListenerHub(main, new Set());
    expect(hub.onEditingChanged).toBe(main.onEditingChanged);
  });

  it('calls a subscriber even if the main listener lacks the handler; returns its result', () => {
    const main = { onCheckboxChanged: () => 'x' } as unknown as EventListenerIf;
    const sub = { onEditingChanged: vi.fn(), onCheckboxChanged: vi.fn() };
    const hub = createEventListenerHub(main, new Set([sub]));
    (hub as unknown as { onEditingChanged: (e: unknown) => void }).onEditingChanged('e');
    expect(sub.onEditingChanged).toHaveBeenCalledWith('e');
    expect((hub.onCheckboxChanged as unknown as () => string)()).toBe('x');
  });
});
