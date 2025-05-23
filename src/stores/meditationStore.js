import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMeditationStore = defineStore('meditation', () => {
  const currentAudio = ref(null)
  const currentConfig = ref(null)
  const hasUnsavedChanges = ref(false)
  const sessions = ref([])

  // Default configuration template
  const defaultConfig = {
    name: "Default Configuration",
    version: "1.0",
    environment: {
      backgroundColor: "#222222",
      ambientLight: {
        color: "#ffffff",
        intensity: 0.5
      },
      directionalLight: {
        color: "#ffffff",
        intensity: 0.8,
        position: [5, 5, 5]
      }
    },
    room: {
      width: 10,
      height: 5,
      depth: 10,
      wallColor: "#cccccc",
      floorColor: "#999999"
    },
    events: []
  }

  // Create a new meditation session folder
  const createNewSession = async (sessionName) => {
    try {
      // Create a unique ID for the session
      const sessionId = `meditation-${Date.now()}`
      
      // Create the session data
      const newSession = {
        id: sessionId,
        name: sessionName,
        folder: `/songs/${sessionId}`,
        configs: [
          {
            id: 'default',
            name: 'Default Configuration',
            file: `/songs/${sessionId}/default.json`
          }
        ]
      }

      // Add to sessions list
      sessions.value.push(newSession)
      
      // Return the new session data
      return newSession
    } catch (error) {
      console.error('Error creating new session:', error)
      throw error
    }
  }

  // Load available sessions
  const loadSessions = async () => {
    try {
      // In a real app, this would scan the public/songs directory
      // For now, we'll use localStorage to persist session data
      const savedSessions = localStorage.getItem('meditationSessions')
      if (savedSessions) {
        sessions.value = JSON.parse(savedSessions)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  // Save sessions to localStorage
  const saveSessions = () => {
    localStorage.setItem('meditationSessions', JSON.stringify(sessions.value))
  }

  // Save current session configuration
  const saveSessionConfig = async (sessionId, configName, config) => {
    try {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      // Create new config entry
      const newConfig = {
        id: configName.toLowerCase().replace(/\s+/g, '-'),
        name: configName,
        file: `/songs/${sessionId}/${configName.toLowerCase().replace(/\s+/g, '-')}.json`
      }

      // Add to session configs if it doesn't exist
      if (!session.configs.find(c => c.id === newConfig.id)) {
        session.configs.push(newConfig)
      }

      // Save to localStorage
      saveSessions()
      
      return newConfig
    } catch (error) {
      console.error('Error saving session config:', error)
      throw error
    }
  }

  // Load a specific session
  const loadSession = async (sessionId, configId = 'default') => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      try {
        // Load configuration
        const config = session.configs.find(c => c.id === configId)
        if (config) {
          const response = await fetch(config.file)
          currentConfig.value = await response.json()
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }
  }

  // Check if there are unsaved changes
  const hasChanges = computed(() => hasUnsavedChanges.value)

  return {
    currentAudio,
    currentConfig,
    hasUnsavedChanges,
    sessions,
    defaultConfig,
    createNewSession,
    loadSessions,
    saveSessionConfig,
    loadSession,
    hasChanges
  }
}) 