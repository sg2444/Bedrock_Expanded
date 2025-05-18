import { ScriptEventRouter } from "../../systems/ScriptEventRouter.js";
import { QuestManager } from "./QuestManager.js";
import { CooldownSystem } from "../../systems/CooldownSystem.js";
import { S } from "../../systems/core/SettingsSystem.js";

// Handle startquest:<id|all|help>
ScriptEventRouter.register("startquest", ({ player, arg }) => {
  if (arg === "all") {
    const all = QuestManager.listAvailableQuests();
    for (const id of all) {
      try {
        //QuestManager.assignQuestById(player, id, { showIntro: false });
        QuestManager.assignQuestById(player, id, false);
      } catch (e) {
        console.warn(`[startquest:all] Failed to assign ${id}:`, e);
      }
    }
  } else {
    try {
      const success = QuestManager.assignQuestById(player, arg);
      if (success) {
        player.sendMessage(`§7[Quests] Started quest: §f${arg}`);
      }
    } catch (e) {
      player.sendMessage(`§c[Quests] Failed to start quest: ${arg}`);
      console.warn(`[startquest:${arg}] Failed:`, e);
    }
  }
});

// Handle quests:<command>|<optional_id>
ScriptEventRouter.register("quests", ({ player, arg }) => {
  //const [command, questId] = arg.split(".");
  const parts = arg?.split(".");
  const command = parts[0];

  switch (command) {
    case "show": {
      QuestManager.showAllQuestsTitle?.(player);
      break;
    }

    case "list": {
      QuestManager.listAvailableQuests?.(player);
      break;
    }

    case "completeobj": {
      const questId = parts[1];
      const index = parseInt(parts[2]);

      if (!questId || isNaN(index)) {
        player.sendMessage(
          "§c[Quests] Usage: quests:completeobj.<questId>.<objectiveIndex>"
        );
        break;
      }

      const quest = QuestManager.getActiveQuests(player).find(
        (q) => q.id === questId
      );

      if (!quest) {
        player.sendMessage(`§c[Quests] No active quest: ${questId}`);
        break;
      }

      const obj = quest.objectives?.[index];
      if (!obj) {
        player.sendMessage(
          `§c[Quests] Objective ${index} not found in ${questId}`
        );
        break;
      }

      if (typeof obj.forceComplete === "function") {
        obj.forceComplete(player);
      } else if (typeof obj.isCompleted === "function") {
        obj.isCompleted = () => true;
      }

      player.sendMessage(`§a[Quests] Objective ${index} marked complete.`);
      quest.advanceToNextObjective(player);
      break;
    }

    case "advance": {
      const questId = parts[1];
      const quest = QuestManager.getActiveQuests(player).find(
        (q) => q.id === questId
      );
      if (!quest) {
        player.sendMessage(
          `§c[Quests] Quest '${questId}' is not currently active.`
        );
        return;
      }
      const obj = quest?.getCurrentObjective?.(player);
      if (!obj) {
        player.sendMessage(
          `§c[Quests] No current objective found for '${questId}'.`
        );
        return;
      }
      if (obj?.forceComplete) obj.forceComplete(player);
      else if (typeof obj?.isCompleted === "function")
        obj.isCompleted = () => true;

      quest.advanceToNextObjective(player);
      player.sendMessage(
        `§a[Quests] Advanced '${questId}' to stage ${quest.stage}.`
      );
      break;
    }

    case "reset": {
      const active = QuestManager.getActiveQuests(player);
      for (const quest of active) {
        QuestManager.removeQuest(player, quest);
      }

      S.set(player, "activeQuests", []);

      player.sendMessage("§c[Quests] All active quests removed.");
      break;
    }

    case "cooldowns": {
      CooldownSystem.cleanupExpired(player);

      const now = Date.now();
      const keys = S.list(player).filter((k) => k.startsWith("cd."));
      if (!keys.length) {
        player.sendMessage("§7[Quests] No cooldowns currently active.");
        return;
      }

      player.sendMessage("§e[Cooldowns] Active timers:");
      for (const key of keys) {
        const expires = S.get(player, key);

        if (typeof expires === "number" && now < expires) {
          const remaining = Math.ceil((expires - now) / 1000);
          const label = key.replace(/^cd\./, "").replace(/\./g, "/");
          player.sendMessage(`§f• ${label}: §7${formatDuration(remaining)}`);
        }
      }
      break;
    }

    case "resetcooldown": {
      const questId = parts[1];
      if (!questId) {
        player.sendMessage(
          "§c[Quests] Please provide a quest ID to reset cooldown."
        );
        break;
      }

      const cooldownKey = `cd.quests.${questId}`;
      S.set(player, cooldownKey, undefined);
      player.sendMessage(`§a[Quests] Cooldown reset for quest: §f${questId}`);
      break;
    }

    case "debug": {
      const quests = QuestManager.getActiveQuests(player);
      if (!quests.length) {
        player.sendMessage("§7[Quests] You have no active quests.");
        return;
      }

      player.sendMessage("§e[Quest Debug Output]");
      for (const quest of quests) {
        const type = quest.type ?? "unknown";
        const title = quest.name ?? "Unnamed";
        const id = quest.id ?? "no_id";
        const stage =
          typeof quest.stage === "number" ? ` (stage ${quest.stage})` : "";
        const objectives = quest.objectives ?? [];

        player.sendMessage(
          `§6• [${type.toUpperCase()}] ${title} §8[id=${id}]${stage}`
        );

        if (!objectives.length) {
          player.sendMessage("   §8(no objectives found)");
          continue;
        }

        for (const obj of objectives) {
          const objType = obj?.constructor?.name ?? "Unknown";
          const hasDesc = typeof obj.getDescription === "function";
          const tags = obj.trackingTags?.join(", ") ?? "none";
          player.sendMessage(
            `   §7- §f${objType} §8(desc=${hasDesc}, tags=${tags})`
          );
        }
      }

      player.sendMessage(`§7[Total Active Quests]: ${quests.length}`);
      break;
    }

    case "complete": {
      const questId = parts[1];
      if (!questId) {
        player.sendMessage(
          "§c[Quests] Please provide a quest ID to force complete."
        );
        break;
      }

      const active = QuestManager.getActiveQuests(player);
      const quest = active.find((q) => q.id === questId);

      if (!quest) {
        player.sendMessage(`§c[Quests] No active quest with id: ${questId}`);
        break;
      }

      for (const obj of quest.objectives) {
        if (typeof obj.isCompleted === "function") {
          obj.isCompleted = () => true;
        }
      }

      // Now force advance until onComplete is triggered
      while (!quest.isCompleted()) {
        quest.advanceToNextObjective(player);
      }

      // Ensure onComplete is called if not already triggered
      if (quest.isCompleted()) {
        quest.onComplete?.(player);
        QuestManager.completeQuest(player, quest);
      }

      player.sendMessage(`§7[Quests] Force-completed: §f${quest.name}`);
      break;
    }

    case "clear": {
      S.remove(player, "activeQuests");
      player.sendMessage("§c[Quests] Cleared activeQuests property.");
      break;
    }

    default:
      player.sendMessage(`§7[Quests] Unknown subcommand: ${arg}`);
  }
});

// props:<command>
ScriptEventRouter.register("props", ({ player, arg }) => {
  switch (arg) {
    case "list": {
      const props = S.list(player);
      if (!props.length) {
        player.sendMessage("§8[Props] No dynamic properties found.");
        return;
      }

      player.sendMessage("§e[Dynamic Properties]");
      for (const key of props) {
        const val = S.get(player, key);
        player.sendMessage(`- ${key}: ${val} [type: ${typeof val}]`);

        player.sendMessage(`§7- §f${key}: §8${JSON.stringify(val)}`);
      }

      player.sendMessage(`§7[Total Properties]: ${props.length}`);
      break;
    }

    default:
      player.sendMessage(`§c[Props] Unknown argument: ${arg}`);
      break;
  }
});

ScriptEventRouter.register("monolith", ({ player, arg }) => {
  switch (arg) {
    case "register_here": {
      console.warn("test1");
      const blockBelow = player.dimension.getBlock(
        player.location.offset(0, -1, 0)
      );
      if (blockBelow?.typeId === "be:monolith_eye") {
        const pos = blockBelow.location;
        console.warn("test2");
        world.setDynamicProperty("monolithLocation", JSON.stringify(pos));
        player.sendMessage(
          `§6[Monolith] Registered at ${Math.floor(pos.x)}, ${Math.floor(
            pos.y
          )}, ${Math.floor(pos.z)}`
        );
      } else {
        player.sendMessage(
          "§c[Monolith] Stand on the monolith_eye block to register its position."
        );
      }
      break; // ← This was missing
    }

    default:
      player.sendMessage(`§c[monolith] Unknown argument: ${arg}`);
      break;
  }
});
