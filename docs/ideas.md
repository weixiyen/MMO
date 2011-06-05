Combat Mechanics
==========

The "Final Fantasy 11" encounter
------------------
- Each battle lasts about 1-2 minutes (but can last 3)
- fast kills = experience point chains (bonus exp if killing 2 mobs withn 1:30 of eachother)
- MP is typically depleted by end of 6 straight mobs
- A leveling session is divided up into chain sequences
- Each chain sequence lasts about 7-10 minutes
- players take breaks between chains.
- Player Abilities are typically on 30 second -> 5 minute timers
- Within each encounter, melees can build up TP to use weapon skills 
- Weapon skills used in conjunction on 1 mob create skillchains, which do bonus dmg
- Magic users participate in Skillchains for magic bursts (bonus damage)
- The goal of each battle is to create a skillchain to kill the mob (otherwise EXP chain is lost)

Boss encounters (each boss server is unique)
------------------


Map Notes
==========
Use MongoDB's Geospatial Indexing as a way of storing Map Data

Each map is a collection of '2D' geo-spatial indexed items

Each tile is 50px by 50px.  The coordinate of the tile is the upper left point at which it begins.

Each player coordinate translates to 1px on the screen.

Thus, if a player is at coordinate 200,200, they are actually on map tile index 4,4.

We can then query the tile map (client side) for the closest 625 map tiles (25x25) to the player and preload the UI for the player.  Everytime the player moves 200px, we subtract out older tiles and get a new boundary of tiles.

We can also query the server for NPCs with a defined boundary box (bounded queries) and 20 PCs (nearest query) to 200,200.

Map Editor (JPG)
---------
The game will have a map editor.  The options will look like this.

- map size (rectangle)
- ability to right click a tile, then select a category, then a tile
- ability to click a tile twice to use last tile
- ability to click a tile, then shift select a different tile, then right click the selection and select a category then a tile
- be able to select from a pre-defined list of NPCs
	- buildings
		- be able to choose the building TYPE (aka how user interacts with building)
	- monsters (each monster has these characteristics...)
		- family (family ID)
		- aggro (boolean)
		- aggro radius (int)
		- spawn radius (int)
		- animations {
			abilityid1: [ background position array ]
			abilityid2: [ background position array ]
			abilityid3: [ background position array ]
			}
		- abilities
			- passive (list of ability IDs)
			- melee (list of ability IDs)
			- magic (list of ability IDs)
			- special (list of ability IDs)
		- strengths
			- abilities mob is strong vs
			- elements mob is weak vs
		- weaknesses
			- abilities mob is weak vs
			- elements mob is weak vs
		- attackable (boolean)

Front-end Map Notes
==========
Seems 850 50x50 tiles are the max we can have as DOM elements moving around on IE at any given time.