# Angoisse

## V0.0.0 Alpha Dev Build

Initial project setup.

Angoisse is my first attempt at a 3D game.

## V0.0.1 Alpha Dev Build

Cube spinning in 3D space.

## V0.0.2 Alpha Dev Build

The spinning cube now moves with keyboard commands.

## V0.0.3 Alpha Dev Build

Boundaries established and visible.

## V0.0.4 Alpha Dev Build

Added a floor.

## V0.0.5 Alpha Dev Build

Corrected bounds using cube size × √3 / 2.

## V0.0.6 Alpha Dev Build

Added jumping with the space bar, in addition to WASD movement.

## V0.0.7 Alpha Dev Build

Built another traversable room.

## V0.0.8 Alpha Dev Build

Created collision between player and north wall. The wall must be jumped over.

This now qualifies as a game.

Four days ago: “What’s a const?”  
Today: two working 2D games, a coded website, two apps, and a 3D game in prototype.

## V0.0.9 Alpha Dev Build

Cube is now a glowing icosahedron.

## V0.0.10 Alpha Dev Build

Moved development workflow into VS Code with Prettier and local live testing.  
Confirmed visible changes render correctly.

## V0.0.11 Alpha Dev Build

Added camera controls.

## V0.0.12 Alpha Dev Build

Created the tetrahedron with three followers and mathematically placed them.

## V0.0.13 Alpha Dev Build

Placed player and followers in `playerGroup`; they now all move together as a happy family.

## V0.0.14 Alpha Dev Build

Re-centered the tetrahedral player body so it rotates around its true center.
Added shared halo logic and 3-axis group rotation.

## V0.0.15 Alpha Dev Build

Added connector lines between the player and followers, forming a visible tetrahedral body.

## V0.0.16 Alpha Dev Build

Tightened collision from one large group hitbox to individual node hitboxes.  
Moved tetrahedron rotation into a dedicated function.  
Prevented the rotating body from clipping through walls.

## V0.0.17 Alpha Dev Build

Added direct Y-axis movement.  
Commented out the old jump mechanic.  
Temporary vertical control uses `Z` until spacebar input is reworked.

## V0.0.18 Alpha Dev Build

Added smooth follow-camera behavior using a camera offset from `playerGroup`.  
Camera now lerps toward the desired position instead of snapping instantly.  
This prepares camera movement to become a controllable gameplay mechanic.

## V0.0.19 Alpha Dev Build

Rebuilt the playing field into a true bounded 3D chamber.  
Added transparent walls, floor, and ceiling aligned to the room bounds.  
Added debug labels so the coordinate system can no longer gaslight me.

## V0.0.20 Alpha Dev

Refactored `game.js` into a clear Macro B-style structure.  
Separated constants, scene setup, materials, geometry, player body, room construction, input, movement, rotation, and animation loop.  
Preserved old jump/collision math in a labeled scrap section for future use.

## V0.0.21 Alpha Dev

Expanded the world beyond a single chamber.

Added a second room and began building reusable multi-room structure.  
Created collision walls inside the room-building system so placed rooms can carry their own boundaries.  
Fixed the rotation-clipping issue that allowed the player body to force itself through walls.  
Added a tunnel connecting the two rooms.  
Added debug collision controls: `G` disables collision for ghost-mode testing, and `H` restores hard boundaries.

The prisoner can now escape, but only when the operator permits it.

## V0.0.22 Alpha Dev

Added the first collectible node.  
Created a glowing torus-knot collection object with spherical hit detection.  
The collection node now detects contact with the tetrahedral player body, fades out, and removes itself from the scene when collected.

It’s alive.

## V0.0.23 Alpha Dev

Moved the collection node to a more challenging position at `(-5, 5, -10)`.  
Increased the collection hitbox radius to make the node reliably collectable during movement testing.  
Added a temporary wireframe sphere to visualize the collection hitbox for debugging purposes.

## V0.0.24 Alpha Dev

Converted collection nodes into a reusable array system.  
Added a second collection node in room B.  
Collection nodes now include wireframe debug hitboxes.  
Touching a collection node turns collision off.  
Manual debug controls remain active: `G` disables collision and `H` restores collision.
GitHub Actions recovered and the project deployed successfully.  
Created a shortcut to GitHub Status for future deployment troubleshooting.

Reality is now conditional.

## V0.0.25 Alpha Dev

Established rudimentary — read as “janky” — gameplay.

Collection nodes now affect game state by turning collision off.  
Added a restore-collision plane in room B that turns collision back on when crossed.  
Moved the restore plane farther into the room to prevent the rotating tetrahedral body from getting trapped as its trailing node crosses the boundary.

Behold me.

## Field Note

Project deployed successfully.  
Development is roughly ten hours ahead of schedule for today.  
The developer left the machine, walked to the park, sat in the sun, and returned with proof of life.

A literal dev hat has been ordered: black bucket hat, white embroidered alien face.

The ritual vestments arrive tomorrow.

## V0.0.26 Alpha Dev

Added camera reset control.  
Pressing `B` returns the camera offset to its default follow position behind the player.  
Cleaned up duplicate key listener after confirming the mechanic worked.

## V0.0.27 Alpha Dev

Added title card using `titleasset.jpg`.  
Added start button to enter the game from the title screen.  
Fixed first collection node cleanup behavior.

No further comment.

## V0.0.28 Alpha Dev

Added enemy nodes.  
Enemy nodes now use hitbox collision to trigger the game-over state.  
Added `endasset.mp4` as the end-screen video asset.  
Touching an enemy node now brings up the end screen and plays the ending video.

I am Kala, the destroyer of worlds.

## V0.0.29 Alpha Dev

Added end-screen text overlay.  
Game-over now plays the explosion video and displays a creepy message in the Eater font:

“you destroyed the universe. good job.”

## V0.1.0 Alpha Prototype

Angoisse has crossed the first threshold.

The project now includes a title screen, a playable tetrahedral body, multiple generated rooms, reusable collision systems, collectibles, enemy nodes, debug controls, a game-over sequence, and a deployed build.

The little universe has rules, hazards, rewards, and consequences.
