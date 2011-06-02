Map Notes
==========
Use MongoDB's Geospatial Indexing as a way of storing Map Data

Each map is a collection of '2D' geo-spatial indexed items

Each tile is 100px by 100px.  The coordinate of the tile is the upper left point at which it begins.

Each player coordinate translates to 1px on the screen.

Thus, if a player is at coordinate 200,200, they are actually on map tile 2,2.

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

Needs testing with 700 100x100 tiles to see if that will slow down IE (surface area based??)