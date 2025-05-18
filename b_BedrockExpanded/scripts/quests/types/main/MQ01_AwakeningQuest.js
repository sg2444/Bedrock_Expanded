import { StageableQuest } from "../../base/StageableQuest.js";
import {
  LocationProximityObjective,
  ScriptEventObjective,
  EntityInteractionObjective,
} from "../../objectives/index.js";
import { MQ02_EchoesOfThePastQuest } from "./MQ02_EchoesOfThePastQuest.js"
import {QuestManager} from "../../systems/QuestManager.js"

export class MQ01_AwakeningQuest extends StageableQuest {
  constructor() {
    super(
      "MQ01",
      "Awakening",
      "You awaken in isolation. A strange energy pulses nearby — faint but unmistakable. A monolith stands before you, etched with shifting glyphs. The air feels thick. Something watches.",
      "main"
    );
    this.setStage(0);
    this.dialogue = {
      intro: [
        {
          id: "MQ01/intro_vision",
          auto: true,
        },
      ],
      stage: {
        2: [
          {
            npc: "be:kaelin",
            id: "MQ01/seer_intro",
          },
        ],
      },
    };
  }

  defineStage(stage) {
    switch (stage) {
      case 0:
        return [
          new LocationProximityObjective({
            id: "mq01_approach_monolith",
            questId: this.id,
            position: { x: "~", y: "~", z: "~" },
            radius: 8,
            triggerOnce: true,
            description: "Approach the monolith that hums with strange energy.",
          }),
        ];
      case 1:
        return [
          new ScriptEventObjective({
            id: "mq01_observe_glyphs",
            questId: this.id,
            eventName: "mq01.observe_glyphs",
            description: "Touch the glyphs etched into the monolith.",
          }),
        ];
      case 2:
        return [
          new EntityInteractionObjective({
            id: "mq01_speak_with_kaelin",
            questId: this.id,
            entityTypes: ["be:kaelin"],
            description: "Speak with Elder Kaelin in the nearby village.",
          }),
        ];
      default:
        return [];
    }
  }

  onComplete(player) {
    player.sendMessage(
      "§6[Quest] The Elder nods solemnly. 'You have awakened, but the road ahead remains shadowed.'"
    );
    player.setDynamicProperty("awakeningQuestComplete", true);

        // Automatically assign MQ03
        const nextQuest = new MQ02_EchoesOfThePastQuest();
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
    return `§e${this.name} §7(Stage ${this.stage + 1}/3)`;
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
