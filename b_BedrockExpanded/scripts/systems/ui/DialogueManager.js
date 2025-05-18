// DialogueManager.js

import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

import { S } from "../core/SettingsSystem.js";
import { getQuestDialogueIdForEntity } from "../../quests/systems/QuestUIRouter.js";

export const DialogueManager = {
  _activePlayer: null,

  queueFor(player) {
    this._activePlayer = player;
  },

  triggerOn(npc) {
    const player = this._activePlayer;
    if (!player || !npc) return;

    let id = getQuestDialogueIdForEntity(player, npc);

    //Fallback if no quest-related dialogue is found
    if (!id) {
      id = this.getDefaultDialogueIdForEntity(npc);
    }

    if (id) {
      this.startDialogue(player, id);
    } else {
      console.warn(`[DialogueManager] No dialogue found for ${npc.typeId}`);
    }
    this._activePlayer = null;
  },

  loadAllDialogues(index) {
    if (!Array.isArray(index)) return;

    if (!this.dialogues) this.dialogues = {};

    for (const entry of index) {
      if (!entry || !entry.id || !entry.data) {
        console.warn("[DialogueManager] Invalid dialogue entry:", entry);
        continue;
      }

      this.dialogues[entry.id] = entry.data;
    }
  },

  startDialogue(player, id) {
    const dialogue = this.dialogues[id];
    const scene = dialogue?.["minecraft:dialogue"]?.scenes?.start;
    if (!scene) {
      console.warn(
        `[DialogueManager] Missing or invalid dialogue for ID: ${id}`
      );
      return;
    }

    this.showDialogueNode(player, scene);
  },

  showDialogueNode(player, node) {
    const form = new ActionFormData()
      .title(node.npc_name ?? "Dialogue")
      .body(node.text?.join("\n") ?? "");

    (node.buttons ?? []).forEach((btn) => form.button(btn.text));

    form.show(player).then((res) => {
      const selected = node.buttons?.[res.selection];
      if (selected?.commands) {
        selected.commands.forEach((cmd) => {
          player.runCommand(cmd);
        });
      }
    });
  },

  getDefaultDialogueIdForEntity(npc) {
    return this._getRandomDialogueId("default.generic");
  },
  /*   getDefaultDialogueIdForEntity(npc) {
    if (npc.typeId.endsWith("gerren")) return "default.gerren";
    if (npc.hasTag("questgiver")) return "default.questgiver";
    if (npc.hasTag("main_npc")) return "default.main_npc";
    return "default.generic"; // Catch-all fallback
  }, */

  _getRandomDialogueId(prefix) {
    const matches = Object.keys(this.dialogues).filter((id) =>
      id.startsWith(prefix)
    );
    if (matches.length === 0) return null;
    return matches[Math.floor(Math.random() * matches.length)];
  },
};
