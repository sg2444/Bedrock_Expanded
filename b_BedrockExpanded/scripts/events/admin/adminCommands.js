import { ScriptEventRouter } from "../../systems/ScriptEventRouter.js";
import { QuestManager } from "../../quests/systems/QuestManager.js";
import { CooldownSystem } from "../../systems/CooldownSystem.js";

function isOp(player) {
  return player.hasTag?.("admin") || player.nameTag === "SeaDog"; // customize as needed
}

// Admin command: force complete a quest
ScriptEventRouter.register("admin.complete", ({ player, arg }) => {
  if (!isOp(player)) {
    player.sendMessage("§c[Admin] You are not authorized.");
    return;
  }

  const quest = QuestManager.getActiveQuests(player).find(q => q.id === arg || q.name === arg);
  if (!quest) {
    player.sendMessage(`§c[Admin] Quest "${arg}" not found or inactive.`);
    return;
  }

  quest.onComplete?.(player);
  QuestManager.removeQuest(player, quest);
  player.sendMessage(`§a[Admin] Quest "${quest.name}" forcibly completed.`);
});

// Admin command: teleport to a location/NPC tag
ScriptEventRouter.register("admin.tp", ({ player, arg }) => {
  if (!isOp(player)) return player.sendMessage("§c[Admin] You are not authorized.");
  if (!arg) return player.sendMessage("§c[Admin] Missing teleport target.");

  try {
    player.runCommandAsync(`tp @s @e[tag=${arg},limit=1]`);
    player.sendMessage(`§a[Admin] Teleported to "${arg}"`);
  } catch (e) {
    player.sendMessage(`§c[Admin] Teleport failed.`);
  }
});

// Admin command: reset specific cooldown
ScriptEventRouter.register("admin.cdreset", ({ player, arg }) => {
  if (!isOp(player)) return player.sendMessage("§c[Admin] You are not authorized.");
  CooldownSystem.clear(player, arg);
  player.sendMessage(`§7[Admin] Cooldown "${arg}" cleared.`);
});

// Admin command: list internal quests
ScriptEventRouter.register("admin.quests", ({ player }) => {
  if (!isOp(player)) return player.sendMessage("§c[Admin] You are not authorized.");
  const active = QuestManager.getActiveQuests(player);
  if (!active.length) return player.sendMessage("§7[Admin] No active quests.");

  player.sendMessage("§d[Admin] Active Quests:");
  for (const quest of active) {
    player.sendMessage(`§f• ${quest.name} §7(id: ${quest.id ?? "unknown"})`);
  }
});
