import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { S } from "../../systems/core/SettingsSystem.js";

/**
 * Displays a UI form allowing the player to toggle quest-related preferences.
 */
export function showQuestSettingsUI(player) {
  const isActionbarEnabled = S.get(player, "questActionbar") ?? true;

  system.run(() => {
    try {
      const form = new ActionFormData()
        .title("Quest Settings")
        .body("Toggle your preferences below:")
        .button(`Action Bar: ${isActionbarEnabled ? "✅ On" : "❌ Off"}`);

      form.show(player).then((response) => {
        if (response.canceled) return;

        const newValue = !isActionbarEnabled;
        S.set(player, "questActionbar", newValue);

        player.sendMessage(
          `§e[Quest] Action Bar is now ${newValue ? "§aenabled" : "§cdisabled"}§r.`
        );
      });
    } catch (err) {
      console.warn("[QuestSettingsUI] Failed to show form:", err);
    }
  });
}
