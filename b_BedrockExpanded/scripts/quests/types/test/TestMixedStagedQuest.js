import { StageableQuest } from "../../base/StageableQuest.js";
import {
  ItemCollectionObjective,
  EntityInteractionObjective,
  DimensionEntryObjective
} from "../../objectives/index.js";

export class TestMixedStagedQuest extends StageableQuest {
  constructor() {
    super(
      "staged_mixed_test",
      "Trial of the Three Paths (Staged)",
      "Advance through challenges of gathering, fighting, and travel.",
      "side"
    );
    this.setStage(0);
  }

  defineStage(stage) {
    switch (stage) {
      case 0:
        return [
          new ItemCollectionObjective({
            id: "collect_apples",
            questId: this.id,
            itemId: "minecraft:apple",
            requiredCount: 2,
            description: "Collect 2 apples."
          })
        ];
      case 1:
        return [
          new EntityInteractionObjective({
            id: "poke_a_chicken",
            questId: this.id,
            entityId: "minecraft:chicken",
            requiredCount: 1,
            description: "Poke a chicken!"
          })
        ];
      case 2:
        return [
          new DimensionEntryObjective({
            id: "go_nether",
            questId: this.id,
            dimensionId: "minecraft:nether",
            description: "Step foot into the Nether."
          })
        ];
      default:
        return [];
    }
  }

  getTitle() {
    return `§e${this.name} §7(Stage ${this.stage + 1}/3)`;
  }

  getDescription() {
    const obj = this.getCurrentObjective?.();
    return {
      text: `§7Stage ${this.stage + 1}: §f${obj?.description ?? "..."}`,
    };
  }

  getActionbar(player) {
    const objective = this.getCurrentObjective(player);
    return {
      text: `§b[Stage ${this.stage + 1}] ${objective?.getProgressText?.(player) ?? "..."}`
    };
  }
}
