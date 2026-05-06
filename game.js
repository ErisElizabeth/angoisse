//angoisse    game.js
//This is the main game file. It sets up the scene, camera, and renderer, creates the player and followers, builds the walls and floor, and contains the main game loop that handles player movement, camera movement, and rendering.
//imports
import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xba5252);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 4, 5);
camera.lookAt(0, 0, 0);
const cameraMoveSpeed = 0.12;
const tetraRadius = 2;
function moveCamera() {
	if (keys['j']) camera.position.x -= cameraMoveSpeed;
	if (keys['l']) camera.position.x += cameraMoveSpeed;

	if (keys['i']) camera.position.y += cameraMoveSpeed;
	if (keys['k']) camera.position.y -= cameraMoveSpeed;

	if (keys['u']) camera.position.z -= cameraMoveSpeed;
	if (keys['o']) camera.position.z += cameraMoveSpeed;
}
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const playerGroup = new THREE.Group();
scene.add(playerGroup);

// This is your main player.
const playerDim = 0.1;
const playerGeometry = new THREE.IcosahedronGeometry(playerDim, 0);
const playerMaterial = new THREE.MeshPhongMaterial({
	color: 0xb847d1,
	emissive: 0x764a80, // The color of the "glow"
	emissiveIntensity: 0.5, // How strong it is
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);

//  Create a larger "halo" version of the same geometry
const haloGeometry = new THREE.IcosahedronGeometry(playerDim * 1.3, 0);
const haloMaterial = new THREE.MeshBasicMaterial({
	color: 0xf6e3fa,
	transparent: true,
	opacity: 0.1,
	blending: THREE.AdditiveBlending, // Makes it look like light
	side: THREE.BackSide, // Renders on the inside to avoid covering the player
});
//
function addHaloTo(object) {
	const halo = new THREE.Mesh(haloGeometry, haloMaterial);
	object.add(halo);
}

const playerBox = new THREE.Box3().setFromObject(player);

player.position.set(0, playerDim + tetraRadius, 0);
addHaloTo(player);
// old math I'm hoarding for later use, may be useful for positioning followers in a tetrahedron shape around the player
const legLength = 4;
const tetraHeight = (Math.sqrt(6) / 3) * legLength;
const baseOnePoint = (Math.sqrt(3) / 3) * legLength;
const baseTwoPoint = (Math.sqrt(3) / 6) * legLength;
const baseThreePoint = legLength / 2;
const legPositionY = playerDim + tetraHeight;
const followerOne = new THREE.Mesh(playerGeometry, playerMaterial);

followerOne.position.set(baseOnePoint, legPositionY, 0);
addHaloTo(followerOne);
const followerTwo = new THREE.Mesh(playerGeometry, playerMaterial);

followerTwo.position.set(-baseTwoPoint, legPositionY, -baseThreePoint);
addHaloTo(followerTwo);
const followerThree = new THREE.Mesh(playerGeometry, playerMaterial);

followerThree.position.set(-baseTwoPoint, legPositionY, baseThreePoint);
addHaloTo(followerThree);

playerGroup.add(player);
playerGroup.add(followerOne);
playerGroup.add(followerTwo);
playerGroup.add(followerThree);

// Position the player and followers at the vertices of a tetrahedron
player.position.set(1, 1, 1);
followerOne.position.set(1, -1, -1);
followerTwo.position.set(-1, 1, -1);
followerThree.position.set(-1, -1, 1);

player.position.normalize().multiplyScalar(tetraRadius);
followerOne.position.normalize().multiplyScalar(tetraRadius);
followerTwo.position.normalize().multiplyScalar(tetraRadius);
followerThree.position.normalize().multiplyScalar(tetraRadius);

const bounds = {
	minX: -10,
	maxX: 30,
	minZ: -30,
	maxZ: 10,
};
//here start building walls

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x0c55f2 });
const northWall = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 0.5), wallMaterial);
northWall.position.set(0, 0.5, -10);
scene.add(northWall);

const southWall = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 0.5), wallMaterial);
southWall.position.set(0, 0.5, 10);
scene.add(southWall);
//add hit box to north wall
const northWallBox = new THREE.Box3().setFromObject(northWall);

function isTouchingNorthWall() {
	const playerBox = new THREE.Box3().setFromObject(playerGroup);

	return playerBox.intersectsBox(northWallBox);
}

const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 22), wallMaterial);
eastWall.position.set(10, 0.5, 0);
scene.add(eastWall);

const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 22), wallMaterial);
westWall.position.set(-10, 0.5, 0);
scene.add(westWall);
//build new room (b)

const bwallMaterial = new THREE.MeshStandardMaterial({ color: 0xa5bae8 });

const bnorthWall = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 0.5), bwallMaterial);
bnorthWall.position.set(0, 0.5, -10.5);
scene.add(bnorthWall);

const bsouthWall = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 0.5), bwallMaterial);
bsouthWall.position.set(0, 0.5, -30);
scene.add(bsouthWall);

const beastWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 22), bwallMaterial);
beastWall.position.set(10, 0.5, -20);
scene.add(beastWall);

const bwestWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 22), bwallMaterial);
bwestWall.position.set(-10, 0.5, -20);
scene.add(bwestWall);

//end here building walls
//add a floor
const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.1, 40), new THREE.MeshStandardMaterial({ color: 0x222222 }));
floor.position.set(0, -0.05, -10);
floor.material.opacity = 0.75;
floor.material.transparent = true;
scene.add(floor);
//bounding player to the room
function clampPlayerToBounds() {
	playerGroup.position.x = Math.max(
		bounds.minX + playerDim,
		Math.min(bounds.maxX - playerDim, playerGroup.position.x)
	);

	playerGroup.position.z = Math.max(
		bounds.minZ + playerDim,
		Math.min(bounds.maxZ - playerDim, playerGroup.position.z)
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
const jumpStrength = 0.25;
const floorY = playerDim;

window.addEventListener('keydown', (event) => {
	keys[event.key.toLowerCase()] = true;

	if (event.code === 'Space' && isOnGround) {
		velocityY = jumpStrength;
		isOnGround = false;
	}
});

window.addEventListener('keyup', (event) => {
	keys[event.key.toLowerCase()] = false;
});

function movePlayer() {
	const speed = 0.08;

	const oldPosition = playerGroup.position.clone();

	if (keys['w'] || keys['arrowup']) playerGroup.position.z -= speed;
	if (keys['s'] || keys['arrowdown']) playerGroup.position.z += speed;
	if (keys['a'] || keys['arrowleft']) playerGroup.position.x -= speed;
	if (keys['d'] || keys['arrowright']) playerGroup.position.x += speed;

	if (isTouchingNorthWall()) {
		playerGroup.position.copy(oldPosition);
	}
}

function applyJumpAndGravity() {
	playerGroup.position.y += velocityY;
	velocityY -= gravity;

	if (playerGroup.position.y <= floorY) {
		playerGroup.position.y = floorY;
		velocityY = 0;
		isOnGround = true;
	}
}

function animate() {
	requestAnimationFrame(animate);

	movePlayer();
	moveCamera();

	applyJumpAndGravity();
	clampPlayerToBounds();
	camera.lookAt(playerGroup.position);
	player.rotation.x += 0.01;
	player.rotation.y += 0.01;
	player.rotation.z += 0.01;

	followerOne.rotation.x += 0.01;
	followerOne.rotation.y += 0.01;
	followerOne.rotation.z += 0.01;

	followerTwo.rotation.x += 0.01;
	followerTwo.rotation.y += 0.01;
	followerTwo.rotation.z += 0.01;

	followerThree.rotation.x += 0.01;
	followerThree.rotation.y += 0.01;
	followerThree.rotation.z += 0.01;

	playerGroup.rotation.x += 0.01;
	playerGroup.rotation.y += 0.01;
	playerGroup.rotation.z += 0.01;

	renderer.render(scene, camera);
}

animate();
