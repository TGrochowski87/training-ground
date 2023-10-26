# Ways of teaching

### Split the entire teaching process to stages

1. Learn getting to me in a single place
2. Learn chasing me
3. Learn avoiding bullets
4. Learn shooting me
5. Save neural nets between stages, do not start form scratch every time


### Two states - explore and engage

If they don't see me, they will be in exploring state. They will have more fitness the more area they cover exploring

How I see it now, is that by default they will be in exploring state, but when they notice the player, they will change their weights to the second matrix, dedicated for killing.

Teaching process:
  - Teach one neural network for tunning around between distant points
  - Prepare a new training ground where every enemy in population will have its own player to shoot down
  - Tech the second neural network to shoot
  - Switch between matrices depending on sensors' readings


### Single teaching sequence

They would run around just like in first phase of the option above, but if they see me, they get a new input and get points for shooting me.
I may be behind 3 walls: left, top and right


# Other

1. It may be a good idea to remove input neurons indicating wall detection. They are the only detectable entities beside Player, so this should a binary situation.
2. I should think about giving the enemy a flat boost to fitness instead of a multiplayer to encourage finding and killing the player fast.
3. Sensors should probably be static and not rotate with the enemy it is attached to.