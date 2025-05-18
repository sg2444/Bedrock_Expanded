import { ModalFormData } from "@minecraft/server-ui";
import { ScriptEventRouter } from "../../systems/ScriptEventRouter.js";
import { QuestManager } from "../../quests/systems/QuestManager.js";
import { CooldownSystem } from "../../systems/CooldownSystem.js";

function isOp(player) {
  return player.hasTag?.("admin") || player.nameTag === "senorfeliz6620"; // update if needed
}

ScriptEventRouter.register("adminui", async ({ player }) => {
  if (!isOp(player)) {
    player.sendMessage("§c[Admin] You are not authorized.");
    return;
  }

  const active = QuestManager.getActiveQuests(player);
  const options = [
    "Force Complete Quest",
    "Teleport to NPC",
    "Reset Cooldown",
    "List Active Quests",
  ];

  const form = new ModalFormData()
    .title("Admin Tools")
    .dropdown("Action", options, 0)
    .textField("Argument", "(e.g. fetch_apples, blacksmith, quests/daily_forager)", "");

  const res = await form.show(player);
  if (res.canceled) return;

  const [choice, input] = res.formValues;
  const value = input?.trim();

  switch (choice) {
    case 0: // complete
      const quest = active.find(q => q.id === value || q.name === value);
      if (!quest) {
        player.sendMessage(`§cQuest "${value}" not found.`);
        return;
      }
      quest.onComplete?.(player);
      QuestManager.removeQuest(player, quest);
      player.sendMessage(`§a[Admin] Quest "${quest.name}" forcibly completed.`);
      break;

    case 1: // teleport
      try {
        await player.runCommandAsync(`tp @s @e[tag=${value},limit=1]`);
        player.sendMessage(`§a[Admin] Teleported to "${value}".`);
      } catch {
        player.sendMessage("§cTeleport failed.");
      }
      break;

    case 2: // reset cooldown
      CooldownSystem.clear(player, value);
      player.sendMessage(`§7[Admin] Cooldown "${value}" cleared.`);
      break;

    case 3: // list active quests
      if (!active.length) return player.sendMessage("§7No active quests.");
      player.sendMessage("§d[Admin] Active Quests:");
      for (const q of active) {
        player.sendMessage(`§f• ${q.name} §7(id: ${q.id ?? "unknown"})`);
      }
      break;
  }
});
