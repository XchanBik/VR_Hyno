<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ currentSession ? `Editing: ${currentSession.name}` : 'Meditation Editor' }}
        </h1>
        <button 
          @click="showNewSessionDialog = true" 
          class="btn btn-primary"
        >
          {{ currentSession ? 'New Session' : 'Create Session' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- No Session View -->
      <div v-if="!currentSession" class="text-center py-12">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">
          No Active Session
        </h2>
        <p class="text-gray-500 mb-8">
          Create a new session to start editing your meditation experience.
        </p>
        <button 
          @click="showNewSessionDialog = true" 
          class="btn btn-primary"
        >
          Create New Session
        </button>
      </div>

      <!-- Session Editor View -->
      <div v-else class="space-y-6">
        <!-- Audio Controls -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center space-x-4 mb-4">
            <input 
              type="file" 
              @change="handleFileUpload" 
              accept="audio/*"
              class="hidden" 
              ref="fileInput"
            />
            <button 
              @click="$refs.fileInput.click()" 
              class="btn btn-secondary"
            >
              Upload Audio
            </button>
            <div class="flex space-x-2">
              <button @click="play" :disabled="!audioFile" class="btn btn-primary">
                Play
              </button>
              <button @click="pause" :disabled="!audioFile" class="btn btn-primary">
                Pause
              </button>
              <button @click="stop" :disabled="!audioFile" class="btn btn-primary">
                Stop
              </button>
            </div>
          </div>
          
          <div class="timeline bg-gray-100 rounded-lg p-4" ref="timelineContainer">
            <!-- Waveform will be rendered here -->
          </div>
          
          <div class="text-center mt-4 font-mono text-gray-600">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>

        <!-- Configuration Controls -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Configuration</h3>
            <button 
              @click="saveConfig" 
              :disabled="!audioFile" 
              class="btn btn-primary"
            >
              Save Configuration
            </button>
          </div>
          <!-- Add configuration controls here -->
        </div>
      </div>
    </main>

    <!-- New Session Dialog -->
    <div v-if="showNewSessionDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Create New Meditation Session
        </h3>
        <p class="text-gray-500 mb-4">
          This will create a new folder for your meditation session. 
          You can then upload an audio file and create configurations for it.
        </p>
        <input 
          v-model="newSessionName" 
          placeholder="Session name" 
          class="input mb-4"
        />
        <div class="flex justify-end space-x-3">
          <button 
            @click="showNewSessionDialog = false" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="createNewSession" 
            :disabled="!newSessionName" 
            class="btn btn-primary"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Save Configuration Dialog -->
    <div v-if="showSaveDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Save Configuration
        </h3>
        <input 
          v-model="configName" 
          placeholder="Configuration name" 
          class="input mb-4"
        />
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelSave" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            @click="confirmSave" 
            :disabled="!configName" 
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeditationStore } from '../../stores/meditationStore'
import WaveSurfer from 'wavesurfer.js'

const router = useRouter()
const store = useMeditationStore()

const currentSession = ref(null)
const audioFile = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const wavesurfer = ref(null)
const timelineContainer = ref(null)
const showSaveDialog = ref(false)
const configName = ref('')
const showNewSessionDialog = ref(false)
const newSessionName = ref('')

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    audioFile.value = file
    store.currentAudio = file
    initWaveSurfer(file)
  }
}

const initWaveSurfer = (file) => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }

  wavesurfer.value = WaveSurfer.create({
    container: timelineContainer.value,
    waveColor: '#4a9eff',
    progressColor: '#2c3e50',
    cursorColor: '#2c3e50',
    barWidth: 2,
    barRadius: 3,
    responsive: true,
    height: 100,
    barGap: 3
  })

  wavesurfer.value.loadBlob(file)
  
  wavesurfer.value.on('ready', () => {
    duration.value = wavesurfer.value.getDuration()
  })

  wavesurfer.value.on('audioprocess', () => {
    currentTime.value = wavesurfer.value.getCurrentTime()
  })
}

const play = () => {
  wavesurfer.value?.play()
}

const pause = () => {
  wavesurfer.value?.pause()
}

const stop = () => {
  wavesurfer.value?.stop()
}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const createNewSession = async () => {
  if (!newSessionName.value) return

  try {
    const newSession = await store.createNewSession(newSessionName.value)
    currentSession.value = newSession
    showNewSessionDialog.value = false
    newSessionName.value = ''
  } catch (error) {
    alert('Error creating new session: ' + error.message)
  }
}

const saveConfig = () => {
  showSaveDialog.value = true
}

const confirmSave = async () => {
  if (!configName.value) return

  const config = {
    name: configName.value,
    duration: duration.value,
    // Add any other configuration data here
  }

  await store.saveSessionConfig(currentSession.value.id, configName.value, config)
  showSaveDialog.value = false
  configName.value = ''
}

const cancelSave = () => {
  showSaveDialog.value = false
  configName.value = ''
}

// Handle navigation
const handleBeforeUnload = (e) => {
  if (store.hasChanges) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  wavesurfer.value?.destroy()
})
</script>

<style scoped>
.editor {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
}

.controls button {
  margin: 0 5px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.timeline {
  background: #f5f5f5;
  border-radius: 4px;
  margin: 20px 0;
}

.time-display {
  font-family: monospace;
  font-size: 1.2em;
  text-align: center;
  margin-top: 10px;
}

.save-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.save-dialog-content h3 {
  margin-top: 0;
}

.save-dialog-content input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style> 