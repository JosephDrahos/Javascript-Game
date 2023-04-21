# Javascript-Game
2D JS Game

Game: You are the blue square and your weapon is the yellow diamond. Your weapon 	will initially move in an infinity symbol and can be tactically swapped with a circle. Red squares, diamonds and hexagons (enemies) are trying to touch you and take your lives away. Your weapon will kill the enemies in one shot and you have 5 lives. You are trying to live for as long as possible and your best time will be saved as the goal to beat.

Controls: W - move up
		  A - move left
		  S - move down
		  D - move right
		  Spacebar - increase the speed of your weapon while holding space
		  Left-Shift - change the shape your weapon rotates in
		  Restart Button - will restart the game at any point (during or postmordem). Your current time will not save as a new best on restart
		  Music Controls - you can play some game music by pressing the play button on the song control UI underneath the game window



How it works:

Movement:
	Player movement takes in the key press events and updates an array of all keycodes. If the key is held down the cooresponding keycode array index is set to true. If the key is lifted -> false. An update keys function is run every millisecond to check the state of which keys are pressed and to update the player velocity or modifiers accordingly. 

	Enemy movement is based on player position and each enemies current position. Each enemy creates finds the distance between itself and the player and then reduces this distance by a velocity specific to each enemy type

	Enemy type 1 (square): moves similar speed to the player
	type 2 (diamond): moves faster than player
	type 3 (hexagon): moves slower than player


Weapon:
	The user weapon is initially set to the figure 8 (infinity) pattern. This is done by a figure 8 parametric equation based on player position and an increasing angle theta. The shift key alternates the weapon to a circular pattern which also uses the value theta. The spacebar increase the change in theta by 1.5 when it is held

Collision:
	Each enemy checks if they are within the players hurt box which is slightly smaller than the players visible blue box (balancing). If they are within this distance the player takes damage (life --) and is invincible for 2 seconds and their movement speed is 1.5 for the duration of invicibility.

	Each enemy also checks their distance to the weapon in a similar fashion and if they are within the kill distance the enemy frees its memory for more important things

Enemy Spawning:
	Enemies will spawn in at increasingly frequent intervals from 0-15, 15-30, and 30+ seconds. They will also spawn randomly at least two player widths away from the player. Each enemy is given its own gl buffer, shader program, and position to be drawn every frame it is alive. The render function loops through the list of enemies and calls each ones unique buffer and program to be drawn to the screen.

Game End/Restart:
	The game will end when the players lives reach 0. The game timer will stop and enemies will stop spawing. The Restart Game button refreshed player lives, enemy array, and the game timer to play another round

Music Control Box:
	The game was a little lifeless without sound so I added the option to play a song while playing. The mp3 file (song.mp3) found within the source folder is the one that will be played.

CSS:
	A css file is used to make the tab look a little nicer and centered.
