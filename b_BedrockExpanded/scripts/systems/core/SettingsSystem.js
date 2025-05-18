const PROPERTY_PREFIX = "BE_setting:";

/**
 * SettingsSystem provides a simple key-value store using dynamic properties on player entities.
 * All keys are namespaced to prevent collisions.
 */
export const S = {
  /**
   * Set a dynamic setting for a player.
   * @param {Player} player
   * @param {string} key
   * @param {boolean|string|number} value
   */
/*   set(player, key, value) {
    try {
      player.setDynamicProperty(PROPERTY_PREFIX + key, value);
    } catch (err) {
      console.warn(`[SettingsSystem] Failed to set ${key}:`, err);
      player.sendMessage(`§c[Error] Failed to save setting: ${key}`);
    }
  }, */

  set(player, key, value) {
    const fullKey = PROPERTY_PREFIX + key;
    try {
      const toStore = (Array.isArray(value) || typeof value === "object")
        ? JSON.stringify(value)
        : value;

          //console.warn(`[SettingsSystem] Writing ${fullKey} =`, toStore); // ✅ debug output
          
          
      player.setDynamicProperty(fullKey, toStore);
    } catch (err) {
      console.warn(`[SettingsSystem] Failed to set ${key}:`, err);
      player.sendMessage(`§c[Error] Failed to save setting: ${key}`);
    }
  },

  get(player, key) {
    const value = player.getDynamicProperty(PROPERTY_PREFIX + key);
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  },

  remove(player, key) {
    try {
      player.setDynamicProperty(PROPERTY_PREFIX + key, undefined);
    } catch (err) {
      console.warn(`[SettingsSystem] Failed to remove ${key}:`, err);
    }
  },
  /**
   * Toggle a boolean setting value for a player.
   * If not set, assumes default `true`.
   * @param {Player} player
   * @param {string} key
   * @returns {boolean} new value
   */
  toggle(player, key) {
    const current = this.get(player, key);
    const newValue = !current;
    this.set(player, key, newValue);
    return newValue;
  },

  /**
   * List all usable dynamic property keys for the player, stripped of prefix.
   * @param {Player} player
   * @returns {string[]} array of keys without prefix
   */
  list(player) {
    return typeof player.getDynamicPropertyIds === "function"
      ? player
          .getDynamicPropertyIds()
          .filter(k => k.startsWith(PROPERTY_PREFIX))
          .map(k => k.substring(PROPERTY_PREFIX.length))
      : [];
  }
};
