<template>
  <div class="player">
    <!-- Directory Selection View -->
    <div v-if="!store.rootDirHandle" class="directory-selector">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Welcome to VR Meditation</h2>
      <p class="text-gray-600 mb-8">
        Please select a folder where your meditation sessions will be stored.
      </p>
      <button @click="selectDirectory" class="btn btn-primary">
        Select Sessions Folder
      </button>
    </div>

    <!-- Main App View -->
    <div v-else>
      <div v-if="!isVRMode" class="session-selector">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Select Meditation Session</h2>
        <div v-if="sessions.length === 0" class="no-sessions text-center py-8">
          <p class="text-gray-500">No sessions available. Please create a session in the editor first.</p>
          <router-link to="/editor" class="btn btn-primary mt-4 inline-block">
            Go to Editor
          </router-link>
        </div>
        <div v-else class="sessions-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="session in sessions" 
               :key="session.id" 
               class="session-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
               @click="selectSession(session)">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold text-gray-900">{{ session.name }}</h3>
              <span class="px-2 py-1 text-sm rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': session.metadata.difficulty === 'beginner',
                      'bg-yellow-100 text-yellow-800': session.metadata.difficulty === 'intermediate',
                      'bg-red-100 text-red-800': session.metadata.difficulty === 'advanced'
                    }">
                {{ session.metadata.difficulty }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-4">{{ session.metadata.description }}</p>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in session.metadata.tags" 
                    :key="tag"
                    class="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                {{ tag }}
              </span>
            </div>
            
            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{{ formatTime(session.metadata.duration) }}</span>
              <span>By {{ session.metadata.author }}</span>
            </div>
          </div>
        </div>
      </div>

      <div id="vr-container"></div>
      <div class="controls" v-if="!isVRMode">
        <button @click="enterVR" 
                :disabled="!isVRSupported || !selectedSession"
                class="btn btn-primary">
          Enter VR
        </button>
      </div>

      <!-- No Session View -->
      <div v-if="!currentSession" class="text-center py-12">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">
          No Active Session
        </h2>
        <p class="text-gray-500 mb-8">
          No sessions available. Please create a session in the editor first.
        </p>
        <router-link to="/editor" class="btn btn-primary">
          Go to Editor
        </router-link>
      </div>
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

const selectDirectory = async () => {
  try {
    await store.initRootDirectory()
    await store.loadSessions()
    sessions.value = store.sessions
    checkVRSupport()
  } catch (error) {
    console.error('Error selecting directory:', error)
  }
}

onMounted(() => {
  checkVRSupport()
})

onMounted(async () => {
  try {
    await store.initRootDirectory()
    await store.loadSessions()
    sessions.value = store.sessions
    checkVRSupport()
  } catch (error) {
    console.error('Error initializing app:', error)
  }
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
  background-color: #f5f5f5;
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

.session-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.session-item {
  transition: transform 0.2s;
}

.session-item:hover {
  transform: translateY(-2px);
}

.directory-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 