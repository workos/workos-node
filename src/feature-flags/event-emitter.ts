type Listener<Args extends unknown[]> = (...args: Args) => void;

// Internal registration record. `fn` is stored loosely typed
// (`(...args: any[]) => void`) so it is assignable both to and from the typed
// public signatures — call sites need no casts, and public type-safety lives in
// the generic method signatures. The ORIGINAL listener fn is stored (not a
// wrapper) so off() matches the reference the caller passed.
type Handler = { fn: (...args: any[]) => void; once: boolean };

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
  private handlers = new Map<keyof Events, Handler[]>();

  on<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    return this.add(event, fn, false);
  }

  once<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    return this.add(event, fn, true);
  }

  off<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    this.remove(event, (h) => h.fn !== fn);
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
      // Remove the once-registration by identity, not by fn: the same fn may
      // also be registered with on(), and only this entry should be dropped.
      if (h.once) this.remove(event, (existing) => existing !== h);
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

  // ── eventemitter3-compatible aliases ────────────────────────────────────
  // FeatureFlagsRuntimeClient previously extended eventemitter3, whose
  // EventEmitter also exposed these. They are kept so the runtime client's
  // public surface stays a superset of the old one — swapping the base class
  // off eventemitter3 is then non-breaking for consumers.
  addListener<E extends keyof Events>(event: E, fn: Listener<Events[E]>): this {
    return this.on(event, fn);
  }

  removeListener<E extends keyof Events>(
    event: E,
    fn: Listener<Events[E]>,
  ): this {
    return this.off(event, fn);
  }

  listeners<E extends keyof Events>(event: E): Array<Listener<Events[E]>> {
    return (this.handlers.get(event) ?? []).map(
      (h) => h.fn as Listener<Events[E]>,
    );
  }

  eventNames(): Array<keyof Events> {
    return [...this.handlers.keys()];
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

  // Single owner of the "filter the list, then keep-or-delete the slot" logic
  // shared by off() and once auto-removal.
  private remove(event: keyof Events, keep: (h: Handler) => boolean): void {
    const list = this.handlers.get(event);
    if (!list) return;
    const next = list.filter(keep);
    if (next.length) this.handlers.set(event, next);
    else this.handlers.delete(event);
  }
}
