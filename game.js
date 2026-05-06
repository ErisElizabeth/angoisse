import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// This is your temporary player.
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff88 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
const cubeSize = 1;
const playerRadius = cubeSize * Math.sqrt(3) / 2;
player.position.set(0, playerRadius, 0);
scene.add(player);

const bounds = {
  minX: -10,
  maxX: 10,
  minZ: -10,
  maxZ: 10
};
//here start building walls

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

const northWall = new THREE.Mesh(
  new THREE.BoxGeometry(22, 1, 0.5),
  wallMaterial
);
northWall.position.set(0, 0.5, -10);
scene.add(northWall);

const southWall = new THREE.Mesh(
  new THREE.BoxGeometry(22, 1, 0.5),
  wallMaterial
);
southWall.position.set(0, 0.5, 10);
scene.add(southWall);

const eastWall = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 1, 22),
  wallMaterial
);
eastWall.position.set(10, 0.5, 0);
scene.add(eastWall);

const westWall = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 1, 22),
  wallMaterial
);
westWall.position.set(-10, 0.5, 0);
scene.add(westWall);

//end here building walls
//add a floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.1, 20),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.position.set(0, -0.05, 0);
scene.add(floor);
//bounding playeraaaaaaaaaaswwa
function clampPlayerToBounds() {
  player.position.x = Math.max(
    bounds.minX + playerRadius,
    Math.min(bounds.maxX - playerRadius, player.position.x)
  );

  player.position.z = Math.max(
    bounds.minZ + playerRadius,
    Math.min(bounds.maxZ - playerRadius, player.position.z)
  );
}
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);


const keys = {};

// Jump / gravity variables
let velocityY = 0;
let isOnGround = true;

const gravity = 0.018;
const jumpStrength = 0.35;
const floorY = playerRadius;

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (event.code === "Space" && isOnGround) {
    velocityY = jumpStrength;
    isOnGround = false;
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function movePlayer() {
  const speed = 0.08;

  if (keys["w"] || keys["arrowup"]) player.position.z -= speed;
  if (keys["s"] || keys["arrowdown"]) player.position.z += speed;
  if (keys["a"] || keys["arrowleft"]) player.position.x -= speed;
  if (keys["d"] || keys["arrowright"]) player.position.x += speed;
}

function applyJumpAndGravity() {
  player.position.y += velocityY;
  velocityY -= gravity;

  if (player.position.y <= floorY) {
    player.position.y = floorY;
    velocityY = 0;
    isOnGround = true;
  }
}

function animate() {
  requestAnimationFrame(animate);

  movePlayer();
  applyJumpAndGravity();
  clampPlayerToBounds();

  player.rotation.x += 0.01;
  player.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();