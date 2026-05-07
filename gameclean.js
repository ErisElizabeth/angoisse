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
const cameraOffset = new THREE.Vector3(0, 4, 5);
function createTextLabel(mainText, subText, position) {
	const canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 512;

	const context = canvas.getContext('2d');

	// Transparent background
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Main text
	context.font = 'bold 160px Arial';
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(mainText, canvas.width / 2, canvas.height / 2 - 60);

	// Smaller subtitle
	context.font = 'bold 70px Arial';
	context.fillStyle = 'white';
	context.fillText(subText, canvas.width / 2, canvas.height / 2 + 90);

	const texture = new THREE.CanvasTexture(canvas);

	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		depthTest: false,
	});

	const sprite = new THREE.Sprite(material);
	sprite.position.set(position.x, position.y, position.z);
	sprite.scale.set(8, 4, 1);

	scene.add(sprite);

	return sprite;
}

function moveCamera() {
	if (keys['j']) cameraOffset.x -= cameraMoveSpeed;
	if (keys['l']) cameraOffset.x += cameraMoveSpeed;

	if (keys['i']) cameraOffset.y += cameraMoveSpeed;
	if (keys['k']) cameraOffset.y -= cameraMoveSpeed;

	if (keys['u']) cameraOffset.z -= cameraMoveSpeed;
	if (keys['o']) cameraOffset.z += cameraMoveSpeed;
}

function snapCamera() {
	const desiredCameraPosition = playerGroup.position.clone().add(cameraOffset);
	camera.position.lerp(desiredCameraPosition, 0.1);
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

// Store the player and followers in an array for easy access later
const playerNodes = [player, followerOne, followerTwo, followerThree];

// Position the player and followers at the vertices of a tetrahedron
player.position.set(1, 1, 1);
followerOne.position.set(1, -1, -1);
followerTwo.position.set(-1, 1, -1);
followerThree.position.set(-1, -1, 1);

player.position.normalize().multiplyScalar(tetraRadius);
followerOne.position.normalize().multiplyScalar(tetraRadius);
followerTwo.position.normalize().multiplyScalar(tetraRadius);
followerThree.position.normalize().multiplyScalar(tetraRadius);

// ======================================================
// PLAYER CONNECTOR LINES
// ======================================================

const connectorMaterial = new THREE.LineBasicMaterial({
	color: 0xf6e3fa,
	transparent: true,
	opacity: 0.45,
});

function createConnector(startNode, endNode) {
	const points = [startNode.position.clone(), endNode.position.clone()];

	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	const line = new THREE.Line(geometry, connectorMaterial);

	playerGroup.add(line);

	return line;
}
// Connect the player to each follower
createConnector(player, followerOne);
createConnector(player, followerTwo);
createConnector(player, followerThree);

createConnector(followerOne, followerTwo);
createConnector(followerTwo, followerThree);
createConnector(followerThree, followerOne);

// Define the boundaries of the room
const roomSize = 50;
const wallThickness = 0.1;

const bounds = {
	minX: -roomSize / 2,
	maxX: roomSize / 2,
	minZ: -roomSize / 2,
	maxZ: roomSize / 2,
	minY: -roomSize / 2,
	maxY: roomSize / 2,
};

// =======================================================
// ROOM CONSTRUCTION
// =======================================================
function createRoom(roomSize, roomTransparency = 0.4) {
	const roomGroup = new THREE.Group();

	const wallThickness = 0.1;

	const wallMaterialNorth = new THREE.MeshStandardMaterial({ color: 0x5d608c });
	const wallMaterialSouth = new THREE.MeshStandardMaterial({ color: 0x131a13 });
	const wallMaterialEast = new THREE.MeshStandardMaterial({ color: 0x1e856d });
	const wallMaterialWest = new THREE.MeshStandardMaterial({ color: 0x3e0b4d });
	const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xb89898 });
	const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x591a1a });

	const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, roomSize, wallThickness), wallMaterialNorth);

	const southWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, roomSize, wallThickness), wallMaterialSouth);

	const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, roomSize, roomSize), wallMaterialEast);

	const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, roomSize, roomSize), wallMaterialWest);

	const floor = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallThickness, roomSize), floorMaterial);

	const ceiling = new THREE.Mesh(new THREE.BoxGeometry(roomSize, wallThickness, roomSize), ceilingMaterial);

	northWall.position.set(0, 0, -roomSize / 2);
	southWall.position.set(0, 0, roomSize / 2);
	eastWall.position.set(roomSize / 2, 0, 0);
	westWall.position.set(-roomSize / 2, 0, 0);
	floor.position.set(0, -roomSize / 2, 0);
	ceiling.position.set(0, roomSize / 2, 0);

	const roomParts = [northWall, southWall, eastWall, westWall, floor, ceiling];

	roomParts.forEach((part) => {
		part.material.transparent = true;
		part.material.opacity = roomTransparency;
		roomGroup.add(part);
	});

	return roomGroup;
}
const roomA = createRoom(50, 0.4);
roomA.position.set(0, 0, 0);
scene.add(roomA);

const roomB = createRoom(50, 0.4);
roomB.position.set(0, 0, -70);
scene.add(roomB);

// =======================================================
// add room label sprites
//

createTextLabel('Y+', 'ceiling', {
	x: 0,
	y: roomSize / 2 - 1,
	z: 0,
});

createTextLabel('Y-', 'floor', {
	x: 0,
	y: -roomSize / 2 + 1,
	z: 0,
});

createTextLabel('Z-', 'north', {
	x: 0,
	y: 0,
	z: -roomSize / 2 + 1,
});

createTextLabel('Z+', 'south', {
	x: 0,
	y: 0,
	z: roomSize / 2 - 1,
});

createTextLabel('X+', 'east', {
	x: roomSize / 2 - 1,
	y: 0,
	z: 0,
});

createTextLabel('X-', 'west', {
	x: -roomSize / 2 + 1,
	y: 0,
	z: 0,
});

//bounding player to the room
function clampPlayerToBounds() {
	const playerClearance = tetraRadius;

	playerGroup.position.x = Math.max(
		bounds.minX + playerClearance,
		Math.min(bounds.maxX - playerClearance, playerGroup.position.x)
	);

	playerGroup.position.z = Math.max(
		bounds.minZ + playerClearance,
		Math.min(bounds.maxZ - playerClearance, playerGroup.position.z)
	);

	playerGroup.position.y = Math.max(
		bounds.minY + playerClearance,
		Math.min(bounds.maxY - playerClearance, playerGroup.position.y)
	);
}

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const keys = {};

// Jump / gravity variables unneeded for now, but may be useful later if I want to add more complex platforming elements, for now I'm just using it to let the player jump in place
//let velocityY = 0;
//let isOnGround = true;

//const gravity = 0.018;
//const jumpStrength = 0.25;
//const floorY = playerDim;

window.addEventListener('keydown', (event) => {
	keys[event.key.toLowerCase()] = true;
});
//jump disabled for now, but may be useful later if I want to add more complex platforming elements, for now I'm just using it to let the player jump in place
//	if (event.code === 'Space' && isOnGround) {
//		velocityY = jumpStrength;
//		isOnGround = false;
//	}
//});

window.addEventListener('keyup', (event) => {
	keys[event.key.toLowerCase()] = false;
});

function movePlayer() {
	const speed = 0.08;

	if (keys['w'] || keys['arrowup']) playerGroup.position.z -= speed;
	if (keys['s'] || keys['arrowdown']) playerGroup.position.z += speed;
	if (keys['a'] || keys['arrowleft']) playerGroup.position.x -= speed;
	if (keys['d'] || keys['arrowright']) playerGroup.position.x += speed;

	if (keys['z']) playerGroup.position.y += speed;
	if (keys['shift']) playerGroup.position.y -= speed;
}

function rotatePlayerGroup() {
	playerGroup.rotation.x += 0.01;
	playerGroup.rotation.y += 0.01;
	playerGroup.rotation.z += 0.01;
}

function rotatePlayerNodes() {
	playerNodes.forEach((node) => {
		node.rotation.x += 0.01;
		node.rotation.y += 0.01;
		node.rotation.z += 0.01;
	});
}

function animate() {
	requestAnimationFrame(animate);

	movePlayer();
	moveCamera();
	snapCamera();
	//clampPlayerToBounds();

	rotatePlayerGroup();
	rotatePlayerNodes();

	camera.lookAt(playerGroup.position);

	renderer.render(scene, camera);
}

animate();

// I can recycle this box geometry for the north and south walls to create hit boxes for collision detection, but for now I'm just using it to let the player jump in place
//add hit box to north wall
//const northWallBox = new THREE.Box3().setFromObject(northWall);
//
//function isTouchingNorthWall() {
//	playerGroup.updateMatrixWorld(true);
//
//	return playerNodes.some((node) => {
//		const nodeWorldPosition = new THREE.Vector3();
//		node.getWorldPosition(nodeWorldPosition);
//
//		const nodeSphere = new THREE.Sphere(nodeWorldPosition, playerDim);

//		return northWallBox.intersectsSphere(nodeSphere);
//	});
//}
