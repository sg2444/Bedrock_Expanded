import {EventBus} from "../core/EventBus.js"

/**
 * Interprets Item usage for gameplay intent
 * Emits events as required (eg. opening UI)
 */

EventBus.on("itemUsed", ({ player, itemStack }) => {
    if (!player || typeof player.typeId !== "string" || !itemStack) {
      console.warn("[DEBUG] invalid player or itemStack", player?.name);
      return;
    }
  
    const itemId = itemStack?.typeId;
  
    if (itemId === "minecraft:book") {
      EventBus.emit("open_journal", { player });
      return;
    }

    //Trigger Quest journal UI
    if (itemId === "minecraft:compass") {
        EventBus.emit("open_questsettings", {player});
        return;
    }

    //Example skill
    //if (itemId === "minecraft:blaze_rod") {
    //    EventBus.emit("activate_skill", {player, skillId: "flameburst"});
    //    return;
    //}

})