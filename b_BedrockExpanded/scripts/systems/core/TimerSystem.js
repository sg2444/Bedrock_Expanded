import { system } from "@minecraft/server";

const intervals = new Map();

/**
 * Run a named repeating interval callback using Minecraft's system.runInterval.
 * Automatically clears any existing interval under the same ID.
 * 
 * @param {string} id - Unique identifier for the interval
 * @param {Function} callback - Function to run at each interval
 * @param {number} ticks - Number of game ticks between calls (default: 20 ticks = 1 second)
 */
export function run(id, callback, ticks = 20) {
  clear(id); // Prevent duplicate intervals
  const handle = system.runInterval(callback, ticks);
  intervals.set(id, handle);
}

/**
 * Clear a previously registered repeating interval by ID.
 * 
 * @param {string} id - Identifier used in run()
 */
export function clear(id) {
  const handle = intervals.get(id);
  if (handle !== undefined) {
    system.clearRun(handle);
    intervals.delete(id);
  }
}
