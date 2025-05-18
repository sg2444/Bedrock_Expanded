import { BaseObjective } from "./BaseObjective.js";
import { S } from "../../systems/core/SettingsSystem.js";

export class ItemCollectionObjective extends BaseObjective {
  static type = "itemCollection";

  constructor(config = {}) {
    super(config);
    this.itemId = config.itemId;
    this.requiredCount = config.requiredCount || 1;
    this.trackingTags = ["itemUsed"];
  }

  onItemCollected(player, item) {
    if (item?.typeId !== this.itemId) return;
    const key = this.#getStorageKey(player);
    const current = S.get(player, key) || 0;
    S.set(player, key, current + 1);
  }

  #getStorageKey(player) {
    return `q.${this.questId}.${this.id}.collected`;
  }

  getProgress(player) {
    return Math.min(
      this.requiredCount,
      S.get(player, this.#getStorageKey(player)) || 0
    );
  }

  getProgressText(player) {
    return `${this.getProgress(player)} / ${this.requiredCount}`;
  }

  isCompleted(player) {
    if (super.isCompleted?.(player)) return true;
    return this.getProgress(player) >= this.requiredCount;
  }

  getDescription() {
    const itemName = this.itemId?.replace?.("minecraft:", "") ?? "item";
    const count = this.requiredCount ?? 1;
    const text = `Collect ${count} ${itemName}(s)`;
    return { text };
  }

  getActionbar(player) {
    return { text: this.getProgressText(player) };
  }

  reset(player) {
    S.set(player, this.#getStorageKey(player), 0);
  }

  serialize(player) {
    return {
      type: ItemCollectionObjective.type,
      id: this.id,
      questId: this.questId,
      itemId: this.itemId,
      requiredCount: this.requiredCount,
      progress: this.getProgress(player),
    };
  }

  deserialize(data) {
    this.id = data.id;
    this.questId = data.questId;
    this.itemId = data.itemId;
    this.requiredCount = data.requiredCount ?? 1;
  }
}
