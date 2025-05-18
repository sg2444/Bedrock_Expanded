import { BaseObjective } from "./BaseObjective.js";
import { S } from "../../systems/core/SettingsSystem.js";

export class DimensionEntryObjective extends BaseObjective {
  static type = "dimensionEntry";

  constructor(config = {}) {
    super(config);
    this.targetDimension = config.dimensionId ?? "minecraft:nether";
    this.trackingTags = ["dimensionEnter"];
  }

  onDimensionEnter(player, dimensionId) {
    if (dimensionId !== this.targetDimension) return;
    S.set(player, this.#getStorageKey(player), true);
  }

  #getStorageKey(player) {
    return `q.${this.questId}.${this.id}.entered`;
  }

  isCompletedd(player) {
    if (super.isCompletedd?.(player)) return true;
    return player.dimension.id === this.dimensionId;
  }

  getProgressText(player) {
    return this.isCompleted(player)
      ? `✔ Entered ${this.targetDimension}`
      : `Enter ${this.targetDimension}`;
  }

  getDescription() {
    const name = this.targetDimension.replace("minecraft:", "");
    return { text: `Enter the ${name}` };
  }

  getActionbar(player) {
    return {
      text: this.getProgressText(player),
    };
  }

  reset(player) {
    S.set(player, this.#getStorageKey(player), false);
  }

  serialize(player) {
    return {
      type: DimensionEntryObjective.type,
      id: this.id,
      questId: this.questId,
      dimensionId: this.targetDimension,
      completed: this.isCompleted(player),
      progress: this.isCompleted(player) ? 1 : 0,
    };
  }

  deserialize(data) {
    this.id = data.id;
    this.questId = data.questId;
    this.targetDimension = data.dimensionId ?? "minecraft:nether";
  }
}
