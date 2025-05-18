import { QuestManager } from "./QuestManager.js";

export class QuestJournal {
  static async showJournal(player) {
    const activeQuests = QuestManager.getActiveQuests(player);
    if (!activeQuests.length) {
      player.sendMessage("§7[Quest] You have no active quests.");
      return;
    }

    

    const sorted = this.#getSortedQuests(activeQuests);
    player.sendMessage("§e[Quest Journal] §rActive Quests:");

    for (const quest of sorted) {
      const objective = quest.getCurrentObjective?.(player);
      let rawDesc;
      try {
        const rawDesc = await objective?.getDescription?.(player);

      } catch (e) {

      }   

      const name = quest.name ?? "Unnamed Quest";
      const type = quest.type ?? "unknown";
      const label = `[${type.toUpperCase()}]`;
      const color = this.#getTypeColor(type);
      const defaultcolor = this.#getTypeColor('description');


      // ✅ fallback if invalid or empty
      const shouldFallback =
        !rawDesc ||
        (typeof rawDesc !== "string" && (!rawDesc.text || rawDesc.text.trim?.() === ""));

      if (shouldFallback && typeof quest.getDescription === "function") {
        rawDesc = await quest.getDescription?.(player);
      }

      let desc;
      if (typeof rawDesc === "string") {
        desc = rawDesc;
      } else if (typeof rawDesc?.text === "string") {
        desc = rawDesc.text;
      } else if (rawDesc?.text && typeof rawDesc.text === "object") {
        try {
          desc = JSON.stringify(rawDesc.text);
        } catch {
          desc = "(no description)";
        }
      } else {
        desc = "(no description)";
      }
      
     
      const progress = objective?.getProgressText?.(player);
      const progressText = progress ? ` §8(${progress})` : "";

      player.sendMessage(`${color}• ${label} ${name}`);
      player.sendMessage(`${defaultcolor}•  - ${desc}${progressText}`);
    }
  }

  static getJournalText(player) {
    const lines = [];
    const activeQuests = QuestManager.getActiveQuests(player);
    if (!activeQuests.length) {
      lines.push("§7[Quest] You have no active quests.");
      return lines;
    }

    const sorted = this.#getSortedQuests(activeQuests);
    lines.push("§e[Quest Journal] §rActive Quests:");

    for (const quest of sorted) {
      const name = quest.name ?? "Unnamed Quest";
      const type = quest.type ?? "unknown";
      const label = `[${type.toUpperCase()}]`;
      const color = this.#getTypeColor(type);

      const objective = quest.getCurrentObjective?.(player);
      let rawDesc = objective?.getDescription?.();

      const shouldFallback =
        !rawDesc ||
        (typeof rawDesc !== "string" && (!rawDesc.text || rawDesc.text.trim?.() === ""));

      if (shouldFallback && typeof quest.getDescription === "function") {
        rawDesc = quest.getDescription(player);
      }

      let desc;
      if (typeof rawDesc === "string") {
        desc = rawDesc;
      } else if (typeof rawDesc?.text === "string") {
        desc = rawDesc.text;
      } else if (rawDesc?.text && typeof rawDesc.text === "object") {
        try {
          desc = JSON.stringify(rawDesc.text);
        } catch {
          desc = "(no description)";
        }
      } else {
        desc = "(no description)";
      }
      

      const progress = objective?.getProgressText?.(player);
      const progressText = progress ? ` §8(${progress})` : "";

      lines.push(`${color}• ${label} ${name}`);
      lines.push(`§7  - ${desc}${progressText}`);
    }

    return lines;
  }

  static #getTypeColor(type) {
    switch (type) {
      case "main": return "§6";
      case "side": return "§b";
      case "daily": return "§a";
      case "description": return "§7";
      default: return "§7";
    }
  }

  static #getSortedQuests(quests) {
    const typePriority = {
      main: 0,
      side: 1,
      daily: 2,
      test: 99,
      unknown: 999
    };

    return [...quests].sort((a, b) => {
      const wA = typePriority[a.type] ?? 1000;
      const wB = typePriority[b.type] ?? 1000;
      return wA - wB;
    });
  }
}
