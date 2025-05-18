/**
 * Convert a duration in seconds into a human-readable format.
 * @param {number} seconds
 * @returns {string} formatted string like "1h 23m 45s"
 */
export function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
  
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || h > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
  
    return parts.join(" ");
  }
  