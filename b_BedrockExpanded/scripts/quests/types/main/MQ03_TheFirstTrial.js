import { StageableQuest } from "../../base/StageableQuest.js";
import {
  EntityInteractionObjective,
  LocationProximityObjective,
  ScriptEventObjective,
  EntityKillObjective,
} from "../../objectives/index.js";

export class MQ03_TheFirstTrialQuest extends StageableQuest {
  constructor() {
    super(
      "MQ03",
      "The First Trial",
      "Elder Kaelin has deciphered the Echoes Ledger, revealing the path to the First Shrine hidden beneath Glimmerroot Caverns.",
      "main"
    );
    this.setStage(0);
    this.dialogue = {
      stage: {
        0: [
          {
            npc: "be:kaelin",
            id: "MQ03/kaelin_shrine_hint",
          },
        ],
        4: [
          {
            npc: "be:shrine_guardian",
            id: "MQ03/guardian_lines",
          },
        ],
        5: [
          {
            id: "MQ03/memory_vision",
            auto: true,
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
            id: "mq03_receive_shrine_coords",
            questId: this.id,
            entityTypes: ["be:kaelin"],
            description: "Receive the shrine coordinates from Elder Kaelin.",
          }),
        ];
      case 1:
        return [
          new LocationProximityObjective({
            id: "mq03_arrive_glimmerroot",
            questId: this.id,
            position: { x: "~", y: "~", z: "~" }, // Replace with known coordinates
            radius: 20,
            description: "Travel to Glimmerroot Caverns near the northern cliffs.",
          }),
        ];
      case 2:
        return [
          new ScriptEventObjective({
            id: "mq03_solve_glyph_puzzle",
            questId: this.id,
            eventName: "mq03.solve_glyph_puzzle",
            description: "Solve the glyph puzzle to unlock the inner sanctum.",
          }),
        ];
      case 3:
        return [
          new EntityKillObjective({
            id: "mq03_defeat_guardian",
            questId: this.id,
            entityId: "be:shrine_guardian",
            requiredCount: 1,
            description: "Defeat the Shrine Guardian that protects the core.",
          }),
        ];
      case 4:
        return [
          new ScriptEventObjective({
            id: "mq03_activate_shrine_core",
            questId: this.id,
            eventName: "mq03.activate_core",
            description: "Activate the Shrine Core and receive your first memory vision.",
          }),
        ];
      default:
        return [];
    }
  }

  onComplete(player) {
    player.sendMessage(
      "§d[Vision] The shrine pulses — monoliths across the world begin to stir..."
    );
    player.setDynamicProperty("firstTrialComplete", true);
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
