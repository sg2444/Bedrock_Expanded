import { BaseObjective } from "./BaseObjective.js";
import { S } from "../../systems/core/SettingsSystem.js";

export class EntityKillObjective extends BaseObjective {
  static type = "entityKill";

  constructor(config = {}) {
    super(config);
    this.targetEntity = config.entityId;
    this.requiredCount = config.requiredCount || 1;
    this.trackingKey = `quests.${this.questId}.kills:${this.targetEntity}`;
    this.trackingTags = [this.trackingKey];
  }

  onEntityInteract(player, entity) {
    if (entity.typeId !== this.targetEntity) return;
    const key = this.#getStorageKey(player);
    const current = S.get(player, key) || 0;
    S.set(player, key, current + 1);
  }

  #getStorageKey(player) {
    return `q.${this.questId}.${this.id}.kills`;
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
    const key = this.#getStorageKey(player);
    return (S.get(player, key) || 0) >= this.requiredCount;
  }

  forceComplete(player) {
    const key = this.#getStorageKey(player);
    S.set(player, key, this.requiredCount);
    super.forceComplete(player);
  }

  getDescription() {
    const name = this.targetEntity?.replace?.("minecraft:", "") ?? "entity";
    return {
      text: `Kill ${this.requiredCount} ${name}${
        this.requiredCount !== 1 ? "s" : ""
      }`,
    };
  }

  getActionbar(player) {
    return { text: this.getProgressText(player) };
  }

  reset(player) {
    S.set(player, this.#getStorageKey(player), 0);
  }

  serialize(player) {
    return {
      type: EntityKillObjective.type,
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
