import { ObjectiveFactory } from "../objectives/index.js";

export class BaseQuest {
  constructor(objectives = []) {
    this.id = "unnamed";
    this.name = "Unnamed Quest";
    this.description = "No description available.";
    this.type = "main";
    this.stage = 0;
    this.objectives = objectives;
    this.currentObjectiveIndex = 0;
    this.dialogue = {
      intro: null, // e.g. "quest.intro.fetch_apples"
      stage: {}, // e.g. { 1: "quest.stage1.foo", 2: "quest.stage2.foo" }
      complete: null,
    };
  }

  getCurrentObjective() {
    return this.objectives[this.currentObjectiveIndex];
  }

  isCompleted(player) {
    return this.objectives.every((obj) => obj.isCompleted?.(player));
  }

  resetObjectives(player) {
    for (const obj of this.objectives) {
      obj.reset?.(player);
    }
    this.currentObjectiveIndex = 0;
  }

  advanceToNextObjective(player) {
    console.warn("[DEBUG] we got to advancing");

    this.currentObjectiveIndex++;

    const current = this.getCurrentObjective?.();
    console.warn("[DEBUG] current objective:", current);
    console.warn(
      "[DEBUG] typeof getProgressText:",
      typeof current?.getProgressText
    );

    let progress = "";
    if (current && typeof current.getProgressText === "function") {
      progress = current.getProgressText(player);
    }

    if (S.get?.(player, "questActionbar") !== false && progress) {
      player.onScreenDisplay.setActionBar(`§a[Quest] §f${progress}`);
    }

    console.warn(
      "[DEBUG] Advanced to index:",
      this.currentObjectiveIndex,
      "/",
      this.objectives.length
    );

    if (this.isCompleted()) {
      console.warn("[DEBUG] Quest completed, calling onComplete()");
      this.onComplete?.(player);
    }
  }

  completeObjective(player) {
    this.advanceToNextObjective(player);
  }

  startActionbar(player) {
    const text = this.getActionBar(player);
    if (text) {
      player.sendMessage(text); // You may replace with actual actionbar if available
    }
  }

  getActionBar(player) {
    const current = this.getCurrentObjective();
    const progress = current?.getProgressText?.(player);
    return progress ? `§b[${this.name}] ${progress}` : undefined;
  }

  getTitle() {
    return { text: this.name };
  }

  getDescription() {
    return { text: this.description };
  }

  forceComplete(player) {
    this.objectives.forEach((o) => {
      if (typeof o.isCompleted === "function") {
        o.isCompleted = () => true;
      }
    });

    while (!this.isCompleted()) {
      this.advanceToNextObjective(player);
    }
  }

  serialize(player) {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      stage: this.stage,
      currentObjectiveIndex: this.currentObjectiveIndex,
      objectives: this.objectives
        .map((obj) => {
          if (typeof obj.serialize !== "function") {
            console.warn(
              `[ERROR] Objective at index ${index} has no serialize():`,
              obj
            );
          }
          const data = obj.serialize?.(player);
          if (!data || typeof data !== "object" || !data.type) {
            console.warn(
              "[Quest] Skipping invalid objective during serialization:",
              obj
            );
            return null;
          }
          return data;
        })
        .filter(Boolean),
    };
  }

  deserialize(data) {
    this.name = data.name ?? this.name;
    this.id = data.id ?? this.id;
    this.description = data.description ?? this.description;
    this.type = data.type ?? this.type;
    this.stage = data.stage ?? this.stage;
    this.currentObjectiveIndex = data.currentObjectiveIndex ?? 0;

    // ✅ Rebuild class-based objectives
    if (Array.isArray(data.objectives)) {
      this.objectives = data.objectives.map((objData) => {
        const ctor = ObjectiveFactory[objData?.type];
        if (ctor) {
          const instance = new ctor();
          instance.deserialize?.(objData);
          return instance;
        }
        return objData;
      });
    }
  }

  static deserialize(data) {
    const instance = new this();
    instance.deserialize(data);
    return instance;
  }
}
