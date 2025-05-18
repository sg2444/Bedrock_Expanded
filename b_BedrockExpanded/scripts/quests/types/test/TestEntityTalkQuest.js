import { EntityInteractionObjective } from "../../objectives/index.js";
import { BaseQuest } from "../../base/BaseQuest.js";


export class TestEntityTalkQuest extends BaseQuest {
  constructor() {
    super([
      new EntityInteractionObjective({
        id: "talk_to_villager",
        questId: "example_quest",
        entityId: "minecraft:villager",
        requiredCount: 1,
        description: "Talk to a Villager."
      })
    ]);

    this.id = "example_quest";
    this.name = "Example Quest";
    this.description = "This is a test quest. Speak to a Villager to complete it.";
  }

  onComplete(player) {
    super.onComplete(player);
    player.sendMessage("§a[Quest] You completed the Example Quest!");
    player.runCommandAsync("give @s minecraft:cookie 3");
  }
  
  serialize(player) {
    return super.serialize?.(player);
  }
  

}
