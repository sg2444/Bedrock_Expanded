import { world } from "@minecraft/server";
import { QuestManager } from "../quests/systems/QuestManager.js";
import { CooldownSystem } from "../systems/CooldownSystem.js";
import { S } from "../systems/core/SettingsSystem.js";
import { EventBus } from "../systems/core/EventBus.js";
import { trySpawnMonolith } from "../monolith/spawn_monolith.js";

// Player spawn logic (1.18+)
world.afterEvents.playerSpawn.subscribe((event, initialSpawn) => {
  const player = event.player;
  if (!player) return;


  CooldownSystem.cleanupExpired(player);
  QuestManager.loadPlayerQuests(player);

  const showActionbar = S.get(player, "questActionbar");
  if (showActionbar !== false) {
    for (const quest of QuestManager.getActiveQuests(player)) {
      quest.startActionbar?.(player);
    }
  }

  if (!initialSpawn) return; // only trigger on very first spawn
  
    trySpawnMonolith(player);

  //const names = QuestManager.getActiveQuests(player).map(q => q.name ?? "Unnamed").join(",");
});

// Player dimension change → EventBus dispatch
world.afterEvents.playerDimensionChange.subscribe((event) => {
  const player = event.player;
  const toDimension = event.to?.id;

  console.warn("[DEBUG] playerDimensionChange triggered:", {
    name: player?.nameTag,
    to: toDimension,
    valid: player?.isValid?.()
  });

  if (!player?.isValid() || !toDimension) return;

  EventBus.emit("playerEnteredDimension", { player, toDimension });
});
