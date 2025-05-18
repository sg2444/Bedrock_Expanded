import { world, system } from "@minecraft/server";

// Core systems

import { ScriptEventRouter } from "./systems/ScriptEventRouter.js";

import "./systems/ObjectiveEventBridge.js"; // Route internal quest events
import "./systems/interpreters/ItemUsedInterpreter.js";
import "./systems/TickSystems.js";

// Initialize script command router
ScriptEventRouter.init();

// Load all available quest definitions
import "./quests/index.js";

// Load all available events
import "./events/index.js";

import "./systems/ui/UIRouter.js"; // among other imports

import "./testing/ActionFormTest.js";
