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
- each player plays a specific role in a party
	- Tank
	- DPS1 - skillchain 
	- DPS2 - skillchain / puller
	- debuff / buff mage
	- dps mage
	- healing mage
- every weapon skill is element based
- every skillchain is element based
- magic burst element must match the element of the skillchain to burst correctly
	
Recommended modifications to the FFXI battle system
------------------
- higher mobs give exponentially more EXP
- a third WS in skillchain will grant n^2 damage
- mob weaknesses matter more (opposites will resist hard)
- weather will play a bigger role in damage / damage mitigation
- More Viable Party Setups than FFXI
	- 4 DPS 2 healer (depends on exponential SC damage, healer rotation every other fight)
	- 1 Tank, 4 dps, 1 healer (depends on damage mitigation and quick exponential skillchains)
	- 1 Tank, 1 DPS, 4 support (super-buffing 1 DPS and tank to do major damage)
	- 1 DPS, 5 support ( super buffing 1 DPS to "solo" mob)
	- 4 DPS, 1 support, 1 healer (relies on evasion rotation between DPS and coordinated SCs)
	- 6 debuff mages ( depends on DoT, but cannot chain EXP as fast )
	- 3 DPS 3 support 
	- 2 DPS 2 support 2 healer
- General axioms
	- parties without tanks need more precision, more likely to die
	- parties without support need 2 healer rotations
	- parties with no support or healer need perfect execution
	- parties with no dps will gain exp slowly but safely
	- parties with no dps mage require lvl 3 skillchains
- Each player has special "escape" ability
- Each player has 2 hour ability

Basic Classes
----------------
Warrior
Scout
Performer
Mage

Advanced Classes
----------------
Warrior
	- Paladin (Tank) 
	- Gladiator (melee dps) 
	- Knight (melee dps)
Scout
	- Thief (melee dps)
	- Ninja (Tank)
	- Ranger (ranged dps)
Performer
	- Bard (buff)
	- Dancer (buff)
	- Illusionist (Debuff)
Mage
	- Priest (healer)
	- Elementalist (ranged dps)
	- Time Shifter (debuff)

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