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
1. Now that I have introduced a new input node indicating if the player has been spotted, I should probably increase the number of inner nodes, as the value from this one new input node should have potential to change their behavior drastically.
   - I could also switch between two dedicated matrices, but it would be even harder to train properly and I want it to be a single brain

### If there is time left
1. Next target site for exploring should be randomized with fixed seed, so they don't only learn one boring pattern.