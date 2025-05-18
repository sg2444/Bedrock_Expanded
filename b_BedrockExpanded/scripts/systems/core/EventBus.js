const listeners = new Map();

export const EventBus = {
  on(eventName, callback) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, []);
    }
    listeners.get(eventName).push(callback);
  },

  emit(eventName, ...args) {
    const subs = listeners.get(eventName);
    if (!subs) return;
    for (const cb of subs) {
      try {
        cb(...args); // <-- this spreads the args
      } catch (e) {
        console.warn(`[EventBus] Error in ${eventName} handler:`, e);
      }
    }
  },

  clear(eventName) {
    listeners.delete(eventName);
  },

  reset() {
    listeners.clear();
  },
};
