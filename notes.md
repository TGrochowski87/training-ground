# Calculating fitness

### Two states - explore and engage

If they don't see me, they will be in exploring state.
- They will gain more points for fitness the more area they cover exploring
- They will gain linearly more points the closer they get to their next site
  - Seems easier 
  - Generation lifetime should be at least long enough for the AI to be able to visit every site once. Preferably more.

The engage stage is simply the `Single teaching sequence`, but the initial brain should already be trained to scan the area.


### Single teaching sequence

They would run around just like in first phase of the option above, but if they see the player, they get a new input and get points for shooting them.

## Ways for improvement

### Better to be considered early
1. Now that I have introduced a new input node indicating if the player has been spotted, I should probably increase the number of inner (hidden) nodes, as the value from this one new input node should have potential to change their behavior drastically.
   - I could also switch between two dedicated matrices, but it would be even harder to train properly and I want it to be a single brain.

2. I should try providing some identifier of the targeted site to the network. Currently AI can only train for a one generic pattern to reach any of the sites. This would allow them to make different actions based on the targeted site.
   - **The best option seems to be adding a one more input node for every sensor that would indicate the direction of the next site. This should even provide enough information for AI to try and avoid obstacles.**
   - The other option I thought about was to use a simple array index of the site. This would result in 3 more input nodes. This option provides less information to the network and the number of nodes is dependant of the number of sites.

### If there is time left
1. Next target site for exploring should be randomized with fixed seed, so they don't only learn one boring pattern.
2. Implement non-redundant genetic encoding (Thierens, 1996) for conventional neural network to avoid competing conventions.