import { BaseObjective } from "./BaseObjective.js";
import { S } from "../../systems/core/SettingsSystem.js";

export class EntityInteractionObjective extends BaseObjective {
  static type = "entityInteraction";

  constructor(config = {}) {
    super(config);
    this.targetEntity = config.entityId;
    this.requiredCount = config.requiredCount || 1;
    this.description =
      config.description ??
      `Interact with ${this.requiredCount} ${this.targetEntity}`;
    this.trackingTags = ["entityInteract"];
  }

  onEntityInteract(player, entity) {
    if (entity.typeId !== this.targetEntity) return;
    const key = this.#getStorageKey(player);
    const current = S.get(player, key) || 0;
    S.set(player, key, current + 1);
  }

  #getStorageKey(player) {
    return `q.${this.questId}.${this.id}.interacted`;
  }

  getProgress(player) {
    return S.get(player, this.#getStorageKey(player)) || 0;
  }

  getProgressText(player) {
    const current = S.get(player, this.#getStorageKey(player)) || 0;
    return `${current}/${this.requiredCount} ${this.targetEntity}`;
  }

  isCompleted(player) {
    if (super.isCompleted?.(player)) return true;
    return this._interacted?.[player.id] === true;
  }

  getDescription() {
    const base = this.targetEntity?.replace?.("minecraft:", "") ?? "entity";
    const count = this.requiredCount ?? 1;

    const desc =
      this.description ??
      `Interact with ${count} ${base}${count !== 1 ? "s" : ""}`;

    return { text: desc };
  }

  getActionbar(player) {
    return { text: this.getProgressText(player) };
  }

  reset(player) {
    S.set(player, this.#getStorageKey(player), 0);
  }

  serialize(player) {
    return {
      type: EntityInteractionObjective.type,
      id: this.id,
      questId: this.questId,
      entityId: this.targetEntity,
      requiredCount: this.requiredCount,
      progress: this.getProgress(player),
    };
  }

  deserialize(data) {
    this.id = data.id;
    this.questId = data.questId;
    this.targetEntity = data.entityId;
    this.requiredCount = data.requiredCount ?? 1;
  }
}
