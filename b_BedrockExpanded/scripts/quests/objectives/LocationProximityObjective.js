import { BaseObjective } from "./BaseObjective.js";
import { S } from "../../systems/core/SettingsSystem.js";

export class LocationProximityObjective extends BaseObjective {
  static type = "locationProximity";

  constructor(config = {}) {
    super(config);
    this.targetPos = config.position; // { x, y, z }
    this.radius = config.radius ?? 4;
    this.dimension = config.dimension ?? "overworld";
    this.requiredCount = 1;
    this.trackingTags = ["playerTick"];
  }

  onPlayerTick(player) {
    if (this.isCompleted(player)) return;
    if (player.dimension.id !== this.dimension) return;

    const pos = player.location;
    const dx = pos.x - this.targetPos.x;
    const dy = pos.y - this.targetPos.y;
    const dz = pos.z - this.targetPos.z;

    const distanceSquared = dx * dx + dy * dy + dz * dz;
    if (distanceSquared <= this.radius * this.radius) {
      S.set(player, this.#getStorageKey(player), true);
      this.forceComplete(player); // cleanly complete
    }
  }

  #getStorageKey(player) {
    return `q.${this.questId}.${this.id}.proximityReached`;
  }

  getProgress(player) {
    return this.isCompleted(player) ? this.requiredCount : 0;
  }

  getProgressText(player) {
    return this.isCompleted(player)
      ? `✔ Reached the location`
      : `Approach the target area`;
  }

  isCompleted(player) {
    if (super.isCompleted?.(player)) return true;
    return S.get(player, this.#getStorageKey(player)) === true;
  }

  forceComplete(player) {
    S.set(player, this.#getStorageKey(player), true);
    super.forceComplete?.(player);
  }

  getDescription() {
    return { text: `Reach the marked location` };
  }

  getActionbar(player) {
    return { text: this.getProgressText(player) };
  }

  reset(player) {
    S.set(player, this.#getStorageKey(player), false);
  }

  serialize(player) {
    return {
      type: LocationProximityObjective.type,
      id: this.id,
      questId: this.questId,
      position: this.targetPos,
      radius: this.radius,
      dimension: this.dimension,
      requiredCount: this.requiredCount,
      progress: this.getProgress(player),
    };
  }

  deserialize(data) {
    this.id = data.id;
    this.questId = data.questId;
    this.targetPos = data.position ?? { x: 0, y: 0, z: 0 };
    this.radius = data.radius ?? 4;
    this.dimension = data.dimension ?? "overworld";
    this.requiredCount = data.requiredCount ?? 1;
  }
}
