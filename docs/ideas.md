Map Notes
==========
Use MongoDB's Geospatial Indexing as a way of storing Map Data

Each map is a collection of '2D' geo-spatial indexed items

There are 2 types of maps

- tile map
- player map

Each map coordinate translates to 100px on the screen.

Each player coordinate translates to 1px on the screen.

Thus, if a player is at coordinate 200,200, they are actually on map tile 2,2.

We can then query the tile map for the closest 50 map tiles to the player and preload the UI for the player.

We can also query the game map for the closest 20 NPCs (bounded queries) and 20 PCs (nearest query) to 200,200.

Map collection naming conventions
---------
Name the maps tmap and gmap for tile and player maps respectively

- tmap_1 (tile map 1)
- gmap_1 (game map 1)

- tmap_2 (tile map 2)
_ gmap_2 (game map 2)

Front-end map querying
---------
- if player moves too far from last querypoint, we query for map data


Map Editor (JPG)
---------
The game will have a map editor.  The options will look like this.

- map size (rectangle)
- ability to drag & drop select tiles
- change all tiles in selection
- change all of one tile type to another tile type in selection or document
- minimap feature
- be able to select from a pre-defined list of NPCs
    - buildings
    - monsters
- be able to overlay large images
- be able to designate areas to cut new images that are saved in DB to load