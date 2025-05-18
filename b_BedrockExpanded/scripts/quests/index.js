import { QuestManager } from "./systems/QuestManager.js";
import "./systems/QuestUIRouter.js";
import "./systems/questCommands.js";


import { RegisteredQuests } from "./_registry.js";


for (const { id, class: QuestClass } of RegisteredQuests) {
  QuestManager.registerQuestType(id, QuestClass);
}
