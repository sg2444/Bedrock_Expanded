import { ItemCollectionObjective } from "./ItemCollectionObjective.js";
import { EntityInteractionObjective } from "./EntityInteractionObjective.js";
import { DimensionEntryObjective } from "./DimensionEntryObjective.js";

export {
  ItemCollectionObjective,
  EntityInteractionObjective,
  DimensionEntryObjective
};

// Optional: central type map for dynamic instantiation
export const ObjectiveFactory = {
  itemCollection: ItemCollectionObjective,
  entityInteraction: EntityInteractionObjective,
  dimensionEntry: DimensionEntryObjective
};
