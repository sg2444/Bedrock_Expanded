// DialogueManager.js

import { system } from "@minecraft/server";
import { S } from "../core/SettingsSystem.js";

export const DialogueManagerWorking = {
  _activePlayer: null,

  /**
   * Queues a player as the next dialogue initiator
   * Called when scriptevent is triggered on the player
   */
  queueFor(player) {
    if (!player || player.typeId !== "minecraft:player") return;
    DialogueManagerWorking._activePlayer = player;
  },

  /**
   * Triggers the dialogue from the NPC entity
   * Called when scriptevent is triggered on the NPC
   */
  triggerOn(npc, sceneId = "quest.intro.fetch_apples") {
    const player = DialogueManagerWorking._activePlayer;
    if (!player || player.typeId !== "minecraft:player") return;
    if (!npc || !npc.typeId) return;

    // Example dynamic setup (replace as needed)
    S.set(player, "dialogtext", "npc.fetch_apples");
    S.set(player, "student_buttons_collection", [
      {
        student_buttons_text: "Yes, I’ll help you.",
        student_button_visible: true,
      },
      { student_buttons_text: "No thanks.", student_button_visible: true },
    ]);
    S.set(player, "student_button_grid_dimensions", [2, 1]);

    const pos = {
      x: Math.floor(npc.location.x),
      y: Math.floor(npc.location.y),
      z: Math.floor(npc.location.z),
    };
    const npcSelector = `@e[type=${npc.typeId},x=${pos.x},y=${pos.y},z=${pos.z},r=2,c=1]`;

    system.runTimeout(() => {
      try {
        player.runCommand(`dialogue open ${npcSelector} @s ${sceneId}`);
      } catch (e) {
        console.warn("[DialogueManagerWorking] Failed to open dialogue:", e);
      }
      DialogueManagerWorking._activePlayer = null;
    }, 2);
  },
};
