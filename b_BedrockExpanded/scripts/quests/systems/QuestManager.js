import { S } from "../../systems/core/SettingsSystem.js";
import { BaseQuest } from "../base/BaseQuest.js";
import { CooldownSystem } from "../../systems/CooldownSystem.js";
import { formatDuration } from "../../utils/TimeUtils.js";
import { DialogueManager } from "../../systems/ui/DialogueManager.js";
import { showDialogueIntro } from "./QuestUIRouter.js"; // Adjust path if needed

const RegisteredQuestTypes = new Map();
const activeQuests = new Map();
const autoLoadedPlayers = new Set();

export class QuestManager {
  static registerQuestType(id, questClass) {
    RegisteredQuestTypes.set(id, questClass);
    questClass.questTypeId = id;
  }

  static loadPlayerQuests(player) {
    const stored = S.get(player, "activeQuests");

    if (!stored || typeof stored !== "object") {
      activeQuests.set(player.id, []);
      return;
    }

    const quests = [];

    try {
      const data = Array.isArray(stored) ? stored : JSON.parse(stored);

      for (const q of data) {
        const QuestClass = RegisteredQuestTypes.get(q.id);

        if (!QuestClass) {
          console.warn(`[QuestManager] Unknown quest ID during load: ${q.id}`);
          continue;
        }

        try {
          const quest =
            typeof QuestClass.deserialize === "function"
              ? QuestClass.deserialize(q)
              : new QuestClass();

          if (typeof quest.setStage === "function" && q.stage !== undefined) {
            quest.setStage(q.stage);
          }
          quests.push(quest);
        } catch (err) {
          console.warn(`[QuestManager] Failed to instantiate '${q.id}':`, err);
        }
      }
    } catch (e) {
      console.warn(
        `[QuestManager] Failed to parse quest data during load for ${player.nameTag}:`,
        stored
      );
    }

    activeQuests.set(player.id, []);
    for (const quest of quests) {
      this.assignQuest(player, quest, false, { skipReset: true });
    }
  }

  static getQuestIdForInstance(quest) {
    return (
      (quest.constructor.questTypeId ||
        [...RegisteredQuestTypes.entries()].find(
          ([, cls]) => quest instanceof cls
        )?.[0]) ??
      quest.id
    );
  }

  static assignQuest(
    player,
    quest,
    fromInteraction = false,
    { skipReset = false } = {}
  ) {
    const id = this.getQuestIdForInstance(quest);

    // Prevent duplicate assignments
    const existing = this.getActiveQuests(player);
    if (existing.some((q) => this.getQuestIdForInstance(q) === id)) {
      console.warn(
        `[QuestManager] Quest '${id}' is already active for ${player.nameTag}. Skipping.`
      );
      return;
    }

    if (!activeQuests.has(player.id)) {
      activeQuests.set(player.id, []);
    }

    activeQuests.get(player.id).push(quest);
    if (!skipReset) {
      quest.reset?.(player);
    }

    // ✅ Start action bar if enabled
    if (S.get?.(player, "questActionbar") !== false) {
      quest.startActionbar?.(player);
    }

    if (!fromInteraction && quest.dialogue?.intro?.length > 0) {
      const introEntry = quest.dialogue.intro.find((e) => e.auto);
      if (introEntry?.id) {
        DialogueManager.startDialogue(player, introEntry.id);
      }
    }

    // Only save if this is a fresh assignment (not already loaded from disk)

    if (quest instanceof BaseQuest) {
      QuestManager.savePlayerQuests(player);
      //if (showIntro) {
      //  showDialogueIntro(player, quest); // 👈 trigger dialogue
      //}
    }
  }

  static savePlayerQuests(player) {
    const quests = this.getActiveQuests(player);
    const serialized = [];

    for (const quest of quests) {
      if (typeof quest.serialize !== "function") {
        console.warn(
          `[QuestManager] Quest '${quest.id}' is missing a serialize() method:`,
          typeof quest.serialize
        );
        continue;
      }

      try {
        const data = quest.serialize(player);

        if (Array.isArray(data.objectives)) {
          data.objectives.forEach((obj, i) => {
            if (typeof obj !== "object" || obj === null) {
              console.warn(
                `[QuestManager] Objective ${i} in '${quest.id}' is not an object:`,
                obj
              );
            } else if (typeof obj.type !== "string") {
              console.warn(
                `[QuestManager] Objective ${i} in '${quest.id}' is missing a type:`,
                obj
              );
            }
          });
        }

        serialized.push(data);
      } catch (err) {
        console.warn(
          `[QuestManager] Failed to serialize quest '${quest.id}':`,
          err
        );
      }
    }

    S.set(player, "activeQuests", serialized);
  }

  static assignQuestById(player, id, { showIntro = true } = {}) {
    const QuestClass = RegisteredQuestTypes.get(id);

    if (!QuestClass) {
      console.warn(`[QuestManager] Unrecognized quest ID "${id}"`);
      return false;
    }

    if (typeof QuestClass.canAssign === "function") {
      const canAssign = QuestClass.canAssign(player);
      if (!canAssign) {
        const cooldownKey = `quests/${id}`;
        const remaining = CooldownSystem.getRemaining?.(player, cooldownKey);

        if (typeof remaining === "number" && remaining > 0) {
          const formatted = formatDuration(remaining);
          player.sendMessage(
            `§7[Quest] You can't start this quest again yet. Cooldown: §c${formatted}`
          );
        } else {
          player.sendMessage("§7[Quest] You can't start this quest again yet.");
        }
        return false;
      }
    }

    const questInstance = new QuestClass();
    this.assignQuest(player, questInstance, false);
    //this.assignQuest(player, questInstance, { showIntro });
    return true;
  }

  static completeQuest(player, quest) {
    const id = this.getQuestIdForInstance(quest);
    if (!id) throw new Error("Quest class not registered.");

    const playerQuests = activeQuests.get(player.id) || [];
    activeQuests.set(
      player.id,
      playerQuests.filter((q) => q !== quest)
    );
    quest.stopActionbar?.(player);

    try {
      const stored = S.get(player, "activeQuests");
      if (!stored) return;

      const serialized = quest.serialize(player);
      const remaining = stored.filter(
        (q) => q.id !== id || JSON.stringify(q) !== JSON.stringify(serialized)
      );

      S.set(player, "activeQuests", remaining);
    } catch (e) {
      console.warn(
        `[QuestManager] Failed to complete quest for ${player.nameTag}:`,
        e
      );
    }
  }

  static removeQuest(player, quest) {
    const id = this.getQuestIdForInstance(quest);
    if (!id) return;
    const playerQuests = activeQuests.get(player.id) || [];
    activeQuests.set(
      player.id,
      playerQuests.filter((q) => q !== quest)
    );
    quest.stopActionbar?.(player);

    try {
      //const stored = player.getDynamicProperty("activeQuests");
      const stored = S.get(player, "activeQuests");
      if (!stored) return;
      const questData = stored;
      const serialized = quest.serialize(player);
      const remaining = questData.filter(
        (q) => q.id !== id || JSON.stringify(q) !== JSON.stringify(serialized)
      );

      //player.setDynamicProperty("activeQuests", JSON.stringify(remaining));
      S.set(player, "activeQuests", remaining);
    } catch (e) {
      console.warn(
        `[QuestManager] Failed to remove quest for player ${player.nameTag}:`,
        e
      );
    }
  }

  static updateQuest(player, updatedQuest) {
    const id = this.getQuestIdForInstance(updatedQuest);
    if (!id) throw new Error("Quest class not registered.");

    const serialized = updatedQuest.serialize(player);
    let questData = [];

    try {
      const stored = S.get(player, "activeQuests");
      if (stored) {
        if (typeof stored === "string") {
          questData = JSON.parse(stored);
        } else if (Array.isArray(stored)) {
          questData = stored;
        } else {
          console.warn(
            "[QuestManager] Unexpected quest data type:",
            typeof stored,
            stored
          );
        }
      }
    } catch (err) {
      console.warn(
        `[QuestManager] Failed to parse quest data during update for ${player.nameTag}:`,
        err
      );
    }

    questData = questData.filter((q) => q.id !== id);
    questData.push({ id, ...serialized });

    try {
      S.set(player, "activeQuests", questData);
    } catch (err) {
      console.warn("[QuestManager] Failed to set dynamic property:", err);
    }

    const list = activeQuests.get(player.id) || [];
    const filtered = list.filter(
      (q) => this.getQuestIdForInstance(q) !== id || q !== updatedQuest
    );
    filtered.push(updatedQuest);

    activeQuests.set(player.id, filtered);
  }

  static hasQuest(player, quest) {
    const playerQuests = activeQuests.get(player.id) || [];
    return playerQuests.includes(quest);
  }

  static getActiveQuests(player) {
    if (!player || typeof player !== "object" || !("id" in player)) {
      console.warn(
        "[QuestManager] getActiveQuests called with invalid player:",
        player
      );
      return [];
    }

    if (!activeQuests.has(player.id) && !autoLoadedPlayers.has(player.id)) {
      this.loadPlayerQuests(player);
      autoLoadedPlayers.add(player.id);
    }

    return activeQuests.get(player.id) || [];
  }

  static getActiveObjectives(player) {
    if (!player || typeof player !== "object" || !("id" in player)) {
      console.warn(
        "[QuestManager] getActiveObjectives called with invalid player:",
        player
      );
      return [];
    }

    const quests = this.getActiveQuests(player);
    const objectives = [];

    for (const quest of quests) {
      if (Array.isArray(quest.objectives)) {
        for (const obj of quest.objectives) {
          if (typeof obj === "object") {
            objectives.push(obj);
          }
        }
      }
    }

    return objectives;
  }

  static listAvailableQuests() {
    const entries = [...RegisteredQuestTypes.entries()];
    /* console.warn("=== Available Quests ===");
  for (const [id, questClass] of entries) {
    console.warn(`ID: ${id} | Class: ${questClass.name}`);
  }
 */ return entries.map(([id]) => id);
  }

  static showAllQuestsTitle(player) {
    const quests = this.getActiveQuests(player);
    if (!quests.length) {
      player.runCommand(
        `titleraw @s title {"rawtext":[{"text":"§7No active quests"}]}`
      );
      return;
    }

    const lines = quests.map((q) => `§6• §r${q.name ?? "Unnamed Quest"}`);
    const titleText = lines.join("\\n");
    player.runCommand(
      `titleraw @s title {"rawtext":[{"text":"${titleText}"}]}`
    );
  }

  static resetObjectives(player, questId) {
    const quest = this.getActiveQuests(player).find(
      (q) => q.id === questId || q.questId === questId
    );
    if (!quest) return;

    for (const obj of quest.objectives ?? []) {
      if (typeof obj.reset === "function") {
        obj.reset(player);
      }
    }
  }
}
