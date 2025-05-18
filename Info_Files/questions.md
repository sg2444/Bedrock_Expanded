## Questions
 
 - Dialogue isn't passed back to BaseQuest. That means we can't have getDialogue in BaseQuest and it work. Do we need this?
 - EntityKillObjective defines trackingTags differently to ItemCollection and Dimension (this.trackingKey)
 - ItemCollection deserialize doesn't include progress but I think it's needed. Same with DimenionEntry and EntityInteraction, EntityKill
 - DimensionEntry has completed in serialize. Needed?
 - If we maintain dialogue in JS can we still use the npcinteract screen? Does this have benefits?

 ## MQ01 
 - Summary mentioned peaceful clearing, let's rewrite for vanilla minecraft. Should this check the biome? What is the summary meant for? What should be the description at each stage?
- Summary needs to be displayed on initial player spawn.
 - Create a check for player walking near monolith
 - Create an on interact check for touching the glyph - perhaps a popup that shows touch as you right click. Or is it proximity?
- How do we direct to the village? There was a particles thing on disord.
- Tattered guidebook? Or should Kaelin give it to them?
 - Can we know where the nearest village is on world spawn?