import type { EventListenerIf } from "./event-listener.if";

/**
 * The event listener of a table: the listener given to the constructor plus the listeners of
 * {@link TableApi.subscribe}. Without subscribers every call goes to the main listener exactly as before
 * (`listener.onX` is the main listener's member, also `undefined`).
 *
 * Not exported: an internal of {@link TableScope}.
 */
export function createEventListenerHub(main: EventListenerIf, subscribers: Set<Partial<EventListenerIf>>): EventListenerIf {
  return new Proxy(main, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof prop !== "string" || !prop.startsWith("on") || !subscribers.size) {
        return value;
      }
      return (...args: unknown[]) => {
        const ret = typeof value === "function" ? (value as (...a: unknown[]) => unknown).apply(target, args) : undefined;
        for (const subscriber of Array.from(subscribers)) {
          const fn = (subscriber as Record<string, unknown>)[prop];
          if (typeof fn === "function") {
            try {
              (fn as (...a: unknown[]) => unknown).apply(subscriber, args);
            } catch (e) {
              console.error(e); // one subscriber must not break the table or the others
            }
          }
        }
        return ret;
      };
    }
  });
}
