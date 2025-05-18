// DialogueManager.js
import { world } from "@minecraft/server";
import * as S from "../systems/SettingsSystem.js"; // Dynamic properties

export class DialogueManager {
  static dialogues = {};

  static loadDialogue(id, data) {
    this.dialogues[id] = data;
  }

  static startDialogue(player, id) {
    const dialogue = this.dialogues[id];
    if (!dialogue) return;

    // Check flags
    const hasFlags = (dialogue.flags_required || []).every(flag => S.get(player, flag));
    if (!hasFlags) {
      player.sendMessage("You don't meet the conditions to speak with this NPC.");
      return;
    }

    this.runNode(player, dialogue, "start");
  }

  static runNode(player, dialogue, nodeId) {
    const node = dialogue.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Send NPC line
    player.sendMessage(`§l${dialogue.npc}:§r ${node.npcLine}`);

    // Handle commands
    if (node.commands) {
      for (const cmd of node.commands) {
        player.runCommandAsync(cmd);
      }
    }

    // Handle flag setting
    if (node.set_flags) {
      for (const flag of node.set_flags) {
        S.set(player, flag, true);
      }
    }

    if (node.end) return;

    // Send response options
    node.responses.forEach((r, i) => {
      player.sendMessage(`§e[${i + 1}]§r ${r.text}`);
    });

    // Store state so we can continue on input
    S.set(player, "currentDialogueId", dialogue.id);
    S.set(player, "currentNodeId", node.id);
  }

  static handleResponse(player, choiceIndex) {
    const id = S.get(player, "currentDialogueId");
    const nodeId = S.get(player, "currentNodeId");
    const dialogue = this.dialogues[id];
    if (!dialogue) return;

    const node = dialogue.nodes.find(n => n.id === nodeId);
    if (!node || !node.responses || !node.responses[choiceIndex]) return;

    const next = node.responses[choiceIndex].next;
    if (next) {
      this.runNode(player, dialogue, next);
    }
  }
}
