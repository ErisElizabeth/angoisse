// angoisse — game.js
// Main game file for Angoisse.

// COORDINATE NOTE FOR MY MACHINIST BRAIN:
// YOU ARE NOT MILLING, YOU ARE
// Three.js uses Y as the vertical/up axis.
// The playable floor/depth plane is X/Z.
//
// Think of this game as working in a G18-like X/Z plane,
// not a G17 X/Y plane.
//
// X+ = right/east
// X- = left/west
// Z- = forward/north
// Z+ = backward/south
// Y+ = up/ceiling
// Y- = down/floor

// Sets up the scene, player body, rooms, debug labels, controls, camera, and render loop.

import * as THREE from "three";

// ======================================================
// 1. CONSTANTS / SETTINGS / TUNING
// ======================================================

// Scene
const sceneBackgroundColor = 0xba5252;

// Camera
const cameraStartPosition = new THREE.Vector3(0, 4, 5);
const cameraStartTarget = new THREE.Vector3(0, 0, 0);
const cameraOffset = new THREE.Vector3(0, 4, 5);
const cameraMoveSpeed = 0.12;
const cameraFollowLerp = 0.1;

// Player
const playerDim = 0.1;
const tetraRadius = 2;
const playerMoveSpeed = 0.08;
const playerNodeSpinSpeed = 0.01;
const playerGroupSpinSpeed = 0.01;

// Room
const roomSize = 50;
const wallThickness = 0.1;
const roomTransparency = 0.4;

// Colors
const playerColor = 0xb847d1;
const playerGlowColor = 0x764a80;
const haloColor = 0xf6e3fa;
const connectorColor = 0xf6e3fa;

const wallNorthColor = 0x5d608c;
const wallSouthColor = 0x131a13;
const wallEastColor = 0x1e856d;
const wallWestColor = 0x3e0b4d;
const floorColor = 0xb89898;
const ceilingColor = 0x591a1a;
// debugging tool
let collisionEnabled = true;
// Debug labels
const showDebugLabels = true;
const debugLabelScale = new THREE.Vector3(8, 4, 1);
// Old tetrahedron math, hoarded for later.
// This was used before switching to normalized tetrahedron vertex positions.
/*
const legLength = 4;
const tetraHeight = (Math.sqrt(6) / 3) * legLength;
const baseOnePoint = (Math.sqrt(3) / 3) * legLength;
const baseTwoPoint = (Math.sqrt(3) / 6) * legLength;
const baseThreePoint = legLength / 2;
const legPositionY = playerDim + tetraHeight;
*/

// ======================================================
// 2. SCENE / CAMERA / RENDERER
// ======================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(sceneBackgroundColor);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.copy(cameraStartPosition);
camera.lookAt(cameraStartTarget);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======================================================
// 3. BOUNDS
// ======================================================

const bounds = {
  minX: -roomSize / 2,
  maxX: roomSize / 2,
  minZ: -roomSize / 2,
  maxZ: roomSize / 2,
  minY: -roomSize / 2,
  maxY: roomSize / 2,
};

// ======================================================
// 4. MATERIALS
// ======================================================

const collectionNodeRadius = 0.45;
const collectionNodeHitRadius = 2.5;
const showCollectionDebugHitboxes = true;
const collectionNodeGeometry = new THREE.TorusKnotGeometry(
  collectionNodeRadius,
  0.12,
  80,
  12,
);

const collectionNodeMaterial = new THREE.MeshPhongMaterial({
  color: 0xffcc66,
  emissive: 0xff8800,
  emissiveIntensity: 0.7,
  transparent: true,
  opacity: 1,
});
// Debugging tool for collection node hitbox.
const collectionHitboxMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  wireframe: true,
  transparent: true,
  opacity: 0.35,
});

const collectionNodes = [];
const playerMaterial = new THREE.MeshPhongMaterial({
  color: playerColor,
  emissive: playerGlowColor,
  emissiveIntensity: 0.5,
});

const haloMaterial = new THREE.MeshBasicMaterial({
  color: haloColor,
  transparent: true,
  opacity: 0.1,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
});

const connectorMaterial = new THREE.LineBasicMaterial({
  color: connectorColor,
  transparent: true,
  opacity: 0.45,
});

// ======================================================
// 5. GEOMETRY
// ======================================================

const playerGeometry = new THREE.IcosahedronGeometry(playerDim, 0);
const haloGeometry = new THREE.IcosahedronGeometry(playerDim * 1.3, 0);
//=======================================================
//5.1 collection node
//=======================================================
// =======================================================
// 5.1 COLLECTION NODE
// =======================================================

const collectionNode = new THREE.Mesh(
  collectionNodeGeometry,
  collectionNodeMaterial,
);

collectionNode.position.set(-5, 5, -10);
collectionNode.userData.collected = false;
collectionNode.userData.hitRadius = collectionNodeHitRadius;
collectionNode.userData.fadeSpeed = 0.03;

scene.add(collectionNode);

const collectionDebugSphere = new THREE.Mesh(
  new THREE.SphereGeometry(collectionNodeHitRadius, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffff00,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  }),
);

collectionDebugSphere.position.copy(collectionNode.position);
scene.add(collectionDebugSphere);

// ======================================================
// 6. PLAYER / TETRAHEDRON BODY
// ======================================================

const playerGroup = new THREE.Group();
scene.add(playerGroup);

const player = new THREE.Mesh(playerGeometry, playerMaterial);
const followerOne = new THREE.Mesh(playerGeometry, playerMaterial);
const followerTwo = new THREE.Mesh(playerGeometry, playerMaterial);
const followerThree = new THREE.Mesh(playerGeometry, playerMaterial);

const playerNodes = [player, followerOne, followerTwo, followerThree];

playerGroup.add(player);
playerGroup.add(followerOne);
playerGroup.add(followerTwo);
playerGroup.add(followerThree);

positionPlayerNodes();
addHalosToPlayerNodes();
createPlayerConnectors();

// ======================================================
// 7. ROOM CONSTRUCTION
// ======================================================

const roomA = createRoom(roomSize, roomTransparency);
roomA.group.position.set(0, 0, 0);
scene.add(roomA.group);

const roomB = createRoom(roomSize, roomTransparency);
roomB.group.position.set(0, 0, -70);
scene.add(roomB.group);

// Collect all room colliders into one master list
const roomColliders = [...roomA.colliders, ...roomB.colliders];

function isTouchingRoomCollider() {
  playerGroup.updateMatrixWorld(true);

  return playerNodes.some((node) => {
    const nodeWorldPosition = new THREE.Vector3();
    node.getWorldPosition(nodeWorldPosition);

    const nodeSphere = new THREE.Sphere(nodeWorldPosition, playerDim);

    return roomColliders.some((collider) => {
      collider.updateMatrixWorld(true);

      const colliderBox = new THREE.Box3().setFromObject(collider);

      return colliderBox.intersectsSphere(nodeSphere);
    });
  });
}

const tunnelAB = createTunnelBetweenRooms(-roomSize / 2, -70 + roomSize / 2, 5);

// ======================================================
// 8. DEBUG LABELS
// ======================================================

if (showDebugLabels) {
  createRoomAxisLabels(roomA.group, roomSize);
  createRoomAxisLabels(roomB.group, roomSize);
}

// ======================================================
// 8.1 COLLISION RESTORE PLANE
// ======================================================

const restorePlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
});

const restorePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(roomSize, roomSize),
  restorePlaneMaterial,
);

// Room B is centered at z = -70.
// Its south/+Z wall is at roomB.z + roomSize / 2.
// Put the restore plane just inside room B from that wall.
restorePlane.position.set(
  roomB.group.position.x,
  roomB.group.position.y,
  roomB.group.position.z + roomSize / 2 - tetraRadius * 2.5,
);

scene.add(restorePlane);

// ======================================================
// 9. LIGHTING
// ======================================================

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ======================================================
// 10. INPUT
// ======================================================

const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (event.key.toLowerCase() === "g") {
    collisionEnabled = false;
    console.log("Collision OFF");
  }

  if (event.key.toLowerCase() === "h") {
    collisionEnabled = true;
    console.log("Collision ON");
  }
});

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  // Jump disabled for now.
  // Useful scrap if platforming returns later:
  // if (event.code === "Space" && isOnGround) {
  //   velocityY = jumpStrength;
  //   isOnGround = false;
  // }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});
// ======================================================
// 11. PLAYER HELPERS
// ======================================================

function positionPlayerNodes() {
  // Position the player and followers at the vertices of a tetrahedron.
  player.position.set(1, 1, 1);
  followerOne.position.set(1, -1, -1);
  followerTwo.position.set(-1, 1, -1);
  followerThree.position.set(-1, -1, 1);

  player.position.normalize().multiplyScalar(tetraRadius);
  followerOne.position.normalize().multiplyScalar(tetraRadius);
  followerTwo.position.normalize().multiplyScalar(tetraRadius);
  followerThree.position.normalize().multiplyScalar(tetraRadius);
}

function addHaloTo(object) {
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  object.add(halo);
}

function addHalosToPlayerNodes() {
  playerNodes.forEach((node) => {
    addHaloTo(node);
  });
}

function createConnector(startNode, endNode) {
  const points = [startNode.position.clone(), endNode.position.clone()];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, connectorMaterial);

  playerGroup.add(line);

  return line;
}

function createPlayerConnectors() {
  // Connect lead player node to followers.
  createConnector(player, followerOne);
  createConnector(player, followerTwo);
  createConnector(player, followerThree);

  // Connect followers to each other.
  createConnector(followerOne, followerTwo);
  createConnector(followerTwo, followerThree);
  createConnector(followerThree, followerOne);
}
//=======================================================
// 11.5 COLLECTION NODE HELPERS
//=======================================================

function createCollectionNode(position) {
  const node = new THREE.Mesh(
    collectionNodeGeometry,
    collectionNodeMaterial.clone(),
  );

  node.position.copy(position);
  node.userData.collected = false;
  node.userData.hitRadius = collectionNodeHitRadius;
  node.userData.fadeSpeed = 0.03;

  let debugHitbox = null;

  if (showCollectionDebugHitboxes) {
    debugHitbox = new THREE.Mesh(
      new THREE.SphereGeometry(collectionNodeHitRadius, 24, 24),
      collectionHitboxMaterial.clone(),
    );

    debugHitbox.position.copy(position);
    scene.add(debugHitbox);
  }

  node.userData.debugHitbox = debugHitbox;

  scene.add(node);
  collectionNodes.push(node);

  return node;
}

function checkCollectionNodeCollisions() {
  playerGroup.updateMatrixWorld(true);

  collectionNodes.forEach((collectionNode) => {
    if (collectionNode.userData.collected) return;

    const collectionSphere = new THREE.Sphere(
      collectionNode.position,
      collectionNode.userData.hitRadius,
    );

    const touched = playerNodes.some((playerNode) => {
      const playerNodeWorldPosition = new THREE.Vector3();
      playerNode.getWorldPosition(playerNodeWorldPosition);

      const playerNodeSphere = new THREE.Sphere(
        playerNodeWorldPosition,
        playerDim,
      );

      return collectionSphere.intersectsSphere(playerNodeSphere);
    });

    if (touched) {
      collectionNode.userData.collected = true;

      // Gameplay effect:
      // collecting a node turns collision off.
      collisionEnabled = false;
      console.log("Collection node touched: collision OFF");
    }
  });
}

function updateCollectionNodes() {
  for (let i = collectionNodes.length - 1; i >= 0; i--) {
    const collectionNode = collectionNodes[i];

    collectionNode.rotation.x += 0.02;
    collectionNode.rotation.y += 0.03;
    collectionNode.rotation.z += 0.01;

    const debugHitbox = collectionNode.userData.debugHitbox;

    if (debugHitbox) {
      debugHitbox.position.copy(collectionNode.position);
    }

    if (!collectionNode.userData.collected) continue;

    collectionNode.material.opacity -= collectionNode.userData.fadeSpeed;

    if (debugHitbox) {
      debugHitbox.material.opacity -= collectionNode.userData.fadeSpeed;
    }

    if (collectionNode.material.opacity <= 0) {
      scene.remove(collectionNode);

      if (debugHitbox) {
        scene.remove(debugHitbox);
        debugHitbox.geometry.dispose();
        debugHitbox.material.dispose();
      }

      collectionNode.geometry.dispose();
      collectionNode.material.dispose();

      collectionNodes.splice(i, 1);
    }
  }
}

// Example collection nodes
createCollectionNode(new THREE.Vector3(-5, 5, -10)); // room A
createCollectionNode(new THREE.Vector3(8, 5, -75)); // room B
// ======================================================
// 12. ROOM HELPERS
// ======================================================

function createRoom(size, transparency = 0.4) {
  const roomGroup = new THREE.Group();

  const wallMaterialNorth = new THREE.MeshStandardMaterial({
    color: wallNorthColor,
  });

  const wallMaterialSouth = new THREE.MeshStandardMaterial({
    color: wallSouthColor,
  });

  const wallMaterialEast = new THREE.MeshStandardMaterial({
    color: wallEastColor,
  });

  const wallMaterialWest = new THREE.MeshStandardMaterial({
    color: wallWestColor,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: floorColor,
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: ceilingColor,
  });

  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, wallThickness),
    wallMaterialNorth,
  );

  const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, wallThickness),
    wallMaterialSouth,
  );

  const eastWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, size, size),
    wallMaterialEast,
  );

  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, size, size),
    wallMaterialWest,
  );

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(size, wallThickness, size),
    floorMaterial,
  );

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(size, wallThickness, size),
    ceilingMaterial,
  );

  northWall.position.set(0, 0, -size / 2);
  southWall.position.set(0, 0, size / 2);
  eastWall.position.set(size / 2, 0, 0);
  westWall.position.set(-size / 2, 0, 0);
  floor.position.set(0, -size / 2, 0);
  ceiling.position.set(0, size / 2, 0);

  const roomParts = [northWall, southWall, eastWall, westWall, floor, ceiling];

  roomParts.forEach((part) => {
    part.material.transparent = true;
    part.material.opacity = transparency;
    roomGroup.add(part);
  });
  // Invisible collision walls
  const northCollider = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, wallThickness),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  const southCollider = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, wallThickness),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  const eastCollider = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, size, size),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  const westCollider = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, size, size),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  const floorCollider = new THREE.Mesh(
    new THREE.BoxGeometry(size, wallThickness, size),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  const ceilingCollider = new THREE.Mesh(
    new THREE.BoxGeometry(size, wallThickness, size),
    new THREE.MeshBasicMaterial({ visible: false }),
  );

  northCollider.position.copy(northWall.position);
  southCollider.position.copy(southWall.position);
  eastCollider.position.copy(eastWall.position);
  westCollider.position.copy(westWall.position);
  floorCollider.position.copy(floor.position);
  ceilingCollider.position.copy(ceiling.position);

  const colliders = [
    northCollider,
    southCollider,
    eastCollider,
    westCollider,
    floorCollider,
    ceilingCollider,
  ];

  colliders.forEach((collider) => {
    roomGroup.add(collider);
  });
  return {
    group: roomGroup,
    colliders,
  };
}

function checkRestorePlaneCollision() {
  // If collision is already on, the restore plane has nothing to do.
  if (collisionEnabled) return;

  const planeZ = restorePlane.position.z;
  const triggerDistance = tetraRadius;

  const dz = Math.abs(playerGroup.position.z - planeZ);

  const withinPlaneX =
    playerGroup.position.x >= restorePlane.position.x - roomSize / 2 &&
    playerGroup.position.x <= restorePlane.position.x + roomSize / 2;

  const withinPlaneY =
    playerGroup.position.y >= restorePlane.position.y - roomSize / 2 &&
    playerGroup.position.y <= restorePlane.position.y + roomSize / 2;

  if (dz <= triggerDistance && withinPlaneX && withinPlaneY) {
    collisionEnabled = true;
    console.log("Restore plane touched: collision ON");
  }
}

function createTunnelBetweenRooms(startZ, endZ, radius = 5) {
  const tunnelLength = Math.abs(endZ - startZ);
  const tunnelCenterZ = (startZ + endZ) / 2;

  const tunnelGeometry = new THREE.CylinderGeometry(
    radius,
    radius,
    tunnelLength,
    32,
    1,
    true, // openEnded: no caps
  );

  const tunnelMaterial = new THREE.MeshStandardMaterial({
    color: 0x444466,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });

  const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

  // CylinderGeometry runs along Y by default.
  // Rotate it so its length runs along Z.
  tunnel.rotation.x = Math.PI / 2;

  tunnel.position.set(0, 0, tunnelCenterZ);

  scene.add(tunnel);

  return tunnel;
}

// ======================================================
// 13. DEBUG LABEL HELPERS
// ======================================================

function createTextLabel(mainText, subText, position, parent = scene) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;

  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.font = "bold 160px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(mainText, canvas.width / 2, canvas.height / 2 - 60);

  context.font = "bold 70px Arial";
  context.fillStyle = "white";
  context.fillText(subText, canvas.width / 2, canvas.height / 2 + 90);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.position.set(position.x, position.y, position.z);
  sprite.scale.copy(debugLabelScale);

  parent.add(sprite);

  return sprite;
}

function createRoomAxisLabels(roomGroup, size) {
  createTextLabel(
    "HOME",
    "0, 0, 0",
    {
      x: 0,
      y: 0,
      z: 0,
    },
    roomGroup,
  );

  createTextLabel(
    "Y+",
    "ceiling",
    {
      x: 0,
      y: size / 2 - 1,
      z: 0,
    },
    roomGroup,
  );

  createTextLabel(
    "Y-",
    "floor",
    {
      x: 0,
      y: -size / 2 + 1,
      z: 0,
    },
    roomGroup,
  );

  createTextLabel(
    "Z-",
    "north",
    {
      x: 0,
      y: 0,
      z: -size / 2 + 1,
    },
    roomGroup,
  );

  createTextLabel(
    "Z+",
    "south",
    {
      x: 0,
      y: 0,
      z: size / 2 - 1,
    },
    roomGroup,
  );

  createTextLabel(
    "X+",
    "east",
    {
      x: size / 2 - 1,
      y: 0,
      z: 0,
    },
    roomGroup,
  );

  createTextLabel(
    "X-",
    "west",
    {
      x: -size / 2 + 1,
      y: 0,
      z: 0,
    },
    roomGroup,
  );
}
// ======================================================
// 14. MOVEMENT / CAMERA / BOUNDS
// ======================================================

function movePlayer() {
  const oldPosition = playerGroup.position.clone();

  if (keys["w"] || keys["arrowup"]) playerGroup.position.z -= playerMoveSpeed;
  if (keys["s"] || keys["arrowdown"]) playerGroup.position.z += playerMoveSpeed;
  if (keys["a"] || keys["arrowleft"]) playerGroup.position.x -= playerMoveSpeed;
  if (keys["d"] || keys["arrowright"])
    playerGroup.position.x += playerMoveSpeed;

  if (keys["z"]) playerGroup.position.y += playerMoveSpeed;
  if (keys["shift"]) playerGroup.position.y -= playerMoveSpeed;

  if (collisionEnabled && isTouchingRoomCollider()) {
    playerGroup.position.copy(oldPosition);
  }
}

function moveCamera() {
  if (keys["j"]) cameraOffset.x -= cameraMoveSpeed;
  if (keys["l"]) cameraOffset.x += cameraMoveSpeed;

  if (keys["i"]) cameraOffset.y += cameraMoveSpeed;
  if (keys["k"]) cameraOffset.y -= cameraMoveSpeed;

  if (keys["u"]) cameraOffset.z -= cameraMoveSpeed;
  if (keys["o"]) cameraOffset.z += cameraMoveSpeed;
}

function snapCamera() {
  const desiredCameraPosition = playerGroup.position.clone().add(cameraOffset);
  camera.position.lerp(desiredCameraPosition, cameraFollowLerp);
}

function clampPlayerToBounds() {
  const playerClearance = tetraRadius;

  playerGroup.position.x = Math.max(
    bounds.minX + playerClearance,
    Math.min(bounds.maxX - playerClearance, playerGroup.position.x),
  );

  playerGroup.position.z = Math.max(
    bounds.minZ + playerClearance,
    Math.min(bounds.maxZ - playerClearance, playerGroup.position.z),
  );

  playerGroup.position.y = Math.max(
    bounds.minY + playerClearance,
    Math.min(bounds.maxY - playerClearance, playerGroup.position.y),
  );
}

// ======================================================
// 15. ROTATION
// ======================================================

function rotatePlayerGroup() {
  const oldRotation = playerGroup.rotation.clone();

  playerGroup.rotation.x += playerGroupSpinSpeed;
  playerGroup.rotation.y += playerGroupSpinSpeed;
  playerGroup.rotation.z += playerGroupSpinSpeed;

  if (collisionEnabled && isTouchingRoomCollider()) {
    playerGroup.rotation.copy(oldRotation);
  }
}

function rotatePlayerNodes() {
  playerNodes.forEach((node) => {
    node.rotation.x += playerNodeSpinSpeed;
    node.rotation.y += playerNodeSpinSpeed;
    node.rotation.z += playerNodeSpinSpeed;
  });
}

// ======================================================
// 16. OLD COLLISION / PHYSICS SCRAP
// ======================================================

// Jump / gravity variables are disabled for now.
// They may be useful later if platforming returns.
/*
let velocityY = 0;
let isOnGround = true;

const gravity = 0.018;
const jumpStrength = 0.25;
const floorY = playerDim;

function applyJumpAndGravity() {
  playerGroup.position.y += velocityY;
  velocityY -= gravity;

  if (playerGroup.position.y <= floorY) {
    playerGroup.position.y = floorY;
    velocityY = 0;
    isOnGround = true;
  }
}
*/

// Wall collision is disabled for now.
// Node-based sphere hitboxes can be revived later.
/*
const northWallBox = new THREE.Box3().setFromObject(northWall);

function isTouchingNorthWall() {
  playerGroup.updateMatrixWorld(true);

  return playerNodes.some((node) => {
    const nodeWorldPosition = new THREE.Vector3();
    node.getWorldPosition(nodeWorldPosition);

    const nodeSphere = new THREE.Sphere(nodeWorldPosition, playerDim);

    return northWallBox.intersectsSphere(nodeSphere);
  });
}
*/

// ======================================================
// 17. ANIMATION LOOP
// ======================================================

function animate() {
  requestAnimationFrame(animate);

  movePlayer();
  moveCamera();
  snapCamera();
  checkCollectionNodeCollisions();
  updateCollectionNodes();
  checkRestorePlaneCollision();

  // TEMP TEST:
  // Bounds are currently disabled while exploring room placement.
  // Re-enable when you want the player locked to the current bounds.
  // clampPlayerToBounds();

  rotatePlayerGroup();
  rotatePlayerNodes();
  collectionNode.rotation.x += 0.02;
  collectionNode.rotation.y += 0.03;
  collectionNode.rotation.z += 0.01;
  camera.lookAt(playerGroup.position);

  renderer.render(scene, camera);
}

animate();
