import { world } from "@minecraft/server";
import { S } from "../systems/core/SettingsSystem.js";

const STRUCTURE_ID = "mystructure:monolith";
const FLAG = "monolithSpawned";

export function trySpawnMonolith(player) {
    console.warn('Trying to spawn monolith')
  if (S.get(world, FLAG)) return;

  const pos = findGoodSpawnLocation(player.location, 32, 5);
  if (!pos) {
    console.warn("[Monolith] No valid location found.");
    return;
  }

  clearAreaForStructure(pos, 5);

  world.getDimension("overworld").runCommand(
    `structure load ${STRUCTURE_ID} ${Math.floor(pos.x)} ${Math.floor(pos.y)} ${Math.floor(pos.z)}`
  );

  S.set(world, FLAG, true);
  S.set(world, "monolithLocation", pos);

  // Optional: magic particles
  for (let i = 0; i < 20; i++) {
    world.getDimension("overworld").spawnParticle("minecraft:enchanting_table", {
      x: pos.x + Math.random() * 4 - 2,
      y: pos.y + 2,
      z: pos.z + Math.random() * 4 - 2
    });
  }
}

export function findGoodSpawnLocation(origin, maxRadius = 32, size = 5) {
  const dim = world.getDimension("overworld");
  const unsafeBlocks = ["minecraft:water", "minecraft:lava", "minecraft:leaves"];

  for (let r = 4; r <= maxRadius; r += 4) {
    for (let dx = -r; dx <= r; dx += 2) {
      for (let dz = -r; dz <= r; dz += 2) {
        const x = Math.floor(origin.x + dx);
        const z = Math.floor(origin.z + dz);
        const y = getTopSolidYAt(dim, x, z);

        if (!isAreaFlatAndClear(x, y, z, dim, size)) continue;

        const groundBlock = dim.getBlock({ x, y: y - 1, z });
        if (!groundBlock || unsafeBlocks.includes(groundBlock.typeId)) continue;

        return { x, y, z };
      }
    }
  }

  return null; // fallback could go here
}

export function isAreaFlatAndClear(cx, cy, cz, dim, size) {
  for (let dx = -size; dx <= size; dx++) {
    for (let dz = -size; dz <= size; dz++) {
      const x = cx + dx;
      const z = cz + dz;
      const y = getTopSolidYAt(dim, x, z);
      if (Math.abs(y - cy) > 1) return false;
      for (let i = 0; i < 5; i++) {
        const above = dim.getBlock({ x, y: y + i, z });
        if (above?.typeId !== "minecraft:air") return false;
      }
    }
  }
  return true;
}

export function clearAreaForStructure(pos, radius = 5) {
  const dim = world.getDimension("overworld");
  const clearables = ["minecraft:leaves", "minecraft:log", "minecraft:bamboo", "minecraft:grass"];

  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = 0; dy <= 10; dy++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const block = dim.getBlock({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz });
        if (!block) continue;
        if (clearables.some(type => block.typeId.includes(type))) {
          dim.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air`);
        }
      }
    }
  }
}


export function getTopSolidYAt(dim, x, z, yMax = 128, yMin = 48) {
  for (let y = yMax; y >= yMin; y--) {
    const block = dim.getBlock({ x, y, z });
    if (!block) continue;

    const id = block.typeId;
    if (
      id !== "minecraft:air" &&
      id !== "minecraft:cave_air" &&
      id !== "minecraft:void_air"
    ) {
      return y;
    }
  }
  return yMin;
}
