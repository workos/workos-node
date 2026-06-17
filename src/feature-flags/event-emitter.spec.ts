import { EventEmitter } from './event-emitter';

interface TestEvents {
  ping: [number];
  data: [string, number];
}

describe('EventEmitter', () => {
  let emitter: EventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>();
  });

  describe('on / emit', () => {
    it('invokes the listener with the emitted args', () => {
      const received: number[] = [];
      emitter.on('ping', (n) => received.push(n));

      emitter.emit('ping', 42);

      expect(received).toEqual([42]);
    });

    it('returns true when a listener ran, false when none did', () => {
      expect(emitter.emit('ping', 1)).toBe(false);

      emitter.on('ping', () => {});
      expect(emitter.emit('ping', 1)).toBe(true);
    });

    it('invokes multiple listeners in registration order', () => {
      const order: string[] = [];
      emitter.on('ping', () => order.push('first'));
      emitter.on('ping', () => order.push('second'));

      emitter.emit('ping', 0);

      expect(order).toEqual(['first', 'second']);
    });

    it('only invokes listeners for the emitted event', () => {
      const pings: number[] = [];
      emitter.on('ping', (n) => pings.push(n));

      emitter.emit('data', 'x', 1);

      expect(pings).toEqual([]);
    });
  });

  describe('once', () => {
    it('fires exactly once, then auto-removes', () => {
      let calls = 0;
      emitter.once('ping', () => calls++);

      emitter.emit('ping', 1);
      emitter.emit('ping', 2);

      expect(calls).toBe(1);
      expect(emitter.listenerCount('ping')).toBe(0);
    });
  });

  describe('off', () => {
    it('removes a listener registered with on()', () => {
      const received: number[] = [];
      const listener = (n: number) => received.push(n);

      emitter.on('ping', listener);
      emitter.off('ping', listener);
      emitter.emit('ping', 1);

      expect(received).toEqual([]);
      expect(emitter.listenerCount('ping')).toBe(0);
    });

    it('removes a once()-registered listener by its original reference before it fires', () => {
      let calls = 0;
      const listener = () => calls++;

      emitter.once('ping', listener);
      emitter.off('ping', listener);
      emitter.emit('ping', 1);

      expect(calls).toBe(0);
      expect(emitter.listenerCount('ping')).toBe(0);
    });

    it('leaves other listeners intact when removing one', () => {
      const order: string[] = [];
      const a = () => order.push('a');
      const b = () => order.push('b');

      emitter.on('ping', a);
      emitter.on('ping', b);
      emitter.off('ping', a);
      emitter.emit('ping', 1);

      expect(order).toEqual(['b']);
    });
  });

  describe('dispatch safety', () => {
    it('still fires a later listener removed mid-dispatch, then honors the removal next round', () => {
      const order: string[] = [];
      const b = () => order.push('b');
      // `a` removes the later listener `b` mid-dispatch; the snapshot must keep
      // `b` firing this round, with the removal taking effect next round.
      const a = () => {
        order.push('a');
        emitter.off('ping', b);
      };

      emitter.on('ping', a);
      emitter.on('ping', b);
      emitter.emit('ping', 1);

      expect(order).toEqual(['a', 'b']);
      order.length = 0;
      emitter.emit('ping', 2);
      expect(order).toEqual(['a']);
    });

    it('does not fire a listener added during the same dispatch', () => {
      const order: string[] = [];
      const late = () => order.push('late');
      // `first` registers `late` mid-dispatch. Because add() pushes onto the
      // live handler array, only the snapshot taken at emit start prevents
      // `late` from firing this round — this is the case that proves the snapshot.
      const first = () => {
        order.push('first');
        emitter.on('ping', late);
      };

      emitter.on('ping', first);
      emitter.emit('ping', 1);

      expect(order).toEqual(['first']);
      expect(emitter.listenerCount('ping')).toBe(2);

      order.length = 0;
      emitter.emit('ping', 2);
      expect(order).toEqual(['first', 'late']);
    });
  });

  describe('listenerCount', () => {
    it('reflects adds and removes', () => {
      expect(emitter.listenerCount('ping')).toBe(0);

      const listener = () => {};
      emitter.on('ping', listener);
      emitter.on('ping', () => {});
      expect(emitter.listenerCount('ping')).toBe(2);

      emitter.off('ping', listener);
      expect(emitter.listenerCount('ping')).toBe(1);
    });
  });

  describe('removeAllListeners', () => {
    it('clears listeners for a single event only', () => {
      emitter.on('ping', () => {});
      emitter.on('data', () => {});

      emitter.removeAllListeners('ping');

      expect(emitter.listenerCount('ping')).toBe(0);
      expect(emitter.listenerCount('data')).toBe(1);
    });

    it('clears every event when called with no argument', () => {
      emitter.on('ping', () => {});
      emitter.on('data', () => {});

      emitter.removeAllListeners();

      expect(emitter.listenerCount('ping')).toBe(0);
      expect(emitter.listenerCount('data')).toBe(0);
    });
  });

  describe("unhandled 'error'", () => {
    let errorEmitter: EventEmitter<{ error: [unknown] }>;

    beforeEach(() => {
      errorEmitter = new EventEmitter<{ error: [unknown] }>();
    });

    it('throws the emitted Error when there is no listener', () => {
      const boom = new Error('boom');
      expect(() => errorEmitter.emit('error', boom)).toThrow(boom);
    });

    it('wraps a non-Error value in an Error when there is no listener', () => {
      expect(() => errorEmitter.emit('error', 'kaboom')).toThrow('kaboom');
    });

    it('does not throw when a listener is attached', () => {
      const received: unknown[] = [];
      errorEmitter.on('error', (err) => received.push(err));

      const boom = new Error('boom');
      expect(() => errorEmitter.emit('error', boom)).not.toThrow();
      expect(received).toEqual([boom]);
    });
  });

  describe('eventemitter3-compatible aliases', () => {
    it('addListener registers a listener like on', () => {
      const received: number[] = [];
      emitter.addListener('ping', (n) => received.push(n));

      emitter.emit('ping', 7);

      expect(received).toEqual([7]);
    });

    it('removeListener removes a listener like off', () => {
      const received: number[] = [];
      const fn = (n: number) => received.push(n);
      emitter.addListener('ping', fn);
      emitter.removeListener('ping', fn);

      emitter.emit('ping', 1);

      expect(received).toEqual([]);
    });

    it('listeners returns the registered listener functions for an event', () => {
      const a = (): void => {};
      const b = (): void => {};
      emitter.on('ping', a);
      emitter.on('ping', b);

      expect(emitter.listeners('ping')).toEqual([a, b]);
      expect(emitter.listeners('data')).toEqual([]);
    });

    it('eventNames returns only events that currently have listeners', () => {
      expect(emitter.eventNames()).toEqual([]);

      const fn = (): void => {};
      emitter.on('ping', fn);
      emitter.on('data', () => {});
      expect(emitter.eventNames()).toEqual(['ping', 'data']);

      emitter.off('ping', fn);
      expect(emitter.eventNames()).toEqual(['data']);
    });
  });
});
