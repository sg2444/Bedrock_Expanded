import { system as SystemAPI } from "@minecraft/server";

export class ScriptEventRouter {
  static #handlers = new Map();

  static init() {
    SystemAPI.afterEvents.scriptEventReceive.subscribe((event) => {
      const { id, sourceEntity } = event;
      if (!sourceEntity?.typeId) return;

      const [command, arg] = id.split(":");
      const handler = this.#handlers.get(command);

      if (handler) {
        try {
          handler({ player: sourceEntity, command, arg, raw: id });
        } catch (e) {
          console.warn(`[ScriptEventRouter] Handler for "${id}" failed:`, e);
        }
      } else {
        sourceEntity.sendMessage(`§7[Script] Unknown command: §f${id}`);
      }
    });
  }

  static register(command, fn) {
    this.#handlers.set(command, fn);
  }

  static unregister(command) {
    this.#handlers.delete(command);
  }
}
