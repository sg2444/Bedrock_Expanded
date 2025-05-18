import { ItemCollectionObjective } from "../../objectives/ItemCollectionObjective.js";
import { BaseQuest } from "../../base/BaseQuest.js";
import { CooldownSystem } from "../../../systems/CooldownSystem.js";

export class TestDailyRepeatableQuest extends BaseQuest {
  constructor() {
    super([
      new ItemCollectionObjective({
        id: "collect_sweet_berries",
        questId: "daily_forager",
        itemId: "minecraft:sweet_berries",
        requiredCount: 3,
        description: "Collect 3 sweet berries for the farmer."
      })
    ]);

    this.id = "daily_forager";
    this.name = "Daily Forager";
    this.type = "daily"; 
    this.description = "Collect 3 berries. Can be completed once every 24 hours.";
    this.stage = 0;

  }

   static canAssign(player) {
    return CooldownSystem.canAssign(player, "quests/daily_forager");
  }

  
   onComplete(player) {
    player.sendMessage("§a[Quest] You completed the Daily Forager Quest!");
    player.runCommand("give @s minecraft:emerald 2");
    CooldownSystem.set(player, "quests/daily_forager", 86400);
  }
   

  
  serialize(player) {
    return super.serialize?.(player);
  }
  
}
