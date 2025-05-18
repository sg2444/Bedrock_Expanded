## Notes
 
- Interesting themes in other quests. More linked to vanilla minecraft. How do we use? Heading to nether etc.
- Should we have a compass item that directs to known locations. Such as glimmerroot cave etc.
- Can this compass find naturually spawned locations such as a mine? Can we place an item in one of the chests?


- Jigsaw can spawn a town?
- Jigsaw dungeons can spawn with structure blocks. These run scripts that check when player is near and mark it as a certain dungeon based on progression? First one found can be basic dungeon mobs etc, the more found the harder it is?



## Quest Notes

 - No travelling to the nether?



## Quest Design notes

- Base quest defines below
    - id
    - name
    - description
    - type (main, faction, side, test)
    - stage = 0
    - objectives
    - currentObjectiveIndex = 0
    - dialogue {intro=null, stage{}, complete=null}
- Stageable Quest extends
    - id, name, description, type and stage = 0. Is this necessary given its an 

- Objective
    - id
    - questId
    - IsOptional = false
    - timeLimit = null
    - trackingTags=[]
    - getDescription
    - getActionbar
    - getProgressText
    - onStart
    - OnInteract
    - onFail