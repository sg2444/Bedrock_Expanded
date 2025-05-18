import { world } from "@minecraft/server";
import { EventBus } from "../systems/core/EventBus.js";

world.afterEvents.entityDie.subscribe(({deadEntity, damageSource}) => {
    const killer = damageSource.damagingEntity;
    if (killer?.typeId === "minecraft:player") {
        EventBus.emit("entity_killed", {
            type: "entity_killed",
            player: killer,
            victim: deadEntity
        });
    }
});



///below isnt checked
world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
  
    if (!damagingEntity || typeof damagingEntity.typeId !== "string") return;
    if (!hitEntity || typeof hitEntity.typeId !== "string") return;
  
    EventBus.emit("playerHitEntity", {
        player: damagingEntity,
        entity: hitEntity
      });
  });
  