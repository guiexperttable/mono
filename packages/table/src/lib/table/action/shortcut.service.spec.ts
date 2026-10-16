// ShortcutService needs a TableScope (DOM) – here it gets a minimal fake with the four members it uses:
// tableOptions, hostElement.addEventListener, listenerAbortController and onActionTriggered.
// It also reads the globals `navigator.platform` (Mac or not) and `location.hostname` (debug logging on localhost);
// both are stubbed per test.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import {
  OsxShortcutActionIdMapping,
  ShortcutService,
  WindowsShortcutActionIdMapping,
} from '@guiexpert/table';
import type { ActionId, OnActionTriggeredIf, ShortcutActionIdMapping, TableScope } from '@guiexpert/table';
import { KEY_EVENTS_BY_MAPPING_KEY, keyEvent, type KeyEventInit } from '../../../../test-utils/key-event';

type KeyHandler = (evt: KeyboardEvent) => void;

interface FakeScope {
  scope: TableScope;
  onActionTriggered: Mock<(id: ActionId) => boolean>;
  addEventListener: Mock<(type: string, fn: KeyHandler) => void>;
  abortController: AbortController;
  /** the registered keydown handler (undefined if none was registered) */
  keydown(): KeyHandler | undefined;
}

function fakeScope(options: { shortcutActionsDisabled?: boolean; shortcutActionIdMapping?: ShortcutActionIdMapping } = {},
                   consumed = true): FakeScope {
  let handler: KeyHandler | undefined;
  const addEventListener = vi.fn<(type: string, fn: KeyHandler) => void>((type, fn) => {
    if (type === 'keydown') handler = fn;
  });
  const onActionTriggered = vi.fn<(id: ActionId) => boolean>(() => consumed);
  const abortController = new AbortController();
  const scope = {
    tableOptions: { shortcutActionsDisabled: false, ...options },
    hostElement: { addEventListener },
    listenerAbortController: abortController,
    onActionTriggered,
  } as unknown as TableScope;
  return { scope, onActionTriggered, addEventListener, abortController, keydown: () => handler };
}

type DispatchedEvent = KeyboardEvent & {
  preventDefault: Mock<() => void>;
  stopPropagation: Mock<() => void>;
};

function keydownEvent(init: KeyEventInit, target: { tagName: string; isContentEditable?: boolean } = { tagName: 'DIV' }): DispatchedEvent {
  return Object.assign(keyEvent(init), {
    target: { isContentEditable: false, ...target },
    preventDefault: vi.fn<() => void>(),
    stopPropagation: vi.fn<() => void>(),
  }) as DispatchedEvent;
}

function stubPlatform(platform: string, hostname = 'example.com') {
  vi.stubGlobal('navigator', { platform });
  vi.stubGlobal('location', { hostname });
}

beforeEach(() => {
  stubPlatform('Win32');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ShortcutService', () => {

  describe('init', () => {

    it('uses the Windows mapping on non-Mac platforms', () => {
      stubPlatform('Win32');
      const service = new ShortcutService(fakeScope().scope);
      expect(service.getShortcutActionMapping()).toEqual(new WindowsShortcutActionIdMapping().get());
    });

    it('uses the OSX mapping when navigator.platform contains "Mac"', () => {
      stubPlatform('MacIntel');
      const service = new ShortcutService(fakeScope().scope);
      expect(service.getShortcutActionMapping()).toEqual(new OsxShortcutActionIdMapping().get());
    });

    it('treats Linux like Windows', () => {
      stubPlatform('Linux x86_64');
      const service = new ShortcutService(fakeScope().scope);
      expect(service.getShortcutActionMapping()).toEqual(new WindowsShortcutActionIdMapping().get());
    });

    it('adds and overrides shortcuts with tableOptions.shortcutActionIdMapping', () => {
      const service = new ShortcutService(fakeScope({
        shortcutActionIdMapping: { 'ctrl+c': 'SELECT_ALL', 'f9': 'COPY_2_CLIPBOARD' },
      }).scope);
      const mapping = service.getShortcutActionMapping();
      expect(mapping['ctrl+c']).toBe('SELECT_ALL');
      expect(mapping['f9']).toBe('COPY_2_CLIPBOARD');
      expect(mapping['f2']).toBe('START_EDITING'); // predefined entries stay
    });

    it('registers one keydown listener on the host element, bound to the scope\'s abort signal', () => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      expect(fake.addEventListener).toHaveBeenCalledTimes(1);
      expect(fake.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), { signal: fake.abortController.signal });
    });

    it('registers no listener and keeps an empty mapping when shortcutActionsDisabled is true', () => {
      const fake = fakeScope({ shortcutActionsDisabled: true });
      const service = new ShortcutService(fake.scope);
      expect(fake.addEventListener).not.toHaveBeenCalled();
      expect(service.getShortcutActionMapping()).toEqual({});
    });

    it('logs the mapping with console.debug on localhost only', () => {
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      stubPlatform('Win32', 'example.com');
      new ShortcutService(fakeScope().scope);
      expect(debug).not.toHaveBeenCalled();

      stubPlatform('Win32', 'localhost');
      new ShortcutService(fakeScope().scope);
      expect(debug).toHaveBeenCalledWith('ShortcutService', expect.objectContaining({ 'ctrl+c': 'COPY_2_CLIPBOARD' }));
    });

    it('logs "ShortcutService skipped." on 127.0.0.1 when shortcuts are disabled', () => {
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      stubPlatform('Win32', '127.0.0.1');
      new ShortcutService(fakeScope({ shortcutActionsDisabled: true }).scope);
      expect(debug).toHaveBeenCalledWith('ShortcutService skipped.');
    });

    it('throws when there is no global `location` (needs a browser-like environment)', () => {
      // NOTE: isDebug() reads location.hostname unguarded – constructing the service in Node/SSR throws.
      vi.stubGlobal('location', undefined);
      expect(() => new ShortcutService(fakeScope().scope)).toThrow(TypeError);
    });
  });

  describe('addListener', () => {

    it('notifies added listeners besides the table scope', () => {
      const fake = fakeScope({}, false);
      const service = new ShortcutService(fake.scope);
      const other: OnActionTriggeredIf = { onActionTriggered: vi.fn(() => false) };
      service.addListener(other);
      fake.keydown()!(keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true }));
      expect(fake.onActionTriggered).toHaveBeenCalledTimes(1);
      expect(other.onActionTriggered).toHaveBeenCalledTimes(1);
    });

    it('adds the same listener only once', () => {
      const fake = fakeScope({}, false);
      const service = new ShortcutService(fake.scope);
      const other: OnActionTriggeredIf = { onActionTriggered: vi.fn(() => false) };
      service.addListener(other);
      service.addListener(other);
      service.addListener(fake.scope); // already registered by the constructor
      fake.keydown()!(keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true }));
      expect(other.onActionTriggered).toHaveBeenCalledTimes(1);
      expect(fake.onActionTriggered).toHaveBeenCalledTimes(1);
    });
  });

  describe('keydown handling', () => {

    it('prevents default and stops propagation when a listener consumed the action', () => {
      const fake = fakeScope({}, true);
      new ShortcutService(fake.scope);
      const evt = keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true });
      fake.keydown()!(evt);
      expect(evt.preventDefault).toHaveBeenCalledTimes(1);
      expect(evt.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('lets the event through when no listener consumed the action', () => {
      const fake = fakeScope({}, false);
      new ShortcutService(fake.scope);
      const evt = keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true });
      fake.keydown()!(evt);
      expect(fake.onActionTriggered).toHaveBeenCalled();
      expect(evt.preventDefault).not.toHaveBeenCalled();
      expect(evt.stopPropagation).not.toHaveBeenCalled();
    });

    it('consumes the event if at least one of several listeners consumed it', () => {
      const fake = fakeScope({}, false);
      const service = new ShortcutService(fake.scope);
      service.addListener({ onActionTriggered: () => true });
      const evt = keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true });
      fake.keydown()!(evt);
      expect(evt.preventDefault).toHaveBeenCalled();
    });

    it('logs shortcut and emitted action with console.debug on localhost', () => {
      const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      stubPlatform('Win32', 'localhost');
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      debug.mockClear();
      fake.keydown()!(keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true }));
      expect(debug).toHaveBeenCalledWith('ShortcutService shortcut  :', 'ctrl c');
      expect(debug).toHaveBeenCalledWith('ShortcutService emit      :', 'COPY_2_CLIPBOARD');
    });

    it.each(['INPUT', 'SELECT', 'TEXTAREA'])('ignores keys typed into an %s (cell editor)', (tagName) => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      const evt = keydownEvent({ key: 'a', code: 'KeyA', ctrlKey: true }, { tagName });
      fake.keydown()!(evt);
      expect(fake.onActionTriggered).not.toHaveBeenCalled();
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });

    it('ignores keys typed into a contentEditable element', () => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      fake.keydown()!(keydownEvent({ key: 'a', code: 'KeyA', ctrlKey: true }, { tagName: 'DIV', isContentEditable: true }));
      expect(fake.onActionTriggered).not.toHaveBeenCalled();
    });

    // Regression: findEntity compared the event's shortcut with itself instead of with the mapping key
    // → every key triggered the FIRST mapping entry (START_EDITING).
    it('Ctrl+C triggers COPY_2_CLIPBOARD (Windows)', () => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      fake.keydown()!(keydownEvent({ key: 'c', code: 'KeyC', ctrlKey: true }));
      expect(fake.onActionTriggered).toHaveBeenCalledWith('COPY_2_CLIPBOARD');
    });

    it('Cmd+A triggers SELECT_ALL (Mac)', () => {
      stubPlatform('MacIntel');
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      fake.keydown()!(keydownEvent({ key: 'a', code: 'KeyA', metaKey: true }));
      expect(fake.onActionTriggered).toHaveBeenCalledWith('SELECT_ALL');
    });

    it('a key without shortcut (plain "x") triggers no action and is not prevented', () => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      const evt = keydownEvent({ key: 'x', code: 'KeyX' });
      fake.keydown()!(evt);
      expect(fake.onActionTriggered).not.toHaveBeenCalled();
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });

    it('Tab triggers no action and is not prevented (focus can leave the table)', () => {
      const fake = fakeScope();
      new ShortcutService(fake.scope);
      const evt = keydownEvent({ key: 'Tab', code: 'Tab' });
      fake.keydown()!(evt);
      expect(fake.onActionTriggered).not.toHaveBeenCalled();
      expect(evt.preventDefault).not.toHaveBeenCalled();
    });

    it('an own shortcut from tableOptions.shortcutActionIdMapping triggers its action', () => {
      const fake = fakeScope({ shortcutActionIdMapping: { 'f9': 'COPY_2_CLIPBOARD' } });
      new ShortcutService(fake.scope);
      fake.keydown()!(keydownEvent({ key: 'F9', code: 'F9' }));
      expect(fake.onActionTriggered).toHaveBeenCalledWith('COPY_2_CLIPBOARD');
    });
  });
  describe('built-in shortcuts – every mapping entry triggers exactly its action', () => {
    const cases: Array<[string, string, Record<string, ActionId>]> = [
      ['Win32', 'Windows', new WindowsShortcutActionIdMapping().get()],
      ['MacIntel', 'Mac', new OsxShortcutActionIdMapping().get()],
    ];
    for (const [platform, label, mapping] of cases) {
      for (const [key, actionId] of Object.entries(mapping)) {
        it(`${label}: "${key}" → ${actionId}`, () => {
          stubPlatform(platform);
          const init = KEY_EVENTS_BY_MAPPING_KEY[key];
          expect(init, `no key event known for "${key}"`).toBeDefined();
          const fake = fakeScope();
          new ShortcutService(fake.scope);
          fake.keydown()!(keydownEvent(init!));
          expect(fake.onActionTriggered).toHaveBeenCalledTimes(1);
          expect(fake.onActionTriggered).toHaveBeenCalledWith(actionId);
        });
      }
    }

    it('an own mapping may use "arrowup" or "up" for the arrow keys', () => {
      const fake = fakeScope({ shortcutActionIdMapping: { 'shift+arrowup': 'SELECT_ALL', 'shift+down': 'DESELECT_ALL' } });
      new ShortcutService(fake.scope);
      fake.keydown()!(keydownEvent({ key: 'ArrowUp', code: 'ArrowUp', shiftKey: true }));
      fake.keydown()!(keydownEvent({ key: 'ArrowDown', code: 'ArrowDown', shiftKey: true }));
      expect(fake.onActionTriggered.mock.calls).toEqual([['SELECT_ALL'], ['DESELECT_ALL']]);
    });
  });
});

describe('ShortcutService – right-to-left (since 1.1.98)', () => {
  afterEach(() => vi.unstubAllGlobals());

  function rtlScope(rtl: boolean) {
    const fake = fakeScope();
    (fake.scope as unknown as { isRtl: () => boolean }).isRtl = () => rtl;
    new ShortcutService(fake.scope);
    return fake;
  }

  it('swaps ← and → before the mapping is looked up', () => {
    stubPlatform('Win32');
    const fake = rtlScope(true);
    fake.keydown()!(keydownEvent({ key: 'ArrowRight', code: 'ArrowRight' }));
    fake.keydown()!(keydownEvent({ key: 'ArrowLeft', code: 'ArrowLeft' }));
    fake.keydown()!(keydownEvent({ key: 'ArrowUp', code: 'ArrowUp' }));
    expect(fake.onActionTriggered.mock.calls.map(c => c[0])).toEqual(['NAVIGATE_LEFT', 'NAVIGATE_RIGHT', 'NAVIGATE_UP']);
  });

  it('macOS ⌘← goes to the end of the row (left), ⌘→ to the start', () => {
    stubPlatform('MacIntel');
    const fake = rtlScope(true);
    fake.keydown()!(keydownEvent({ key: 'ArrowLeft', code: 'ArrowLeft', metaKey: true }));
    fake.keydown()!(keydownEvent({ key: 'ArrowRight', code: 'ArrowRight', metaKey: true }));
    expect(fake.onActionTriggered.mock.calls.map(c => c[0])).toEqual(['NAVIGATE_ROW_END', 'NAVIGATE_ROW_START']);
  });

  it('left-to-right: unchanged', () => {
    stubPlatform('Win32');
    const fake = rtlScope(false);
    fake.keydown()!(keydownEvent({ key: 'ArrowRight', code: 'ArrowRight' }));
    expect(fake.onActionTriggered.mock.calls.map(c => c[0])).toEqual(['NAVIGATE_RIGHT']);
  });
});
