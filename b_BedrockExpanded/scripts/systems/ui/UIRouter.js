import { ScriptEventRouter } from "../ScriptEventRouter.js";
import { DialogueManager } from "./DialogueManager.js";
import { dialogueIndex } from "../../dialogue/dialogueIndex.js";
import { DialogueManagerWorking } from "./DialogueManagerWorking.js";

DialogueManager.loadAllDialogues(dialogueIndex);

ScriptEventRouter.register("dialogue", ({ player, arg, raw }) => {
  if (!player || !arg) return;

  //console.warn("arg:" + arg + " raw:" + raw);
  if (arg === "interact_gerren") {
    if (player.typeId === "minecraft:player") {
      DialogueManagerWorking.queueFor(player);
    } else {
      DialogueManagerWorking.triggerOn(player);
    }
  } else {
    if (player.typeId === "minecraft:player") {
      DialogueManager.queueFor(player);
    } else {
      DialogueManager.triggerOn(player);
    }
  }
});

ScriptEventRouter.register("be:dialogue", ({ player, arg, raw }) => {
  if (!player || !arg) return;

  if (player.typeId === "minecraft:player") {
    DialogueManager.queueFor(player);
  } else {
    DialogueManager.triggerOn(player);
  }
});

export function showScreen(player, screenId) {
  try {
    // Targets an entity of the same type and location as the player
    console.warn("running dialogue");
    player.runCommand(`dialogue open @s @s ${screenId}`);
    console.warn("dialogue run");
  } catch (err) {
    console.warn(`[UIRouter] Failed to open screen '${screenId}':`, err);
  }
}
