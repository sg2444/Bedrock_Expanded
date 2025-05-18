import { TestItemCollectionQuest } from "./TestItemCollectionQuest.js";
import { TestDailyRepeatableQuest } from "./TestDailyRepeatableQuest.js";
import { TestEntityTalkQuest } from "./TestEntityTalkQuest.js";
import { TestMultiStageQuest } from "./TestMultiStageQuest.js";
import { TestMixedObjectivesFlat } from "./TestMixedObjectivesFlat.js";
import { TestMixedStagedQuest } from "./TestMixedStagedQuest.js";
import { TQ01_SampleDynamicDialogueQuest } from "./TQ01_SampleDynamicDialogueQuest.js";

export const testQuests = [
  { id: "fetch_apples", class: TestItemCollectionQuest },
  { id: "daily_forager", class: TestDailyRepeatableQuest },
  { id: "example_quest", class: TestEntityTalkQuest },
  { id: "blacksmith_request", class: TestMultiStageQuest },
  { id: "mixed_test", class: TestMixedObjectivesFlat },
  { id: "staged_mixed_test", class: TestMixedStagedQuest },
  {
    id: "TQ01_SampleDynamicDialogueQuest",
    class: TQ01_SampleDynamicDialogueQuest,
  },
];
