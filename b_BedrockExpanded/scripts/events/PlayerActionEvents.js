import { world } from "@minecraft/server";
import { EventBus } from "../systems/core/EventBus.js";

world.beforeEvents.itemUse.subscribe((event) => {
  const { source: player, itemStack } = event;
  if (!player?.typeId || !itemStack) return;
  //EventBus.emit("itemUsed", { player, itemStack });
  EventBus.emit("itemUsed", {
    player: player,
    itemStack: itemStack
  });
});

world.afterEvents.playerInteractWithEntity.subscribe(event => {
  const { player, target } = event;
  if (!player?.typeId || !target?.typeId) return;

  EventBus.emit("playerHitEntity", { player, target });
});
