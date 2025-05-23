<template>
  <div class="player">
    <div v-if="!isVRMode" class="session-selector">
      <h2>Select Meditation Session</h2>
      <div v-if="sessions.length === 0" class="no-sessions">
        No sessions available. Please create a session in the editor first.
      </div>
      <div v-else class="sessions-list">
        <div v-for="session in sessions" :key="session.id" class="session-item" @click="selectSession(session)">
          <h3>{{ session.name }}</h3>
          <p>Duration: {{ formatTime(session.duration) }}</p>
        </div>
      </div>
    </div>

    <div id="vr-container"></div>
    <div class="controls" v-if="!isVRMode">
      <button @click="enterVR" :disabled="!isVRSupported || !selectedSession">Enter VR</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMeditationStore } from '../../stores/meditationStore'
import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'

const store = useMeditationStore()
const isVRSupported = ref(false)
const isVRMode = ref(false)
const selectedSession = ref(null)
const sessions = ref([])

let scene, camera, renderer, cursor, raycaster, mouse

onMounted(async () => {
  await store.loadSessions()
  sessions.value = store.sessions
})

onUnmounted(() => {
  cleanup()
})

const selectSession = async (session) => {
  selectedSession.value = session
  await store.loadSession(session.id)
  initScene()
}

const initScene = () => {
  // Create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x222222)

  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 1.6, 3)
  scene.add(camera)

  // Create renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.xr.enabled = true
  document.getElementById('vr-container').appendChild(renderer.domElement)
  document.getElementById('vr-container').appendChild(VRButton.createButton(renderer))

  // Initialize raycaster and mouse
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Create room and cursor
  createRoom()
  createCursor()

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)

  // Handle window resize
  window.addEventListener('resize', onWindowResize)

  // Start animation loop
  renderer.setAnimationLoop(animate)
}

const createRoom = () => {
  // Room dimensions
  const roomWidth = 10
  const roomHeight = 5
  const roomDepth = 10

  // Create room walls
  const wallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth)
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    side: THREE.BackSide,
    roughness: 0.7,
    metalness: 0.1
  })
  const room = new THREE.Mesh(wallGeometry, wallMaterial)
  scene.add(room)

  // Add floor
  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth)
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x999999,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = Math.PI / 2
  floor.position.y = -roomHeight / 2
  scene.add(floor)
}

const createCursor = () => {
  const cursorGeometry = new THREE.SphereGeometry(0.02, 16, 16)
  const cursorMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  })
  cursor = new THREE.Mesh(cursorGeometry, cursorMaterial)
  cursor.position.z = -0.5
  camera.add(cursor)
}

const checkVRSupport = () => {
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      isVRSupported.value = supported
    })
  }
}

const enterVR = () => {
  if (isVRSupported.value && selectedSession.value) {
    isVRMode.value = true
  }
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = (time) => {
  if (cursor) {
    cursor.rotation.copy(camera.rotation)
    cursor.scale.setScalar(1 + Math.sin(time * 0.003) * 0.1)
  }
  renderer.render(scene, camera)
}

const cleanup = () => {
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.player {
  width: 100vw;
  height: 100vh;
  position: relative;
}

#vr-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.controls button {
  padding: 12px 24px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.session-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 600px;
  width: 90%;
}

.sessions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.session-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-item:hover {
  background: #e0e0e0;
}

.session-item h3 {
  margin: 0 0 10px 0;
}

.session-item p {
  margin: 0;
  color: #666;
}

.no-sessions {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style> 