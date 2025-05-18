import { world } from "@minecraft/server";
import { S } from "../systems/core/SettingsSystem.js";

world.afterEvents.playerTick.subscribe(({ player }) => {
  const raw = world.getDynamicProperty("monolithLocation");
  if (!raw) return;

  const { x, y, z } = JSON.parse(raw);
  const dx = player.location.x - x;
  const dy = player.location.y - y;
  const dz = player.location.z - z;
  const distSq = dx * dx + dy * dy + dz * dz;

  if (distSq > 64) return; // out of range

  const questStage = S.get(player, "awakeningQuestStage");

  if (!questStage || questStage === "unstarted") {
    // Attract player: magical glow
    player.runCommandAsync(`particle soul ${x + 0.5} ${y + 1.3} ${z + 0.5} 0.1 0.1 0.1 0.01 1`);
    player.runCommandAsync(`particle endRod ${x + 0.5} ${y + 2.0} ${z + 0.5} 0.1 0.1 0.1 0.01 2`);
  } else if (questStage === "stage1" || questStage === "active") {
    // Stronger magical activity
    player.runCommandAsync(`particle portal ${x + 0.5} ${y + 2.2} ${z + 0.5} 0.1 0.2 0.1 0.01 4`);
  } else if (questStage === "complete") {
    // Completed — residual power
    if (Math.random() < 0.05) {
      player.runCommandAsync(`particle dragon_breath ${x + 0.5} ${y + 1.8} ${z + 0.5} 0.1 0.1 0.1 0.02 1`);
    }
  }
});