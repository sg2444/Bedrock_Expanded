import { system, world } from "@minecraft/server";
import { EventBus } from "./core/EventBus.js";

// How often to emit playerTick (in ticks). 1 = every tick, 5 = every 0.25s
const TICK_INTERVAL = 5;

let tickCount = 0;

system.runInterval(() => {
  tickCount++;
  if (tickCount % TICK_INTERVAL !== 0) return;

  for (const player of world.getAllPlayers()) {
    EventBus.emit("playerTick", { player });
  }
}, 1); // Run this check every tick
