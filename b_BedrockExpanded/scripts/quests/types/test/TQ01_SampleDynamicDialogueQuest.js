import { StageableQuest } from "../../base/StageableQuest.js";
import {
  ItemCollectionObjective,
  EntityInteractionObjective,
  DimensionEntryObjective,
} from "../../objectives/index.js";

export class TQ01_SampleDynamicDialogueQuest extends StageableQuest {
  constructor() {
    super(
      "TQ01_SampleDynamicDialogueQuest",
      "Echoes and Encounters",
      "Uncover secrets across three stages of exploration.",
      "test"
    );
    this.setStage(0);

    this.dialogue = {
      intro: [
        {
          npc: "be:kaelin",
          id: "quest.intro.echoes_and_encounters",
          triggerOnce: true,
          onComplete: ["say Your journey begins..."],
        },
      ],
      stage: {
        0: [
          {
            npc: "be:villager_1",
            id: "quest.stage0.gather",
            onComplete: ["say You should collect those items."],
          },
        ],
        1: [
          {
            npc: "be:gerren",
            id: "quest.stage1.interact",
            conditions: ["stage0_complete"],
            onComplete: ["say Good work. Let’s continue."],
          },
        ],
        2: [
          {
            npc: "be:kaelin",
            id: "quest.stage2.dimension",
            onComplete: ["say You crossed dimensions!"],
          },
        ],
      },
      complete: [
        {
          npc: "be:elder",
          id: "quest.complete.echoes",
          triggerOnce: true,
          onComplete: ["function quest/mark_complete"],
        },
      ],
    };
  }

  defineStage(stage) {
    switch (stage) {
      case 0:
        return [
          new ItemCollectionObjective({
            id: "collect_apples",
            questId: this.id,
            itemId: "minecraft:apple",
            requiredCount: 3,
            description: "Collect 3 apples.",
          }),
        ];
      case 1:
        return [
          new EntityInteractionObjective({
            id: "speak_with_gerren",
            questId: this.id,
            entityId: "be:gerren",
            requiredCount: 1,
            description: "Speak with Gerren.",
          }),
        ];
      case 2:
        return [
          new DimensionEntryObjective({
            id: "enter_nether",
            questId: this.id,
            dimensionId: "minecraft:nether",
            description: "Enter the Nether.",
          }),
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
    const obj = this.getCurrentObjective(player);
    return {
      text: `§b[Stage ${this.stage + 1}] ${
        obj?.getProgressText?.(player) ?? "In Progress"
      }`,
    };
  }

  getDialogueEntriesForStage(stage) {
    return this.dialogue?.stage?.[stage] ?? [];
  }

  onStageComplete(player, stage) {
    super.onStageComplete(player, stage);

    // Example: set a flag used for dialogue condition
    if (stage === 0) {
      this.setFlag(player, "stage0_complete", true);
    }
  }

  serialize(player) {
    return super.serialize?.(player);
  }
}
