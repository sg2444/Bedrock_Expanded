import { S } from "./core/SettingsSystem.js";

export class CooldownSystem {
  /**
   * Convert a namespaced cooldown key to dynamic property key.
   */
  static #toKey(scopeKey) {
    return `cd.${scopeKey.replace(/[\/\\]/g, ".")}`;
  }

  static set(player, scopeKey, seconds) {
    const key = this.#toKey(scopeKey);
    const now = Date.now();
    S.set(player, key, now + seconds * 1000);
  }

  static isActive(player, scopeKey) {
    const key = this.#toKey(scopeKey);
    const expiresAt = S.get(player, key);
    return typeof expiresAt === "number" && Date.now() < expiresAt;
  }

  static getRemaining(player, scopeKey) {
    const key = this.#toKey(scopeKey);
    const expiresAt = S.get(player, key);
    if (typeof expiresAt !== "number") return 0;
    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  }

  static clear(player, scopeKey) {
    const key = this.#toKey(scopeKey);
    S.set(player, key, 0);
  }

  static canAssign(player, scopeKey) {
    return !this.isActive(player, scopeKey);
  }
  

  /**
   * Removes expired cooldowns from a player.
   */
  static cleanupExpired(player) {
    const now = Date.now();
    const keys = S.list(player);
    for (const key of keys) {
      if (!key.startsWith("cd.")) continue;
      const expires = S.get(player, key);
      if (typeof expires !== "number" || now >= expires) {
        S.set(player, key, undefined);
      }
    } 
  }
}
