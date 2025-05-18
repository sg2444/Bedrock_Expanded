import { StageableQuest } from "../../base/StageableQuest.js";
import {
  EntityInteractionObjective,
  ItemCollectionObjective
} from "../../objectives/index.js";


export class TestMultiStageQuest extends StageableQuest {
  constructor() {
    super(
      "blacksmith_request",
      "Blacksmith's Request",
      "Help the Blacksmith through multiple steps.",
      "side"
    );
    this.setStage(0);
  }

  defineStage(stage) {
    switch (stage) {
      case 0:
        return [
          new EntityInteractionObjective({
            id: "talk_to_blacksmith",
            questId: this.id,
            entityId: "minecraft:villager",
            requiredCount: 1,
            description: "Find and talk to the Blacksmith."
          })
        ];
      case 1:
        return [
          new ItemCollectionObjective({
            id: "fetch_apples",
            questId: this.id,
            itemId: "minecraft:apple",
            requiredCount: 5,
            description: "Collect 5 apples for the Blacksmith."
          })
        ];
      case 2:
        return [
          new EntityInteractionObjective({
            id: "return_to_blacksmith",
            questId: this.id,
            entityId: "minecraft:villager",
            requiredCount: 1,
            description: "Return to the Blacksmith with the apples."
          })
        ];
      default:
        return [];
    }
  }
  getDescription() {
    const obj = this.getCurrentObjective?.();
    return {
      text: `§7Stage ${this.stage + 1}: §f${obj?.description ?? "..."}`,
    };
  }

  getTitle() {
    return `${this.name} (Stage ${this.stage + 1}/3)`;
  }

  getActionbar(player) {
    const obj = this.getCurrentObjective(player);
    return {
      text: `§b[Stage ${this.stage + 1}] ${obj?.getProgressText?.(player) ?? "In Progress"}`
    };
  }
  
}
