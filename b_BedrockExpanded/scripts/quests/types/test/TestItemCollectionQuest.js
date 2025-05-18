import { BaseQuest } from "../../base/BaseQuest.js";
import { ItemCollectionObjective } from "../../objectives/index.js";

export class TestItemCollectionQuest extends BaseQuest {
  constructor() {
    super([
      new ItemCollectionObjective({
        id: "fetch_apples",
        questId: "fetch_apples",
        itemId: "minecraft:apple",
        requiredCount: 5,
        description: "Collect apples."
      })
    ]);

    this.id = "fetch_apples";
    this.name = "Fetch Apples";
    this.description = "A simple side quest to help the Blacksmith gather apples.";
    this.type = "side";
    this.stage = 0;

  }

  onComplete(player) {
    //super.onComplete(player);
    player.sendMessage("§a[Quest] You completed the Fetch Apples Quest!");
    player.runCommand("give @s minecraft:cookie 3");
  }

  serialize(player) {
    return super.serialize?.(player);
  }
  
}