import { dailyQuests } from "./types/daily/_registry.js";
import { mainQuests } from "./types/main/_registry.js";
import { sideQuests } from "./types/side/_registry.js";
import { testQuests } from "./types/test/_registry.js";

export const RegisteredQuests = [
  ...dailyQuests,
  ...mainQuests,
  ...sideQuests,
  ...testQuests,
];