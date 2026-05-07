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
