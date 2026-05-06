import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xba5252);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 4, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// This is your temporary player.
const playerDim = 0.25;
const playerGeometry = new THREE.IcosahedronGeometry(playerDim, 0);
const playerMaterial = new THREE.MeshPhongMaterial({
	color: 0xb847d1,
	emissive: 0x764a80, // The color of the "glow"
	emissiveIntensity: 0.5, // How strong it is
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);
//unneeded after a  rev
//const cubeSize = playerDim;
//const playerRadius = cubeSize * Math.sqrt(3) / 2;

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
const halo = new THREE.Mesh(haloGeometry, haloMaterial);
player.add(halo); // Attach it directly to the player

const playerBox = new THREE.Box3().setFromObject(player);

player.position.set(0, playerDim, 0);
scene.add(player);

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
	const playerBox = new THREE.Box3().setFromObject(player);

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
scene.add(floor);
//bounding playeraaaaaaaaaaswwa
function clampPlayerToBounds() {
	player.position.x = Math.max(bounds.minX + playerDim, Math.min(bounds.maxX - playerDim, player.position.x));

	player.position.z = Math.max(bounds.minZ + playerDim, Math.min(bounds.maxZ - playerDim, player.position.z));
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

	const oldX = player.position.x;
	const oldZ = player.position.z;

	if (keys['w'] || keys['arrowup']) player.position.z -= speed;
	if (keys['s'] || keys['arrowdown']) player.position.z += speed;
	if (keys['a'] || keys['arrowleft']) player.position.x -= speed;
	if (keys['d'] || keys['arrowright']) player.position.x += speed;

	if (isTouchingNorthWall()) {
		player.position.x = oldX;
		player.position.z = oldZ;
	}
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
