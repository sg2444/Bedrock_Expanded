import { BaseQuest } from "../../base/BaseQuest.js";
import {
  ItemCollectionObjective,
  EntityInteractionObjective,
  DimensionEntryObjective
} from "../../objectives/index.js";

export class TestMixedObjectivesFlat extends BaseQuest {
  constructor() {
    super([
      new ItemCollectionObjective({
        id: "collect_apples",
        questId: "mixed_test",
        itemId: "minecraft:apple",
        requiredCount: 2,
        description: "Collect 2 apples."
      }),
      new EntityInteractionObjective({
        id: "poke_a_chicken",
        questId: "mixed_test",
        entityId: "minecraft:chicken",
        requiredCount: 1,
        description: "Poke a chicken!"
      }),
      new DimensionEntryObjective({
        id: "go_nether",
        questId: "mixed_test",
        dimensionId: "minecraft:nether",
        description: "Step foot into the Nether."
      })
    ]);

    this.id = "mixed_test";
    this.name = "Trial of the Three Paths";
    this.type = "side"; // 
    this.description = "Prove your worth by collecting, interacting, and traveling.";
  }

  static canAssign(player) {
    return true;
  }

  serialize(player) {
    return super.serialize?.(player);
  }

  getDescription() {
    const obj = this.getCurrentObjective?.();
    return {
      text: `§f${obj?.description ?? "Complete the objectives."}`
    };
  }
  
}
