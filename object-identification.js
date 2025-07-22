// Handle back button navigation
const backButton = document.getElementById('back-button');
if (backButton) {
  backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Game state
let objects = [];
let currentObject = null;
let currentOptions = [];
let canClick = true;
// Load success count from localStorage or default to 0
let successCount = parseInt(localStorage.getItem('objectIdentificationSuccessCount') || '0', 10);

// DOM elements
const successCounterDiv = document.getElementById('success-counter');
const container = document.getElementById('object-display');
const optionsContainer = document.getElementById('options-container');
const messageDiv = document.getElementById('message');

function updateSuccessCounter() {
  successCounterDiv.textContent = `Successes: ${successCount}`;
  // Save to localStorage whenever counter updates
  localStorage.setItem('objectIdentificationSuccessCount', successCount.toString());
}
updateSuccessCounter();

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Sound effects
const successSound = new Audio('sounds/success.mp3');
const tryAgainSound = new Audio('sounds/tryagain.mp3');

// Unlock audio on first user interaction
let audioContext;
function unlockAudio() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    } catch (e) {
      console.log('AudioContext not supported');
    }
  }
}

// Load objects from JSON
async function loadObjects() {
  try {
    const response = await fetch('objects.json');
    objects = await response.json();
    startNewRound();
  } catch (error) {
    console.error('Error loading objects:', error);
    messageDiv.textContent = 'Error loading game data';
  }
}

// Global variables for animation
let currentMesh = null;
let animationId = null;

// Animation function
function animate() {
  animationId = requestAnimationFrame(animate);
  if (currentMesh) {
    currentMesh.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
}

// Create 3D object
function createObject(objData) {
  // Clear previous animation
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Clear previous objects
  while(scene.children.length > 2) {
    scene.remove(scene.children[2]);
  }

  const displayRadius = 1;
  const geometry = new THREE.SphereGeometry(displayRadius, 32, 32);

  function createMeshWithTexture(material) {
    const mesh = new THREE.Mesh(geometry, material);
    currentMesh = mesh;

    // Special handling for Saturn
    console.log('Creating object:', objData.name);
    if (objData.name === 'Saturn') {
      console.log('Adding rings to Saturn!');
      
      const innerRadius = displayRadius * 1.1;
      const outerRadius = displayRadius * 1.8;
      const segments = 64;
      const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
      console.log('Ring geometry created:', ringGeometry);
      
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
      
      const ringTexture = textureLoader.load('textures/saturn_ring.png');
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const rings = new THREE.Mesh(ringGeometry, ringMaterial);
      rings.position.set(0, 0, 0);
      rings.rotation.x = -Math.PI / 2 + 0.17;
      
      console.log('Ring mesh created with texture:', rings);
      console.log('Adding ring to mesh:', mesh);
      
      mesh.add(rings);
    }

    scene.add(mesh);
    
    // Position camera
    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0, 0);
    
    // Debug scene contents
    console.log('Scene children count:', scene.children.length);
    console.log('Mesh children count:', mesh.children.length);
    
    // Start animation
    animate();
  }

  // Load texture with success and error callbacks
  const texture = textureLoader.load(
    `textures/${objData.texture}`,
    // onLoad
    (loadedTexture) => {
      const material = new THREE.MeshLambertMaterial({ map: loadedTexture });
      createMeshWithTexture(material);
    },
    // onProgress
    undefined,
    // onError
    (error) => {
      console.log('Texture failed to load, using fallback color');
      const material = new THREE.MeshLambertMaterial({ color: objData.color });
      createMeshWithTexture(material);
    }
  );
}

// Generate options for the current round
function generateOptions(correctObject) {
  const options = [correctObject];
  const availableObjects = objects.filter(obj => obj.name !== correctObject.name);
  
  // Randomly select 2 more objects
  while (options.length < 3) {
    const randomIndex = Math.floor(Math.random() * availableObjects.length);
    const randomObject = availableObjects[randomIndex];
    
    if (!options.some(opt => opt.name === randomObject.name)) {
      options.push(randomObject);
    }
  }
  
  // Shuffle the options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return options;
}

// Update option buttons
function updateOptions() {
  const optionButtons = document.querySelectorAll('.option-button');
  currentOptions.forEach((option, index) => {
    optionButtons[index].textContent = option.name;
    optionButtons[index].onclick = () => handleOptionClick(option);
  });
}

// Handle option selection
function handleOptionClick(selectedObject) {
  if (!canClick) return;
  
  unlockAudio();
  
  if (selectedObject.name === currentObject.name) {
    // Correct answer
    canClick = false;
    successCount++;
    updateSuccessCounter();
    messageDiv.textContent = `Correct! That's ${currentObject.name}!`;
    messageDiv.style.color = '#4CAF50';
    
    try {
      successSound.play();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Sound/confetti not available');
    }
    
    // Highlight correct answer
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
      if (button.textContent === currentObject.name) {
        button.classList.add('correct');
      }
    });
    
    // Progress to next round after success
    setTimeout(() => {
      startNewRound();
    }, 2500);
  } else {
    // Wrong answer - allow user to try again
    messageDiv.textContent = `Not quite! Try again.`;
    messageDiv.style.color = '#f44336';
    
    try {
      tryAgainSound.play();
    } catch (e) {
      console.log('Sound not available');
    }
    
    // Briefly highlight the incorrect choice
    const optionButtons = document.querySelectorAll('.option-button');
    const clickedButton = Array.from(optionButtons).find(button => 
      button.textContent === selectedObject.name
    );
    
    if (clickedButton) {
      clickedButton.classList.add('incorrect');
      setTimeout(() => {
        clickedButton.classList.remove('incorrect');
      }, 1000);
    }
    
    // Don't progress - user can keep trying
  }
}

// Start a new round
function startNewRound() {
  canClick = true;
  messageDiv.textContent = "What is this astronomical object?";
  messageDiv.style.color = '#fff';
  
  // Clear button states
  const optionButtons = document.querySelectorAll('.option-button');
  optionButtons.forEach(button => {
    button.classList.remove('correct', 'incorrect');
  });
  
  // Select random object
  currentObject = objects[Math.floor(Math.random() * objects.length)];
  currentOptions = generateOptions(currentObject);
  
  // Update display
  createObject(currentObject);
  updateOptions();
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
});

// Initialize game
loadObjects();