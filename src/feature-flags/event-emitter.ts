type Listener<Args extends unknown[]> = (...args: Args) => void;

/**
 * Minimal, runtime-agnostic, typed event emitter.
 *
 * Replaces eventemitter3 so the SDK carries no event dependency and works in
 * edge runtimes where `node:events` is not available. Generic over an event
 * map (`{ eventName: [arg1, arg2, ...] }`) for compile-time-checked event
 * names and payloads.
 *
 * Unlike eventemitter3, an unhandled `'error'` event throws instead of being
 * silently dropped — matching Node's `EventEmitter` so failures are never
 * swallowed.
 */
// `Record<keyof Events, unknown[]>` (rather than `Record<string, unknown[]>`)
// lets the event map be declared as an `interface` as well as a `type` —
// interfaces have no implicit string index signature, so the looser form
// would reject them.
export class EventEmitter<Events extends Record<keyof Events, unknown[]>> {
  // Store the ORIGINAL listener fn (not a wrapper) so off() can remove
  // once-listeners by the reference the caller passed. The internal fn type
  // is (...args: any[]) => void — assignable both to and from the typed
  // public signatures, so no casts are needed at the call sites. Public
  // type-safety lives in the generic method signatures below.
  private handlers = new Map<
    keyof Events,
    Array<{ fn: (...args: any[]) => void; once: boolean }>
  >();

  on<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    return this.add(event, fn, false);
  }

  once<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    return this.add(event, fn, true);
  }

  off<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    const list = this.handlers.get(event);
    if (list) {
      const next = list.filter((h) => h.fn !== fn);
      if (next.length) this.handlers.set(event, next);
      else this.handlers.delete(event);
    }
    return this;
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    const list = this.handlers.get(event);
    if (!list || list.length === 0) {
      // Node semantics: an unhandled 'error' must not be silently dropped.
      if (event === 'error') {
        throw args[0] instanceof Error ? args[0] : new Error(String(args[0]));
      }
      return false;
    }
    // Snapshot so once-removal / off() during dispatch is safe.
    for (const h of [...list]) {
      if (h.once) this.off(event, h.fn);
      h.fn(...args);
    }
    return true;
  }

  listenerCount(event: keyof Events): number {
    return this.handlers.get(event)?.length ?? 0;
  }

  removeAllListeners(event?: keyof Events): this {
    if (event === undefined) this.handlers.clear();
    else this.handlers.delete(event);
    return this;
  }

  private add<E extends keyof Events>(
    event: E,
    fn: Listener<Events[E]>,
    once: boolean,
  ): this {
    const list = this.handlers.get(event) ?? [];
    list.push({ fn, once });
    this.handlers.set(event, list);
    return this;
  }
}
