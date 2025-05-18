import { BaseQuest } from "./BaseQuest.js";
import { QuestManager } from "../systems/QuestManager.js";

export class StageableQuest extends BaseQuest {
  constructor(id, name, description, type = "side") {
    super([]);
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.stage = 0;
  }

  /**
   * Updates quest objectives based on the current stage.
   * Subclasses must override this method to return a new array of objectives.
   */
  defineStage(stage) {
    console.warn(
      `[StageableQuest] defineStage(${stage}) not implemented for quest ${this.id}`
    );
    return [];
  }

  setStage(stage) {
    this.stage = stage;
    this.objectives = this.defineStage(stage) ?? [];
  }

  advanceToNextObjective(player) {
    this.stage++;
    this.setStage(this.stage);

    const current = this.getCurrentObjective(player);

    if (typeof current?.getProgressText === "function") {
      const progress = current.getProgressText(player);
      if (progress) {
        player.onScreenDisplay.setActionBar(`§a[Quest] §f${progress}`);
      }
    }

    if (this.stage >= 3) {
      this.onComplete?.(player);
    }
    QuestManager.updateQuest(player, this);
  }

  serialize(player) {
    return {
      ...super.serialize(player),
      stage: this.stage,
    };
  }

  deserialize(data) {
    this.stage = data.stage ?? 0;
    this.setStage(this.stage);
    this.currentObjectiveIndex = data.currentObjectiveIndex ?? 0;
  }

  static deserialize(data) {
    const instance = new this(); // Assumes subclass uses no-arg constructor or sets fields after
    instance.deserialize(data);
    return instance;
  }
}
