import { EventBus } from "../../systems/core/EventBus.js";
import { QuestJournal } from "./QuestJournal.js";
import { QuestManager } from "./QuestManager.js";
import { showQuestSettingsUI } from "./QuestSettingsUI.js";
import { system, world } from "@minecraft/server";
import { S } from "../../systems/core/SettingsSystem.js";

/* 
Response to journal access requests. Opens the quest Journal
*/

EventBus.on("open_journal", ({ player }) => {
  if (!player || typeof player.typeId !== "string") return;
  QuestJournal.showJournal(player);
});

EventBus.on("open_questsettings", ({ player }) => {
  if (!player || typeof player.typeId !== "string") return;

  showQuestSettingsUI(player);
});

/**
 * Opens a quest dialogue screen using a temporary NPC entity.
 * Requires `npc_screen` and a matching dialogtext-bound control to exist.
 */

export function showDialogueIntro(player, quest) {
  const sceneId = `npc.${quest.id}`;
  const dialogueSceneId = `quest.intro.${quest.id}`;

  S.set(player, "dialogtext", sceneId);
  //S.set(player, "npc_name", "be.npc.blacksmith.name");

  /////// WORK-IN-PROGRESS //////
  S.set(player, "student_buttons_collection", [
    {
      student_buttons_text: "Yes, I’ll help you.",
      student_button_visible: true,
    },
    { student_buttons_text: "No thanks.", student_button_visible: true },
  ]);

  S.set(player, "student_button_grid_dimensions", [2, 1]);

  const dimension = player.dimension;
  const location = player.location;

  let npc;

  try {
    // Spawn the NPC immediately
    const npc = dimension.spawnEntity("be:dialogue_proxy", location);
    npc.nameTag = "dialogue_proxy";
    npc.runCommand("effect @s invisibility 99999 1 true");

    // Run /dialogue open after 1 tick to allow S.set() to commit
    system.runTimeout(() => {
      try {
        player.runCommand(
          `dialogue open @e[name=dialogue_proxy,c=1,r=2] @s ${dialogueSceneId}`
        );
      } catch (e) {
        console.warn(`[QuestUIRouter] Failed to run dialogue command:`, e);
      }

      // Despawn the NPC a bit later to ensure UI loads
      system.runTimeout(() => {
        //npc.kill();
        npc.remove();
        //npc.triggerEvent("despawn");
      }, 200);
    }, 5);
  } catch (e) {
    console.warn("[QuestUIRouter] Failed to open dialogue screen:", e);
  }
}

export function getQuestDialogueIdForEntity(player, entity) {
  const quests = QuestManager.getActiveQuests(player);

  for (const quest of quests) {
    const stageDialogues = quest.dialogue?.stage?.[quest.stage] ?? [];
    for (const entry of stageDialogues) {
      if (entry.npc === entity.typeId) {
        return entry.id;
      }
    }
  }
  return null;
}
