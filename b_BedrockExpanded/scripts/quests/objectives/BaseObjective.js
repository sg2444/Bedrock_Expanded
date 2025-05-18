import { DynamicType } from "../../core/DynamicType.js";
import { QuestManager } from "../systems/QuestManager.js";
import { run, clear } from "../../systems/core/TimerSystem.js";

/**
 * BaseObjective: shared structure for all quest objectives.
 */
export class BaseObjective extends DynamicType {
  constructor({
    id,
    questId,
    isOptional = false,
    timeLimit = null,
    trackingTags = [],
    getDescription,
    getActionbar,
    getProgressText,
    onStart,
    onInteract,
    onFail,
  }) {
    super(id);
    this.id = id;
    this.questId = questId;
    this.isOptional = isOptional;
    this.timeLimit = timeLimit;
    this.trackingTags = trackingTags;

    this.getDescription =
      getDescription?.bind(this) ?? (() => ({ text: "(no description)" }));
    this.getActionbar = getActionbar?.bind(this) ?? (() => null);
    this.getProgressText = getProgressText?.bind(this) ?? (() => null);
    this._onInteract = onInteract?.bind(this);
    this._onStart = onStart?.bind(this);
    this._onFail = onFail?.bind(this);
    this._forceComplete = {};
  }

  /**
   * Triggered when this objective is started.
   */
  onStart(player) {
    this._onStart?.(player);

    if (this.timeLimit) {
      const timerId = `${player.id}.quest.timer.${this.id}`;
      run(
        timerId,
        () => {
          this._onFail?.(player);
          QuestManager.getActiveQuest(player)?.advanceToNextObjective?.(player);
        },
        this.timeLimit,
        false
      );
    }
  }

  /**
   * Triggered when player interacts with the target.
   */
  onInteract(event) {
    const success = this._onInteract?.(event);
    if (!success) return false;

    const { player } = event;
    clear(`${player.id}.quest.timer.${this.id}`);
    QuestManager.getActiveQuest(player)?.advanceToNextObjective?.(player);
    return true;
  }

  isCompleted(player) {
    if (this._forceComplete?.[player.id]) return true;
    return false; // Override this in subclasses
  }

  forceComplete(player) {
    this._forceComplete[player.id] = true;
    this.onComplete?.(player); // Optional hook if needed
  }

  /**
   * Resets objective state for a given player (default: no-op).
   * Subclasses should override.
   */
  reset(_player) {
    // Intentionally left blank
  }

  /**
   * Basic serialization support.
   */
  serialize(player) {
    return {
      type: this.type,
      id: this.id ?? "unnamed",
      progress: this.getProgress?.(player) ?? 0,
      optional: this.isOptional,
      timeLimit: this.timeLimit,
    };
  }

  /**
   * Rehydrates from saved data.
   */
  deserialize(data) {
    this.id = data.id ?? this.id;
    this.questId = data.questId ?? this.questId;
    this.isOptional = data.optional ?? false;
    this.timeLimit = data.timeLimit ?? null;
  }
}
