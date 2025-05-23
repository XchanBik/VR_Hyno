import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMeditationStore = defineStore('meditation', () => {
  const currentAudio = ref(null)
  const currentConfig = ref(null)
  const hasUnsavedChanges = ref(false)
  const sessions = ref([])
  const currentSession = ref(null)

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

  // Create a new meditation session
  const createNewSession = async (sessionName) => {
    try {
      // Create a unique ID for the session
      const sessionId = `meditation-${Date.now()}`
      
      // Create the session data
      const newSession = {
        id: sessionId,
        name: sessionName,
        configs: [
          {
            id: 'default',
            name: 'Default Configuration',
            data: { ...defaultConfig }
          }
        ]
      }

      // Add to sessions list
      sessions.value.push(newSession)
      currentSession.value = newSession
      currentConfig.value = defaultConfig
      
      // Save to localStorage
      saveSessions()
      
      return newSession
    } catch (error) {
      console.error('Error creating new session:', error)
      throw error
    }
  }

  // Load available sessions
  const loadSessions = async () => {
    try {
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
      if (!session) throw new Error('Session not found')

      // Create new config entry
      const newConfig = {
        id: configName.toLowerCase().replace(/\s+/g, '-'),
        name: configName,
        data: config
      }

      // Update or add config
      const existingConfigIndex = session.configs.findIndex(c => c.id === newConfig.id)
      if (existingConfigIndex >= 0) {
        session.configs[existingConfigIndex] = newConfig
      } else {
        session.configs.push(newConfig)
      }

      // Update current config
      currentConfig.value = config
      hasUnsavedChanges.value = false

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
        currentSession.value = session
        // Load configuration
        const config = session.configs.find(c => c.id === configId)
        if (config) {
          currentConfig.value = config.data
        } else {
          currentConfig.value = defaultConfig
        }
      } catch (error) {
        console.error('Error loading session:', error)
        throw error
      }
    }
  }

  // Set current session
  const setCurrentSession = (session) => {
    currentSession.value = session
    if (session) {
      currentConfig.value = session.configs[0]?.data || defaultConfig
    } else {
      currentConfig.value = null
    }
  }

  // Update unsaved changes state
  const setHasChanges = (value) => {
    hasUnsavedChanges.value = value
  }

  // Check if there are unsaved changes
  const hasChanges = computed(() => hasUnsavedChanges.value)

  return {
    currentAudio,
    currentConfig,
    currentSession,
    hasUnsavedChanges,
    sessions,
    defaultConfig,
    createNewSession,
    loadSessions,
    saveSessionConfig,
    loadSession,
    setCurrentSession,
    setHasChanges,
    hasChanges
  }
}) 