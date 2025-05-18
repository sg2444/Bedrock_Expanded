import { StageableQuest } from "../../base/StageableQuest.js";
import {
  EntityInteractionObjective,
  LocationProximityObjective,
  ItemCollectionObjective,
} from "../../objectives/index.js";
import { MQ03_TheFirstTrialQuest } from "./MQ03_TheFirstTrialQuest.js"
import {QuestManager} from "../../systems/QuestManager.js"

export class MQ02_EchoesOfThePastQuest extends StageableQuest {
  constructor() {
    super(
      "MQ02",
      "Echoes of the Past",
      "Visions linger in your mind. Answers may lie deeper within Stillmere, or among its scattered guardians.",
      "main"
    );
    this.setStage(0);
    this.dialogue = {
      stage: {
        0: [
          {
            npc: "be:kaelin",
            id: "MQ02/kaelin_guidebook",
          },
        ],
        4: [
          {
            npc: "be:kaelin",
            id: "MQ02/kaelin_ledger_translation",
          },
        ],
      },
    };
  }

  defineStage(stage) {
    switch (stage) {
      case 0:
        return [
          new EntityInteractionObjective({
            id: "mq02_show_guidebook_to_kaelin",
            questId: this.id,
            entityTypes: ["be:kaelin"],
            requiresHeldItem: "custom:tattered_guidebook",
            description: "Show the Tattered Guidebook to Elder Kaelin.",
          }),
        ];
      case 1:
        return [
          new LocationProximityObjective({
            id: "mq02_travel_to_watchpost",
            questId: this.id,
            position: { x: "~", y: "~", z: "~" }, // Replace with fixed location if needed
            radius: 16,
            description: "Reach the Foothill Watchpost ruins north of the village.",
          }),
        ];
      case 2:
        return [
          new LocationProximityObjective({
            id: "mq02_enter_watchpost_ruins",
            questId: this.id,
            position: { x: "~", y: "~", z: "~" },
            radius: 10,
            description: "Explore the ruins and avoid or defeat hostile creatures.",
          }),
        ];
      case 3:
        return [
          new ItemCollectionObjective({
            id: "mq02_collect_echoes_ledger",
            questId: this.id,
            itemId: "custom:echoes_ledger",
            requiredCount: 1,
            description: "Recover the Echoes Ledger from the tower archives.",
          }),
        ];
      case 4:
        return [
          new EntityInteractionObjective({
            id: "mq02_return_ledger_to_kaelin",
            questId: this.id,
            entityTypes: ["be:kaelin"],
            requiresHeldItem: "custom:echoes_ledger",
            description: "Return the ledger to Kaelin for translation.",
          }),
        ];
      default:
        return [];
    }
  }

  onComplete(player) {
    player.sendMessage(
      "§6[Quest] Kaelin nods gravely. 'If you're ready... the shrine awaits.'"
    );
    player.setDynamicProperty("echoesOfThePastComplete", true);
  
    // Automatically assign MQ03
    const nextQuest = new MQ03_TheFirstTrialQuest();
    QuestManager.assignQuest(player, nextQuest);
  }
  

  getDescription() {
    return {
      text: `Stage ${this.stage + 1}: ${
        this.objectives[0]?.description ?? "..."
      }`,
    };
  }

  getTitle() {
    return `§e${this.name} §7(Stage ${this.stage + 1}/5)`;
  }

  getActionbar(player) {
    const obj = this.getCurrentObjective(player);
    return {
      text: `§b[Stage ${this.stage + 1}] ${
        obj?.getProgressText?.(player) ?? "..."
      }`,
    };
  }

  serialize(player) {
    return super.serialize?.(player);
  }
}
