import { ActionFormData } from "@minecraft/server-ui";
import { world, system } from "@minecraft/server";

world.beforeEvents.itemUse.subscribe((eventData) => {
  let item = eventData.itemStack;
  let player = eventData.source;
  if (item.typeId == "minecraft:stick") {
    system.run(() => {
      Menu(player); // 👈 only pass player
    });
  }
});

async function Menu(player) {
  let form = new ActionFormData();
  form.title("Action Form");

  const response = await form.show(player); // ✅ use 'player' here

  if (response.selection === 0) {
    // Do something when button 0 is selected
  }
}
