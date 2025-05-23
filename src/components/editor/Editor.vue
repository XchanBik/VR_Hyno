<template>
  <div class="editor">
    <div class="header">
      <h2>Meditation Editor</h2>
      <button @click="showNewSessionDialog = true" class="new-session-btn">Create New Session</button>
    </div>

    <div class="controls">
      <input type="file" @change="handleFileUpload" accept="audio/*" />
      <button @click="play" :disabled="!audioFile">Play</button>
      <button @click="pause" :disabled="!audioFile">Pause</button>
      <button @click="stop" :disabled="!audioFile">Stop</button>
      <button @click="saveConfig" :disabled="!audioFile">Save Configuration</button>
    </div>
    
    <div class="timeline" ref="timelineContainer">
      <!-- Waveform will be rendered here -->
    </div>
    
    <div class="time-display">
      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
    </div>

    <!-- Save Configuration Dialog -->
    <div v-if="showSaveDialog" class="dialog">
      <div class="dialog-content">
        <h3>Save Configuration</h3>
        <input v-model="configName" placeholder="Configuration name" />
        <div class="dialog-buttons">
          <button @click="confirmSave">Save</button>
          <button @click="cancelSave">Cancel</button>
        </div>
      </div>
    </div>

    <!-- New Session Dialog -->
    <div v-if="showNewSessionDialog" class="dialog">
      <div class="dialog-content">
        <h3>Create New Meditation Session</h3>
        <p class="dialog-description">
          This will create a new folder for your meditation session. 
          You can then upload an audio file and create configurations for it.
        </p>
        <input v-model="newSessionName" placeholder="Session name" />
        <div class="dialog-buttons">
          <button @click="createNewSession" :disabled="!newSessionName">Create</button>
          <button @click="showNewSessionDialog = false">Cancel</button>
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

  await store.saveSession(config)
  showSaveDialog.value = false
  configName.value = ''
}

const cancelSave = () => {
  showSaveDialog.value = false
  configName.value = ''
}

const createNewSession = async () => {
  if (!newSessionName.value) return

  try {
    const newSession = await store.createNewSession(newSessionName.value)
    showNewSessionDialog.value = false
    newSessionName.value = ''
    
    // Show success message or redirect
    alert(`New session "${newSession.name}" created! You can now upload an audio file.`)
  } catch (error) {
    alert('Error creating new session: ' + error.message)
  }
}

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