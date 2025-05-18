Minecraft Dialogue Engine Integration Guide
==========================================

This package contains all the files required to implement a modular, scriptable dialogue system in Minecraft Bedrock Edition.

FILES INCLUDED
--------------

1. dialogue_gerren_intro.json
   - Example dialogue tree for Gerren the Blacksmith.

2. DialogueManager.js
   - JavaScript manager for loading and progressing dialogue trees, setting flags, and triggering events.

3. client_ui.json
   - Basic 2-option dialogue screen UI layout (un-styled).

4. client_ui_styled.json
   - Styled UI version with support for 4 response buttons and background panels.

USAGE & PLACEMENT
-----------------

Place the files in the following directories in your Minecraft behavior/resource packs:

1. dialogue_gerren_intro.json
   - Location: `scripts/dialogue/`
   - Used as a data definition. You can load this file via your initialization script into DialogueManager.

2. DialogueManager.js
   - Location: `scripts/systems/` or similar.
   - Used in your main.js or event setup to initialize and manage dialogue.
   - Make sure to import and register this manager in your main entry point.

3. client_ui.json / client_ui_styled.json
   - Location: `resource_packs/your_pack/ui/`
   - These are part of your UI definition files and should be referenced in your `client.ui.json` or invoked via `/dialogue open` or custom command logic.

4. Script Events (Optional)
   - Make sure to map script events like `dialogue.response_0` through `dialogue.response_3` in your ScriptEventRouter.js.
   - These should route to `DialogueManager.handleResponse(player, index)` with the appropriate index.

Remember to use `SettingsSystem` to track player state (e.g. flags like MQ01_Completed).

CONTACT
-------
Upload this zip back into ChatGPT for context in future sessions.

