import { EventBus } from "./core/EventBus.js";
import { QuestManager } from "../quests/systems/QuestManager.js";

function safeCall(objective, method, ...args) {
  try {
    if (!objective || typeof objective !== "object") return;
    const fn = objective[method];
    if (typeof fn === "function") {
      fn.apply(objective, args);
    }
  } catch (err) {
    console.warn(`[ObjectiveEventBridge] ${method} error:`, err);
  }
}

function filterObjectives(player, tag) {
  return QuestManager.getActiveObjectives(player).filter(obj =>
    obj?.trackingTags?.includes(tag)
  );
}

// Handle item collection
EventBus.on("itemUsed", ({ player, itemStack }) => {
  for (const obj of filterObjectives(player, "itemUsed")) {
    safeCall(obj, "onItemCollected", player, itemStack);
  }
});

// Handle entity interaction
EventBus.on("playerHitEntity", ({player, target }) => {
  for (const obj of filterObjectives(player, "entityInteract")) {
    safeCall(obj, "onEntityInteract", player, target );
  }
});

// Handle dimension entry
EventBus.on("playerEnteredDimension", ({player, dimensionId}) => {
  for (const obj of filterObjectives(player, "dimensionEnter")) {
    safeCall(obj, "onDimensionEnter", player, dimensionId);
  }
});

EventBus.on("playerTick", ({ player }) => {
  for (const obj of filterObjectives(player, "playerTick")) {
    safeCall(obj, "onPlayerTick", player);
  }
});

