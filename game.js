// Astronomy objects will be loaded from objects.json
let objects = [];

let currentPair = [];
let canClick = true;

const container = document.getElementById('game-container');
const messageDiv = document.getElementById('message');

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, container.offsetWidth / container.offsetHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 2);
scene.add(light);
// Add ambient light for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Store clickable meshes
let meshes = [];

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Sound effects
const successSound = new Audio('sounds/success.mp3');
const tryAgainSound = new Audio('sounds/tryagain.mp3');

// Unlock audio on first user interaction (Safari compatibility)
let audioContext;
function unlockAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      // Ignore if AudioContext is not available
    }
  }
  successSound.play().then(() => successSound.pause()).catch(() => {});
  tryAgainSound.play().then(() => tryAgainSound.pause()).catch(() => {});
  container.removeEventListener('click', unlockAudio);
}
container.addEventListener('click', unlockAudio);

function pickTwoObjects() {
  let idx1 = Math.floor(Math.random() * objects.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * objects.length);
  } while (idx2 === idx1);
  return [objects[idx1], objects[idx2]];
}

function clearScene() {
  meshes.forEach(mesh => scene.remove(mesh));
  meshes = [];
}

function showPair(pair) {
  clearScene();
  // Both objects have the same display size (smaller)
  const displayRadius = 6;
  // Calculate effective radii (account for Saturn's ring)
  const effectiveRadii = pair.map(obj =>
    obj.name === 'Saturn' ? displayRadius * 1.8 : displayRadius
  );
  // Calculate distance so they don't overlap (sum of effective radii + padding)
  const padding = 1.2; // extra space between spheres/rings
  const distance = effectiveRadii[0] + effectiveRadii[1] + padding;
  // Left and right positions (centered)
  const positions = [-distance / 2, distance / 2];
  pair.forEach((obj, i) => {
    const geometry = new THREE.SphereGeometry(displayRadius, 32, 32);
    // Load texture if available
    let material;
    if (obj.texture) {
      const texture = textureLoader.load(
        'textures/' + obj.texture,
        undefined,
        undefined,
        function (err) {
          console.warn('Texture failed to load:', obj.texture);
        }
      );
      material = new THREE.MeshPhongMaterial({ map: texture, color: 0xffffff }); // no tint
    } else {
      material = new THREE.MeshPhongMaterial({ color: obj.color });
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = positions[i];
    mesh.userData = { obj, index: i };
    scene.add(mesh);
    meshes.push(mesh);

    // Add rings for Saturn
    if (obj.name === 'Saturn') {
      const ringTexture = textureLoader.load('textures/saturn_ring.png');
      const innerRadius = displayRadius * 1.1;
      const outerRadius = displayRadius * 1.8;
      const segments = 64;
      const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
      // Remap UVs so the texture wraps around the ring
      const pos = ringGeometry.attributes.position;
      const uv = ringGeometry.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const angle = Math.atan2(y, x); // -PI to PI
        const radius = Math.sqrt(x * x + y * y);
        const u = (radius - innerRadius) / (outerRadius - innerRadius); // 0 at inner, 1 at outer
        const v = (angle + Math.PI) / (2 * Math.PI); // 0 to 1 around the ring
        uv.setXY(i, u, v);
      }
      uv.needsUpdate = true;
      const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(0, 0, 0); // Centered on planet
      ring.rotation.x = -Math.PI / 2 + 0.17; // Horizontal with slight tilt
      // Do not set ring.rotation.z
      mesh.add(ring); // Attach ring to planet mesh
      mesh.userData.ring = ring; // Store reference for animation if needed
    }
  });
  // Add labels
  document.querySelectorAll('.obj-label').forEach(e => e.remove());
  pair.forEach((obj, i) => {
    const label = document.createElement('div');
    label.className = 'obj-label';
    label.textContent = obj.name;
    label.style.position = 'absolute';
    // Project a point just below the mesh to 2D screen coordinates
    const mesh = meshes.find(m => m.userData && m.userData.obj === obj);
    if (mesh) {
      const radius = mesh.geometry.parameters.radius || 4;
      const offset = 1.25; // Closer to the object
      const bottom = mesh.localToWorld(new THREE.Vector3(0, -radius * offset, 0));
      const projected = bottom.clone().project(camera);
      const canvasRect = renderer.domElement.getBoundingClientRect();
      const x = (projected.x * 0.5 + 0.5) * canvasRect.width - 50;
      const y = (1 - (projected.y * 0.5 + 0.5)) * canvasRect.height;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
    }
    label.style.textAlign = 'center';
    label.style.fontSize = '2rem';
    label.style.color = '#fff';
    label.style.textShadow = '1px 1px 6px #333';
    label.style.pointerEvents = 'none';
    container.appendChild(label);
  });
}

function showMessage(text, color = '#fff') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

function nextRound() {
  canClick = true;
  currentPair = pickTwoObjects();
  showPair(currentPair);
  showMessage('Which is bigger? Tap to choose!');
}

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  if (!canClick) return;
  // Get mouse position relative to renderer
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(meshes);
  if (intersects.length > 0) {
    canClick = false;
    const picked = intersects[0].object.userData;
    const other = currentPair[1 - picked.index];
    if (picked.obj.size > other.size) {
      successSound.currentTime = 0;
      successSound.play();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      showMessage('Great job! 🎉', '#00ff99');
      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      tryAgainSound.currentTime = 0;
      tryAgainSound.play();
      showMessage('Try again! 😊', '#ffcc00');
      setTimeout(() => {
        canClick = true;
        showPair(currentPair);
        showMessage('Which is bigger? Tap to choose!');
      }, 1200);
    }
  }
}

renderer.domElement.addEventListener('click', onClick);

// Keyboard controls: 1 = left, 2 = right
window.addEventListener('keydown', function(event) {
  if (!canClick) return;
  if (event.key === '1' || event.key === '2') {
    const index = event.key === '1' ? 0 : 1;
    // Simulate picking the corresponding object
    canClick = false;
    const picked = { obj: currentPair[index], index };
    const other = currentPair[1 - index];
    if (picked.obj.size > other.size) {
      successSound.currentTime = 0;
      successSound.play();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      showMessage('Great job! 🎉', '#00ff99');
      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      tryAgainSound.currentTime = 0;
      tryAgainSound.play();
      showMessage('Try again! 😊', '#ffcc00');
      setTimeout(() => {
        canClick = true;
        showPair(currentPair);
        showMessage('Which is bigger? Tap to choose!');
      }, 1200);
    }
  }
});

// Camera setup
camera.position.z = 16;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  meshes.forEach(mesh => {
    // Only rotate the planet mesh (not the ring separately)
    if (mesh.type === 'Mesh' && mesh.geometry.type === 'SphereGeometry') {
      mesh.rotation.y += 0.01;
    }
  });
  renderer.render(scene, camera);
}
animate();

// Replace nextRound and game start logic to wait for objects to load
function startGame() {
  nextRound();
}

// Load objects.json before starting the game
fetch('objects.json')
  .then(response => response.json())
  .then(data => {
    objects = data;
    startGame();
  })
  .catch(err => {
    showMessage('Failed to load objects.json', '#ff0000');
    console.error('Failed to load objects.json', err);
  }); 